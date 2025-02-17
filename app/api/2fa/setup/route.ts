import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { authenticator } from "otplib"
import QRCode from "qrcode"

export async function GET() {
  try {
    console.log("2FA Setup - Starting request")
    
    const session = await getServerSession(authOptions)
    console.log("2FA Setup - Session:", session)
    
    if (!session?.user?.email) {
      console.log("2FA Setup - No session or email found")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    console.log("2FA Setup - User found:", !!user)

    if (!user) {
      console.log("2FA Setup - User not found in database")
      return new NextResponse("User not found", { status: 404 })
    }

    const secret = user.twoFactorSecret || authenticator.generateSecret()
    console.log("2FA Setup - Secret generated/retrieved")

    if (!user.twoFactorSecret) {
      console.log("2FA Setup - Saving new secret")
      await db.user.update({
        where: { email: session.user.email },
        data: { twoFactorSecret: secret }
      })
    }

    const otpauth = authenticator.keyuri(
      user.email,
      "SecureBank",
      secret
    )
    
    const qrCode = await QRCode.toDataURL(otpauth)
    console.log("2FA Setup - QR code generated successfully")

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error("2FA Setup - Detailed error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
