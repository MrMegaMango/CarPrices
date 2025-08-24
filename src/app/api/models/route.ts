import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const makeId = searchParams.get('makeId')

    const where = makeId ? { makeId } : {}

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

    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
