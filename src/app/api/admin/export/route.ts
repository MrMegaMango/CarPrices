import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

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
      (sql`
        select d.*, ma.name as "make.name", mo.name as "model.name",
               u.id as "user.id", u.name as "user.name", u.email as "user.email", u."createdAt" as "user.createdAt"
        from car_deals d
        join car_makes ma on ma.id = d."makeId"
        join car_models mo on mo.id = d."modelId"
        join users u on u.id = d."userId"
      `) as unknown as Array<Record<string, unknown>>, 
      (sql`select * from car_makes`) as unknown as Array<Record<string, unknown>>,
      (sql`select m.*, ma.name as "make.name" from car_models m join car_makes ma on ma.id = m."makeId"`) as unknown as Array<Record<string, unknown>>,
      (sql`select id, name, email, "createdAt", "updatedAt" from users`) as unknown as Array<Record<string, unknown>>,
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
