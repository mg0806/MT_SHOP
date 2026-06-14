import prisma from '@/libs/prismadb'
import { getCurrentUser } from './getCurrentUser';

interface Iparams{

    orderId?: string

}

export default async function getOrderById(params:Iparams) {
    try {
        const {orderId} = params
        const currentUser = await getCurrentUser();

        if (!currentUser || !orderId) {
            return null;
        }

        const order = await prisma.order.findUnique({
            where:{
                id: orderId
            }
        })

        if (!order) {
            return null
        }

        if (currentUser.role !== 'ADMIN' && order.userId !== currentUser.id) {
            return null;
        }

        const products =
            typeof order.products === "string"
                ? JSON.parse(order.products)
                : order.products;

        if (!Array.isArray(products)) {
            return order;
        }

        const productIds = products
            .map((item: any) => item.productId || item.id)
            .filter(Boolean);

        if (!productIds.length) {
            return order;
        }

        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, images: true },
        });
        const productImageMap = new Map(dbProducts.map((product) => [product.id, product.images]));

        return {
            ...order,
            products: products.map((item: any) => {
                if (item.selectedImg?.images?.[0]) return item;

                const images = productImageMap.get(item.productId || item.id);
                const imageGroups = Array.isArray(images) ? images : [];
                const firstImageGroup = imageGroups[0] as any;

                return {
                    ...item,
                    selectedImg: {
                        color: item.selectedImg?.color || firstImageGroup?.color || "",
                        colorCode: item.selectedImg?.colorCode || firstImageGroup?.colorCode || "",
                        images:
                            item.selectedImg?.images ||
                            firstImageGroup?.images ||
                            (firstImageGroup?.image ? [firstImageGroup.image] : []),
                    },
                };
            }),
        };
    } catch (error : any) {
        throw new Error(error)
    }
}
