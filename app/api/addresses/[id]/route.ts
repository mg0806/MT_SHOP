import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const address = await prisma.savedAddress.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.savedAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
