import { sql } from '@/lib/db'

// Ensures new columns exist. Safe to call multiple times (IF NOT EXISTS).
export async function ensureCarDealsColorColumns(): Promise<void> {
  await sql`
    alter table car_deals add column if not exists "exteriorColor" text;
  `
  await sql`
    alter table car_deals add column if not exists "interiorColor" text;
  `
}


