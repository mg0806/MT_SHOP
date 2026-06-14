import { NextResponse } from "next/server";
import {
    getCheapestRoadCourier,
    getShiprocketAvailability,
} from "../courierService";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const data = await getShiprocketAvailability(payload);
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
