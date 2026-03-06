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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return 'invalid-email'
  const visibleLocal = local.length <= 2 ? local[0] ?? '*' : `${local[0]}***${local[local.length - 1]}`
  return `${visibleLocal}@${domain}`
}

type EmailSendResult =
  | { sent: true }
  | { sent: false; reason: 'missing_config' | 'smtp_error' }

async function sendConfirmationEmail(to: string, name: string, subject: string) {
  const smtpUser = process.env.GMAIL_USER
  const smtpPass = process.env.GMAIL_APP_PASSWORD
  const fromAddress = process.env.FEEDBACK_EMAIL_FROM || (smtpUser ? `CarDeals <${smtpUser}>` : '')

  if (!smtpUser || !smtpPass || !fromAddress) {
    return { sent: false, reason: 'missing_config' } satisfies EmailSendResult
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `We received your feedback: "${subject}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Thanks for reaching out, ${escapeHtml(name)}!</h2>
          <p>We've received your feedback regarding "<strong>${escapeHtml(subject)}</strong>" and will get back to you within 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated confirmation from CarDeals. Please do not reply to this email.
          </p>
        </div>
      `,
    })

    return { sent: true } satisfies EmailSendResult
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return { sent: false, reason: 'smtp_error' } satisfies EmailSendResult
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestId = Math.random().toString(36).slice(2, 10)
    const body = await request.json()
    const data = feedbackSchema.parse(body)
    const maskedEmail = maskEmail(data.email)
    console.log(`[feedback:${requestId}] Received submission from ${maskedEmail}`)

    await ensureFeedbackTable()

    await sql`
      insert into feedback (name, email, subject, message)
      values (${data.name}, ${data.email}, ${data.subject}, ${data.message})
    `
    console.log(`[feedback:${requestId}] Stored in database`)

    const emailResult = await sendConfirmationEmail(data.email, data.name, data.subject)
    if (emailResult.sent) {
      console.log(`[feedback:${requestId}] Confirmation email sent to ${maskedEmail}`)
    } else if (emailResult.reason === 'missing_config') {
      console.warn(`[feedback:${requestId}] Confirmation email skipped (missing GMAIL_USER/GMAIL_APP_PASSWORD/FEEDBACK_EMAIL_FROM config)`)
    } else {
      console.warn(`[feedback:${requestId}] Confirmation email failed due to SMTP error`)
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.sent,
      emailReason: emailResult.sent ? null : emailResult.reason,
    })
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
