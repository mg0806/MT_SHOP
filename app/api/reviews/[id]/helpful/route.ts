import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { vote } = await request.json();

  if (vote !== "yes" && vote !== "no") {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const data =
    vote === "no"
      ? { helpfulNo: { increment: 1 } }
      : { helpfulYes: { increment: 1 } };

  try {
    const review = await prisma.review.update({ where: { id }, data });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
