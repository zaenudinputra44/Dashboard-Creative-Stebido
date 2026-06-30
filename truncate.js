import dotenv from 'dotenv';
dotenv.config();
import { sql } from './api/_db.js';
async function run() {
  await sql`TRUNCATE TABLE kol_tiktok_report`;
  console.log('Truncated');
  process.exit(0);
}
run();
