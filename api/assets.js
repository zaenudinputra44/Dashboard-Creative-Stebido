import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const data = await sql`SELECT * FROM assets WHERE id = ${id}`;
        if (data.length === 0) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(data[0]);
      } else {
        const data = await sql`SELECT * FROM assets ORDER BY id DESC`;
        return res.status(200).json(data);
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nama_aset, kategori, jumlah, pemegang_aset, status, tanggal_masuk, tanggal_kadaluwarsa, keterangan } = req.body;
      const data = await sql`
        INSERT INTO assets (nama_aset, kategori, jumlah, pemegang_aset, status, tanggal_masuk, tanggal_kadaluwarsa, keterangan)
        VALUES (${nama_aset}, ${kategori}, ${jumlah}, ${pemegang_aset}, ${status}, ${tanggal_masuk}, ${tanggal_kadaluwarsa}, ${keterangan})
        RETURNING *
      `;
      return res.status(201).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, nama_aset, kategori, jumlah, pemegang_aset, status, tanggal_masuk, tanggal_kadaluwarsa, keterangan } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const data = await sql`
        UPDATE assets
        SET nama_aset = ${nama_aset}, kategori = ${kategori}, jumlah = ${jumlah}, 
            pemegang_aset = ${pemegang_aset}, status = ${status}, tanggal_masuk = ${tanggal_masuk}, 
            tanggal_kadaluwarsa = ${tanggal_kadaluwarsa}, keterangan = ${keterangan}
        WHERE id = ${id}
        RETURNING *
      `;
      if (data.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const data = await sql`
        DELETE FROM assets WHERE id = ${id} RETURNING id
      `;
      if (data.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
