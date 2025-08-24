import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log('🚀 GET /api/makes - Request started')
  console.log('📊 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 20) + '...',
  })

  try {
    console.log('🔍 Testing Prisma connection...')
    
    // Test basic database connection first
    await prisma.$connect()
    console.log('✅ Prisma connection successful')

    console.log('📝 Executing findMany query for CarMake...')
    const makes = await prisma.carMake.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { carDeals: true }
        }
      }
    })

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
