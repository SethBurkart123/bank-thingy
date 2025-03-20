'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, KeyRound, Mail, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!show2FA) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error === "2FA_REQUIRED") {
          setShow2FA(true)
          setLoading(false)
          toast({
            title: "2FA Required",
            description: "Please enter your two-factor authentication code.",
          })
          return
        }

        if (!result?.ok) {
          toast({
            title: "Error",
            description: "Invalid email or password.",
            variant: "destructive",
          })
          return
        }

        router.push("/dashboard")
        router.refresh()
      } else {
        const finalSignIn = await signIn("credentials", {
          email,
          password,
          code,
          redirect: false,
        })

        if (finalSignIn?.ok) {
          router.push("/dashboard")
          router.refresh()
        } else {
          toast({
            title: "Invalid Code",
            description: "The 2FA code you entered is incorrect. Please try again.",
            variant: "destructive",
          })
          setCode("")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Shield className="mr-2 h-6 w-6" />
          SecureBank
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;The most secure and reliable way to manage your money.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {show2FA ? "Two-Factor Authentication" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {show2FA 
                ? "Enter the code from your authenticator app" 
                : "Enter your credentials to sign in"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!show2FA ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter 2FA code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                  maxLength={6}
                  pattern="\d{6}"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (show2FA ? "Verify" : "Sign In")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href="/register" className="w-full">
              Create an account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {show2FA && (
            <Button 
              variant="ghost" 
              className="text-sm text-muted-foreground"
              onClick={() => {
                setShow2FA(false)
                setCode("")
              }}
            >
              ← Back to login
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}