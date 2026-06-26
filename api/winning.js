import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM winning_contents ORDER BY id DESC`;
      const formatted = data.map(row => ({
        id: row.id,
        title: row.title,
        ctr: row.ctr,
        transactions: row.transactions,
        faktorSukses: row.faktor_sukses
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, ctr, transactions, faktorSukses } = req.body;
      const result = await sql`
        INSERT INTO winning_contents (title, ctr, transactions, faktor_sukses)
        VALUES (${title}, ${ctr}, ${transactions}, ${faktorSukses})
        RETURNING *
      `;
      const row = result[0];
      return res.status(201).json({
        id: row.id,
        title: row.title,
        ctr: row.ctr,
        transactions: row.transactions,
        faktorSukses: row.faktor_sukses
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
