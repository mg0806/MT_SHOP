import { getCurrentUser } from "@/actions/getCurrentUser";
import getStoreSettings from "@/actions/getStoreSettings";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

const cleanString = (value: unknown) => String(value ?? "").trim();
const cleanOptional = (value: unknown) => {
  const cleaned = cleanString(value);
  return cleaned || null;
};
const cleanPositiveNumber = (value: unknown, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const settings = await getStoreSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json();
  const existing = await getStoreSettings();
  const pickupPincode = cleanString(body.pickupPincode).replace(/\D/g, "");

  if (pickupPincode.length !== 6) {
    return NextResponse.json({ error: "Pickup pincode must be 6 digits" }, { status: 400 });
  }

  if (!cleanString(body.shiprocketPickupName)) {
    return NextResponse.json({ error: "Shiprocket pickup location name is required" }, { status: 400 });
  }

  const settings = await prisma.storeSettings.update({
    where: { id: existing.id },
    data: {
      storeName: cleanString(body.storeName) || "MTShop",
      legalName: cleanOptional(body.legalName),
      gstin: cleanOptional(body.gstin),
      supportEmail: cleanOptional(body.supportEmail),
      supportPhone: cleanOptional(body.supportPhone),
      shiprocketPickupName: cleanString(body.shiprocketPickupName),
      pickupContactName: cleanOptional(body.pickupContactName),
      pickupPhone: cleanOptional(body.pickupPhone),
      pickupEmail: cleanOptional(body.pickupEmail),
      pickupAddressLine1: cleanOptional(body.pickupAddressLine1),
      pickupAddressLine2: cleanOptional(body.pickupAddressLine2),
      pickupCity: cleanOptional(body.pickupCity),
      pickupState: cleanOptional(body.pickupState),
      pickupCountry: cleanString(body.pickupCountry) || "India",
      pickupPincode,
      defaultPackageLength: cleanPositiveNumber(body.defaultPackageLength, existing.defaultPackageLength),
      defaultPackageBreadth: cleanPositiveNumber(body.defaultPackageBreadth, existing.defaultPackageBreadth),
      defaultPackageHeight: cleanPositiveNumber(body.defaultPackageHeight, existing.defaultPackageHeight),
      defaultPackageWeight: cleanPositiveNumber(body.defaultPackageWeight, existing.defaultPackageWeight),
    },
  });

  return NextResponse.json(settings);
}
