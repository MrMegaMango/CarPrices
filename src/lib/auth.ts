import GoogleProvider from "next-auth/providers/google"
import { sql } from "@/lib/db"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions = {
  // Temporarily disable Prisma adapter to test OAuth flow
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET 
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []
    ),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          // Check if user exists, if not create them
          const existingUser = await sql`
            select id from users where email = ${user.email} limit 1
          ` as Array<{ id: string }>

          if (existingUser.length === 0) {
            // Create new user
            await sql`
              insert into users (id, email, name, image)
              values (${account.providerAccountId}, ${user.email}, ${user.name || null}, ${user.image || null})
              on conflict (email) do update set
                name = excluded.name,
                image = excluded.image,
                "updatedAt" = CURRENT_TIMESTAMP
            `
          }
          return true
        } catch (error) {
          console.error('Error creating user:', error)
          return false
        }
      }
      return true
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID to session
      if (session.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // Persist user ID in token from Google account
      if (account?.provider === 'google' && account?.providerAccountId) {
        token.sub = account.providerAccountId
      } else if (user?.id) {
        token.sub = user.id
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
