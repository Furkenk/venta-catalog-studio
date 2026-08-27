const crypto = require('crypto');
const { parseCookies, sign, base64url } = require('./auth-utils.cjs');
const USERS = {
  admin:{username:'Admin',role:'admin',salt:'0ea1757daa41eb0f08360c18b1ba21eb',hash:'c149eb8a62ae5815e2286edfc70c1ff8cf46ca35d64b08b26cd03c2c671f2ad4'},
  ersoy:{username:'Ersoy',role:'user',salt:'145ea8d3327a970d26cc61b2846f3120',hash:'12682afc9e53c469553728459221b34c09a2b948e3d3f0ac2ad6a17ae132f3fe'},
  onur:{username:'Onur',role:'user',salt:'21658d3418a615d257be050e51d5458a',hash:'3f014c95cb442997cdd00e837f646fcdbfc6c5e3bb3f47f68d615f49d70f8771'},
  ahmet:{username:'Ahmet',role:'user',salt:'6e086c50513911bb8bff6918b9291141',hash:'010b5c046968ea9b2068958d6ff48c3bdb8a57c28fb32ee48cc0ade15f6fc8fe'},
  furkan:{username:'Furkan',role:'admin',salt:'233ed68189615fdc28ce3dd97c539737',hash:'dd7702f9f6f140945134fcd67fb99de2193cff9080c92fc33430024a9b448e9a'}
};
function safePassword(password,user){const hash=crypto.scryptSync(String(password),user.salt,32).toString('hex');const a=Buffer.from(hash),b=Buffer.from(user.hash);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function makeToken(user){const payload=base64url(JSON.stringify({u:user.username,r:user.role,iat:Date.now()}));return `${payload}.${sign(payload)}`}
function getUser(req){const token=parseCookies(req.headers.cookie||'').venta_user_session;if(!token)return null;const [payload,sig]=token.split('.');if(!payload||!sig||sig!==sign(payload))return null;try{const p=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(Date.now()-Number(p.iat)>12*60*60*1000)return null;const user=USERS[String(p.u||'').toLowerCase()];return user?{username:user.username,role:user.role}:null}catch{return null}}
module.exports=async(req,res)=>{if(req.method==='GET')return res.status(200).json({authenticated:!!getUser(req),user:getUser(req)});if(req.method==='DELETE'){res.setHeader('Set-Cookie','venta_user_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return res.status(200).json({ok:true})}if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});const {username='',password=''}=req.body||{};const user=USERS[String(username).toLowerCase()];if(!user||!safePassword(password,user))return res.status(401).json({error:'Kullanıcı adı veya şifre hatalı.'});res.setHeader('Set-Cookie',`venta_user_session=${makeToken(user)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);return res.status(200).json({authenticated:true,user:{username:user.username,role:user.role}})};
module.exports.getUser=getUser;
