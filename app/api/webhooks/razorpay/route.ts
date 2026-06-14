import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { verifyWebhookSignature } from "@/libs/razorpay";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature(rawBody, signature)) {
    auditLog("webhook_signature_failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.notes?.internalOrderId;
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order?.status === "PENDING") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID_WEBHOOK", razorpayPaymentId: payment.id, paidAt: new Date() },
        });
        auditLog("webhook_payment_captured", { orderId, paymentId: payment.id });
      }
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    const orderId = payment.notes?.internalOrderId;
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "PAYMENT_FAILED" } });
      auditLog("webhook_payment_failed", { orderId });
    }
  }

  if (event.event === "refund.processed") {
    const refund = event.payload.refund.entity;
    await prisma.refund.updateMany({
      where: { razorpayRefundId: refund.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    auditLog("webhook_refund_processed", { refundId: refund.id });
  }

  return NextResponse.json({ received: true });
}
