import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [], products: [] });
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ids: items.map((item) => item.productId),
    products: items.map((item) => item.product),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  return NextResponse.json({ saved: true });
}
