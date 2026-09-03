const crypto = require('crypto');
const { parseCookies, sign, base64url } = require('./auth-utils.cjs');

const SESSION_MAX_AGE = 12 * 60 * 60;

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
  }

  return { url, serviceRoleKey };
}

function normalizeUsername(username) {
  const normalized = String(username || '').trim().toLocaleLowerCase('tr-TR');
  return /^[a-z0-9çğıöşü]{3,32}$/u.test(normalized) ? normalized : null;
}

function makeToken(user) {
  const payload = base64url(JSON.stringify({
    u: user.username,
    n: user.fullName,
    r: user.role,
    iat: Date.now(),
  }));
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
    if (!['manager', 'admin'].includes(session.r) || !normalizeUsername(session.u)) return null;

    return {
      username: session.u,
      fullName: session.n || session.u,
      role: session.r,
    };
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

function safeEqualHex(left, right) {
  if (!/^[a-f0-9]{64}$/i.test(left || '') || !/^[a-f0-9]{64}$/i.test(right || '')) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

async function authenticateMember(username, password) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername || !password) return null;

  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/catalog_members?username=eq.${encodeURIComponent(normalizedUsername)}&active=eq.true&select=username,full_name,role,password_hash&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Member lookup failed with ${response.status}.`);
  }

  const members = await response.json();
  const member = Array.isArray(members) ? members[0] : null;
  if (!member || !['manager', 'admin'].includes(member.role)) return null;

  const passwordHash = crypto
    .createHash('sha256')
    .update(String(password), 'utf8')
    .digest('hex');

  if (!safeEqualHex(passwordHash, member.password_hash)) return null;

  return {
    username: member.username,
    fullName: member.full_name,
    role: member.role,
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
    const user = await authenticateMember(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    setUserSession(res, user);
    return res.status(200).json({ authenticated: true, user });
  } catch (error) {
    console.error('Member authentication failed:', error);
    return res.status(500).json({ error: 'Giriş servisi yapılandırılamadı.' });
  }
};

module.exports.getUser = getUser;
