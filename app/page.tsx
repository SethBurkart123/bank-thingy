'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Smartphone, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: <Shield className="h-12 w-12 text-violet-500" />,
    title: "Secure Banking",
    description: "Bank with confidence knowing your money is protected by state-of-the-art security measures."
  },
  {
    icon: <Lock className="h-12 w-12 text-violet-500" />,
    title: "Two-Factor Authentication",
    description: "Add an extra layer of security to your account with our advanced 2FA system."
  },
  {
    icon: <Smartphone className="h-12 w-12 text-violet-500" />,
    title: "Modern Experience",
    description: "Enjoy a seamless banking experience with our intuitive and responsive platform."
  }
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">SecureBank</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Banking Made <span className="text-violet-500">Secure</span> and Simple
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              Experience modern banking with uncompromising security. Your money, your control, our protection.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-violet-500 to-purple-500">
              <Link href="/register" className="text-lg">
                Open an Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-slate-50/50">
          <div className="container mx-auto px-4 py-24">
            <div className="grid gap-12 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h2 className="mb-3 text-xl font-semibold">{feature.title}</h2>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between space-y-4 text-center md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">SecureBank</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SecureBank. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
