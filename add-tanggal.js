import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`ALTER TABLE kol_reports ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE`;
    console.log("✅ Berhasil menambahkan kolom tanggal!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
