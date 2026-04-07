import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !stripeKey.startsWith('sk_')) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No stripe-signature header' }, { status: 400 })
  }

  const stripe = new Stripe(stripeKey)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook received:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const analysisId = session.metadata?.analysisId
    const tier = session.metadata?.tier ?? 'bundle'

    console.log('Payment complete for analysisId:', analysisId, 'tier:', tier)

    if (!analysisId) {
      console.error('No analysisId in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      const rows = await query(`
        UPDATE analyses
        SET paid = true, paid_tier = $1, stripe_session_id = $2
        WHERE id = $3
        RETURNING id, paid, paid_tier
      `, [tier, session.id, analysisId])

      if (rows.length > 0) {
        console.log('Analysis marked paid:', rows[0])
      } else {
        console.error('No row updated — analysisId not found:', analysisId)
      }
    } catch (err: any) {
      console.error('DB update error:', err.message)
    }
  }

  return NextResponse.json({ received: true })
}