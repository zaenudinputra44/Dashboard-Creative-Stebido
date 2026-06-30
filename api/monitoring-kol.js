import { sql } from './_db.js';

const mapRow = (row) => ({
  id: row.id,
  week: row.week,
  namaKol: row.nama_kol,
  platform: row.platform,
  linkAkun: row.link_akun,
  namaProduk: row.nama_produk,
  jenisKerjasama: row.jenis_kerjasama,
  picKol: row.pic_kol,
  status: row.status
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM monitoring_pekerjaan_kol ORDER BY id DESC`;
      return res.status(200).json(data.map(mapRow));
    } 
    
    else if (req.method === 'POST') {
      const { week, namaKol, platform, linkAkun, namaProduk, jenisKerjasama, picKol } = req.body;
      const result = await sql`
        INSERT INTO monitoring_pekerjaan_kol 
        (week, nama_kol, platform, link_akun, nama_produk, jenis_kerjasama, pic_kol, status)
        VALUES 
        (${week}, ${namaKol}, ${platform}, ${linkAkun}, ${namaProduk}, ${jenisKerjasama}, ${picKol}, 'Pendekatan')
        RETURNING *
      `;
      return res.status(201).json(mapRow(result[0]));
    }
    
    else if (req.method === 'PUT') {
      const { id, week, namaKol, platform, linkAkun, namaProduk, jenisKerjasama, picKol, status } = req.body;
      
      const previous = await sql`SELECT status FROM monitoring_pekerjaan_kol WHERE id = ${id}`;
      const wasSelesai = previous.length > 0 && previous[0].status === 'Selesai';

      const result = await sql`
        UPDATE monitoring_pekerjaan_kol 
        SET week=${week}, nama_kol=${namaKol}, platform=${platform}, link_akun=${linkAkun}, 
            nama_produk=${namaProduk}, jenis_kerjasama=${jenisKerjasama}, pic_kol=${picKol}, status=${status}
        WHERE id = ${id}
        RETURNING *
      `;

      if (status === 'Selesai' && !wasSelesai) {
        try {
          const allUsers = await sql`SELECT name FROM users`;
          
          const recipients = new Set();
          allUsers.forEach(u => recipients.add(u.name));
          
          const title = "Pekerjaan KOL Selesai!";
          const message = `Kerjasama dengan KOL "${namaKol}" untuk produk ${namaProduk} telah diselesaikan oleh ${picKol}.`;
          
          for (const user of recipients) {
            await sql`
              INSERT INTO notifications (user_name, title, message) 
              VALUES (${user}, ${title}, ${message})
            `;
          }
        } catch (notifErr) {
          console.error("Gagal mengirim notifikasi KOL:", notifErr);
        }
      }

      return res.status(200).json(mapRow(result[0]));
    }
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        const { id: bodyId } = req.body || {};
        if (bodyId) {
          await sql`DELETE FROM monitoring_pekerjaan_kol WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM monitoring_pekerjaan_kol WHERE id = ${id}`;
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
