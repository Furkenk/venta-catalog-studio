const crypto = require('crypto');
const { parseCookies, sign, base64url, decryptSession } = require('./auth-utils.cjs');

const USERS = {
  admin: { username: 'Admin', password: 'VntAdmin1', role: 'admin' },
  ersoy: { username: 'Ersoy', password: 'VntErsoy1', role: 'user' },
  onur: { username: 'Onur', password: 'VntOnur1', role: 'user' },
  ahmet: { username: 'Ahmet', password: 'VntAhmet1', role: 'user' },
  furkan: { username: 'Furkan', password: 'VntFurkan1', role: 'admin' }
};

function makeToken(user) {
  const payload = base64url(JSON.stringify({ u: user.username, r: user.role, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}
function getUser(req) {
  const c = parseCookies(req.headers.cookie || '');
  const token = c.venta_user_session;
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || sig !== sign(payload)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() - Number(p.iat) > 12 * 60 * 60 * 1000) return null;
    const key = String(p.u || '').toLowerCase();
    return USERS[key] ? { username: USERS[key].username, role: USERS[key].role } : null;
  } catch { return null; }
}
function safeEqual(a,b){const aa=Buffer.from(a||''),bb=Buffer.from(b||'');return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
module.exports = async (req,res) => {
  if (req.method === 'GET') return res.status(200).json({ authenticated: !!getUser(req), user: getUser(req) });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie','venta_user_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'); return res.status(200).json({ok:true}); }
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const { username='', password='' } = req.body || {};
  const user = USERS[String(username).toLowerCase()];
  if (!user || !safeEqual(String(password), user.password)) return res.status(401).json({error:'Kullanıcı adı veya şifre hatalı.'});
  res.setHeader('Set-Cookie',`venta_user_session=${makeToken(user)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);
  return res.status(200).json({authenticated:true,user:{username:user.username,role:user.role}});
};
module.exports.getUser = getUser;
