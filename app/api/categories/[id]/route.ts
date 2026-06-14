import { getCurrentUser } from "@/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prismadb";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.error();
    }

    const body = await request.json();
    const { name, icon } = body;

    try {
        const category = await prisma.category.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(icon && { icon })
            }
        });
        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Category name already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error updating category" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.error();
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    try {
        // Get the category first
        const category = await prisma.category.findUnique({
            where: { id: params.id }
        });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        // Check if any products exist with this category
        const productsCount = await prisma.product.count({
            where: { category: category.name }
        });

        if (productsCount > 0 && !force) {
            return NextResponse.json({
                message: `Cannot delete category. ${productsCount} product(s) exist in this category. Deleting will remove all products.`,
                productsCount
            }, { status: 400 });
        }

        if (force) {
            // Delete all products in this category
            await prisma.product.deleteMany({
                where: { category: category.name }
            });
        }

        const deletedCategory = await prisma.category.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            deletedCategory,
            deletedProducts: force ? productsCount : 0
        });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: params.id },
        });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching category" }, { status: 500 });
    }
}