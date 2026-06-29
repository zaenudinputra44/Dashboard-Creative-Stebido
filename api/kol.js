import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    // Pastikan tabel kol_reports ada
    await sql`
      CREATE TABLE IF NOT EXISTS kol_reports (
        id SERIAL PRIMARY KEY,
        nama_kol VARCHAR(150) NOT NULL,
        platform VARCHAR(50),
        tingkat VARCHAR(50),
        pic VARCHAR(100),
        status VARCHAR(50),
        jadwal_tayang DATE,
        biaya NUMERIC,
        link_hasil TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM kol_reports ORDER BY id DESC`;
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { nama_kol, platform, tingkat, pic, status, jadwal_tayang, biaya, link_hasil } = req.body;
      const result = await sql`
        INSERT INTO kol_reports (nama_kol, platform, tingkat, pic, status, jadwal_tayang, biaya, link_hasil)
        VALUES (${nama_kol}, ${platform}, ${tingkat}, ${pic}, ${status}, ${jadwal_tayang || null}, ${biaya || 0}, ${link_hasil || ''})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    else if (req.method === 'PUT') {
      const { id, nama_kol, platform, tingkat, pic, status, jadwal_tayang, biaya, link_hasil } = req.body;
      const result = await sql`
        UPDATE kol_reports 
        SET 
          nama_kol = ${nama_kol},
          platform = ${platform},
          tingkat = ${tingkat},
          pic = ${pic},
          status = ${status},
          jadwal_tayang = ${jadwal_tayang || null},
          biaya = ${biaya || 0},
          link_hasil = ${link_hasil || ''}
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
