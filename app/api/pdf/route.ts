import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const analysisId = searchParams.get('analysisId')

  if (!analysisId) {
    return new NextResponse('Missing analysisId', { status: 400 })
  }

  let analysis: any = null
  try {
    const rows = await query(`SELECT * FROM analyses WHERE id = $1 LIMIT 1`, [analysisId])
    analysis = rows[0] ?? null
  } catch (err: any) {
    console.error('PDF DB error:', err.message)
    return new NextResponse('Database error', { status: 500 })
  }

  if (!analysis) {
    return new NextResponse('Analysis not found', { status: 404 })
  }

  const stripeKey        = process.env.STRIPE_SECRET_KEY ?? ''
  const stripeConfigured = stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_')
  if (stripeConfigured && !analysis.paid) {
    return new NextResponse('Payment required', { status: 403 })
  }

  const comparables: any[] = Array.isArray(analysis.comparables)
    ? analysis.comparables
    : (() => { try { return JSON.parse(analysis.comparables ?? '[]') } catch { return [] } })()

  if (!comparables.length) {
    return new NextResponse('No comparables in this analysis', { status: 400 })
  }

  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { EvidenceBundle } = await import('@/components/pdf/EvidenceBundle')
    const React              = (await import('react')).default

   const element = React.createElement(EvidenceBundle, {
  analysis: {
    userRvPerM2:     Number(analysis.user_rv_per_m2)   || 0,
    medianRvPerM2:   Number(analysis.median_rv_per_m2) || 0,
    percentile:      Number(analysis.percentile)       || 50,
    potentialSaving: Number(analysis.potential_saving) || 0,
  },
  comparables,
  property: {
    address:         String(analysis.full_address    ?? analysis.postcode ?? ''),
    postcode:        String(analysis.postcode         ?? ''),
    descriptionText: String(analysis.description_text ?? 'Commercial Property'),
    floorArea:       Number(analysis.floor_area)      || 0,
    rateableValue:   Number(analysis.rateable_value)  || 0,
  },
}) as any

const buffer = await renderToBuffer(element)

    const filename = `rates-challenge-${(analysis.postcode ?? 'report').replace(/\s/g, '-')}.pdf`

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(buffer.byteLength),
        'Cache-Control':       'no-store',
      },
    })

  } catch (err: any) {
    console.error('PDF generation failed:', err.message)
    return new NextResponse('PDF generation failed: ' + err.message, { status: 500 })
  }
}