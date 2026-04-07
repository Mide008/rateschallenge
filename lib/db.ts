// lib/db.ts
// Direct PostgreSQL connection — bypasses Supabase JS client and RLS entirely
// Uses the same Session Pooler that successfully loaded 2,193,029 rows

import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DB_URL
    if (!connectionString) {
      throw new Error('SUPABASE_DB_URL is not set in .env.local')
    }
    pool = new Pool({
      connectionString,
      ssl:                    { rejectUnauthorized: false },
      max:                    5,
      idleTimeoutMillis:      30000,
      connectionTimeoutMillis: 10000,
    })
    pool.on('error', (err) => {
      console.error('PG pool error:', err.message)
    })
  }
  return pool
}

export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result = await client.query(sql, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}