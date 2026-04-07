// scripts/ingest.js
// Run with: node scripts/ingest.js
// Reads VOA compiled list (asterisk-delimited, 01 records only)

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIGURATION ─────────────────────────────────────────────────────────────
const FILENAME  = 'voa_2023.csv';
const LIST_YEAR = FILENAME.includes('2026') ? 2026 : 2023;
const CSV_PATH  = path.join(__dirname, '..', 'data', 'raw', FILENAME);
const BATCH_SIZE = 500;
const SLEEP_MS   = 100;
const DELIMITER  = '*';   // VOA compiled list uses asterisk, NOT pipe or comma
// ──────────────────────────────────────────────────────────────────────────────

// Map description text → short code for filtering in the UI
// Add more as you discover them in your data
const DESCRIPTION_TO_CODE = {
  'surgery and premises':         'SU',
  'offices and premises':         'CO',
  'office and premises':          'CO',
  'shop and premises':            'SR',
  'shops and premises':           'SR',
  'warehouse and premises':       'WH',
  'industrial premises':          'IN',
  'restaurant and premises':      'RS',
  'public house and premises':    'PP',
  'hotel and premises':           'HO',
  'garage and premises':          'GR',
  'car park':                     'PK',
  'petrol filling station':       'PN',
  'workshop and premises':        'EW',
  'storage and premises':         'TK',
  'mixed retail premises':        'MX',
  'leisure and premises':         'LS',
  'clinic and premises':          'CL',
  'nursery and premises':         'NU',
  'salon and premises':           'SA',
  'bank and premises':            'BK',
  'public house':                 'PP',
  'restaurant':                   'RS',
  'cafe and premises':            'RS',
  'takeaway and premises':        'RS',
};

function getDescriptionCode(text) {
  if (!text) return 'OC';
  const lower = text.toLowerCase().trim();
  for (const [key, code] of Object.entries(DESCRIPTION_TO_CODE)) {
    if (lower.includes(key)) return code;
  }
  return 'OC'; // Other Commercial — fallback
}

function normalisePostcode(raw) {
  if (!raw) return { postcode: null, sector: null };
  const pc = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  const parts = pc.split(' ');
  if (parts.length === 2 && parts[1].length >= 1) {
    return { postcode: pc, sector: `${parts[0]} ${parts[1][0]}` };
  }
  // Handle postcodes without space e.g. GU470QE
  const match = pc.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/);
  if (match) {
    const formatted = `${match[1]} ${match[2]}`;
    return { postcode: formatted, sector: `${match[1]} ${match[2][0]}` };
  }
  return { postcode: pc, sector: null };
}

