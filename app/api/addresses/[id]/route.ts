import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const address = await prisma.savedAddress.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.savedAddress.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
