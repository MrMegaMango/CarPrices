import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 API route /api/makes called')
    console.log('🔍 Attempting to connect to database...')
    
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    console.log('🔍 Fetching car makes...')
    const makes = await prisma.carMake.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { carDeals: true }
        }
      }
    })

    console.log(`✅ Found ${makes.length} car makes`)
    return NextResponse.json(makes)
  } catch (error) {
    console.error('❌ Detailed error in /api/makes:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch makes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
