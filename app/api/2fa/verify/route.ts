import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { db } from "@/lib/db"
import { authenticator } from "otplib"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { code } = body

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

    // Enable 2FA and mark as verified
    await db.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        twoFactorVerified: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA verification error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
