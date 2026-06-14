import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getCurrentUser } from "@/actions/getCurrentUser";

function getBannerClient() {
    const bannerClient = (prisma as any).banner;
    if (!bannerClient) {
        throw new Error(
            "Prisma model `Banner` is not available. Run `npx prisma generate` and restart the server."
        );
    }
    return bannerClient;
}

export async function GET() {
    try {
        const banner = await getBannerClient().findFirst();
        return NextResponse.json(banner ?? null);
    } catch (error) {
        console.error("Banner GET error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to fetch banner",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const bannerClient = getBannerClient();

        const existing = await bannerClient.findFirst();

        if (existing) {
            const updated = await bannerClient.update({
                where: { id: existing.id },
                data: {
                    titleLine1: body.titleLine1,
                    titleLine2: body.titleLine2,
                    subtitle: body.subtitle,
                    offerText: body.offerText,
                    backgroundFrom: body.backgroundFrom,
                    backgroundTo: body.backgroundTo,
                    bannerImage: body.bannerImage,
                },
            });
            return NextResponse.json(updated);
        }

        const created = await bannerClient.create({
            data: {
                titleLine1: body.titleLine1,
                titleLine2: body.titleLine2,
                subtitle: body.subtitle,
                offerText: body.offerText,
                backgroundFrom: body.backgroundFrom,
                backgroundTo: body.backgroundTo,
                bannerImage: body.bannerImage,
            },
        });

        return NextResponse.json(created);
    } catch (error) {
        console.error("Banner POST error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to save banner",
            },
            { status: 500 }
        );
    }
}
