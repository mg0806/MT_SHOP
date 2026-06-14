import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb"; // adjust path as per your project
import { getCurrentUser } from "@/actions/getCurrentUser";

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL!;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD!;

let token: string | null = null;
let tokenExpiry = 0;

const normalizeDeliveryStatus = (status?: string) => {
    const normalized = status?.toLowerCase() || "";

    if (normalized.includes("delivered")) return "delivered";
    if (
        normalized.includes("shipped") ||
        normalized.includes("transit") ||
        normalized.includes("pickup") ||
        normalized.includes("manifest") ||
        normalized.includes("out for delivery")
    ) {
        return "dispatched";
    }

    return "pending";
};

export async function GET(req: NextRequest) {
    const awb = req.nextUrl.searchParams.get("awb");

    if (!awb) {
        return NextResponse.json({ error: "AWB number is required" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
        where: { awb },
        select: { userId: true },
    });

    if (!order) {
        return NextResponse.json({ error: "Order tracking is not available yet" }, { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && order.userId !== currentUser.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();

    if (!token || now > tokenExpiry) {
        try {
            const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
            });

            const data = await res.json();

            if (!res.ok || !data.token) {
                return NextResponse.json({ error: "Authentication failed", details: data?.message }, { status: 401 });
            }

            token = data.token;
            tokenExpiry = now + 60 * 60 * 1000;
        } catch (err: any) {
            return NextResponse.json({ error: "Token request failed", details: err.message }, { status: 500 });
        }
    }

    try {
        const trackingRes = await fetch(
            `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );


        const trackingData = await trackingRes.json();
        // console.log("Tracking Data:", trackingData.tracking_data?.shipment_track);

        if (!trackingRes.ok) {
            return NextResponse.json({ error: "Failed to get tracking info", details: trackingData }, { status: 500 });
        }

        // ✅ Extract latest status
        const shipmentTrack = trackingData?.tracking_data?.shipment_track;
        const latestShipment = Array.isArray(shipmentTrack)
            ? shipmentTrack[0]
            : shipmentTrack;
        const deliveryStatus = normalizeDeliveryStatus(latestShipment?.current_status);

        // ✅ Update the order in your DB by AWB
        await prisma.order.updateMany({
            where: { awb: awb },
            data: { deliveryStatus },
        });

        return NextResponse.json(trackingData);
    } catch (err: any) {
        return NextResponse.json({ error: "Tracking failed", details: err.message }, { status: 500 });
    }
}
