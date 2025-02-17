import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { authenticator } from "otplib"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { code } = await req.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
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

    // Disable 2FA
    await db.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA disable error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}