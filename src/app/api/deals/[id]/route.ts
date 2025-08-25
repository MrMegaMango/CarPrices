import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await sql`
      select 
        d.*,
        ma.name as "make.name",
        mo.name as "model.name",
        u.name as "user.name",
        u.email as "user.email"
      from car_deals d
      join car_makes ma on ma.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      join users u on u.id = d."userId"
      where d.id = ${id}
      limit 1
    ` as Array<Record<string, unknown>>
    const deal = rows[0]

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}
