import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { randomBytes } from 'crypto'
import { ensureCarDealsColorColumns, ensureCarDealsGuestColumns } from '@/lib/db-migrate'

type SampleSpec = {
  make: string
  model: string
  year: number
  trim?: string | null
  exteriorColor?: string | null
  interiorColor?: string | null
  msrp: number
  sellingPrice: number
  otdPrice?: number | null
  rebates?: number | null
  dealerName?: string | null
  dealerLocation?: string | null
  dealDate: string // ISO date
  isLeased?: boolean
  financingRate?: number | null
  financingTerm?: number | null
  downPayment?: number | null
  monthlyPayment?: number | null
  notes?: string | null
}

async function findOrCreateMake(name: string): Promise<{ id: string; name: string }> {
  const existing = await sql`
    select id, name from car_makes where lower(name) = lower(${name}) limit 1
  ` as Array<{ id: string; name: string }>
  if (existing.length > 0) return existing[0]
  const inserted = await sql`
    insert into car_makes (name) values (${name}) returning id, name
  ` as Array<{ id: string; name: string }>
  return inserted[0]
}

async function findOrCreateModel(makeId: string, name: string): Promise<{ id: string; name: string }> {
  const existing = await sql`
    select id, name from car_models where lower(name) = lower(${name}) and "makeId" = ${makeId} limit 1
  ` as Array<{ id: string; name: string }>
  if (existing.length > 0) return existing[0]
  const inserted = await sql`
    insert into car_models (name, "makeId") values (${name}, ${makeId}) returning id, name
  ` as Array<{ id: string; name: string }>
  return inserted[0]
}

export async function POST(request: NextRequest) {
  try {
    // Basic guard: allow in non-production or require token
    const token = request.headers.get('x-seed-token') || new URL(request.url).searchParams.get('token')
    const requireToken = process.env.NODE_ENV === 'production'
    if (requireToken && token !== process.env.SEED_TOKEN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ensure required columns exist and guest user exists
    await ensureCarDealsColorColumns()
    await ensureCarDealsGuestColumns()
    await sql`
      insert into users (id, email, name, image, "updatedAt")
      values ('guest', ${'guest@anon.local'}, 'Guest', ${null}, CURRENT_TIMESTAMP)
      on conflict (id) do update set "updatedAt" = EXCLUDED."updatedAt"
    `

    const samples: SampleSpec[] = [
      {
        make: 'Ford', model: 'Bronco', year: 2024, trim: 'Badlands', exteriorColor: 'Area 51', interiorColor: 'Black',
        msrp: 49990, sellingPrice: 46800, otdPrice: 50500, rebates: 1000,
        dealerName: 'Blue Oval Ford', dealerLocation: 'Austin, TX', dealDate: new Date().toISOString().split('T')[0],
        financingRate: 4.9, financingTerm: 60, downPayment: 3000, monthlyPayment: 620,
        notes: 'Included tow package and hard top.'
      },
      {
        make: 'Subaru', model: 'WRX', year: 2023, trim: 'Premium 6MT', exteriorColor: 'WR Blue', interiorColor: 'Black',
        msrp: 33495, sellingPrice: 31950, otdPrice: 34800, rebates: 500,
        dealerName: 'Mountain Subaru', dealerLocation: 'Denver, CO', dealDate: new Date().toISOString().split('T')[0],
        notes: 'No ADM. All-weather mats thrown in.'
      },
      {
        make: 'Ram', model: '1500', year: 2024, trim: 'Big Horn Crew Cab 4x4', exteriorColor: 'Granite Crystal', interiorColor: 'Black',
        msrp: 56500, sellingPrice: 49900, otdPrice: 53700, rebates: 3500,
        dealerName: 'Lone Star RAM', dealerLocation: 'Dallas, TX', dealDate: new Date().toISOString().split('T')[0],
        notes: 'Level 1 package, spray-in bedliner.'
      },
      {
        make: 'Toyota', model: 'Camry', year: 2024, trim: 'SE', exteriorColor: 'Celestial Silver', interiorColor: 'Black',
        msrp: 30450, sellingPrice: 28900, otdPrice: 31500, rebates: 0,
        dealerName: 'Sunrise Toyota', dealerLocation: 'Long Island, NY', dealDate: new Date().toISOString().split('T')[0],
        financingRate: 3.9, financingTerm: 60, downPayment: 2000, monthlyPayment: 470,
        notes: 'Included window tint.'
      },
      {
        make: 'BMW', model: 'X3', year: 2024, trim: 'xDrive30i', exteriorColor: 'Alpine White', interiorColor: 'Cognac',
        msrp: 50900, sellingPrice: 48500, otdPrice: 52500, rebates: 1250,
        dealerName: 'Bavarian BMW', dealerLocation: 'San Jose, CA', dealDate: new Date().toISOString().split('T')[0],
        notes: 'Premium package; 36/10K lease quote was $639/mo with $3K DAS.'
      },
      {
        make: 'BMW', model: '230i', year: 2023, trim: 'RWD', exteriorColor: 'Brooklyn Grey', interiorColor: 'Black',
        msrp: 38795, sellingPrice: 36900, otdPrice: 40100, rebates: 750,
        dealerName: 'Metro BMW', dealerLocation: 'Chicago, IL', dealDate: new Date().toISOString().split('T')[0],
        notes: 'Driver Assistance + Moonroof.'
      },
    ]

    const insertedIds: string[] = []

    for (const s of samples) {
      const make = await findOrCreateMake(s.make)
      const model = await findOrCreateModel(make.id, s.model)

      const id = randomBytes(16).toString('hex')
      await sql`
        insert into car_deals (
          id, "userId", "makeId", "modelId", year, trim, color, "exteriorColor", "interiorColor",
          msrp, "sellingPrice", "otdPrice", rebates,
          "dealerName", "dealerLocation", "dealDate", "financingRate",
          "financingTerm", "downPayment", "monthlyPayment", notes, "isLeased",
          "leaseTermMonths", "mileageAllowance", verified, "isPublic", "guestId", "guestIpHash", "updatedAt"
        ) values (
          ${id}, ${'guest'}, ${make.id}, ${model.id}, ${s.year}, ${s.trim ?? null}, ${null}, ${s.exteriorColor ?? null}, ${s.interiorColor ?? null},
          ${Math.round(s.msrp * 100)}, ${Math.round(s.sellingPrice * 100)}, ${s.otdPrice ? Math.round(s.otdPrice * 100) : null}, ${s.rebates ? Math.round(s.rebates * 100) : null},
          ${s.dealerName ?? null}, ${s.dealerLocation ?? null}, ${new Date(s.dealDate)}, ${s.financingRate ?? null},
          ${s.financingTerm ?? null}, ${s.downPayment ? Math.round(s.downPayment * 100) : null}, ${s.monthlyPayment ? Math.round(s.monthlyPayment * 100) : null}, ${s.notes ?? null}, ${false},
          ${null}, ${null}, ${false}, ${true}, ${'seed'}, ${null}, CURRENT_TIMESTAMP
        )
        on conflict (id) do nothing
      `
      insertedIds.push(id)
    }

    return NextResponse.json({ inserted: insertedIds.length, ids: insertedIds })
  } catch (error) {
    console.error('Error seeding mock reports:', error)
    return NextResponse.json({ error: 'Failed to seed mock reports' }, { status: 500 })
  }
}


