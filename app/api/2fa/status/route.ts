import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth.config"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("2FA Status - Starting request")
    
    const session = await getServerSession(authOptions)
    console.log("2FA Status - Session:", session)
    
    if (!session?.user?.email) {
      console.log("2FA Status - No session or email found")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.$queryRaw`
      SELECT id, twoFactorEnabled, twoFactorVerified 
      FROM User 
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `
    console.log("2FA Status - Raw user query result:", user)

    const userRecord = Array.isArray(user) ? user[0] : null
    console.log("2FA Status - Processed user record:", userRecord)

    if (!userRecord) {
      console.log("2FA Status - User not found in database")
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json({
      isEnabled: userRecord.twoFactorEnabled === 1,
      isVerified: userRecord.twoFactorVerified === 1
    })
  } catch (error) {
    console.error("2FA Status - Detailed error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
