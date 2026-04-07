// lib/comparables.ts
// Uses direct pg connection — bypasses Supabase JS client and RLS

import { query } from './db'
import { AREA_TOLERANCE, CHALLENGE_PERCENTILE, RATES_MULTIPLIER } from './constants'

export interface ComparableRow {
  ba_reference:             string
  full_address:             string
  postcode:                 string
  rateable_value:           number
  total_area:               number
  rv_per_m2:                number
  primary_description_code: string
  description_text:         string
}

export interface ComparablesAnalysis {
  userRvPerM2:       number
  medianRvPerM2:     number
  percentile:        number
  potentialSaving:   number
  annualRatesSaving: number
  hasChallengeCase:  boolean
  comparableCount:   number
  searchScope:       'sector' | 'district' | 'national'
}

export interface ComparablesResult {
  comparables: ComparableRow[]
  analysis:    ComparablesAnalysis | null
  message?:    string
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid    = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function percentileOf(value: number, population: number[]): number {
  if (!population.length) return 50
  const below = population.filter(v => v < value).length
  return Math.round((below / population.length) * 100)
}

const SELECT = `
  ba_reference, full_address, postcode,
  rateable_value, total_area, rv_per_m2,
  primary_description_code, description_text
`

export async function fetchComparables(params: {
  postcodeSector:  string
  descriptionCode: string
  floorArea:       number
  rateableValue:   number
}): Promise<ComparablesResult> {
  const { postcodeSector, descriptionCode, floorArea, rateableValue } = params
  const areaMin  = floorArea * (1 - AREA_TOLERANCE)
  const areaMax  = floorArea * (1 + AREA_TOLERANCE)
  const district = postcodeSector.split(' ')[0]

  let comparables: ComparableRow[] = []
  let searchScope: 'sector' | 'district' | 'national' = 'sector'

  // ── Search 1: same sector + same type + ±30% area ──────────────────────
  try {
    const rows = await query<ComparableRow>(`
      SELECT ${SELECT}
      FROM voa_ratings
      WHERE postcode_sector          = $1
        AND primary_description_code = $2
        AND total_area               BETWEEN $3 AND $4
        AND rateable_value           IS NOT NULL
        AND rv_per_m2                IS NOT NULL
      ORDER BY ABS(total_area - $5)
      LIMIT 25
    `, [postcodeSector, descriptionCode, areaMin, areaMax, floorArea])

    if (rows.length >= 5) {
      comparables = rows
      console.log(`S1 hit: ${rows.length} comparables for ${postcodeSector} / ${descriptionCode}`)
    }
  } catch (err: any) {
    console.error('Search 1 failed:', err.message)
  }

  // ── Search 2: same district + same type + ±30% area ────────────────────
  if (comparables.length < 5) {
    try {
      const rows = await query<ComparableRow>(`
        SELECT ${SELECT}
        FROM voa_ratings
        WHERE postcode                 LIKE $1
          AND primary_description_code = $2
          AND total_area               BETWEEN $3 AND $4
          AND rateable_value           IS NOT NULL
          AND rv_per_m2                IS NOT NULL
        ORDER BY ABS(total_area - $5)
        LIMIT 25
      `, [`${district}%`, descriptionCode, areaMin, areaMax, floorArea])

      if (rows.length > comparables.length) {
        comparables = rows
        searchScope = 'district'
        console.log(`S2 hit: ${rows.length} comparables for district ${district}`)
      }
    } catch (err: any) {
      console.error('Search 2 failed:', err.message)
    }
  }

  // ── Search 3: national + same type + ±50% area ─────────────────────────
  if (comparables.length < 3) {
    try {
      const rows = await query<ComparableRow>(`
        SELECT ${SELECT}
        FROM voa_ratings
        WHERE primary_description_code = $1
          AND total_area               BETWEEN $2 AND $3
          AND rateable_value           IS NOT NULL
          AND rv_per_m2                IS NOT NULL
        ORDER BY ABS(total_area - $4)
        LIMIT 25
      `, [descriptionCode, floorArea * 0.5, floorArea * 1.5, floorArea])

      if (rows.length > comparables.length) {
        comparables = rows
        searchScope = 'national'
        console.log(`S3 hit: ${rows.length} comparables nationally`)
      }
    } catch (err: any) {
      console.error('Search 3 failed:', err.message)
    }
  }

  console.log(`fetchComparables done: found=${comparables.length} scope=${searchScope}`)

  if (!comparables.length) {
    return {
      comparables: [],
      analysis:    null,
      message:     `No comparable ${descriptionCode} properties found near ${postcodeSector}.`,
    }
  }

  const userRvPerM2       = rateableValue / floorArea
  const allRvPerM2        = comparables.map(c => Number(c.rv_per_m2)).filter(v => v > 0)
  const medianRvPerM2     = median(allRvPerM2)
  const percentile        = percentileOf(userRvPerM2, allRvPerM2)
  const potentialSaving   = Math.max(0, (userRvPerM2 - medianRvPerM2) * floorArea)
  const annualRatesSaving = Math.round(potentialSaving * RATES_MULTIPLIER)

  return {
    comparables,
    analysis: {
      userRvPerM2:       Math.round(userRvPerM2    * 100) / 100,
      medianRvPerM2:     Math.round(medianRvPerM2  * 100) / 100,
      percentile,
      potentialSaving:   Math.round(potentialSaving),
      annualRatesSaving,
      hasChallengeCase:  percentile > CHALLENGE_PERCENTILE,
      comparableCount:   comparables.length,
      searchScope,
    },
  }
}