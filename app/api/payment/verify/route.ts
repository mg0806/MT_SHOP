import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { verifyRazorpaySignature } from "@/libs/razorpay";
import { getIp, rateLimit } from "@/libs/rateLimit";
import { sendOrderEmailsSafely } from "@/libs/sendOrderEmails";
import { createShiprocketShipment } from "@/libs/shiprocket";
import { NextResponse } from "next/server";

const shouldCreateShiprocketShipment =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_live_");

export async function POST(request: Request) {
  const ip = getIp(request.headers);
  const limited = rateLimit(`verify:${ip}`, 5, 5 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many verification attempts" }, { status: 429 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, internalOrderId } = await request.json();
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !internalOrderId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!valid) {
    auditLog("payment_signature_failed", { userId: user.id, ip, razorpayOrderId });
    return NextResponse.json({ error: "PAYMENT_SIGNATURE_INVALID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: internalOrderId },
    include: { lineItems: true, savedAddress: true, user: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status !== "PENDING") {
    return NextResponse.json({
      success: true,
      message: "Order already processed",
      orderId: order.id,
      awbCode: order.awbCode || order.awb,
    });
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    auditLog("payment_order_id_mismatch", { userId: user.id, stored: order.razorpayOrderId, received: razorpayOrderId });
    return NextResponse.json({ error: "ORDER_ID_MISMATCH" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID", razorpayPaymentId, paidAt: new Date() },
  });
  auditLog("payment_signature_passed", { userId: user.id, orderId: order.id, razorpayPaymentId });

  await prisma.$transaction(
    order.lineItems.map((item) =>
      prisma.product.updateMany({
        where: { id: item.productId, quantity: { not: null } },
        data: { quantity: { decrement: item.qty } },
      }),
    ),
  );

  if (!shouldCreateShiprocketShipment) {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID_SHIPMENT_PENDING",
        deliveryStatus: "pending",
      },
      include: { lineItems: true, savedAddress: true, user: true },
    });
    auditLog("shipment_skipped_non_production", { userId: user.id, orderId: order.id });
    await sendOrderEmailsSafely(updatedOrder);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      awbCode: null,
      shiprocketOrderId: null,
    });
  }

  let awbCode: string | null = null;
  let shiprocketOrderId: string | null = null;
  try {
    const shipment = await createShiprocketShipment(order);
    awbCode = shipment.awbCode;
    shiprocketOrderId = String(shipment.shiprocketOrderId);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        deliveryStatus: "pending",
        awbCode,
        awb: awbCode,
        shiprocketOrderId,
        shiprocketShipmentId: String(shipment.shipmentId),
        courierName: shipment.courierName,
      },
    });
    auditLog("shipment_created", { userId: user.id, orderId: order.id, awbCode });
  } catch (error) {
    auditLog("shipment_failed", { userId: user.id, orderId: order.id, error: (error as Error).message });
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID_SHIPMENT_PENDING" } });
  }

  const emailOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { lineItems: true, savedAddress: true, user: true },
  });
  if (emailOrder) {
    await sendOrderEmailsSafely(emailOrder);
  }

  return NextResponse.json({ success: true, orderId: order.id, awbCode, shiprocketOrderId });
}
