import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/**
 * Resolves the tip price ID from env var or by scanning the Stripe catalog
 * for a product named "tip jar" or "tipping jar".
 */
export async function resolveTipPriceId(): Promise<string | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  if (process.env.STRIPE_PRICE_TIP) {
    return process.env.STRIPE_PRICE_TIP
  }

  const targetNames = ['tip jar', 'tipping jar']
  const products = await stripe.products.list({ active: true, limit: 100 })
  const match = products.data.find((p) =>
    targetNames.includes(p.name.toLowerCase())
  )
  if (!match) return null

  const prices = await stripe.prices.list({
    active: true,
    product: match.id,
    type: 'one_time',
    limit: 1,
  })
  return prices.data[0]?.id ?? null
}
