const { sign } = require('./auth-utils.cjs');
const crypto = require('crypto');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const shop = String(req.query.shop || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) return res.status(400).json({ error: 'Geçerli bir Shopify mağaza adresi girin.' });
    const apiKey = process.env.SHOPIFY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SHOPIFY_API_KEY Vercel Environment Variables içinde eksik.' });
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_metafields';
    const host = String(req.headers.host || '').split(':')[0];
    const appUrl = process.env.APP_URL || `https://${host}`;
    const redirectUri = `${appUrl}/api/callback`;
    const state = crypto.randomBytes(24).toString('hex');
    const signature = sign(state);
    res.setHeader('Set-Cookie', `shopify_oauth_state=${state}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    const url = `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(apiKey)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    return res.redirect(302, url);
  } catch (error) { console.error(error); return res.status(500).json({ error: error.message || 'Shopify OAuth başlatılamadı.' }); }
};
