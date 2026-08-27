const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function sign(value) {
  if (!process.env.SHOPIFY_API_SECRET) throw new Error('SHOPIFY_API_SECRET is not configured');
  return base64url(crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET).update(value).digest());
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(v => v.trim().split('=' )).filter(p => p.length === 2));
}

module.exports = async (req, res) => {
  try {
    const { shop, code, state } = req.query;
    if (!shop || !code || !state) return res.status(400).send('Shopify OAuth parametreleri eksik.');
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(String(shop))) return res.status(400).send('Geçersiz mağaza.');

    const cookies = parseCookies(req.headers.cookie || '');
    const saved = cookies.shopify_oauth_state || '';
    const [savedState, savedSig] = saved.split('.');
    if (!savedState || !savedSig || savedState !== state || !crypto.timingSafeEqual(Buffer.from(savedSig), Buffer.from(sign(savedState)))) {
      return res.status(400).send('OAuth state doğrulaması başarısız.');
    }

    const response = await fetch(`https://${shop}/admin/oauth/access_tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.SHOPIFY_API_KEY, client_secret: process.env.SHOPIFY_API_SECRET, code })
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) return res.status(502).send('Shopify yetkilendirme başarısız.');

    // Token is intentionally not returned to the browser. Persistent encrypted storage will be added with the catalog database.
    res.setHeader('Set-Cookie', 'shopify_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!doctype html><meta charset="utf-8"><title>Venta Catalog Studio</title><style>body{font:16px Arial;background:#111;color:#eee;display:grid;place-items:center;height:100vh}main{max-width:520px;padding:40px;text-align:center;border:1px solid #333;border-radius:14px}b{color:#c7aa78}</style><main><h2>Shopify bağlantısı tamamlandı</h2><p><b>${shop}</b> için yetkilendirme alındı.</p><p>Şimdi bu pencereyi kapatıp Catalog Studio'ya dönebilirsin.</p></main>`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Shopify OAuth callback hatası.');
  }
};
