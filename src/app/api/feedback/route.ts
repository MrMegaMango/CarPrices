import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureFeedbackTable } from '@/lib/db-migrate'
import { z } from 'zod'

const feedbackSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(5000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = feedbackSchema.parse(body)

    await ensureFeedbackTable()

    await sql`
      insert into feedback (name, email, subject, message)
      values (${data.name}, ${data.email}, ${data.subject}, ${data.message})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
