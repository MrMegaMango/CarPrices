import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as (Session & { user: { id: string } }) | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offsetVal = (page - 1) * limit

    const dealsQuery = `
      select 
        d.*,
        json_build_object('id', ma.id, 'name', ma.name) as make,
        json_build_object('id', mo.id, 'name', mo.name) as model
      from car_deals d
      join car_makes ma on ma.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      where d."userId" = $1
      order by d."createdAt" desc
      offset $2
      limit $3
    `

    const deals = await sql(
      dealsQuery,
      [session.user.id, offsetVal, limit]
    ) as Array<Record<string, unknown>>

    const countRows = await sql(
      'select count(*)::int as count from car_deals d where d."userId" = $1',
      [session.user.id]
    ) as Array<{ count: number }>

    const total = countRows[0]?.count ?? 0

    return NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching user deals:', error)
    return NextResponse.json({ error: 'Failed to fetch user deals' }, { status: 500 })
  }
}


