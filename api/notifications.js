import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    // Pastikan tabel notifications ada
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100),
        title VARCHAR(255),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (req.method === 'GET') {
      const { user_name } = req.query;
      if (!user_name) return res.status(400).json({ error: 'Missing user_name' });
      
      const data = await sql`
        SELECT * FROM notifications 
        WHERE user_name = ${user_name} 
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { title, message, notifyAll, user_name } = req.body;
      
      if (notifyAll) {
        // Ambil semua user aktif
        const users = await sql`SELECT name FROM users`;
        for (const user of users) {
           await sql`
             INSERT INTO notifications (user_name, title, message)
             VALUES (${user.name}, ${title}, ${message})
           `;
        }
        return res.status(201).json({ success: true, count: users.length });
      } else {
        const result = await sql`
          INSERT INTO notifications (user_name, title, message)
          VALUES (${user_name}, ${title}, ${message})
          RETURNING *
        `;
        return res.status(201).json(result[0]);
      }
    }
    else if (req.method === 'PUT') {
      const { id } = req.body;
      const result = await sql`
        UPDATE notifications 
        SET is_read = true 
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
