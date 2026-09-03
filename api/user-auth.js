const crypto = require('crypto');
const { parseCookies, sign, base64url } = require('./auth-utils.cjs');

const CATALOG_LOGIN_DOMAIN = 'catalog.ventajewelry.local';
const SESSION_MAX_AGE = 12 * 60 * 60;

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured.');
  }

  return { url, key };
}

function normalizeUsername(username) {
  const normalized = String(username || '').trim().toLowerCase();

  if (!/^[a-z0-9_]{3,32}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function makeToken(user) {
  const payload = base64url(JSON.stringify({ u: user.username, r: user.role, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

function getUser(req) {
  const token = parseCookies(req.headers.cookie || '').venta_user_session;
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== sign(payload)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() - Number(session.iat) > SESSION_MAX_AGE * 1000) return null;

    if (!['admin', 'user'].includes(session.r) || !normalizeUsername(session.u)) return null;

    return { username: session.u, role: session.r };
  } catch {
    return null;
  }
}

function setUserSession(res, user) {
  res.setHeader(
    'Set-Cookie',
    `venta_user_session=${makeToken(user)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`
  );
}

async function readJson(response) {
  const body = await response.text();

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    return {};
  }
}

async function authenticateWithSupabase(username, password) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername || !password) return null;

  const { url, key } = getSupabaseConfig();
  const email = `${normalizedUsername}@${CATALOG_LOGIN_DOMAIN}`;

  const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: String(password) }),
  });

  const authData = await readJson(authResponse);
  if (!authResponse.ok || !authData.user?.id || !authData.access_token) return null;

  const memberResponse = await fetch(
    `${url}/rest/v1/catalog_members?user_id=eq.${encodeURIComponent(authData.user.id)}&select=role,full_name`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${authData.access_token}`,
      },
    }
  );

  const members = await readJson(memberResponse);
  const member = Array.isArray(members) ? members[0] : null;
  if (!member || !['manager', 'admin'].includes(member.role)) return null;

  return {
    username: member.full_name || normalizedUsername,
    role: member.role === 'manager' ? 'admin' : 'user',
  };
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const user = getUser(req);
    return res.status(200).json({ authenticated: !!user, user });
  }

  if (req.method === 'DELETE') {
    res.setHeader(
      'Set-Cookie',
      'venta_user_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username = '', password = '' } = req.body || {};
    const user = await authenticateWithSupabase(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    setUserSession(res, user);
    return res.status(200).json({ authenticated: true, user });
  } catch (error) {
    console.error('Supabase user authentication failed:', error);
    return res.status(500).json({ error: 'Giriş servisi yapılandırılamadı.' });
  }
};

module.exports.getUser = getUser;
