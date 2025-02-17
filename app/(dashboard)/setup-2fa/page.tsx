'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Setup2FAPage() {
  const router = useRouter()

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const handleEnable = () => {
    router.push("/2fa")
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Enhance Your Security</CardTitle>
          <CardDescription>
            Would you like to enable Two-Factor Authentication for your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
          </p>
          <div className="flex space-x-4">
            <Button onClick={handleEnable}>Enable 2FA</Button>
            <Button variant="outline" onClick={handleSkip}>Skip for now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 