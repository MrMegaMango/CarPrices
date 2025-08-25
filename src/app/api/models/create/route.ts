import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, makeId } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      )
    }

    if (!makeId || typeof makeId !== 'string') {
      return NextResponse.json(
        { error: 'Make ID is required' },
        { status: 400 }
      )
    }

    // Verify make exists
    const make = await sql`select id from car_makes where id = ${makeId} limit 1` as Array<{ id: string }>

    if (make.length === 0) {
      return NextResponse.json(
        { error: 'Make not found' },
        { status: 404 }
      )
    }

    // Check if model already exists for this make (case insensitive)
    const existingModel = await sql`
      select id from car_models 
      where lower(name) = lower(${name.trim()}) and "makeId" = ${makeId}
      limit 1
    ` as Array<{ id: string }>

    if (existingModel.length > 0) {
      return NextResponse.json(
        { error: 'This model already exists for this make' },
        { status: 409 }
      )
    }

    // Create new model
    const inserted = await sql`
      insert into car_models (name, "makeId")
      values (${name.trim()}, ${makeId})
      returning id, name, "makeId", "createdAt", "updatedAt"
    ` as Array<{ id: string; name: string; makeId: string; createdAt: string; updatedAt: string }>

    const created = inserted[0]
    const makeRow = await sql`
      select id, name, logo, "createdAt", "updatedAt" from car_makes where id = ${created.makeId}
    ` as Array<{ id: string; name: string; logo: string | null; createdAt: string; updatedAt: string }>
    const makeData = makeRow[0]

    return NextResponse.json({
      id: created.id,
      name: created.name,
      makeId: created.makeId,
      createdAt: created.createdAt as unknown as Date,
      updatedAt: created.updatedAt as unknown as Date,
      make: makeData && {
        id: makeData.id,
        name: makeData.name,
        logo: makeData.logo,
        createdAt: makeData.createdAt as unknown as Date,
        updatedAt: makeData.updatedAt as unknown as Date,
      }
    })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
