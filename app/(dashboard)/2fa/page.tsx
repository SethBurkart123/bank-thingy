'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function TwoFactorPage() {
  const [qrCode, setQrCode] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEnabled, setIsEnabled] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [disableCode, setDisableCode] = useState("")
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Fetch 2FA status and QR code if not enabled
    const fetch2FAStatus = async () => {
      try {
        const response = await fetch('/api/2fa/status')
        const data = await response.json()
        setIsEnabled(data.isEnabled)
        setIsVerified(data.isVerified)
        
        if (!data.isEnabled) {
          const qrResponse = await fetch('/api/2fa/setup')
          const qrData = await qrResponse.json()
          setQrCode(qrData.qrCode)
        }
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error)
      }
    }

    fetch2FAStatus()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      })

      setIsEnabled(true)
      setIsVerified(true)
      router.refresh()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please check your code and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: disableCode }),
      })

      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      })

      setIsEnabled(false)
      setIsVerified(false)
      setShowDisable(false)
      setDisableCode("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please check your code and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-10"
    >
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enhance your account security with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isEnabled ? (
            <div className="space-y-6">
              <div className="text-sm text-gray-500">
                <p>1. Install an authenticator app like Google Authenticator or Authy</p>
                <p>2. Scan the QR code below with your authenticator app</p>
                <p>3. Enter the verification code from your app</p>
              </div>
              
              {qrCode && (
                <div className="flex justify-center py-4">
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full"
                  />
                </div>
                <Button type="submit" disabled={loading || verificationCode.length !== 6}>
                  {loading ? "Verifying..." : "Enable 2FA"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {!showDisable ? (
                <>
                  <div className="rounded-lg bg-green-50 p-4 text-green-700">
                    <p className="font-medium">Two-factor authentication is enabled</p>
                    <p className="text-sm mt-1">Your account is now more secure.</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDisable(true)}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleDisable} className="space-y-4">
                  <div>
                    <label htmlFor="disable-code" className="block text-sm font-medium mb-2">
                      Enter your 2FA code to confirm disabling
                    </label>
                    <Input
                      id="disable-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={loading || disableCode.length !== 6}
                    >
                      {loading ? "Verifying..." : "Confirm Disable"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDisable(false)
                        setDisableCode("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
