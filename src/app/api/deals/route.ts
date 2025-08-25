import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { sql } from '@/lib/db'
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

    // Sorting handled inline in SQL below

    const deals = await sql`
      select 
        d.*,
        ma.name as "make.name",
        mo.name as "model.name",
        u.id as "user.id",
        u.name as "user.name",
        u.email as "user.email"
      from car_deals d
      join car_makes ma on ma.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      join users u on u.id = d."userId"
      where d."isPublic" = true
      ${makeId ? sql` and d."makeId" = ${makeId}` : sql``}
      ${modelId ? sql` and d."modelId" = ${modelId}` : sql``}
      ${year ? sql` and d.year = ${parseInt(year)}` : sql``}
      ${minPrice ? sql` and d."sellingPrice" >= ${parseInt(minPrice) * 100}` : sql``}
      ${maxPrice ? sql` and d."sellingPrice" <= ${parseInt(maxPrice) * 100}` : sql``}
      ${sortBy === 'price'
        ? (sortOrder === 'asc' ? sql`order by d."sellingPrice" asc` : sql`order by d."sellingPrice" desc`)
        : (sortOrder === 'asc' ? sql`order by d."createdAt" asc` : sql`order by d."createdAt" desc`)}
      offset ${(page - 1) * limit}
      limit ${limit}
    ` as Array<Record<string, unknown>>

    const totalRows = await sql`
      select count(*)::int as count
      from car_deals d
      where d."isPublic" = true
      ${makeId ? sql` and d."makeId" = ${makeId}` : sql``}
      ${modelId ? sql` and d."modelId" = ${modelId}` : sql``}
      ${year ? sql` and d.year = ${parseInt(year)}` : sql``}
      ${minPrice ? sql` and d."sellingPrice" >= ${parseInt(minPrice) * 100}` : sql``}
      ${maxPrice ? sql` and d."sellingPrice" <= ${parseInt(maxPrice) * 100}` : sql``}
    ` as Array<{ count: number }>
    const total = totalRows[0]?.count ?? 0

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

    const inserted = await sql`
      insert into car_deals (
        "userId", "makeId", "modelId", year, trim, color,
        msrp, "sellingPrice", "otdPrice", rebates, "tradeInValue",
        "dealerName", "dealerLocation", "dealDate", "financingRate",
        "financingTerm", "downPayment", "monthlyPayment", notes, "isLeased",
        "leaseTermMonths", "mileageAllowance", verified, "isPublic"
      ) values (
        ${dealData.userId}, ${dealData.makeId}, ${dealData.modelId}, ${dealData.year}, ${dealData.trim ?? null}, ${dealData.color ?? null},
        ${dealData.msrp}, ${dealData.sellingPrice}, ${dealData.otdPrice ?? null}, ${dealData.rebates ?? null}, ${dealData.tradeInValue ?? null},
        ${dealData.dealerName ?? null}, ${dealData.dealerLocation ?? null}, ${dealData.dealDate}, ${dealData.financingRate ?? null},
        ${dealData.financingTerm ?? null}, ${dealData.downPayment ?? null}, ${dealData.monthlyPayment ?? null}, ${dealData.notes ?? null}, ${dealData.isLeased},
        ${dealData.leaseTermMonths ?? null}, ${dealData.mileageAllowance ?? null}, false, true
      )
      returning *
    ` as Array<Record<string, unknown>>

    const dealRow = inserted[0] as { makeId: string; modelId: string; userId: string }
    const makeRow = await sql`select id, name from car_makes where id = ${dealRow.makeId}` as Array<{ id: string; name: string }>
    const modelRow = await sql`select id, name from car_models where id = ${dealRow.modelId}` as Array<{ id: string; name: string }>
    const userRow = await sql`select id, name, email from users where id = ${dealRow.userId}` as Array<{ id: string; name: string | null; email: string }>

    const deal = {
      ...dealRow,
      make: makeRow[0],
      model: modelRow[0],
      user: userRow[0],
    }

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
