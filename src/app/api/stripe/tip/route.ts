import { NextResponse } from 'next/server'
import { isStripeConfigured, getStripeClient, resolveTipPriceId } from '@/lib/stripe'

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not configured.' },
      { status: 503 }
    )
  }

  const priceId = await resolveTipPriceId()
  if (!priceId) {
    return NextResponse.json(
      { error: 'No active tip price found in Stripe.' },
      { status: 503 }
    )
  }

  const stripe = getStripeClient()!
  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?tip=success`,
      cancel_url: `${appUrl}/`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not create checkout session.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
