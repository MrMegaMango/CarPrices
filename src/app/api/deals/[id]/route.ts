import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await sql`
      select 
        d.*,
        ma.name as "make.name",
        mo.name as "model.name",
        u.name as "user.name",
        u.email as "user.email"
      from car_deals d
      join car_makes ma on ma.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      join users u on u.id = d."userId"
      where d.id = ${id}
      limit 1
    ` as Array<Record<string, unknown>>
    const deal = rows[0]

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}

const updateDealSchema = z.object({
  makeId: z.string().optional(),
  modelId: z.string().optional(),
  year: z.number().min(1990).max(new Date().getFullYear() + 2).optional(),
  trim: z.string().nullable().optional(),
  exteriorColor: z.string().nullable().optional(),
  interiorColor: z.string().nullable().optional(),
  msrp: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
  otdPrice: z.number().positive().nullable().optional(),
  rebates: z.number().nullable().optional(),
  dealerName: z.string().nullable().optional(),
  dealerLocation: z.string().nullable().optional(),
  dealDate: z.string().optional(),
  financingRate: z.number().nullable().optional(),
  financingTerm: z.number().nullable().optional(),
  downPayment: z.number().nullable().optional(),
  monthlyPayment: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  isLeased: z.boolean().optional(),
  leaseTermMonths: z.number().nullable().optional(),
  mileageAllowance: z.number().nullable().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    type SessionWithUserId = Session & { user: NonNullable<Session['user']> & { id: string } }
    const userId = (session as SessionWithUserId | null)?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const data = updateDealSchema.parse(body)

    const rows = await sql`select "userId" from car_deals where id = ${id} limit 1` as Array<{ userId: string }>
    if (!rows[0]) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (rows[0].userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const fields: string[] = []
    const values: Array<string | number | null | boolean | Date> = []

    const push = (col: string, val: unknown) => {
      fields.push(`${col} = $${values.length + 1}`)
      values.push(val as never)
    }

    if (data.makeId) push('"makeId"', data.makeId)
    if (data.modelId) push('"modelId"', data.modelId)
    if (data.year !== undefined) push('year', data.year)
    if (data.trim !== undefined) push('trim', data.trim ?? null)
    if (data.exteriorColor !== undefined) push('"exteriorColor"', data.exteriorColor ?? null)
    if (data.interiorColor !== undefined) push('"interiorColor"', data.interiorColor ?? null)
    if (data.msrp !== undefined) push('msrp', Math.round(data.msrp * 100))
    if (data.sellingPrice !== undefined) push('"sellingPrice"', Math.round(data.sellingPrice * 100))
    if (data.otdPrice !== undefined) push('"otdPrice"', data.otdPrice != null ? Math.round(data.otdPrice * 100) : null)
    if (data.rebates !== undefined) push('rebates', data.rebates != null ? Math.round(data.rebates * 100) : null)
    if (data.dealerName !== undefined) push('"dealerName"', data.dealerName ?? null)
    if (data.dealerLocation !== undefined) push('"dealerLocation"', data.dealerLocation ?? null)
    if (data.dealDate !== undefined) push('"dealDate"', new Date(data.dealDate))
    if (data.financingRate !== undefined) push('"financingRate"', data.financingRate ?? null)
    if (data.financingTerm !== undefined) push('"financingTerm"', data.financingTerm ?? null)
    if (data.downPayment !== undefined) push('"downPayment"', data.downPayment != null ? Math.round(data.downPayment * 100) : null)
    if (data.monthlyPayment !== undefined) push('"monthlyPayment"', data.monthlyPayment != null ? Math.round(data.monthlyPayment * 100) : null)
    if (data.notes !== undefined) push('notes', data.notes ?? null)
    if (data.isLeased !== undefined) push('"isLeased"', data.isLeased)
    if (data.leaseTermMonths !== undefined) push('"leaseTermMonths"', data.leaseTermMonths ?? null)
    if (data.mileageAllowance !== undefined) push('"mileageAllowance"', data.mileageAllowance ?? null)

    if (fields.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const updateSql = `update car_deals set ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP where id = $${values.length + 1} returning *`
    const updated = await sql(updateSql, [...values, id]) as Array<Record<string, unknown>>
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Error updating deal:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    type SessionWithUserId = Session & { user: NonNullable<Session['user']> & { id: string } }
    const userId = (session as SessionWithUserId | null)?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const rows = await sql`select "userId" from car_deals where id = ${id} limit 1` as Array<{ userId: string }>
    if (!rows[0]) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (rows[0].userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await sql`delete from car_deals where id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
