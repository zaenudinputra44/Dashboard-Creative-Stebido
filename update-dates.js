import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`UPDATE kol_reports SET tanggal = '2025-03-01'`;
    console.log("✅ Berhasil mengubah semua tanggal menjadi 1 Maret 2025!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
