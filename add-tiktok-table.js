import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS kol_tiktok (
        id SERIAL PRIMARY KEY,
        tanggal DATE DEFAULT CURRENT_DATE,
        nama_talent VARCHAR(150),
        kategori_talent VARCHAR(100),
        link_akun_tiktok TEXT,
        ratecard NUMERIC DEFAULT 0,
        keterangan_sow TEXT,
        periode_owning VARCHAR(100),
        acc_kerjasama BOOLEAN DEFAULT FALSE,
        notes TEXT,
        rc_foto VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Berhasil membuat tabel khusus kol_tiktok!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
