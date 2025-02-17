import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { authenticator } from "otplib"
import { NextResponse } from "next/server"

export const authOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email.toLowerCase()
          }
        })

        if (!user) {
          return null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          return null
        }

        // Only check 2FA if it's enabled AND verified
        if (user.twoFactorEnabled && user.twoFactorVerified) {
          if (!credentials.code) {
            throw new Error('2FA_REQUIRED')
          }

          const isValidCode = authenticator.verify({
            token: credentials.code,
            secret: user.twoFactorSecret || ''
          })

          if (!isValidCode) {
            throw new Error('INVALID_2FA')
          }
        }

        // If we get here, either 2FA is not enabled or verification passed
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.requiresTwoFactor = user.requiresTwoFactor
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.requiresTwoFactor = token.requiresTwoFactor
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
