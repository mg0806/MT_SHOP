import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { trackShipmentByAWB } from "@/libs/shiprocket";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { userId: true, awbCode: true, awb: true, status: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const awbCode = order.awbCode || order.awb;
  if (!awbCode) return NextResponse.json({ awbCode: null, status: order.status, tracking: null });
  try {
    const tracking = await trackShipmentByAWB(awbCode);
    return NextResponse.json({ awbCode, status: order.status, tracking });
  } catch {
    return NextResponse.json({ error: "Tracking temporarily unavailable" }, { status: 500 });
  }
}
