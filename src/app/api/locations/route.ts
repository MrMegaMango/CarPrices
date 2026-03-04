import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { extractState } from '@/lib/states'

export async function GET() {
  try {
    const rows = await sql`
      select distinct "dealerLocation"
      from car_deals
      where "isPublic" = true and "dealerLocation" is not null and "dealerLocation" != ''
    ` as Array<{ dealerLocation: string }>

    const states = new Set<string>()
    for (const row of rows) {
      const state = extractState(row.dealerLocation)
      if (state) states.add(state)
    }

    return NextResponse.json([...states].sort())
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
