import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Test database by counting makes
    const countRows = await sql`select count(*)::int as count from car_makes` as Array<{ count: number }>
    const makeCount = countRows[0]?.count ?? 0
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      makeCount,
      timestamp: new Date().toISOString(),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
