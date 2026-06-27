import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM not_winning_contents ORDER BY id DESC`;
      const formatted = data.map(row => ({
        id: row.id,
        title: row.title,
        adId: row.ad_id,
        ctr: row.ctr,
        conversionRate: row.conversion_rate,
        budgetSpent: row.budget_spent,
        cpc: row.cpc,
        cpa: row.cpa,
        roas: row.roas,
        indikasiMasalah: row.indikasi_masalah,
        decision: row.decision
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, adId, ctr, conversionRate, budgetSpent, cpc, cpa, roas, indikasiMasalah, decision } = req.body;
      const result = await sql`
        INSERT INTO not_winning_contents (title, ad_id, ctr, conversion_rate, budget_spent, cpc, cpa, roas, indikasi_masalah, decision)
        VALUES (${title}, ${adId}, ${ctr}, ${conversionRate}, ${budgetSpent || 0}, ${cpc || 0}, ${cpa || 0}, ${roas || 0}, ${indikasiMasalah}, ${decision || 'Belum Ditentukan'})
        RETURNING *
      `;
      const row = result[0];
      return res.status(201).json({
        id: row.id,
        title: row.title,
        adId: row.ad_id,
        ctr: row.ctr,
        conversionRate: row.conversion_rate,
        budgetSpent: row.budget_spent,
        cpc: row.cpc,
        cpa: row.cpa,
        roas: row.roas,
        indikasiMasalah: row.indikasi_masalah,
        decision: row.decision
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, decision } = req.body;
      const result = await sql`
        UPDATE not_winning_contents 
        SET decision = ${decision} 
        WHERE id = ${id} 
        RETURNING *
      `;
      if (result.length === 0) return res.status(404).json({ error: 'Data not found' });
      
      const row = result[0];
      return res.status(200).json({
        id: row.id,
        title: row.title,
        adId: row.ad_id,
        ctr: row.ctr,
        conversionRate: row.conversion_rate,
        budgetSpent: row.budget_spent,
        cpc: row.cpc,
        cpa: row.cpa,
        roas: row.roas,
        indikasiMasalah: row.indikasi_masalah,
        decision: row.decision
      });
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
          await sql`DELETE FROM not_winning_contents WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM not_winning_contents WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
