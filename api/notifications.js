import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { user_name } = req.query;
      
      if (!user_name) {
        return res.status(400).json({ error: 'Missing user_name' });
      }

      // Fetch notifications for the specific user
      const notifications = await sql`
        SELECT * FROM notifications 
        WHERE user_name = ${user_name}
        ORDER BY created_at DESC 
        LIMIT 50
      `;

      return res.status(200).json(notifications);
    } 
    
    else if (req.method === 'PUT') {
      // Mark as read
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing notification id' });

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
