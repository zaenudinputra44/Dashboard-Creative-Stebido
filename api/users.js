import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all users to populate dropdowns
      const users = await sql`SELECT id, name, role FROM users ORDER BY name ASC`;
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
