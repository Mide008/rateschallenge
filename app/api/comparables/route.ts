import { NextRequest, NextResponse } from 'next/server'
import { fetchComparables } from '@/lib/comparables'

export async function POST(req: NextRequest) {
  try {
    const { postcodeSector, descriptionCode, floorArea, rateableValue } = await req.json()

    if (!postcodeSector || !descriptionCode || !floorArea || !rateableValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await fetchComparables({ postcodeSector, descriptionCode, floorArea, rateableValue })
    return NextResponse.json(result)

  } catch (err) {
    console.error('/api/comparables error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}