import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1QPhkLqrII2r2alSu0NSVvLbMzZgdFB3zptZEtzmMf84/export?format=csv&gid=738362653';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
        }).on('error', reject);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

function parseCSV(text) {
  let rows = [];
  let s = !0, i = 0, row = [''], p = '';
  for (let l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if (',' === l && s) l = row[++i] = '';
    else if ('\n' === l && s) {
      if ('\r' === p) row[i] = row[i].slice(0, -1);
      rows.push(row);
      row = ['']; i = 0; p = ''; continue;
    } else row[i] += l;
    p = l;
  }
  if (row.join('') !== '') rows.push(row);
  return rows;
}

// Convert "4/29/2026" or similar to "YYYY-MM-DD"
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    let month, day;
    // Check if parts[0] is > 12, then it must be day
    if (parseInt(parts[0]) > 12) {
      day = parts[0].padStart(2, '0');
      month = parts[1].padStart(2, '0');
    } else {
      // Assuming MM/DD/YYYY if parts[0] <= 12, though it could be DD/MM/YYYY. 
      // For 4/29/2026, parts[1] > 12, so it's MM/DD/YYYY
      if (parseInt(parts[1]) > 12) {
        month = parts[0].padStart(2, '0');
        day = parts[1].padStart(2, '0');
      } else {
        // Ambiguous, let's assume DD/MM/YYYY as standard if both <= 12
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
      }
    }
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

async function run() {
  console.log("Memulai penarikan data TikTok Report Konten...");
  
  try {
    const csv = await fetchCsv(url);
    const rows = parseCSV(csv);
    
    // Find where data starts
    let startIndex = 2; // Data starts at row 3 (index 2)
    const dataRows = rows.slice(startIndex);
    
    let count = 0;
    
    // Clear old data to prevent duplicates
    await sql`TRUNCATE TABLE kol_tiktok_report`;
    console.log("Tabel lama berhasil dibersihkan, mulai memasukkan data baru...");
    
    for (const row of dataRows) {
      if (!row[2] || row[2].trim() === '') continue; // Skip empty names
      
      const pic = (row[1] || '').trim();
      const nama_talent = row[2].trim();
      const platform = (row[3] || 'TIKTOK').trim();
      const link_sosmed = (row[4] || '').trim();
      const brief = (row[5] || '').trim();
      const draft_video_1 = (row[6] || '').trim();
      const draft_foto = (row[7] || '').trim();
      
      const feedback_1 = (row[8] || '').trim();
      const status_1 = (row[9] || '').trim();
      const revised_draft = (row[10] || '').trim();
      const feedback_2 = (row[11] || '').trim();
      const status_2 = (row[12] || '').trim();
      
      // Combine smartly into single columns
      const draft_video = revised_draft ? revised_draft : draft_video_1;
      const status = status_2 ? status_2 : status_1;
      let feedback = feedback_1;
      if (feedback_2) {
        feedback = feedback ? `${feedback} | ${feedback_2}` : feedback_2;
      }
      
      const link_post = (row[13] || '').trim();
      const date_post = parseDate(row[14]);
      const kode_boost = (row[15] || '').trim();

      await sql`
        INSERT INTO kol_tiktok_report (
          pic, nama_talent, platform, link_sosmed, brief, draft_video, draft_foto, 
          feedback, status, link_post_tiktok, date_post_tiktok, kode_boost
        )
        VALUES (
          ${pic}, ${nama_talent}, ${platform}, ${link_sosmed},
          ${brief}, ${draft_video}, ${draft_foto},
          ${feedback}, ${status}, ${link_post},
          ${date_post ? date_post : null}, ${kode_boost}
        )
      `;
      count++;
    }
    
    console.log(`✅ Berhasil menyinkronkan ${count} data Report Konten.`);
  } catch (err) {
    console.error("❌ Gagal:", err.message);
  }
  
  process.exit(0);
}

run();
