import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { getRazorpayInstance } from "@/libs/razorpay";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await request.json();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.razorpayPaymentId) return NextResponse.json({ error: "No payment to refund" }, { status: 400 });

  const requestedPaise = Math.max(0, Math.round(Number(body.amount) * 100));
  const maxPaise = Math.round(Number(order.grandTotal ?? order.amount / 100) * 100);
  const refundPaise = Math.min(requestedPaise, maxPaise);

  const razorpayInstance = getRazorpayInstance();
  const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
    amount: refundPaise,
    notes: { reason: body.reason || "", adminId: user.id },
  });

  await prisma.refund.create({
    data: {
      orderId: order.id,
      razorpayRefundId: refund.id,
      amount: refundPaise / 100,
      reason: body.reason || "",
      status: "INITIATED",
      initiatedBy: user.id,
    },
  });
  await prisma.order.update({ where: { id: order.id }, data: { status: "REFUND_INITIATED" } });
  auditLog("refund_initiated", { adminId: user.id, orderId: order.id, refundId: refund.id, refundPaise });
  return NextResponse.json({ success: true, refundId: refund.id });
}
