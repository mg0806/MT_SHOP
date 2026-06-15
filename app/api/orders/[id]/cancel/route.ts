import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { getRazorpayInstance } from "@/libs/razorpay";
import { getIp, rateLimit } from "@/libs/rateLimit";
import { cancelShiprocketOrder } from "@/libs/shiprocket";
import { NextResponse } from "next/server";

const SHIPPED_DELIVERY_STATUSES = new Set([
  "dispatched",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
]);

const FINAL_CANCEL_STATUSES = new Set([
  "CANCELED",
  "CANCELED_REFUND_INITIATED",
  "REFUNDED",
]);

const STOCK_RESERVED_STATUSES = new Set([
  "COD_CONFIRMED",
  "PAID",
  "PAID_WEBHOOK",
  "PAID_SHIPMENT_PENDING",
  "PROCESSING",
]);

const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();

const isOrderCancelable = (order: { status: string; deliveryStatus?: string | null }) => {
  if (FINAL_CANCEL_STATUSES.has(order.status)) return false;
  if (order.status === "CANCELLATION_REQUESTED") return false;
  return !SHIPPED_DELIVERY_STATUSES.has(normalizeStatus(order.deliveryStatus));
};

const getRefundAmountPaise = (order: { amount: number; grandTotal?: number | null }) => {
  if (Number.isFinite(order.amount) && order.amount > 0) return Math.round(order.amount);
  return Math.round(Number(order.grandTotal || 0) * 100);
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const ip = getIp(request.headers);
  const limited = rateLimit(`cancel-order:${user.id}:${ip}`, 5, 10 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many cancellation attempts" }, { status: 429 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { lineItems: true, refunds: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== user.id && user.role !== "ADMIN") {
    auditLog("cancel_order_forbidden", { userId: user.id, orderId: id, ip });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (FINAL_CANCEL_STATUSES.has(order.status)) {
    return NextResponse.json({
      success: true,
      message: "Order is already canceled",
      status: order.status,
    });
  }

  if (!isOrderCancelable(order)) {
    return NextResponse.json({ error: "Order can no longer be canceled after shipment" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body?.reason || "").trim();
  if (reason.length < 8) {
    return NextResponse.json({ error: "Please provide a cancellation reason" }, { status: 400 });
  }

  const locked = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
    },
    data: {
      status: "CANCELLATION_REQUESTED",
      cancellationReason: reason.slice(0, 500),
    },
  });

  if (locked.count !== 1) {
    return NextResponse.json({ error: "Order changed while cancellation was being processed. Please refresh and try again." }, { status: 409 });
  }

  let refundId: string | null = null;
  let refundAmountPaise = 0;

  try {
    if (order.shiprocketOrderId) {
      await cancelShiprocketOrder(order.shiprocketOrderId);
      auditLog("shiprocket_order_canceled", { userId: user.id, orderId: order.id, shiprocketOrderId: order.shiprocketOrderId });
    }

    refundAmountPaise = getRefundAmountPaise(order);
    const existingRefund = order.refunds.find((refund) => refund.status !== "FAILED");

    if (order.razorpayPaymentId && refundAmountPaise > 0) {
      if (existingRefund) {
        refundId = existingRefund.razorpayRefundId;
      } else {
        const razorpay = getRazorpayInstance();
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: refundAmountPaise,
          notes: {
            reason: "Order canceled before shipment",
            orderId: order.id,
            userId: user.id,
          },
        });
        refundId = refund.id;

        await prisma.refund.create({
          data: {
            orderId: order.id,
            razorpayRefundId: refund.id,
            amount: refundAmountPaise / 100,
            reason: "Order canceled before shipment",
            status: String(refund.status || "INITIATED").toUpperCase(),
            initiatedBy: user.id,
          },
        });
      }
    }

    const shouldRestoreStock = STOCK_RESERVED_STATUSES.has(order.status);
    await prisma.$transaction([
      ...(shouldRestoreStock
        ? order.lineItems.map((item) =>
            prisma.product.updateMany({
              where: { id: item.productId, quantity: { not: null } },
              data: { quantity: { increment: item.qty } },
            }),
          )
        : []),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: refundId ? "CANCELED_REFUND_INITIATED" : "CANCELED",
          deliveryStatus: "canceled",
          canceledAt: new Date(),
        },
      }),
    ]);

    auditLog("order_canceled", {
      userId: user.id,
      orderId: order.id,
      refundId,
      refundAmountPaise: refundId ? refundAmountPaise : 0,
      stockRestored: shouldRestoreStock,
      shiprocketOrderId: order.shiprocketOrderId,
      ip,
    });

    return NextResponse.json({
      success: true,
      status: refundId ? "CANCELED_REFUND_INITIATED" : "CANCELED",
      refundId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancellation failed";
    await prisma.order.update({
      where: { id: order.id },
      data: refundId
        ? {
            status: "CANCELED_REFUND_INITIATED",
            deliveryStatus: "canceled",
            canceledAt: new Date(),
          }
        : {
            status: order.status,
            deliveryStatus: order.deliveryStatus,
          },
    });
    auditLog("order_cancel_failed", { userId: user.id, orderId: order.id, error: message, ip });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
