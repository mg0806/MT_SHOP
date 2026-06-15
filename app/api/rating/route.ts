import { getCurrentUser } from "@/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

const getOrderProducts = (products: unknown): any[] => {
    if (Array.isArray(products)) return products;
    if (typeof products === "string") {
        try {
            const parsed = JSON.parse(products);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const getProductIdFromOrderItem = (item: any) => item?.productId || item?.id;

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json()
    const { comment, rating, productId, product, photos } = body;
    const safeProductId = typeof productId === "string" ? productId : product?.id;
    const numericRating = Number(rating);

    if (!safeProductId || !comment || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    const deliveredOrder = currentUser.orders.some((order) => {
        if (order.deliveryStatus !== "delivered") return false;
        return getOrderProducts(order.products).some((item: any) => getProductIdFromOrderItem(item) === safeProductId);
    });

    if (!deliveredOrder) {
        return NextResponse.json({ error: "Reviews unlock after delivery" }, { status: 403 });
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            productId: safeProductId,
            userId: currentUser.id,
        },
    });

    if (existingReview) {
        return NextResponse.json({ error: "Product already reviewed" }, { status: 409 });
    }

    const review = await prisma.review.create({
        data: {
            comment,
            rating: numericRating,
            photos: Array.isArray(photos) ? photos : [],
            productId: safeProductId,
            userId: currentUser.id,
        }
    })

    return NextResponse.json(review)
}

export async function PUT(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, comment, rating, photos } = body;

    if (!reviewId || !comment || !rating) {
        return NextResponse.json({ error: "Missing review fields" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!existingReview || existingReview.userId !== currentUser.id) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            comment,
            rating: Number(rating),
            photos: Array.isArray(photos) ? photos : [],
        },
    });

    return NextResponse.json(updatedReview);
}
