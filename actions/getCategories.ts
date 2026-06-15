import prisma from '@/libs/prismadb'
import { unstable_noStore as noStore } from 'next/cache';

export default async function getCategories() {
    noStore();

    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return categories;
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
