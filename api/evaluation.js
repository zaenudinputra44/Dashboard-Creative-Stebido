import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM evaluations ORDER BY id DESC`;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { week, notes } = req.body;
      const result = await sql`
        INSERT INTO evaluations (week, notes)
        VALUES (${week}, ${JSON.stringify(notes)}::jsonb)
        RETURNING *
      `;
      return res.status(201).json(result[0]);
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
          await sql`DELETE FROM evaluations WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM evaluations WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, notes } = req.body;
      const result = await sql`
        UPDATE evaluations 
        SET notes = ${JSON.stringify(notes)}::jsonb 
        WHERE id = ${id} 
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
