import { getCurrentUser } from "@/actions/getCurrentUser";
import { NextResponse } from "next/server";
import { Product, Review } from "@prisma/client";
import prisma from "@/libs/prismadb";


export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.error();

    }

    const body = await request.json()
    const { comment, rating, product, userId, photos } = body;

    const deliveredOrder = currentUser?.orders.some(order => {
        const products: Product[] = (() => {
            if (Array.isArray(order.products)) {
                return order.products as Product[];
            }
            if (typeof order.products === "string") {
                try {
                    const parsed = JSON.parse(order.products);
                    return Array.isArray(parsed) ? parsed as Product[] : [];
                } catch (error) {
                    console.error("Failed to parse order.products:", error);
                    return [];
                }
            }
            return [];
        })();

        return products.some((item: any) => (item.productId || item.id) === product.id) && order.deliveryStatus === "delivered";
    });





    const userReview = product?.reviews.find(((review: Review) => {
        return review.userId === currentUser.id
    }))

    if (userReview || !deliveredOrder) {
        return NextResponse.error();
    }

    const review = await prisma.review.create({
        data: {

            comment,
            rating,
            photos: Array.isArray(photos) ? photos : [],
            productId: product.id,
            userId,
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
