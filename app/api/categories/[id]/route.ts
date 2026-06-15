import { getCurrentUser } from "@/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prismadb";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, icon } = body;
    const nextName = typeof name === "string" ? name.trim() : "";

    try {
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const [category, productsUpdate] = await prisma.$transaction([
            prisma.category.update({
                where: { id },
                data: {
                    ...(nextName && { name: nextName }),
                    ...(icon && { icon })
                }
            }),
            ...(nextName && nextName !== existingCategory.name
                ? [
                    prisma.product.updateMany({
                        where: { category: existingCategory.name },
                        data: { category: nextName },
                    }),
                ]
                : []),
        ]);

        return NextResponse.json({
            category,
            updatedProducts: "count" in productsUpdate ? productsUpdate.count : 0,
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Category name already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error updating category" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    try {
        // Get the category first
        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        // Check if any products exist with this category
        const productsCount = await prisma.product.count({
            where: { category: category.name }
        });

        let fallbackCategory = await prisma.category.findFirst({
            where: {
                id: { not: id },
                name: "Uncategorized",
            },
        });
        if (!fallbackCategory && productsCount > 0 && !force) {
            fallbackCategory = await prisma.category.create({
                data: {
                    name: "Uncategorized",
                    icon: "FaStore",
                },
            });
        }

        const [deletedCategory, productsResult] = await prisma.$transaction([
            prisma.category.delete({
                where: { id }
            }),
            productsCount > 0
                ? force
                    ? prisma.product.deleteMany({
                        where: { category: category.name }
                    })
                    : prisma.product.updateMany({
                        where: { category: category.name },
                        data: { category: fallbackCategory?.name || "Uncategorized" },
                    })
                : prisma.product.updateMany({
                    where: { category: category.name },
                    data: { category: fallbackCategory?.name || "Uncategorized" },
                }),
        ]);

        return NextResponse.json({
            deletedCategory,
            deletedProducts: force ? productsResult.count : 0,
            updatedProducts: force ? 0 : productsResult.count,
            fallbackCategory: force ? null : fallbackCategory?.name || "Uncategorized",
        });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching category" }, { status: 500 });
    }
}
