import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// This endpoint should be protected and only accessible by admin users
export async function GET() {
  try {
    // Get session to ensure user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, allow your email address only - replace with your actual email
    const adminEmails = ['amangocoding@gmail.com'] // Add your email here
    
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Export all data
    const [deals, makes, models, users] = await Promise.all([
      prisma.carDeal.findMany({
        include: {
          make: true,
          model: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.carMake.findMany(),
      prisma.carModel.findMany({
        include: {
          make: true,
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalDeals: deals.length,
        totalMakes: makes.length,
        totalModels: models.length,
        totalUsers: users.length,
      },
      data: {
        deals,
        makes,
        models,
        users,
      },
    }

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Disposition', `attachment; filename="cardeals-backup-${new Date().toISOString().split('T')[0]}.json"`)

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
