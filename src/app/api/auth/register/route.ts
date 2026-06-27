import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName } = await req.json()

    if (!email || !password || !orgName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    // Create org and user in transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizations: {
          create: {
            role: "ADMIN",
            organization: {
              create: {
                name: orgName,
                slug: orgSlug
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
