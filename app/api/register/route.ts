import bcrypt from "bcrypt";
import  prisma  from "@/libs/prismadb";
import { NextResponse } from "next/server";


// creating a new user

export async function POST(request: Request){
    try {
    const body = await request.json()
    const {name,email,password} = body

    if (!name || !email || !password || password.length < 8) {
        return NextResponse.json(
            { error: "Name, valid email, and an 8+ character password are required" },
            { status: 400 }
        )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    })

    if (existingUser) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await prisma.user.create({
        data:{
            name: String(name).trim(),
            email: normalizedEmail,
            hashedPassword,
        }
    })

    const { hashedPassword: _hashedPassword, ...safeUser } = user
    return NextResponse.json(safeUser)
    } catch (error) {
        return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }
}

