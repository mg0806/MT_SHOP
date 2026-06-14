import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { vote } = await request.json();
  const data =
    vote === "no"
      ? { helpfulNo: { increment: 1 } }
      : { helpfulYes: { increment: 1 } };
  const review = await prisma.review.update({ where: { id: params.id }, data });
  return NextResponse.json(review);
}
