// app/api/analyses/route.ts
// Uses direct pg connection for both comparables and insert

import { NextRequest, NextResponse } from 'next/server'
import { fetchComparables } from '@/lib/comparables'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    postcode, postcodeSector, fullAddress,
    descriptionCode, descriptionText,
    floorArea, rateableValue, userId,
  } = body

  console.log('/api/analyses POST:', { postcode, postcodeSector, descriptionCode, floorArea, rateableValue, userId })

  if (!postcode || !postcodeSector || !descriptionCode || !floorArea || !rateableValue) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'You must be signed in to save an analysis' }, { status: 401 })
  }

  const floor = Number(floorArea)
  const rv    = Number(rateableValue)

  if (isNaN(floor) || isNaN(rv) || floor <= 0 || rv <= 0) {
    return NextResponse.json({ error: 'floorArea and rateableValue must be positive numbers' }, { status: 400 })
  }

  // Fetch comparables via direct pg
  let compResult
  try {
    compResult = await fetchComparables({
      postcodeSector,
      descriptionCode,
      floorArea:     floor,
      rateableValue: rv,
    })
  } catch (err: any) {
    console.error('fetchComparables threw:', err.message)
    return NextResponse.json({ error: 'Comparable search failed: ' + err.message }, { status: 500 })
  }

  const { comparables, analysis } = compResult

  // Insert into analyses via direct pg with user_id
  try {
    const rows = await query<{ id: string }>(`
      INSERT INTO analyses (
        user_id, postcode, postcode_sector, full_address,
        description_code, description_text, floor_area, rateable_value,
        user_rv_per_m2, comparable_count, median_rv_per_m2, percentile,
        potential_saving, comparables, paid
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, false
      )
      RETURNING id
    `, [
      userId,
      (postcode as string).trim().toUpperCase(),
      postcodeSector,
      fullAddress ?? null,
      descriptionCode,
      descriptionText ?? null,
      floor,
      rv,
      analysis?.userRvPerM2   ?? null,
      comparables?.length     ?? 0,
      analysis?.medianRvPerM2 ?? null,
      analysis?.percentile    ?? null,
      analysis?.potentialSaving ?? null,
      JSON.stringify(comparables ?? []),
    ])

    const id = rows[0]?.id
    if (!id) {
      console.error('Insert returned no id')
      return NextResponse.json({ error: 'Insert returned no id' }, { status: 500 })
    }

    console.log('/api/analyses created:', id, 'comparables:', comparables?.length)
    return NextResponse.json({ id })

  } catch (err: any) {
    console.error('/api/analyses insert error:', err.message)
    return NextResponse.json({ error: 'Database insert failed: ' + err.message }, { status: 500 })
  }
}