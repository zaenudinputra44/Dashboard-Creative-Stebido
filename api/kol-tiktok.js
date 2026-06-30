import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM kol_tiktok ORDER BY tanggal DESC, id DESC`;
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { 
        tanggal, nama_talent, kategori_talent, link_akun_tiktok, 
        ratecard, keterangan_sow, periode_owning, acc_kerjasama, 
        notes, rc_foto
      } = req.body;
      
      const result = await sql`
        INSERT INTO kol_tiktok (
          tanggal, nama_talent, kategori_talent, link_akun_tiktok, 
          ratecard, keterangan_sow, periode_owning, acc_kerjasama, 
          notes, rc_foto
        )
        VALUES (
          COALESCE(${tanggal || null}::date, CURRENT_DATE), 
          ${nama_talent || ''}, ${kategori_talent || 'Micro'}, ${link_akun_tiktok || ''},
          ${ratecard || 0}, ${keterangan_sow || ''}, ${periode_owning || 'Selamanya'},
          ${acc_kerjasama || false}, ${notes || ''}, ${rc_foto || ''}
        )
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    else if (req.method === 'PUT') {
      const { 
        id, tanggal, nama_talent, kategori_talent, link_akun_tiktok, 
        ratecard, keterangan_sow, periode_owning, acc_kerjasama, 
        notes, rc_foto
      } = req.body;
      
      const result = await sql`
        UPDATE kol_tiktok 
        SET 
          tanggal = COALESCE(${tanggal || null}::date, tanggal),
          nama_talent = ${nama_talent || ''},
          kategori_talent = ${kategori_talent || 'Micro'},
          link_akun_tiktok = ${link_akun_tiktok || ''},
          ratecard = ${ratecard || 0},
          keterangan_sow = ${keterangan_sow || ''},
          periode_owning = ${periode_owning || 'Selamanya'},
          acc_kerjasama = ${acc_kerjasama || false},
          notes = ${notes || ''},
          rc_foto = ${rc_foto || ''}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) return res.status(404).json({ error: 'Data not found' });
      return res.status(200).json(result[0]);
    }
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });
      await sql`DELETE FROM kol_tiktok WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('KOL TikTok API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
