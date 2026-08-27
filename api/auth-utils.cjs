const crypto = require('crypto');
function base64url(input) { return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function getSecret() { const secret=process.env.SHOPIFY_SESSION_SECRET||process.env.SHOPIFY_API_SECRET; if(!secret)throw new Error('SHOPIFY_SESSION_SECRET or SHOPIFY_API_SECRET is not configured'); return crypto.createHash('sha256').update(secret).digest(); }
function sign(value) { return base64url(crypto.createHmac('sha256',getSecret()).update(value).digest()); }
function parseCookies(header='') { return Object.fromEntries(header.split(';').map(v=>v.trim().split('=')).filter(p=>p.length===2).map(([k,...rest])=>[k,rest.join('=')])); }
function encryptSession(session) { const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv('aes-256-gcm',getSecret(),iv); const encrypted=Buffer.concat([cipher.update(JSON.stringify(session),'utf8'),cipher.final()]); const tag=cipher.getAuthTag(); return [iv,tag,encrypted].map(base64url).join('.'); }
function decryptSession(value) { const [iv64,tag64,data64]=String(value||'').split('.'); if(!iv64||!tag64||!data64)return null; try { const d=crypto.createDecipheriv('aes-256-gcm',getSecret(),Buffer.from(iv64,'base64url')); d.setAuthTag(Buffer.from(tag64,'base64url')); return JSON.parse(Buffer.concat([d.update(Buffer.from(data64,'base64url')),d.final()]).toString('utf8')); } catch { return null; } }
module.exports={base64url,sign,parseCookies,encryptSession,decryptSession};
