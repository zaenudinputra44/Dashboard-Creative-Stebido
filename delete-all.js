import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  console.log("Menghapus seluruh data dari tabel kol_reports...");
  try {
    await sql`TRUNCATE TABLE kol_reports RESTART IDENTITY`;
    console.log("✅ Berhasil menghapus semua data!");
  } catch(e) {
    console.log("❌ Gagal menghapus data:", e.message);
  }
  process.exit(0);
}

run();
