import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import getCategories from "@/actions/getCategories";

export async function GET(request: Request) {
    try {
        const categories = await getCategories();
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, icon } = body;

    try {
        const category = await prisma.category.create({
            data: {
                name,
                icon: icon || "FaStore",
            }
        });
        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error creating category" }, { status: 500 });
    }
}