function buildAddress(fields) {
  // Address parts are at indexes 5-12 (sub-building, building, street, locality, town, county)
  const parts = [
    fields[5],  // sub-building / flat / suite name or number
    fields[6],  // address line 2
    fields[7],  // address line 3
    fields[8],  // building name
    fields[9],  // street
    fields[10], // locality / district
    fields[11], // town
  ];
  return parts
    .map(p => (p || '').trim())
    .filter(p => p.length > 0)
    .join(', ');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchInsert(client, records) {
  if (records.length === 0) return;

  const values = records.map((r, i) => {
    const b = i * 12;
    return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12})`;
  }).join(',');

  const flat = records.flatMap(r => [
    r.ba_reference,
    r.billing_authority,
    r.full_address,
    r.postcode,
    r.postcode_sector,
    r.primary_description_code,
    r.description_text,
    r.total_area,
    r.rateable_value,
    r.rv_per_m2,
    r.effective_date,
    r.list_year,
  ]);

  await client.query(
    `INSERT INTO voa_ratings
      (ba_reference, billing_authority, full_address, postcode, postcode_sector,
       primary_description_code, description_text, total_area, rateable_value,
       rv_per_m2, effective_date, list_year)
     VALUES ${values}
     ON CONFLICT DO NOTHING`,
    flat
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
console.log('RatesChallenge — VOA Data Ingest');
console.log('─'.repeat(50));
console.log(`File:      ${FILENAME}`);
console.log(`List year: ${LIST_YEAR}`);
console.log(`Path:      ${CSV_PATH}`);
console.log(`Delimiter: asterisk (*)`);
console.log('─'.repeat(50));

// Verify the file exists before connecting to DB
if (!fs.existsSync(CSV_PATH)) {
  console.error(`ERROR: File not found at ${CSV_PATH}`);
  console.error('Check that your VOA file is in data/raw/ and the FILENAME constant is correct.');
  process.exit(1);
}

// Verify env var is loaded
if (!process.env.SUPABASE_DB_URL) {
  console.error('ERROR: SUPABASE_DB_URL is not set.');
  console.error('Make sure .env.local exists and contains SUPABASE_DB_URL=...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 10000,
});

// Test connection before starting
console.log('Testing database connection...');
let testClient;
try {
  testClient = await pool.connect();
  const result = await testClient.query('SELECT COUNT(*) FROM voa_ratings');
  console.log(`Connected. Current rows in voa_ratings: ${result.rows[0].count}`);
  testClient.release();
} catch (err) {
  console.error('FATAL: Cannot connect to database.');
  console.error('Error:', err.message);
  console.error('');
  console.error('Most likely causes:');
  console.error('1. Your password contains @ — replace it with %40 in SUPABASE_DB_URL');
  console.error('2. You are using the direct connection — switch to the Session Pooler URL');
  console.error('3. SUPABASE_DB_URL is wrong or .env.local is not being found');
  await pool.end();
  process.exit(1);
}

console.log('');
console.log('Reading and inserting records...');
console.log('(This will take a while — let it run)\n');

const rl = readline.createInterface({
  input: fs.createReadStream(CSV_PATH),
  crlfDelay: Infinity,
});

let totalLines    = 0;
let skippedLines  = 0;
let insertedRows  = 0;
let errorRows     = 0;
let batch         = [];
let client        = await pool.connect();

// Track unique description codes found — useful for debugging
const descCodesFound = new Set();

try {
  for await (const line of rl) {
    totalLines++;

    const trimmed = line.trim();
    if (!trimmed) { skippedLines++; continue; }

    const fields = trimmed.split(DELIMITER);

    // Only process 01 records (main property records)
    const recordType = (fields[0] || '').trim();
    if (recordType !== '01') { skippedLines++; continue; }

    // Need at least 17 fields to have both area and RV
    if (fields.length < 17) { skippedLines++; continue; }

    const baReference     = (fields[1]  || '').trim();
    const descriptionText = (fields[15] || '').trim();
    const rawArea         = (fields[16] || '').trim();
    const rawRV           = (fields[17] || '').trim();
    const rawPostcode     = (fields[13] || '').trim();

    if (!baReference) { skippedLines++; continue; }

    const totalArea     = parseFloat(rawArea);
    const rateableValue = parseFloat(rawRV);

    const hasArea = !isNaN(totalArea) && totalArea > 0;
    const hasRV   = !isNaN(rateableValue) && rateableValue > 0;
    const rvPerM2 = hasArea && hasRV ? rateableValue / totalArea : null;

    const { postcode, sector } = normalisePostcode(rawPostcode);
    const fullAddress           = buildAddress(fields);
    const descCode              = getDescriptionCode(descriptionText);

    descCodesFound.add(`${descCode}:${descriptionText}`);

    batch.push({
      ba_reference:              baReference,
      billing_authority:         (fields[3] || '').trim(),
      full_address:              fullAddress,
      postcode,
      postcode_sector:           sector,
      primary_description_code:  descCode,
      description_text:          descriptionText,
      total_area:                hasArea ? totalArea : null,
      rateable_value:            hasRV   ? rateableValue : null,
      rv_per_m2:                 rvPerM2,
      effective_date:            null,   // not in 01 record — add if needed later
      list_year:                 LIST_YEAR,
    });

    if (batch.length >= BATCH_SIZE) {
      try {
        await batchInsert(client, batch);
        insertedRows += batch.length;
      } catch (err) {
        errorRows += batch.length;
        console.error(`\nBatch insert error: ${err.message}`);
      }
      batch = [];
      process.stdout.write(`\r  Processed: ${insertedRows.toLocaleString()} rows inserted, ${skippedLines.toLocaleString()} skipped`);
      await sleep(SLEEP_MS);
    }
  }

  // Insert final batch
  if (batch.length > 0) {
    try {
      await batchInsert(client, batch);
      insertedRows += batch.length;
    } catch (err) {
      errorRows += batch.length;
      console.error(`\nFinal batch error: ${err.message}`);
    }
  }

} finally {
  client.release();
}

// Final stats
console.log('\n\n' + '─'.repeat(50));
console.log('INGEST COMPLETE');
console.log('─'.repeat(50));
console.log(`Total lines read:    ${totalLines.toLocaleString()}`);
console.log(`Records inserted:    ${insertedRows.toLocaleString()}`);
console.log(`Lines skipped:       ${skippedLines.toLocaleString()} (02/05 records + blanks — expected)`);
console.log(`Errors:              ${errorRows.toLocaleString()}`);

// Verify in DB
const verifyClient = await pool.connect();
const stats = await verifyClient.query(`
  SELECT
    COUNT(*)                                    AS total_rows,
    COUNT(total_area)                           AS has_area,
    COUNT(rv_per_m2)                            AS has_rv_per_m2,
    ROUND(AVG(rv_per_m2)::numeric, 2)          AS avg_rv_per_m2,
    MIN(rateable_value)                         AS min_rv,
    MAX(rateable_value)                         AS max_rv
  FROM voa_ratings
`);
verifyClient.release();

console.log('');
console.log('Database verification:');
console.log(`  Total rows in DB:  ${stats.rows[0].total_rows}`);
console.log(`  Have floor area:   ${stats.rows[0].has_area}`);
console.log(`  Have RV/m²:        ${stats.rows[0].has_rv_per_m2}`);
console.log(`  Average RV/m²:     £${stats.rows[0].avg_rv_per_m2}`);
console.log(`  RV range:          £${stats.rows[0].min_rv} – £${stats.rows[0].max_rv}`);

console.log('');
console.log('Description codes found in this file:');
[...descCodesFound].sort().slice(0, 20).forEach(d => console.log(' ', d));

await pool.end();