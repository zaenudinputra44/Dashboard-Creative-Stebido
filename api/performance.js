import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM performance_metrics ORDER BY id DESC`;
      // Convert to match frontend expectations
      const formatted = data.map(row => ({
        id: row.id,
        title: row.title,
        metaLink: row.meta_link,
        funnel: row.funnel,
        ratio: row.ratio,
        impressions: row.impressions,
        clicks: row.clicks,
        transactions: row.transactions,
        roas: row.roas,
        get ctr() { return this.impressions ? ((this.clicks / this.impressions) * 100).toFixed(2) : '0.00' },
        get conversionRate() { return this.clicks ? ((this.transactions / this.clicks) * 100).toFixed(2) : '0.00' }
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, metaLink, funnel, ratio, impressions, clicks, transactions, roas } = req.body;
      const result = await sql`
        INSERT INTO performance_metrics (title, meta_link, funnel, ratio, impressions, clicks, transactions, roas)
        VALUES (${title}, ${metaLink}, ${funnel}, ${ratio}, ${impressions}, ${clicks}, ${transactions}, ${roas})
        RETURNING *
      `;
      const row = result[0];
      const newItem = {
        id: row.id,
        title: row.title,
        metaLink: row.meta_link,
        funnel: row.funnel,
        ratio: row.ratio,
        impressions: row.impressions,
        clicks: row.clicks,
        transactions: row.transactions,
        roas: row.roas,
        get ctr() { return this.impressions ? ((this.clicks / this.impressions) * 100).toFixed(2) : '0.00' },
        get conversionRate() { return this.clicks ? ((this.transactions / this.clicks) * 100).toFixed(2) : '0.00' }
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
