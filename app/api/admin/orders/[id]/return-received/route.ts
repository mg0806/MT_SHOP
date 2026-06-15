import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { getRazorpayInstance } from "@/libs/razorpay";
import { getReturnPickupQuote } from "@/libs/returnPickupQuote";
import { NextResponse } from "next/server";

const getRefundPaiseAfterPickup = (
  order: { amount: number; grandTotal?: number | null },
  pickupDeduction: number,
) => {
  const paidPaise = Number.isFinite(order.amount) && order.amount > 0
    ? Math.round(order.amount)
    : Math.round(Number(order.grandTotal || 0) * 100);
  const pickupDeductionPaise = Math.round(pickupDeduction * 100);
  return {
    refundPaise: Math.max(0, paidPaise - pickupDeductionPaise),
    pickupDeduction: pickupDeductionPaise / 100,
  };
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { refunds: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.returnStatus !== "REQUESTED" && order.returnStatus !== "IN_TRANSIT") {
    return NextResponse.json({ error: "No active return awaiting receipt" }, { status: 409 });
  }

  const locked = await prisma.order.updateMany({
    where: {
      id: order.id,
      returnStatus: { in: ["REQUESTED", "IN_TRANSIT"] },
    },
    data: {
      returnStatus: "RECEIVED_PROCESSING",
      returnReceivedAt: new Date(),
    },
  });

  if (locked.count !== 1) {
    return NextResponse.json({ error: "Return status changed. Please refresh and try again." }, { status: 409 });
  }

  if (!order.razorpayPaymentId) {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        returnStatus: "RECEIVED_NO_ONLINE_REFUND",
        returnReceivedAt: new Date(),
      },
    });
    auditLog("return_received_no_online_refund", { adminId: user.id, orderId: order.id });
    return NextResponse.json({ success: true, returnStatus: updated.returnStatus, refundId: null });
  }

  const existingReturnRefund = order.refunds.find((refund) => refund.reason === "Return received at hub");
  if (existingReturnRefund) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "RETURN_REFUND_INITIATED",
        returnStatus: "REFUND_INITIATED",
      },
    });
    return NextResponse.json({ success: true, refundId: existingReturnRefund.razorpayRefundId });
  }

  let returnQuote: Awaited<ReturnType<typeof getReturnPickupQuote>>;
  let refundPaise = 0;
  let pickupDeduction = 0;

  try {
    returnQuote = await getReturnPickupQuote(order.id);
    const amounts = getRefundPaiseAfterPickup(order, returnQuote.pickupDeduction);
    refundPaise = amounts.refundPaise;
    pickupDeduction = amounts.pickupDeduction;
    if (refundPaise <= 0) throw new Error("Refund amount is zero after pickup deduction");
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { returnStatus: order.returnStatus },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to calculate return pickup charge" },
      { status: 400 },
    );
  }

  try {
    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundPaise,
      notes: {
        reason: "Return received at hub",
        orderId: order.id,
        adminId: user.id,
        pickupDeduction,
        returnCourierName: returnQuote.courierName,
      },
    });

    await prisma.$transaction([
      prisma.refund.create({
        data: {
          orderId: order.id,
          razorpayRefundId: refund.id,
          amount: refundPaise / 100,
          reason: "Return received at hub",
          status: String(refund.status || "INITIATED").toUpperCase(),
          initiatedBy: user.id,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "RETURN_REFUND_INITIATED",
          returnStatus: "REFUND_INITIATED",
          returnReceivedAt: new Date(),
          returnRefundedAt: new Date(),
          returnRefundAmount: refundPaise / 100,
          returnPickupDeduction: pickupDeduction,
        },
      }),
    ]);

    auditLog("return_refund_initiated", { adminId: user.id, orderId: order.id, refundId: refund.id, refundPaise, pickupDeduction });
    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundAmount: refundPaise / 100,
      pickupDeduction,
      returnCourierName: returnQuote.courierName,
    });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { returnStatus: order.returnStatus },
    });
    const message = error instanceof Error ? error.message : "Unable to initiate return refund";
    auditLog("return_refund_failed", { adminId: user.id, orderId: order.id, error: message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
