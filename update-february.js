import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    // Determine the oldest 5 records (which are the "previous data")
    // and update their 'tanggal' to '2025-02-01'
    await sql`
      UPDATE kol_reports
      SET tanggal = '2025-02-01'
      WHERE id IN (
        SELECT id FROM kol_reports 
        ORDER BY created_at ASC 
        LIMIT 5
      )
    `;
    console.log("✅ Berhasil mengubah data sebelumnya menjadi 1 Februari 2025!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
