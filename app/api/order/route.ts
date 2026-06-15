import  prisma  from "@/libs/prismadb";
import { NextResponse } from "next/server";
import  {getCurrentUser}  from "@/actions/getCurrentUser";


export async function PUT(request: Request){
    const currentUser = await getCurrentUser()

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {id,deliveryStatus} = body

    const order = await prisma.order.update({
    where:{id:id},
    data:{deliveryStatus}

    })

    return NextResponse.json(order) 
}
