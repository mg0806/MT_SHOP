import { NextResponse } from "next/server";
import getStoreSettings from "@/actions/getStoreSettings";
import {
    getCheapestRoadCourier,
    getShiprocketAvailability,
} from "../courierService";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const settings = await getStoreSettings();
        const data = await getShiprocketAvailability({
            pickup_postcode: payload.pickup_postcode || settings.pickupPincode,
            delivery_postcode: payload.delivery_postcode,
            weight: payload.weight || settings.defaultPackageWeight,
            length: payload.length || settings.defaultPackageLength,
            breadth: payload.breadth || settings.defaultPackageBreadth,
            height: payload.height || settings.defaultPackageHeight,
            cod: Boolean(payload.cod),
        });
        const cheapestRoadCourier = getCheapestRoadCourier(
            data?.available_courier_companies || []
        );

        return NextResponse.json({
            ...data,
            cheapest_road_courier: cheapestRoadCourier,
        });
    } catch (error: any) {
        console.error("Shiprocket delivery availability error:", error?.message || error);
        return NextResponse.json(
            { error: error?.message || "Failed to check delivery" },
            { status: 500 }
        );
    }
}
