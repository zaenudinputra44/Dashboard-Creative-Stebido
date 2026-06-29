import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT setting_key, setting_value FROM api_settings`;
      const settings = {};
      data.forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      for (const [key, value] of Object.entries(settings)) {
        await sql`
          INSERT INTO api_settings (setting_key, setting_value)
          VALUES (${key}, ${value})
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
        `;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
