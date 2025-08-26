import GoogleProvider from "next-auth/providers/google"

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
    async signIn() {
      // Allow all sign-ins for testing
      return true
    },
    async session({ session, token }: { session: { user?: { id?: string } }; token: { sub?: string } }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: { token: { sub?: string }; user?: { id?: string } }) {
      // Persist user ID in token
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
