import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - SecureBank",
  description: "Login or create an account to access SecureBank",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
