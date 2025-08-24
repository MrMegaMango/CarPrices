import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const make = await prisma.carMake.findUnique({
      where: { id: makeId }
    })

    if (!make) {
      return NextResponse.json(
        { error: 'Make not found' },
        { status: 404 }
      )
    }

    // Check if model already exists for this make (case insensitive)
    const existingModel = await prisma.carModel.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        makeId: makeId
      }
    })

    if (existingModel) {
      return NextResponse.json(
        { error: 'This model already exists for this make' },
        { status: 409 }
      )
    }

    // Create new model
    const newModel = await prisma.carModel.create({
      data: {
        name: name.trim(),
        makeId: makeId
      },
      include: {
        make: true
      }
    })

    return NextResponse.json(newModel)
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
