import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/models - Request started')
  
  try {
    const { searchParams } = new URL(request.url)
    const makeId = searchParams.get('makeId')
    
    console.log('📊 Request params:', { makeId })
    console.log('🔍 Database URL exists:', !!process.env.DATABASE_URL)

    console.log('📝 Executing SQL query for car models...')
    const rows = (makeId
      ? await sql`
        select 
          mo.id,
          mo.name,
          mo."makeId" as "makeId",
          mo."createdAt" as "createdAt",
          mo."updatedAt" as "updatedAt",
          coalesce(count(d.id), 0)::int as "carDealsCount",
          ma.id as "make.id",
          ma.name as "make.name",
          ma.logo as "make.logo",
          ma."createdAt" as "make.createdAt",
          ma."updatedAt" as "make.updatedAt"
        from car_models mo
        join car_makes ma on ma.id = mo."makeId"
        left join car_deals d on d."modelId" = mo.id
        where mo."makeId" = ${makeId}
        group by mo.id, mo.name, mo."makeId", mo."createdAt", mo."updatedAt", ma.id, ma.name, ma.logo, ma."createdAt", ma."updatedAt"
        order by mo.name asc
      `
      : await sql`
        select 
          mo.id,
          mo.name,
          mo."makeId" as "makeId",
          mo."createdAt" as "createdAt",
          mo."updatedAt" as "updatedAt",
          coalesce(count(d.id), 0)::int as "carDealsCount",
          ma.id as "make.id",
          ma.name as "make.name",
          ma.logo as "make.logo",
          ma."createdAt" as "make.createdAt",
          ma."updatedAt" as "make.updatedAt"
        from car_models mo
        join car_makes ma on ma.id = mo."makeId"
        left join car_deals d on d."modelId" = mo.id
        group by mo.id, mo.name, mo."makeId", mo."createdAt", mo."updatedAt", ma.id, ma.name, ma.logo, ma."createdAt", ma."updatedAt"
        order by mo.name asc
      `) as Array<{
      id: string
      name: string
      makeId: string
      createdAt: string
      updatedAt: string
      carDealsCount: number
      'make.id': string
      'make.name': string
      'make.logo': string | null
      'make.createdAt': string
      'make.updatedAt': string
    }>

    const models = rows.map((r) => ({
      id: r.id,
      name: r.name,
      makeId: r.makeId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: { carDeals: r.carDealsCount },
      make: {
        id: r['make.id'],
        name: r['make.name'],
        logo: r['make.logo'],
        createdAt: r['make.createdAt'],
        updatedAt: r['make.updatedAt'],
      }
    }))

    console.log('✅ Query successful, found', models.length, 'models')
    return NextResponse.json(models)
    
  } catch (error) {
    console.error('❌ Error in GET /api/models:')
    console.error('Error type:', (error as Error)?.constructor?.name)
    console.error('Error message:', (error as Error)?.message)
    console.error('Error code:', (error as { code?: string })?.code)
    console.error('Error meta:', (error as { meta?: unknown })?.meta)
    console.error('Full error object:', error)
    
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: process.env.NODE_ENV === 'development' ? {
          message: (error as Error)?.message,
          type: (error as Error)?.constructor?.name,
          code: (error as { code?: string })?.code
        } : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🔚 GET /api/models - Request completed')
  }
}
