import { sql } from './_db.js';

export default async function handler(req, res) {
  // Auto-migration for new manual columns
  try {
    await sql`ALTER TABLE performance_metrics ADD COLUMN budget VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN kontak VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN biaya_kontak VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN closing VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN cac VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN cpm VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN cpc VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN ctr_manual VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN klik_tautan VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN tayangan_landas VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN rasio_landas VARCHAR(255) DEFAULT '-'`;
    await sql`ALTER TABLE performance_metrics ADD COLUMN biaya_landas VARCHAR(255) DEFAULT '-'`;
  } catch(e) {
    // Ignore error if columns already exist
  }

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM performance_metrics ORDER BY id DESC`;
      // Convert to match frontend expectations
      const formatted = data.map(row => ({
        id: row.id,
        title: row.title,
        metaLink: row.meta_link,
        budget: row.budget || '-',
        kontak: row.kontak || '-',
        biayaKontak: row.biaya_kontak || '-',
        closing: row.closing || '-',
        cac: row.cac || '-',
        cpm: row.cpm || '-',
        cpc: row.cpc || '-',
        ctrManual: row.ctr_manual || '-',
        klikTautan: row.klik_tautan || '-',
        tayanganLandas: row.tayangan_landas || '-',
        rasioLandas: row.rasio_landas || '-',
        biayaLandas: row.biaya_landas || '-',
        roas: row.roas || '-'
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { 
      title, metaLink, budget, kontak, biayaKontak, closing, cac, cpm, cpc, 
      ctrManual, klikTautan, tayanganLandas, roas, rasioLandas, biayaLandas 
    } = req.body;
    
    // Fetching from Meta API has been removed as per user request for manual entry.

    try {
      const result = await sql`
        INSERT INTO performance_metrics (
          title, meta_link, budget, kontak, biaya_kontak, closing, cac, 
          cpm, cpc, ctr_manual, klik_tautan, tayangan_landas, roas, rasio_landas, biaya_landas
        )
        VALUES (
          ${title}, ${metaLink}, ${budget}, ${kontak}, ${biayaKontak}, ${closing}, ${cac},
          ${cpm}, ${cpc}, ${ctrManual}, ${klikTautan}, ${tayanganLandas}, ${roas}, ${rasioLandas}, ${biayaLandas}
        )
        RETURNING *
      `;
      const row = result[0];
      const newItem = {
        id: row.id,
        title: row.title,
        metaLink: row.meta_link,
        budget: row.budget,
        kontak: row.kontak,
        biayaKontak: row.biaya_kontak,
        closing: row.closing,
        cac: row.cac,
        cpm: row.cpm,
        cpc: row.cpc,
        ctrManual: row.ctr_manual,
        klikTautan: row.klik_tautan,
        tayanganLandas: row.tayangan_landas,
        rasioLandas: row.rasio_landas,
        biayaLandas: row.biaya_landas,
        roas: row.roas
      };
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        const { id: bodyId } = req.body || {};
        if (bodyId) {
          await sql`DELETE FROM performance_metrics WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM performance_metrics WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
