import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { adId } = req.body;
  if (!adId) {
    return res.status(400).json({ error: 'Ad ID is required' });
  }

  try {
    const settingsRes = await sql`SELECT setting_key, setting_value FROM api_settings WHERE setting_key = 'META_ACCESS_TOKEN'`;
    let token = null;
    settingsRes.forEach(s => {
      if (s.setting_key === 'META_ACCESS_TOKEN') token = s.setting_value;
    });

    if (!token) {
      return res.status(400).json({ error: 'Meta Access Token belum diatur di menu Pengaturan' });
    }

    const cleanAdId = adId.trim();
    // Fetch insights from Meta Graph API including spend
    const graphUrl = `https://graph.facebook.com/v18.0/${cleanAdId}/insights?fields=impressions,clicks,spend,actions,purchase_roas&access_token=${token}`;
    const fbRes = await fetch(graphUrl);
    
    if (!fbRes.ok) {
      const errorText = await fbRes.text();
      console.error('Meta API Error:', errorText);
      return res.status(fbRes.status).json({ error: 'Gagal menarik data dari Meta API', details: errorText });
    }

    const fbData = await fbRes.json();
    if (fbData.data && fbData.data.length > 0) {
      const insights = fbData.data[0];
      
      const impressions = parseInt(insights.impressions || 0, 10);
      const clicks = parseInt(insights.clicks || 0, 10);
      const spend = parseFloat(insights.spend || 0);
      
      let transactions = 0;
      if (insights.actions) {
        const purchaseAction = insights.actions.find(a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
        if (purchaseAction) transactions = parseInt(purchaseAction.value || 0, 10);
      }
      
      let roas = '0.00';
      if (insights.purchase_roas && insights.purchase_roas.length > 0) {
        roas = parseFloat(insights.purchase_roas[0].value || 0).toFixed(2);
      }

      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
      const conversionRate = clicks > 0 ? ((transactions / clicks) * 100).toFixed(2) : '0.00';
      const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';
      const cpa = transactions > 0 ? (spend / transactions).toFixed(2) : '0.00';

      return res.status(200).json({
        success: true,
        data: {
          impressions,
          clicks,
          spend,
          transactions,
          roas,
          ctr,
          conversionRate,
          cpc,
          cpa
        }
      });
    } else {
      return res.status(404).json({ error: 'Data tidak ditemukan untuk Ad ID tersebut' });
    }
  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat menghubungi Meta' });
  }
}
