import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { sql } from '@/lib/db'
import { ensureCarDealsColorColumns, ensureCarDealsGuestColumns } from '@/lib/db-migrate'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { randomBytes, createHash } from 'crypto'

const dealSchema = z.object({
  makeId: z.string(),
  modelId: z.string(),
  year: z.number().min(1990).max(new Date().getFullYear() + 2),
  trim: z.string().optional(),
  color: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  msrp: z.number().positive(),
  sellingPrice: z.number().positive(),
  otdPrice: z.number().positive().optional(),
  rebates: z.number().optional(),

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

    // Build dynamic SQL safely with positional parameters (no nested template fragments)
    const conditions: string[] = ['d."isPublic" = true']
    const params: Array<string | number | Date | null> = []

    if (makeId) {
      params.push(makeId)
      conditions.push(`d."makeId" = $${params.length}`)
    }
    if (modelId) {
      params.push(modelId)
      conditions.push(`d."modelId" = $${params.length}`)
    }
    if (year) {
      const yearInt = parseInt(year)
      params.push(yearInt)
      conditions.push(`d.year = $${params.length}`)
    }
    if (minPrice) {
      const minCents = parseInt(minPrice) * 100
      params.push(minCents)
      conditions.push(`d."sellingPrice" >= $${params.length}`)
    }
    if (maxPrice) {
      const maxCents = parseInt(maxPrice) * 100
      params.push(maxCents)
      conditions.push(`d."sellingPrice" <= $${params.length}`)
    }

    const orderByColumn = sortBy === 'price' ? 'd."sellingPrice"' : 'd."createdAt"'
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc'
    const offsetVal = (page - 1) * limit

    const dealsQuery = `
      select 
        d.*,
        json_build_object('id', ma.id, 'name', ma.name) as make,
        json_build_object('id', mo.id, 'name', mo.name) as model,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user
      from car_deals d
      join car_makes ma on ma.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      left join users u on u.id = d."userId"
      where ${conditions.join(' and ')}
      order by ${orderByColumn} ${orderByDirection}
      offset $${params.length + 1}
      limit $${params.length + 2}
    `

    const deals = await sql(
      dealsQuery,
      [...params, offsetVal, limit]
    ) as Array<Record<string, unknown>>

    const countQuery = `
      select count(*)::int as count
      from car_deals d
      where ${conditions.join(' and ')}
    `
    const totalRows = await sql(
      countQuery,
      params
    ) as Array<{ count: number }>
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
    await ensureCarDealsColorColumns()
    await ensureCarDealsGuestColumns()
    const session = await getServerSession(authOptions) as Session & { user: { id: string; email?: string | null; name?: string | null; image?: string | null } } | null

    // Determine userId: signed-in user or fallback to a shared guest user
    let userId: string | null = null
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      userId = 'guest'
    }

    // Build guest identifiers: device cookie (guestId) and IP hash (guestIpHash)
    let guestId: string | null = null
    try {
      // Read cookie if provided via headers (NextRequest cookies())
      const cookieHeader = request.headers.get('cookie') || ''
      const match = cookieHeader.match(/cd_anon_id=([^;]+)/)
      guestId = match ? decodeURIComponent(match[1]) : null
    } catch {
      guestId = null
    }

    if (!guestId) {
      guestId = randomBytes(16).toString('hex')
    }

    // Derive IP: trust x-forwarded-for or x-real-ip headers
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const ip = ipHeader.split(',')[0]?.trim()
    const guestIpHash = ip ? createHash('sha256').update(ip).digest('hex') : null

    // Ensure user exists in database (for signed-in users) or ensure a shared 'guest' user exists
    if (userId !== 'guest') {
      const existingUser = await sql`
        select id from users where id = ${userId} limit 1
      ` as Array<{ id: string }>

      if (existingUser.length === 0) {
        try {
          await sql`
            insert into users (id, email, name, image, "updatedAt")
            values (${userId}, ${session?.user?.email || null}, ${session?.user?.name || null}, ${session?.user?.image || null}, CURRENT_TIMESTAMP)
          `
        } catch (userCreateError) {
          console.error('Error creating user during deal creation:', userCreateError)
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          )
        }
      }
    } else {
      try {
        await sql`
          insert into users (id, email, name, image, "updatedAt")
          values ('guest', ${null}, 'Guest', ${null}, CURRENT_TIMESTAMP)
          on conflict (id) do nothing
        `
      } catch (guestUserError) {
        console.error('Error ensuring guest user exists:', guestUserError)
        // Continue even if guest user creation fails due to race; insert will fail later if FK requires it
      }
    }

    const body = await request.json()
    const validatedData = dealSchema.parse(body)

    // Generate unique ID
    const id = randomBytes(16).toString('hex')
    
    // Convert dollar amounts to cents
    const dealData = {
      id,
      ...validatedData,
      msrp: Math.round(validatedData.msrp * 100),
      sellingPrice: Math.round(validatedData.sellingPrice * 100),
      otdPrice: validatedData.otdPrice ? Math.round(validatedData.otdPrice * 100) : null,
      rebates: validatedData.rebates ? Math.round(validatedData.rebates * 100) : null,

      downPayment: validatedData.downPayment ? Math.round(validatedData.downPayment * 100) : null,
      monthlyPayment: validatedData.monthlyPayment ? Math.round(validatedData.monthlyPayment * 100) : null,
      userId: userId,
      exteriorColor: validatedData.exteriorColor ?? validatedData.color ?? null,
      interiorColor: validatedData.interiorColor ?? null,
    }

    const inserted = await sql`
      insert into car_deals (
        id, "userId", "makeId", "modelId", year, trim, color, "exteriorColor", "interiorColor",
        msrp, "sellingPrice", "otdPrice", rebates,
        "dealerName", "dealerLocation", "dealDate", "financingRate",
        "financingTerm", "downPayment", "monthlyPayment", notes, "isLeased",
        "leaseTermMonths", "mileageAllowance", verified, "isPublic", "guestId", "guestIpHash", "updatedAt"
      ) values (
        ${dealData.id}, ${dealData.userId}, ${dealData.makeId}, ${dealData.modelId}, ${dealData.year}, ${dealData.trim ?? null}, ${dealData.color ?? null}, ${dealData.exteriorColor ?? null}, ${dealData.interiorColor ?? null},
        ${dealData.msrp}, ${dealData.sellingPrice}, ${dealData.otdPrice ?? null}, ${dealData.rebates ?? null},
        ${dealData.dealerName ?? null}, ${dealData.dealerLocation ?? null}, ${dealData.dealDate}, ${dealData.financingRate ?? null},
        ${dealData.financingTerm ?? null}, ${dealData.downPayment ?? null}, ${dealData.monthlyPayment ?? null}, ${dealData.notes ?? null}, ${dealData.isLeased},
        ${dealData.leaseTermMonths ?? null}, ${dealData.mileageAllowance ?? null}, false, true, ${guestId}, ${guestIpHash}, CURRENT_TIMESTAMP
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

    // If we minted a new anon cookie, set it in response for future submissions
    const response = NextResponse.json(deal, { status: 201 })
    const hadCookie = request.headers.get('cookie')?.includes('cd_anon_id=')
    if (!hadCookie) {
      response.headers.append('Set-Cookie', `cd_anon_id=${encodeURIComponent(guestId)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`)
    }
    return response
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
