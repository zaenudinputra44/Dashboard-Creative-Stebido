import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    // Drop table if it doesn't have the new schema (we do this once to ensure clean slate since we TRUNCATED anyway)
    // To be safe and not drop dynamically on every request, we just check if nama_produk column exists
    // If not, we alter or drop. We'll drop and recreate since it's totally different.
    try {
      await sql`SELECT nama_produk FROM kol_reports LIMIT 1`;
    } catch (e) {
      console.log('Migrasi skema database baru untuk KOL...');
      await sql`DROP TABLE IF EXISTS kol_reports`;
      await sql`
        CREATE TABLE kol_reports (
          id SERIAL PRIMARY KEY,
          kategori VARCHAR(100) DEFAULT 'endors_stebido',
          nama_produk VARCHAR(150),
          pic_kol VARCHAR(150),
          nama_akun VARCHAR(150),
          tingkat_kategori VARCHAR(50),
          no_whatsapp VARCHAR(50),
          tipe VARCHAR(50),
          ratecard NUMERIC DEFAULT 0,
          link_ig TEXT,
          link_gdrive TEXT,
          link_upload_reels TEXT,
          link_upload_story TEXT,
          all_upload BOOLEAN DEFAULT FALSE,
          diiklankan BOOLEAN DEFAULT FALSE,
          tanggal DATE DEFAULT CURRENT_DATE,
          platform VARCHAR(50) DEFAULT 'META',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }

    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM kol_reports ORDER BY tanggal DESC, id DESC`;
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { 
        kategori, nama_produk, pic_kol, nama_akun, tingkat_kategori, 
        no_whatsapp, tipe, ratecard, link_ig, link_gdrive, 
        link_upload_reels, link_upload_story, all_upload, diiklankan, tanggal, platform
      } = req.body;
      
      const result = await sql`
        INSERT INTO kol_reports (
          kategori, nama_produk, pic_kol, nama_akun, tingkat_kategori, 
          no_whatsapp, tipe, ratecard, link_ig, link_gdrive, 
          link_upload_reels, link_upload_story, all_upload, diiklankan, tanggal, platform
        )
        VALUES (
          ${kategori || 'endors_stebido'}, ${nama_produk || ''}, ${pic_kol || ''}, ${nama_akun || ''}, ${tingkat_kategori || 'Micro'},
          ${no_whatsapp || ''}, ${tipe || 'Short & Reels'}, ${ratecard || 0}, ${link_ig || ''}, ${link_gdrive || ''},
          ${link_upload_reels || ''}, ${link_upload_story || ''}, ${all_upload || false}, ${diiklankan || false}, 
          COALESCE(${tanggal || null}::date, CURRENT_DATE), ${platform || 'META'}
        )
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    else if (req.method === 'PUT') {
      const { 
        id, kategori, nama_produk, pic_kol, nama_akun, tingkat_kategori, 
        no_whatsapp, tipe, ratecard, link_ig, link_gdrive, 
        link_upload_reels, link_upload_story, all_upload, diiklankan, tanggal, platform
      } = req.body;
      
      const result = await sql`
        UPDATE kol_reports 
        SET 
          kategori = ${kategori || 'endors_stebido'},
          nama_produk = ${nama_produk || ''},
          pic_kol = ${pic_kol || ''},
          nama_akun = ${nama_akun || ''},
          tingkat_kategori = ${tingkat_kategori || 'Micro'},
          no_whatsapp = ${no_whatsapp || ''},
          tipe = ${tipe || 'Short & Reels'},
          ratecard = ${ratecard || 0},
          link_ig = ${link_ig || ''},
          link_gdrive = ${link_gdrive || ''},
          link_upload_reels = ${link_upload_reels || ''},
          link_upload_story = ${link_upload_story || ''},
          all_upload = ${all_upload},
          diiklankan = ${diiklankan},
          tanggal = COALESCE(${tanggal || null}::date, tanggal),
          platform = ${platform || 'META'}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) return res.status(404).json({ error: 'Data not found' });
      return res.status(200).json(result[0]);
    }
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });
      await sql`DELETE FROM kol_reports WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('KOL API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
