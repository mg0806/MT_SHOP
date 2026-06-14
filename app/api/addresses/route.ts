import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

const normalizeAddressPart = (value: unknown) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const buildAddressSignature = (address: Record<string, unknown>) =>
  [
    address.fullName,
    address.phone,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .map(normalizeAddressPart)
    .join("|");

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addresses = await prisma.savedAddress.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const existingAddresses = await prisma.savedAddress.findMany({
    where: { userId: user.id },
  });
  const incomingSignature = buildAddressSignature(body);
  const duplicate = existingAddresses.find(
    (address) => buildAddressSignature(address as any) === incomingSignature,
  );

  if (duplicate) {
    return NextResponse.json(duplicate);
  }

  const address = await prisma.savedAddress.create({
    data: {
      userId: user.id,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || user.email,
      line1: body.line1,
      line2: body.line2 || "",
      city: body.city,
      state: body.state,
      pincode: body.pincode,
    },
  });
  return NextResponse.json(address);
}
