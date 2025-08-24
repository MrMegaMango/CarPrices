import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const existingMake = await prisma.carMake.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (existingMake) {
      return NextResponse.json(
        { error: 'This make already exists' },
        { status: 409 }
      )
    }

    // Create new make
    const newMake = await prisma.carMake.create({
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json(newMake)
  } catch (error) {
    console.error('Error creating make:', error)
    return NextResponse.json(
      { error: 'Failed to create make' },
      { status: 500 }
    )
  }
}
