import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`ALTER TABLE kol_reports ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'META'`;
    // Update existing rows to 'META' just to be absolutely sure (though DEFAULT handles new queries, existing rows might be null depending on postgres version, but usually DEFAULT applies to existing rows too in modern PG. Let's force update anyway)
    await sql`UPDATE kol_reports SET platform = 'META' WHERE platform IS NULL`;
    console.log("✅ Berhasil menambahkan kolom platform dan memindahkan semua data ke META!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
