import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ analyses: [] })
    }

    const analyses = await query(`
      SELECT
        id,
        postcode,
        description_text,
        percentile,
        potential_saving,
        paid,
        paid_tier,
        created_at
      FROM analyses
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId])

    return NextResponse.json({ analyses })

  } catch (err: any) {
    console.error('Dashboard API error:', err.message)
    return NextResponse.json({ analyses: [] })
  }
}