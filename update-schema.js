import dotenv from 'dotenv';
dotenv.config();
import { sql } from './api/_db.js';

async function run() {
  try {
    await sql`ALTER TABLE kol_tiktok_report RENAME COLUMN feedback_1 TO feedback`;
    await sql`ALTER TABLE kol_tiktok_report RENAME COLUMN status_1 TO status`;
    await sql`ALTER TABLE kol_tiktok_report DROP COLUMN IF EXISTS revised_draft_video_1`;
    await sql`ALTER TABLE kol_tiktok_report DROP COLUMN IF EXISTS feedback_2`;
    await sql`ALTER TABLE kol_tiktok_report DROP COLUMN IF EXISTS status_2`;
    console.log("Schema updated");
  } catch(e) {
    console.log(e);
  }
  process.exit(0);
}
run();
