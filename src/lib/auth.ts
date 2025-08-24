import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  // Temporarily disable Prisma adapter to test OAuth flow
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn() {
      // Allow all sign-ins for testing
      return true
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
