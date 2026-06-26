import { sql } from './db.js';

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
    
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
