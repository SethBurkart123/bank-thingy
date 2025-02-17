import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorVerified: true
      }
    })
    
    console.log("All users in database:", users)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}