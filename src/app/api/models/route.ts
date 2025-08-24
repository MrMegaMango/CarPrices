import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/models - Request started')
  
  try {
    const { searchParams } = new URL(request.url)
    const makeId = searchParams.get('makeId')
    
    console.log('📊 Request params:', { makeId })
    console.log('🔍 Database URL exists:', !!process.env.DATABASE_URL)

    const where = makeId ? { makeId } : {}
    
    console.log('📝 Executing findMany query for CarModel with where:', where)

    // Test connection first
    await prisma.$connect()
    console.log('✅ Prisma connection successful')

    const models = await prisma.carModel.findMany({
      where,
      include: {
        make: true,
        _count: {
          select: { carDeals: true }
        }
      },
      orderBy: { name: 'asc' }
    })

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
