import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Link anonymous analyses from the last 24 hours to this user
    const rows = await query(`
      UPDATE analyses
      SET user_id = $1
      WHERE user_id IS NULL
        AND created_at > NOW() - INTERVAL '24 hours'
      RETURNING id
    `, [userId])

    console.log(`Linked ${rows.length} analyses to user ${userId}`)
    return NextResponse.json({ linked: rows.length })

  } catch (err: any) {
    console.error('link-analyses error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}