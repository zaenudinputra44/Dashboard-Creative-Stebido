import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS kol_tiktok_report (
        id SERIAL PRIMARY KEY,
        pic VARCHAR(150),
        nama_talent VARCHAR(150),
        platform VARCHAR(50),
        link_sosmed TEXT,
        brief TEXT,
        draft_video TEXT,
        draft_foto TEXT,
        feedback_1 TEXT,
        status_1 VARCHAR(50),
        revised_draft_video_1 TEXT,
        feedback_2 TEXT,
        status_2 VARCHAR(50),
        link_post_tiktok TEXT,
        date_post_tiktok DATE,
        kode_boost TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Berhasil membuat tabel kol_tiktok_report!");
  } catch(e) {
    console.log("❌ Gagal:", e.message);
  }
  process.exit(0);
}

run();
