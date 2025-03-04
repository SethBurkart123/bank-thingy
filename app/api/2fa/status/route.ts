import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.$queryRaw`
      SELECT "id", "twoFactorEnabled", "twoFactorVerified" FROM "User"
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `;

    const userRecord = Array.isArray(user) ? user[0] : null;

    if (!userRecord) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      isEnabled: userRecord.twoFactorEnabled === 1,
      isVerified: userRecord.twoFactorVerified === 1,
    });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
