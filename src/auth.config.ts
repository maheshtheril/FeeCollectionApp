import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizations = (user as any).organizations
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Expose organizations to the client
        ;(session.user as any).organizations = token.organizations
      }
      return session
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig

