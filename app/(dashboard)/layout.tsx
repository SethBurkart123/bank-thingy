import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { NavBar } from "@/components/nav-bar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
    </>
  )
}
