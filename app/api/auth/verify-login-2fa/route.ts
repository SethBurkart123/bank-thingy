import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authenticator } from "otplib"

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user?.twoFactorSecret) {
      return new NextResponse("2FA not set up", { status: 400 })
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    })

    if (!isValid) {
      return new NextResponse("Invalid code", { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA verification error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 