import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "../auth/auth.config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { recipientEmail, amount } = body;

    if (!recipientEmail || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!EMAIL_REGEX.test(recipientEmail)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const sender = await db.user.findUnique({
      where: { email: session.user.email },
    });

    // Replace raw SQL query with safe Prisma query
    const recipient = await db.user.findFirst({
      where: {
        email: {
          equals: recipientEmail.toLowerCase(),
        },
      },
    });

    if (!sender || !recipient) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (sender.balance < amount) {
      return new NextResponse("Insufficient funds", { status: 400 });
    }

    // Create transaction and update balances
    await db.$transaction([
      db.transaction.create({
        data: {
          amount: -amount,
          type: "SEND",
          userId: sender.id,
          senderId: sender.id,
          recipientId: recipient.id,
        },
      }),
      db.transaction.create({
        data: {
          amount: amount,
          type: "RECEIVE",
          userId: recipient.id,
          senderId: sender.id,
          recipientId: recipient.id,
        },
      }),
      db.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: amount } },
      }),
      db.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    return new NextResponse("Transaction successful", { status: 200 });
  } catch (error) {
    console.error("[TRANSACTION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            sender: { select: { email: true } },
            recipient: { select: { email: true } },
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user.transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
