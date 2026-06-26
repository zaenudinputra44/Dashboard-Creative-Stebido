import { sql } from './db.js';

const mapRow = (row) => ({
  id: row.id,
  week: row.week,
  produk: row.produk,
  linkKonten: row.link_konten,
  tanggalKonten: row.tanggal_konten,
  judulKonten: row.judul_konten,
  jenisKonten: row.jenis_konten,
  ratio: row.ratio,
  funnel: row.funnel,
  executorCWM: row.executor_cwm,
  picKonten: row.pic_konten,
  status: row.status
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM monitoring_pekerjaan ORDER BY id DESC`;
      return res.status(200).json(data.map(mapRow));
    } 
    
    else if (req.method === 'POST') {
      const { week, produk, linkKonten, tanggalKonten, judulKonten, jenisKonten, ratio, funnel, executorCWM, picKonten } = req.body;
      const result = await sql`
        INSERT INTO monitoring_pekerjaan 
        (week, produk, link_konten, tanggal_konten, judul_konten, jenis_konten, ratio, funnel, executor_cwm, pic_konten, status)
        VALUES 
        (${week}, ${produk}, ${linkKonten}, ${tanggalKonten}, ${judulKonten}, ${jenisKonten}, ${ratio}, ${funnel}, ${executorCWM}, ${picKonten}, 'Baru Masuk')
        RETURNING *
      `;
      return res.status(201).json(mapRow(result[0]));
    }
    
    else if (req.method === 'PUT') {
      const { id, week, produk, linkKonten, tanggalKonten, judulKonten, jenisKonten, ratio, funnel, executorCWM, picKonten } = req.body;
      const result = await sql`
        UPDATE monitoring_pekerjaan 
        SET week=${week}, produk=${produk}, link_konten=${linkKonten}, tanggal_konten=${tanggalKonten}, 
            judul_konten=${judulKonten}, jenis_konten=${jenisKonten}, ratio=${ratio}, funnel=${funnel}, 
            executor_cwm=${executorCWM}, pic_konten=${picKonten}
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(mapRow(result[0]));
    }
    
    else if (req.method === 'DELETE') {
      const { id } = req.query; // Assuming DELETE /api/monitoring?id=123
      if (!id) {
        // Fallback to body
        const { id: bodyId } = req.body || {};
        if (bodyId) {
          await sql`DELETE FROM monitoring_pekerjaan WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM monitoring_pekerjaan WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
    
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
