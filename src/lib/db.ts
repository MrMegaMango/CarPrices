import { neon } from '@neondatabase/serverless'

// Create a singleton Neon SQL client for serverless/Edge-safe HTTP connections
const globalForNeon = globalThis as unknown as {
  neonSql: ReturnType<typeof neon> | undefined
}

export const sql =
  globalForNeon.neonSql ?? neon(process.env.DATABASE_URL as string)

if (process.env.NODE_ENV !== 'production') {
  globalForNeon.neonSql = sql
}


