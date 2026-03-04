import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      select distinct "dealerLocation"
      from car_deals
      where "isPublic" = true and "dealerLocation" is not null and "dealerLocation" != ''
      order by "dealerLocation" asc
    ` as Array<{ dealerLocation: string }>

    return NextResponse.json(rows.map(r => r.dealerLocation))
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
