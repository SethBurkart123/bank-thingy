import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { headers } from "next/headers"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const headersList = headers()
  const userEmail = session.user.email

  // Set up SSE headers
  const response = new NextResponse(
    new ReadableStream({
      start(controller) {
        // Store the controller in a global map with the user's email as the key
        if (!global.controllers) {
          global.controllers = new Map()
        }
        global.controllers.set(userEmail, controller)

        // Clean up when the connection is closed
        headersList.get("connection")?.includes("close") && global.controllers.delete(userEmail)
      }
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    }
  )

  return response
}

// Helper function to notify a user of updates
export async function notifyUser(userEmail: string) {
  const controller = global.controllers?.get(userEmail)
  if (controller) {
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode("data: update\n\n"))
  }
}
