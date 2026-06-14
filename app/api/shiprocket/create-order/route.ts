import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Deprecated. Shipments are created only after verified payment." },
    { status: 410 },
  );
}
