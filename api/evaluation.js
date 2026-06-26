import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM evaluations ORDER BY id DESC`;
      return res.status(200).json(data);
    } 
    
    else if (req.method === 'POST') {
      const { week, notes } = req.body;
      const result = await sql`
        INSERT INTO evaluations (week, notes)
        VALUES (${week}, ${JSON.stringify(notes)}::jsonb)
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }
    
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
