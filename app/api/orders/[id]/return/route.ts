import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import prisma from "@/libs/prismadb";
import { getIp, rateLimit } from "@/libs/rateLimit";
import { NextResponse } from "next/server";

const ACTIVE_RETURN_STATUSES = new Set([
  "REQUESTED",
  "APPROVED",
  "PICKUP_SCHEDULED",
  "IN_TRANSIT",
  "RECEIVED",
  "RECEIVED_NO_ONLINE_REFUND",
  "RECEIVED_PROCESSING",
  "REFUND_INITIATED",
  "REFUNDED",
]);
const BLOCKED_ORDER_STATUSES = new Set(["CANCELED", "CANCELED_REFUND_INITIATED", "REFUNDED", "RETURN_REFUND_INITIATED"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const ip = getIp(request.headers);
  const limited = rateLimit(`return-order:${user.id}:${ip}`, 4, 10 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many return attempts" }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const reason = String(body?.reason || "").trim();
  if (reason.length < 10) {
    return NextResponse.json({ error: "Please provide a return reason" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== user.id && user.role !== "ADMIN") {
    auditLog("return_order_forbidden", { userId: user.id, orderId: id, ip });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.deliveryStatus !== "delivered") {
    return NextResponse.json({ error: "Returns unlock only after delivery" }, { status: 409 });
  }

  if (BLOCKED_ORDER_STATUSES.has(order.status) || ACTIVE_RETURN_STATUSES.has(String(order.returnStatus || ""))) {
    return NextResponse.json({ error: "A return is already active or this order is closed" }, { status: 409 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      returnStatus: "REQUESTED",
      returnReason: reason.slice(0, 1000),
      returnRequestedAt: new Date(),
    },
  });

  auditLog("return_requested", { userId: user.id, orderId: order.id, ip });
  return NextResponse.json({ success: true, returnStatus: updated.returnStatus });
}
