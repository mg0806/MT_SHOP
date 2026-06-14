import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { product } from '../../../Utils/product';
import getProducts from "@/actions/getProduct";


// creating a new user

export async function POST(request: Request) {
    const currentUser = await getCurrentUser()


    if (!currentUser) {
        return NextResponse.error()
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.error()
    }

    const body = await request.json()
    // console.log(body);
    const { name, description, price, brand, weight, category, inStock, images, quantity, availableSizes, isNewArrival } = body
    const weightInKg = weight / 1000;
    const Quantity = parseInt(quantity)
    const product = await prisma.product.create({
        data: {
            name,
            description,
            brand,
            category,
            inStock,
            isNewArrival: Boolean(isNewArrival),
            images,
            availableSizes: Array.isArray(availableSizes) ? availableSizes : [],
            price: parseFloat(price),
            quantity: Quantity,
            weight: weightInKg,

        }
    })
    return NextResponse.json(product)
}

export async function PUT(request: Request) {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return NextResponse.error()
    }

    const body = await request.json()

    if (Array.isArray(body.ids) && body.ids.length > 0 && body.discount !== undefined) {
        const discountValue = Number(body.discount)
        if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
            return NextResponse.json({ message: 'Invalid discount value' }, { status: 400 })
        }

        const updates = await Promise.all(
            body.ids.map(async (productId: string) => {
                const existingProduct = await prisma.product.findUnique({
                    where: { id: productId },
                })

                if (!existingProduct) {
                    return null
                }

                const finalPrice = Number(
                    (existingProduct.price - existingProduct.price * (discountValue / 100)).toFixed(2)
                )

                return prisma.product.update({
                    where: { id: productId },
                    data: {
                        discount: discountValue,
                        finalPrice,
                    },
                })
            }),
        )

        const updatedProducts = updates.filter(Boolean)
        return NextResponse.json(updatedProducts)
    }

    const { id, inStock, isNewArrival } = body

    const data: { inStock?: boolean; isNewArrival?: boolean } = {}
    if (typeof inStock === 'boolean') data.inStock = inStock
    if (typeof isNewArrival === 'boolean') data.isNewArrival = isNewArrival

    const product = await prisma.product.update({
        where: { id: id },
        data

    })

    return NextResponse.json(product)
}
export async function GET(request: Request) {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');  // Extract category from query params

    const products = await getProducts({ category });
    return NextResponse.json(products);
}
