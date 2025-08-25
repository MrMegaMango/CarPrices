import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Make name is required' },
        { status: 400 }
      )
    }

    // Check if make already exists (case insensitive)
    const existing = await sql`select id from car_makes where lower(name) = lower(${name.trim()}) limit 1` as Array<{ id: string }>

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'This make already exists' },
        { status: 409 }
      )
    }

    // Create new make and return it
    const inserted = await sql`
      insert into car_makes (name)
      values (${name.trim()})
      returning id, name, logo, "createdAt", "updatedAt"
    ` as Array<{ id: string; name: string; logo: string | null; createdAt: string; updatedAt: string }>

    const make = inserted[0]
    return NextResponse.json({
      id: make.id,
      name: make.name,
      logo: make.logo,
      createdAt: make.createdAt as unknown as Date,
      updatedAt: make.updatedAt as unknown as Date,
    })
  } catch (error) {
    console.error('Error creating make:', error)
    return NextResponse.json(
      { error: 'Failed to create make' },
      { status: 500 }
    )
  }
}
