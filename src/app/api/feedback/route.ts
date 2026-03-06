import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureFeedbackTable } from '@/lib/db-migrate'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const feedbackSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(5000),
})

async function sendConfirmationEmail(to: string, name: string, subject: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured, skipping confirmation email')
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `We received your feedback: "${subject}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Thanks for reaching out, ${name}!</h2>
        <p>We've received your feedback regarding "<strong>${subject}</strong>" and will get back to you within 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated confirmation from CarDeals. Please do not reply to this email.
        </p>
      </div>
    `,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = feedbackSchema.parse(body)

    await ensureFeedbackTable()

    await sql`
      insert into feedback (name, email, subject, message)
      values (${data.name}, ${data.email}, ${data.subject}, ${data.message})
    `

    // Send confirmation email (non-blocking — don't fail the request if email fails)
    sendConfirmationEmail(data.email, data.name, data.subject).catch((err) =>
      console.error('Failed to send confirmation email:', err)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
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
