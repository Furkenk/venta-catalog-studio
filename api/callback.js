const crypto = require('crypto');
const { sign, parseCookies, encryptSession } = require('./auth-utils.cjs');

const PRODUCTION_APP_URL = 'https://catalog.ventajewelry.com';

function timingSafeEqualString(a, b) {
  const aa = Buffer.from(a || '');
  const bb = Buffer.from(b || '');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

module.exports = async (req, res) => {
  try {
    const { shop, code, state } = req.query;
    if (!shop || !code || !state) return res.status(400).send('Shopify OAuth parametreleri eksik.');

    const shopName = String(shop).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shopName)) return res.status(400).send('Geçersiz mağaza.');

    const cookies = parseCookies(req.headers.cookie || '');
    const saved = cookies.shopify_oauth_state || '';
    const [savedState, savedSig] = saved.split('.');
    if (!savedState || !savedSig || !timingSafeEqualString(savedState, String(state)) || !timingSafeEqualString(savedSig, sign(savedState))) {
      return res.status(400).send('OAuth state doğrulaması başarısız.');
    }

    const response = await fetch(`https://${shopName}/admin/oauth/access_tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) return res.status(502).send('Shopify yetkilendirme başarısız.');

    const session = encryptSession({
      shop: shopName,
      accessToken: data.access_token,
      scope: data.scope || process.env.SHOPIFY_SCOPES || 'read_products,write_metafields',
      connectedAt: Date.now()
    });

    res.setHeader('Set-Cookie', [
      'shopify_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      `venta_shopify_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
    ]);

    return res.redirect(302, `${PRODUCTION_APP_URL}/?shop=${encodeURIComponent(shopName)}&connected=1`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Shopify OAuth callback hatası.');
  }
};
