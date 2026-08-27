const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function getSecret() {
  if (!process.env.SHOPIFY_API_SECRET) throw new Error('SHOPIFY_API_SECRET is not configured');
  return process.env.SHOPIFY_API_SECRET;
}

function sign(value) {
  return base64url(crypto.createHmac('sha256', getSecret()).update(value).digest());
}

module.exports = async (req, res) => {
  try {
    const shop = String(req.query.shop || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
      return res.status(400).send('Geçerli bir Shopify mağaza adresi gerekli. Örnek: venta.myshopify.com');
    }

    const state = base64url(crypto.randomBytes(24));
    const stateSig = sign(state);
    const cookie = `shopify_oauth_state=${state}.${stateSig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
    res.setHeader('Set-Cookie', cookie);

    const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
    const clientId = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products';
    if (!redirectUri || !clientId) throw new Error('Shopify environment variables are incomplete');

    const params = new URLSearchParams({
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state
    });

    return res.redirect(302, `https://${shop}/admin/oauth/authorize?${params.toString()}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Shopify bağlantısı yapılandırılmamış.');
  }
};
