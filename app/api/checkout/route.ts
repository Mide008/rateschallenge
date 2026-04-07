import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const PRICES = {
  analysis: { amount: 2900, label: 'Full Comparable Analysis — RatesChallenge' },
  bundle:   { amount: 4900, label: 'Analysis + Evidence Bundle PDF — RatesChallenge' },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const analysisId = searchParams.get('analysisId')
  const tier       = (searchParams.get('tier') ?? 'bundle') as 'analysis' | 'bundle'
  const base       = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  console.log('/api/checkout GET:', { analysisId, tier })

  if (!analysisId) {
    console.error('No analysisId provided')
    return NextResponse.redirect(`${base}/check`)
  }

  // Verify analysis exists using pg directly
  let analysis: any = null
  try {
    const rows = await query(`SELECT id, postcode FROM analyses WHERE id = $1 LIMIT 1`, [analysisId])
    analysis = rows[0] ?? null
  } catch (err: any) {
    console.error('Checkout: DB error:', err.message)
    return NextResponse.redirect(`${base}/check`)
  }

  if (!analysis) {
    console.error('Checkout: analysis not found:', analysisId)
    return NextResponse.redirect(`${base}/check`)
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const stripeConfigured = !!stripeKey &&
    (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_'))

  if (!stripeConfigured) {
    console.log('Stripe not configured — redirecting back with notice')
    return NextResponse.redirect(`${base}/analysis/${analysisId}?stripe_pending=true`)
  }

  try {
    const stripe  = new Stripe(stripeKey!)
    const price   = PRICES[tier] ?? PRICES.bundle

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      line_items: [{
        price_data: {
          currency:     'gbp',
          product_data: { name: price.label },
          unit_amount:  price.amount,
        },
        quantity: 1,
      }],
      success_url: `${base}/analysis/${analysisId}?paid=true`,
      cancel_url:  `${base}/analysis/${analysisId}`,
      metadata:    { analysisId, tier },
    })

    return NextResponse.redirect(session.url!)

  } catch (err: any) {
    console.error('Stripe session error:', err.message)
    return NextResponse.redirect(`${base}/analysis/${analysisId}?stripe_error=true`)
  }
}