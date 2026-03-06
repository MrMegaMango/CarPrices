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

export async function ensureFeedbackTable(): Promise<void> {
  await sql`
    create table if not exists feedback (
      id serial primary key,
      name text not null,
      email text not null,
      subject text not null,
      message text not null,
      created_at timestamp with time zone default now()
    );
  `
}


