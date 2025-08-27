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


// Ensure columns for anonymous/guest attribution exist
export async function ensureCarDealsGuestColumns(): Promise<void> {
  await sql`
    alter table car_deals add column if not exists "guestId" text;
  `
  await sql`
    alter table car_deals add column if not exists "guestIpHash" text;
  `
}


