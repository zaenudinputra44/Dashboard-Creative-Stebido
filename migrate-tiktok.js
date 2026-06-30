import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1QPhkLqrII2r2alSu0NSVvLbMzZgdFB3zptZEtzmMf84/export?format=csv&gid=689913098';

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

async function run() {
  console.log("Memulai penarikan data TikTok khusus 'RC Influencer'...");
  
  try {
    const csv = await fetchCsv(url);
    const rows = parseCSV(csv);
    
    // Find where RC Influencer data starts and ends
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].includes('RC Influencer')) {
        startIndex = i + 2; // Data starts 2 rows after the title
      } else if (startIndex !== -1 && i >= startIndex && (rows[i][0] === '' || rows[i][0].includes('RC Mega'))) {
        endIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) {
      console.log("❌ Header 'RC Influencer' tidak ditemukan!");
      process.exit(1);
    }
    
    if (endIndex === -1) endIndex = rows.length; // Till the end if no separator found
    
    const dataRows = rows.slice(startIndex, endIndex);
    
    let count = 0;
    
    for (const row of dataRows) {
      if (!row[1] || row[1].trim() === '') continue; // Skip empty names
      
      const nama_talent = row[1].trim();
      const kategori_talent = (row[2] || '').trim();
      const link_akun_tiktok = (row[3] || '').trim();
      
      let ratecard = 0;
      if (row[4]) {
        const num = parseInt(row[4].replace(/[^0-9]/g, ''));
        if (!isNaN(num)) ratecard = num;
      }
      
      const keterangan_sow = (row[5] || '').trim();
      const periode_owning = (row[6] || '').trim();
      
      const acc_text = (row[7] || '').trim().toUpperCase();
      const acc_kerjasama = acc_text === 'TRUE' || acc_text === 'YES' || acc_text === '1';
      
      const notes = (row[8] || '').trim();
      const rc_foto = (row[9] || '').trim();

      await sql`
        INSERT INTO kol_tiktok (
          nama_talent, kategori_talent, link_akun_tiktok, 
          ratecard, keterangan_sow, periode_owning, 
          acc_kerjasama, notes, rc_foto
        )
        VALUES (
          ${nama_talent}, ${kategori_talent}, ${link_akun_tiktok},
          ${ratecard}, ${keterangan_sow}, ${periode_owning},
          ${acc_kerjasama}, ${notes}, ${rc_foto}
        )
      `;
      count++;
    }
    
    console.log(`✅ Berhasil menyinkronkan ${count} data RC Influencer ke menu TIKTOK.`);
  } catch (err) {
    console.error("❌ Gagal:", err.message);
  }
  
  process.exit(0);
}

run();
