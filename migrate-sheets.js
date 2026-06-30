import dotenv from 'dotenv';
dotenv.config();

import { sql } from './api/_db.js';
import https from 'https';

const sheets = [
  { name: 'Sheet Juni (GID 330148039)', id: '1OA2ebCxBIuEJ7H5KdjeWvvlv5wxe3q787FO5YH-ijgI', gid: '330148039' }
];

async function fetchCsv(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=csv&gid=${sheet.gid}`;
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
  console.log("Memulai penarikan data khusus untuk Produk 'Stebido' dengan tanggal 1 Juni 2025...");
  
  let totalMigrated = 0;

  for (const sheet of sheets) {
    console.log(`\nMenarik data dari: ${sheet.name}`);
    try {
      const csv = await fetchCsv(sheet);
      const rows = parseCSV(csv);
      
      if (rows.length < 2) {
        console.log(`⚠️ Data kosong atau hanya header.`);
        continue;
      }
      
      const dataRows = rows.slice(1).reverse();
      let count = 0;
      
      for (const row of dataRows) {
        const namaProduk = (row[0] || '').trim();
        
        if (namaProduk.toLowerCase() !== 'stebido') {
          continue; 
        }
        
        const pic_kol = (row[1] || '').substring(0, 150).trim();
        const nama_akun = (row[2] || '').substring(0, 150).trim();
        const tingkat_kategori = (row[3] || '').substring(0, 50).trim();
        const no_whatsapp = (row[4] || '').substring(0, 50).trim();
        const tipe = (row[5] || '').substring(0, 50).trim();
        
        let ratecard = 0;
        if (row[6]) {
          const num = parseInt(row[6].replace(/[^0-9]/g, ''));
          if (!isNaN(num)) ratecard = num;
        }

        const link_ig = (row[7] || '').trim();
        const link_gdrive = (row[8] || '').trim();
        const link_upload_reels = (row[9] || '').trim();
        const link_upload_story = (row[10] || '').trim();
        
        const all_upload_text = (row[11] || '').toLowerCase();
        const all_upload = all_upload_text === 'true' || all_upload_text === '1' || all_upload_text === 'yes' || all_upload_text === 'y';
        
        const diiklankan_text = (row[12] || '').toLowerCase();
        const diiklankan = diiklankan_text === 'true' || diiklankan_text === '1' || diiklankan_text === 'yes' || diiklankan_text === 'y';

        // Hardcode tanggal to 1 Juni 2025 ('2025-06-01')
        const tanggal = '2025-06-01';

        await sql`
          INSERT INTO kol_reports (
            nama_produk, pic_kol, nama_akun, tingkat_kategori, 
            no_whatsapp, tipe, ratecard, link_ig, link_gdrive, 
            link_upload_reels, link_upload_story, all_upload, diiklankan, kategori, tanggal
          )
          VALUES (
            ${namaProduk}, ${pic_kol}, ${nama_akun}, ${tingkat_kategori},
            ${no_whatsapp}, ${tipe}, ${ratecard}, ${link_ig}, ${link_gdrive},
            ${link_upload_reels}, ${link_upload_story}, ${all_upload}, ${diiklankan}, 'endors_stebido', ${tanggal}
          )
        `;
        count++;
      }
      totalMigrated += count;
      console.log(`✅ Berhasil menyinkronkan ${count} data 'Stebido' dari ${sheet.name}.`);
    } catch(err) {
      console.error(`❌ Gagal menarik data ${sheet.name}:`, err.message);
    }
  }
  
  console.log(`\n🎉 Sinkronisasi selesai! Total data yang dimasukkan: ${totalMigrated}`);
  process.exit(0);
}

run();
