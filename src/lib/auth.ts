import GoogleProvider from "next-auth/providers/google"
import { sql } from "@/lib/db"

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
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: { user: any; account: any }) {
      console.log('SignIn callback called:', { 
        provider: account?.provider, 
        email: user?.email, 
        providerAccountId: account?.providerAccountId 
      })
      
      if (account?.provider === 'google' && user?.email) {
        try {
          // Check if user exists, if not create them
          const existingUser = await sql`
            select id from users where email = ${user.email} limit 1
          ` as Array<{ id: string }>

          console.log('Existing user check:', existingUser.length > 0 ? 'Found' : 'Not found')

          if (existingUser.length === 0) {
            // Create new user
            console.log('Creating new user with ID:', account.providerAccountId)
            await sql`
              insert into users (id, email, name, image, "updatedAt")
              values (${account.providerAccountId}, ${user.email}, ${user.name || null}, ${user.image || null}, CURRENT_TIMESTAMP)
              on conflict (email) do update set
                name = excluded.name,
                image = excluded.image,
                "updatedAt" = CURRENT_TIMESTAMP
            `
            console.log('User created successfully')
          }
          return true
        } catch (error) {
          console.error('Error creating user during sign-in:', error)
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
