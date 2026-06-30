import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM kol_tiktok_report ORDER BY id DESC`;
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { 
        pic, nama_talent, platform, link_sosmed, brief, draft_video, draft_foto, 
        feedback, status, link_post_tiktok, date_post_tiktok, kode_boost
      } = req.body;
      
      const result = await sql`
        INSERT INTO kol_tiktok_report (
          pic, nama_talent, platform, link_sosmed, brief, draft_video, draft_foto, 
          feedback, status, link_post_tiktok, date_post_tiktok, kode_boost
        )
        VALUES (
          ${pic || ''}, ${nama_talent || ''}, ${platform || 'TIKTOK'}, ${link_sosmed || ''},
          ${brief || ''}, ${draft_video || ''}, ${draft_foto || ''},
          ${feedback || ''}, ${status || ''}, ${link_post_tiktok || ''},
          ${date_post_tiktok ? date_post_tiktok : null}, ${kode_boost || ''}
        )
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    else if (req.method === 'PUT') {
      const { 
        id, pic, nama_talent, platform, link_sosmed, brief, draft_video, draft_foto, 
        feedback, status, link_post_tiktok, date_post_tiktok, kode_boost
      } = req.body;
      
      const result = await sql`
        UPDATE kol_tiktok_report 
        SET 
          pic = ${pic || ''},
          nama_talent = ${nama_talent || ''},
          platform = ${platform || 'TIKTOK'},
          link_sosmed = ${link_sosmed || ''},
          brief = ${brief || ''},
          draft_video = ${draft_video || ''},
          draft_foto = ${draft_foto || ''},
          feedback = ${feedback || ''},
          status = ${status || ''},
          link_post_tiktok = ${link_post_tiktok || ''},
          date_post_tiktok = ${date_post_tiktok ? date_post_tiktok : null},
          kode_boost = ${kode_boost || ''}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) return res.status(404).json({ error: 'Data not found' });
      return res.status(200).json(result[0]);
    }
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });
      await sql`DELETE FROM kol_tiktok_report WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('KOL TikTok Report API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
