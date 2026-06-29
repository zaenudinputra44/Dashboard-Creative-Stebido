import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM winning_contents ORDER BY id DESC`;
      const formatted = data.map(row => ({
        id: row.id,
        title: row.title,
        adId: row.ad_id,
        ctr: row.ctr,
        transactions: row.transactions,
        budgetSpent: row.budget_spent,
        roas: row.roas,
        faktorSukses: row.faktor_sukses,
        skalaTindakan: row.skala_tindakan
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, adId, ctr, transactions, budgetSpent, roas, faktorSukses, skalaTindakan } = req.body;
      const result = await sql`
        INSERT INTO winning_contents (title, ad_id, ctr, transactions, budget_spent, roas, faktor_sukses, skala_tindakan)
        VALUES (${title}, ${adId}, ${ctr}, ${transactions}, ${budgetSpent || 0}, ${roas || 0}, ${faktorSukses}, ${skalaTindakan || 'Scale Up Budget'})
        RETURNING *
      `;
      const row = result[0];
      return res.status(201).json({
        id: row.id,
        title: row.title,
        adId: row.ad_id,
        ctr: row.ctr,
        transactions: row.transactions,
        budgetSpent: row.budget_spent,
        roas: row.roas,
        faktorSukses: row.faktor_sukses,
        skalaTindakan: row.skala_tindakan
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
          await sql`DELETE FROM winning_contents WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM winning_contents WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
