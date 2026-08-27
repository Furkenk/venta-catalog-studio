const crypto = require('crypto');
function base64url(input) { return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function getSecret() { const secret=process.env.SHOPIFY_SESSION_SECRET||process.env.SHOPIFY_API_SECRET; if(!secret)throw new Error('SHOPIFY_SESSION_SECRET or SHOPIFY_API_SECRET is not configured'); return crypto.createHash('sha256').update(secret).digest(); }
function sign(value) { return base64url(crypto.createHmac('sha256',getSecret()).update(value).digest()); }
function parseCookies(header='') { return Object.fromEntries(header.split(';').map(v=>v.trim().split('=')).filter(p=>p.length===2).map(([k,...rest])=>[k,rest.join('=')])); }
function encryptSession(session) { const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv('aes-256-gcm',getSecret(),iv); const encrypted=Buffer.concat([cipher.update(JSON.stringify(session),'utf8'),cipher.final()]); const tag=cipher.getAuthTag(); return [iv,tag,encrypted].map(base64url).join('.'); }
function decryptSession(value) { const [iv64,tag64,data64]=String(value||'').split('.'); if(!iv64||!tag64||!data64)return null; try { const d=crypto.createDecipheriv('aes-256-gcm',getSecret(),Buffer.from(iv64,'base64url')); d.setAuthTag(Buffer.from(tag64,'base64url')); return JSON.parse(Buffer.concat([d.update(Buffer.from(data64,'base64url')),d.final()]).toString('utf8')); } catch { return null; } }
function setSessionCookie(res, session) { const value=encryptSession(session); res.setHeader('Set-Cookie', [`venta_shopify_session=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`]); }
async function refreshShopifySession(session, res) {
  if(!session?.shop || !session?.refreshToken) return session;
  const response=await fetch(`https://${session.shop}/admin/oauth/access_token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},body:new URLSearchParams({client_id:process.env.SHOPIFY_API_KEY||'',client_secret:process.env.SHOPIFY_API_SECRET||'',grant_type:'refresh_token',refresh_token:session.refreshToken})});
  const text=await response.text(); let data; try{data=JSON.parse(text)}catch{data={error:'invalid_response'}}
  if(!response.ok || !data.access_token){const err=new Error(data.error_description||data.error||'Shopify access token yenilenemedi.');err.code='SHOPIFY_REAUTH_REQUIRED';throw err;}
  const next={...session,accessToken:data.access_token,refreshToken:data.refresh_token||session.refreshToken,expiresIn:data.expires_in||3600,refreshTokenExpiresIn:data.refresh_token_expires_in||session.refreshTokenExpiresIn,expiresAt:Date.now()+(Number(data.expires_in||3600)*1000),refreshedAt:Date.now()};
  setSessionCookie(res,next); return next;
}
async function getValidSession(req,res,{forceRefresh=false}={}) {
  const raw=parseCookies(req.headers.cookie||'').venta_shopify_session; const session=decryptSession(raw); if(!session?.shop||!session?.accessToken)return null;
  const expiresAt=Number(session.expiresAt||((session.connectedAt||0)+(Number(session.expiresIn||0)*1000))||0);
  if(forceRefresh || (session.refreshToken && expiresAt>0 && expiresAt<Date.now()+5*60*1000)) return refreshShopifySession(session,res);
  return session;
}
module.exports={base64url,sign,parseCookies,encryptSession,decryptSession,setSessionCookie,refreshShopifySession,getValidSession};
