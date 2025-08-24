import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const dealSchema = z.object({
  makeId: z.string(),
  modelId: z.string(),
  year: z.number().min(1990).max(new Date().getFullYear() + 2),
  trim: z.string().optional(),
  color: z.string().optional(),
  msrp: z.number().positive(),
  sellingPrice: z.number().positive(),
  otdPrice: z.number().positive().optional(),
  rebates: z.number().optional(),
  tradeInValue: z.number().optional(),
  dealerName: z.string().optional(),
  dealerLocation: z.string().optional(),
  dealDate: z.string().transform((str) => new Date(str)),
  financingRate: z.number().optional(),
  financingTerm: z.number().optional(),
  downPayment: z.number().optional(),
  monthlyPayment: z.number().optional(),
  notes: z.string().optional(),
  isLeased: z.boolean().default(false),
  leaseTermMonths: z.number().optional(),
  mileageAllowance: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const makeId = searchParams.get('makeId')
    const modelId = searchParams.get('modelId')
    const year = searchParams.get('year')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: {
      isPublic: boolean
      makeId?: string
      modelId?: string
      year?: number
      sellingPrice?: {
        gte?: number
        lte?: number
      }
    } = {
      isPublic: true,
    }

    if (makeId) where.makeId = makeId
    if (modelId) where.modelId = modelId
    if (year) where.year = parseInt(year)
    if (minPrice || maxPrice) {
      where.sellingPrice = {}
      if (minPrice) where.sellingPrice.gte = parseInt(minPrice) * 100 // Convert to cents
      if (maxPrice) where.sellingPrice.lte = parseInt(maxPrice) * 100 // Convert to cents
    }

    let orderBy: Record<string, string> = {}
    switch (sortBy) {
      case 'price':
        orderBy = { sellingPrice: sortOrder }
        break
      case 'savings':
        // This would need a computed field in real implementation
        orderBy = { createdAt: sortOrder }
        break
      default:
        orderBy = { createdAt: sortOrder }
    }

    const [deals, total] = await Promise.all([
      prisma.carDeal.findMany({
        where,
        include: {
          make: true,
          model: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.carDeal.count({ where }),
    ])

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
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { id: string } } | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = dealSchema.parse(body)

    // Convert dollar amounts to cents
    const dealData = {
      ...validatedData,
      msrp: Math.round(validatedData.msrp * 100),
      sellingPrice: Math.round(validatedData.sellingPrice * 100),
      otdPrice: validatedData.otdPrice ? Math.round(validatedData.otdPrice * 100) : null,
      rebates: validatedData.rebates ? Math.round(validatedData.rebates * 100) : null,
      tradeInValue: validatedData.tradeInValue ? Math.round(validatedData.tradeInValue * 100) : null,
      downPayment: validatedData.downPayment ? Math.round(validatedData.downPayment * 100) : null,
      monthlyPayment: validatedData.monthlyPayment ? Math.round(validatedData.monthlyPayment * 100) : null,
      userId: session.user.id,
    }

    const deal = await prisma.carDeal.create({
      data: dealData,
      include: {
        make: true,
        model: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
