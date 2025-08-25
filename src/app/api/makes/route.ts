import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  console.log('🚀 GET /api/makes - Request started')
  console.log('📊 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 20) + '...',
  })

  try {
    console.log('📝 Executing SQL query for car makes with counts...')
    const rows = await sql`
      select 
        m.id,
        m.name,
        m.logo,
        m."createdAt" as "createdAt",
        m."updatedAt" as "updatedAt",
        coalesce(count(d.id), 0)::int as "carDealsCount"
      from car_makes m
      left join car_deals d on d."makeId" = m.id
      group by m.id, m.name, m.logo, m."createdAt", m."updatedAt"
      order by m.name asc
    ` as Array<{
      id: string
      name: string
      logo: string | null
      createdAt: string
      updatedAt: string
      carDealsCount: number
    }>

    const makes = rows.map((r: {
      id: string
      name: string
      logo: string | null
      createdAt: string
      updatedAt: string
      carDealsCount: number
    }) => ({
      id: r.id,
      name: r.name,
      logo: r.logo,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: { carDeals: r.carDealsCount },
    }))

    console.log('✅ Query successful, found', makes.length, 'makes')
    console.log('📋 Makes summary:', makes.map(make => ({ 
      id: make.id, 
      name: make.name, 
      dealCount: make._count.carDeals 
    })))

    const response = NextResponse.json(makes)
    console.log('🎉 Response prepared successfully')
    return response

  } catch (error) {
    console.error('❌ Error in GET /api/makes:')
    console.error('Error type:', (error as Error)?.constructor?.name)
    console.error('Error message:', (error as Error)?.message)
    console.error('Error code:', (error as { code?: string })?.code)
    console.error('Error meta:', (error as { meta?: unknown })?.meta)
    console.error('Full error object:', error)
    
    // Log stack trace for better debugging
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch makes',
        details: process.env.NODE_ENV === 'development' ? {
          message: (error as Error)?.message,
          type: (error as Error)?.constructor?.name,
          code: (error as { code?: string })?.code
        } : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🔚 GET /api/makes - Request completed')
  }
}
