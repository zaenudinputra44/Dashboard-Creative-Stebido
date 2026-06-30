import { sql } from './_db.js';

const mapRowCWM = (row) => ({
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

const mapRowKOL = (row) => ({
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
    const isKol = req.query.type === 'kol' || req.body?.type === 'kol';

    if (req.method === 'GET') {
      if (isKol) {
        const data = await sql`SELECT * FROM monitoring_pekerjaan_kol ORDER BY id DESC`;
        return res.status(200).json(data.map(mapRowKOL));
      } else {
        const data = await sql`SELECT * FROM monitoring_pekerjaan ORDER BY id DESC`;
        return res.status(200).json(data.map(mapRowCWM));
      }
    } 
    
    else if (req.method === 'POST') {
      if (isKol) {
        const { week, namaKol, platform, linkAkun, namaProduk, jenisKerjasama, picKol } = req.body;
        const result = await sql`
          INSERT INTO monitoring_pekerjaan_kol 
          (week, nama_kol, platform, link_akun, nama_produk, jenis_kerjasama, pic_kol, status)
          VALUES 
          (${week}, ${namaKol}, ${platform}, ${linkAkun}, ${namaProduk}, ${jenisKerjasama}, ${picKol}, 'Pendekatan')
          RETURNING *
        `;
        return res.status(201).json(mapRowKOL(result[0]));
      } else {
        const { week, produk, linkKonten, tanggalKonten, judulKonten, jenisKonten, ratio, funnel, executorCWM, picKonten } = req.body;
        const result = await sql`
          INSERT INTO monitoring_pekerjaan 
          (week, produk, link_konten, tanggal_konten, judul_konten, jenis_konten, ratio, funnel, executor_cwm, pic_konten, status)
          VALUES 
          (${week}, ${produk}, ${linkKonten}, ${tanggalKonten}, ${judulKonten}, ${jenisKonten}, ${ratio}, ${funnel}, ${executorCWM}, ${picKonten}, 'Baru Masuk')
          RETURNING *
        `;
        return res.status(201).json(mapRowCWM(result[0]));
      }
    }
    
    else if (req.method === 'PUT') {
      if (isKol) {
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
              await sql`INSERT INTO notifications (user_name, title, message) VALUES (${user}, ${title}, ${message})`;
            }
          } catch (notifErr) {}
        }
        return res.status(200).json(mapRowKOL(result[0]));
      } else {
        const { id, week, produk, linkKonten, tanggalKonten, judulKonten, jenisKonten, ratio, funnel, executorCWM, picKonten, status } = req.body;
        
        const previous = await sql`SELECT status FROM monitoring_pekerjaan WHERE id = ${id}`;
        const wasSelesai = previous.length > 0 && previous[0].status === 'Selesai';

        const result = await sql`
          UPDATE monitoring_pekerjaan 
          SET week=${week}, produk=${produk}, link_konten=${linkKonten}, tanggal_konten=${tanggalKonten}, 
              judul_konten=${judulKonten}, jenis_konten=${jenisKonten}, ratio=${ratio}, funnel=${funnel}, 
              executor_cwm=${executorCWM}, pic_konten=${picKonten}, status=${status}
          WHERE id = ${id}
          RETURNING *
        `;

        if (status === 'Selesai' && !wasSelesai) {
          try {
            const allUsers = await sql`SELECT name FROM users`;
            const recipients = new Set();
            allUsers.forEach(u => recipients.add(u.name));
            
            const title = "Pekerjaan Selesai!";
            const message = `Pekerjaan "${judulKonten}" telah diselesaikan oleh ${executorCWM}.`;
            
            for (const user of recipients) {
              await sql`INSERT INTO notifications (user_name, title, message) VALUES (${user}, ${title}, ${message})`;
            }
          } catch (notifErr) {}
        }
        return res.status(200).json(mapRowCWM(result[0]));
      }
    }
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      const { id: bodyId } = req.body || {};
      const targetId = id || bodyId;
      
      if (!targetId) return res.status(400).json({ error: 'Missing ID' });
      
      if (isKol) {
        await sql`DELETE FROM monitoring_pekerjaan_kol WHERE id = ${targetId}`;
      } else {
        await sql`DELETE FROM monitoring_pekerjaan WHERE id = ${targetId}`;
      }
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
