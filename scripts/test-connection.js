import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('Testing Supabase connection...');
console.log('URL being used:', process.env.SUPABASE_DB_URL?.replace(/:([^:@]+)@/, ':***@'));

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  const client = await pool.connect();
  console.log('SUCCESS: Connected to database');
  
  const result = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  `);
  
  console.log('Tables found in your database:');
  result.rows.forEach(row => console.log(' -', row.tablename));
  
  const count = await client.query('SELECT COUNT(*) FROM voa_ratings');
  console.log('Rows in voa_ratings:', count.rows[0].count);
  
  client.release();
  await pool.end();
  console.log('Connection test complete.');
} catch (err) {
  console.log('FAILED:', err.message);
  console.log('Check your SUPABASE_DB_URL in .env.local');
  await pool.end();
}