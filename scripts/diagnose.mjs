import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '..', 'data', 'raw', 'voa_2023.csv');

console.log('=== VOA FILE DIAGNOSTIC ===\n');
console.log(`Reading: ${CSV_PATH}\n`);

const fileStream = fs.createReadStream(CSV_PATH);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let count01 = 0;
let count03 = 0;
let count04 = 0;
let otherTypes = new Set();

for await (const line of rl) {
  const parts = line.split('*');
  const type = parts[0];

  if (type === '01' && count01 < 3) {
    console.log(`--- RECORD TYPE 01 (example ${count01 + 1}) ---`);
    parts.forEach((val, i) => {
      console.log(`  [${i}] = "${val}"`);
    });
    console.log('');
    count01++;
  }

  if (type === '03' && count03 < 3) {
    console.log(`--- RECORD TYPE 03 (example ${count03 + 1}) ---`);
    parts.forEach((val, i) => {
      console.log(`  [${i}] = "${val}"`);
    });
    console.log('');
    count03++;
  }

  if (type === '04' && count04 < 2) {
    console.log(`--- RECORD TYPE 04 (example ${count04 + 1}) ---`);
    parts.forEach((val, i) => {
      console.log(`  [${i}] = "${val}"`);
    });
    console.log('');
    count04++;
  }

  if (!['01','02','03','04','05'].includes(type)) {
    otherTypes.add(type);
  }

  if (count01 >= 3 && count03 >= 3 && count04 >= 2) break;
}

console.log('=== OTHER RECORD TYPES FOUND ===');
console.log([...otherTypes].join(', ') || 'None');
console.log('\nDiagnostic complete. Paste the output above into your chat.');