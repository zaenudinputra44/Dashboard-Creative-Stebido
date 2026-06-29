import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM technical_issues ORDER BY id DESC`;
      return res.status(200).json(data);
    } 
    
    else if (req.method === 'POST') {
      const { issue, severity } = req.body;
      const result = await sql`
        INSERT INTO technical_issues (issue, severity, status)
        VALUES (${issue}, ${severity}, 'Baru Masuk')
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    
    else if (req.method === 'PUT') {
      const { id, status } = req.body;
      const result = await sql`
        UPDATE technical_issues 
        SET status=${status}
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    }
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        const { id: bodyId } = req.body || {};
        if (bodyId) {
          await sql`DELETE FROM technical_issues WHERE id = ${bodyId}`;
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing ID' });
      }
      await sql`DELETE FROM technical_issues WHERE id = ${id}`;
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
