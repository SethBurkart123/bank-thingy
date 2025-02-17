// Helper function to notify a user of updates
export async function notifyUser(userEmail: string) {
  const controller = (global as any).controllers?.get(userEmail)
  if (controller) {
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode("data: update\n\n"))
  }
} 