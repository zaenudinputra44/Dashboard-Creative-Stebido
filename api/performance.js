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
    const { title, metaLink, funnel, ratio } = req.body;
    
    let impressions = req.body.impressions || 0;
    let clicks = req.body.clicks || 0;
    let transactions = req.body.transactions || 0;
    let roas = req.body.roas || '0.00';
    
    // Attempt to fetch from Meta API if token exists
    try {
      const settingsRes = await sql`SELECT setting_key, setting_value FROM api_settings WHERE setting_key = 'META_ACCESS_TOKEN' OR setting_key = 'META_AD_ACCOUNT_ID'`;
      let token = null;
      settingsRes.forEach(s => {
        if (s.setting_key === 'META_ACCESS_TOKEN') token = s.setting_value;
      });

      if (token && metaLink) {
        const adId = metaLink.trim();
        const graphUrl = `https://graph.facebook.com/v18.0/${adId}/insights?fields=impressions,clicks,actions,purchase_roas&access_token=${token}`;
        const fbRes = await fetch(graphUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.data && fbData.data.length > 0) {
            const insights = fbData.data[0];
            impressions = parseInt(insights.impressions || 0, 10);
            clicks = parseInt(insights.clicks || 0, 10);
            
            if (insights.actions) {
              const purchaseAction = insights.actions.find(a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
              if (purchaseAction) transactions = parseInt(purchaseAction.value || 0, 10);
            }
            
            if (insights.purchase_roas && insights.purchase_roas.length > 0) {
              roas = parseFloat(insights.purchase_roas[0].value || 0).toFixed(2);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error fetching Meta API:', e.message);
    }

    try {
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
