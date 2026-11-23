"use strict";
const crypto=require("node:crypto");
const REPO="sachintechpro/sachintechpro.github.io";
const BRANCH="demo/smitha-rangaswamy-personal-2026";
const CONFIG_PATH="smitha-personal/owner-config.js";
let certs=null,certsTime=0;
const normalized=s=>String(s||"").trim().toLowerCase();

function forwardingKey(){
 const encoded=process.env.SMITHA_FORWARDING_KEY||"";
 let key;
 try{key=Buffer.from(encoded,"base64")}catch{}
 return key?.length===32?key:null
}
function encryptEmail(email){
 if(!email)return "";
 const key=forwardingKey();
 if(!key)throw Error("forwarding_encryption_not_connected");
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",key,iv);
 const encrypted=Buffer.concat([cipher.update(email,"utf8"),cipher.final()]);
 return "v1."+iv.toString("base64url")+"."+encrypted.toString("base64url")+"."+cipher.getAuthTag().toString("base64url")
}
function decryptEmail(value){
 if(!value)return "";
 const key=forwardingKey();if(!key)throw Error("forwarding_encryption_not_connected");
 const parts=String(value).split(".");
 if(parts.length!==4||parts[0]!=="v1")throw Error("forwarding_encryption_invalid");
 const decipher=crypto.createDecipheriv("aes-256-gcm",key,Buffer.from(parts[1],"base64url"));
 decipher.setAuthTag(Buffer.from(parts[3],"base64url"));
 const result=Buffer.concat([decipher.update(Buffer.from(parts[2],"base64url")),decipher.final()]).toString("utf8");
 if(!validEmail(result))throw Error("forwarding_email_invalid");
 return result
}

const validEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<=254;
const ownerSet=()=>new Set(String(process.env.SMITHA_ADMIN_EMAILS||"").split(",").map(normalized).filter(validEmail));
async function readPayload(req,limit=14000){
 let raw="";for await(const chunk of req){raw+=chunk.toString();if(raw.length>limit)throw Error("too_large")}
 return JSON.parse(raw||"{}")
}
async function keys(){
 if(certs&&Date.now()-certsTime<20*60000)return certs;
 const response=await fetch("https://www.googleapis.com/oauth2/v3/certs",{signal:AbortSignal.timeout(6000)});
 if(!response.ok)throw Error("identity_unavailable");
 const obj=await response.json();if(!Array.isArray(obj.keys))throw Error("identity_unavailable");
 certs=obj.keys;certsTime=Date.now();return certs
}
async function authenticated(req){
 const clientId=process.env.GOOGLE_OAUTH_CLIENT_ID||"";
 if(!clientId)return null;
 const match=/^Bearer ([A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)$/.exec(req.headers.authorization||"");
 if(!match)return null;
 try{
  const parts=match[1].split(".");
  const header=JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8"));
  const payload=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8"));
  if(header.alg!=="RS256"||!header.kid)return null;
  const now=Math.floor(Date.now()/1000);
  if(payload.aud!==clientId||!["accounts.google.com","https://accounts.google.com"].includes(payload.iss))return null;
  if(!Number.isFinite(payload.exp)||payload.exp<=now||payload.exp>now+3700)return null;
  if(payload.iat&&payload.iat>now+120)return null;
  if(payload.email_verified!==true&&!["true",1].includes(payload.email_verified))return null;
  const email=normalized(payload.email);
  if(!ownerSet().has(email))return null;
  const key=(await keys()).find(k=>k.kid===header.kid&&k.kty==="RSA"&&k.use==="sig");
  if(!key)return null;
  const trusted=crypto.createPublicKey({key,format:"jwk"});
  if(!crypto.verify("RSA-SHA256",Buffer.from(parts[0]+"."+parts[1]),trusted,Buffer.from(parts[2],"base64url")))return null;
  return {email,name:String(payload.name||"Owner").slice(0,100)};
 }catch{return null}
}
const githubHeaders=()=>({"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(process.env.SMITHA_CONFIG_REPO_TOKEN?{"Authorization":"Bearer "+process.env.SMITHA_CONFIG_REPO_TOKEN}:{})});
const url="https://api.github.com/repos/"+REPO+"/contents/"+CONFIG_PATH;
async function loadConfig(){
 const response=await fetch(url+"?ref="+encodeURIComponent(BRANCH),{headers:githubHeaders(),signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error("config_read_failed");
 const body=await response.json();
 const source=Buffer.from((body.content||"").replace(/\s/g,""),"base64").toString("utf8");
 const obj=JSON.parse(source.replace(/^\s*window\.SMITHA_OWNER_CONFIG\s*=\s*/,"").replace(/;\s*$/,""));
 return{sha:body.sha,settings:obj}
}
const domainAllow={
 whatsapp:["wa.me","api.whatsapp.com"],facebook:["m.me","messenger.com","facebook.com"],instagram:["ig.me","instagram.com"],linkedin:["linkedin.com"],x:["x.com","twitter.com"],tiktok:["tiktok.com"],booking:["calendly.com","cal.com","calendar.google.com","acuityscheduling.com","youcanbook.me","zcal.co"]
};
function safeLink(key,value){
 const raw=String(value||"").trim();
 if(!raw)return "";
 if(raw.length>400)throw Error("invalid_"+key);
 const u=new URL(raw);
 if(u.protocol!=="https:"||u.username||u.password)throw Error("invalid_"+key);
 if(!domainAllow[key].some(d=>u.hostname===d||u.hostname==="www."+d))throw Error("invalid_"+key);
 if(key==="x"&&(!u.pathname.startsWith("/messages/compose")||!u.searchParams.get("recipient_id")))throw Error("invalid_x_dm_link");
 return u.href
}
function cleanSettings(body){
 const old=body?.contact||{},n=body?.newsletter||{},f=body?.forwarding||{};
 const contact={};
 const rawPhone=String(old.phone?.e164||"").trim();
 if(!/^\+[1-9]\d{7,14}$/.test(rawPhone))throw Error("invalid_phone");
 const digits=rawPhone.replace(/\D/g,""),us=digits.length===11&&digits.startsWith("1");
 const display=us?"("+digits.slice(1,4)+") "+digits.slice(4,7)+"-"+digits.slice(7):rawPhone;
 contact.phone={e164:rawPhone,display,verifiedForVoice:old.phone?.verifiedForVoice===true,verifiedForSms:old.phone?.verifiedForSms===true,smsDraftEnabled:old.phone?.smsDraftEnabled===true};
 contact.presentation={showPhoneNumber:false};
 for(const key of ["whatsapp","facebook","instagram","linkedin","x","tiktok","booking"]){
  const item=old[key]||{},u=safeLink(key,item.url);
  contact[key]={url:u,verified:Boolean(u&&item.verified===true)}
 }
 const mail=String(old.email?.address||"").trim().toLowerCase();
 if(mail&&!validEmail(mail))throw Error("invalid_contact_email");
 contact.email={address:mail,verified:Boolean(mail&&old.email?.verified===true)};
 const forwardTo=String(f.email||"").trim().toLowerCase();
 if(forwardTo&&!validEmail(forwardTo))throw Error("invalid_forward_email");
 if(f.enabled===true&&!forwardTo)throw Error("forward_email_required");
 return {newsletter:{
  enabled:n.enabled===true,
  title:String(n.title||"A little clarity in your inbox.").trim().slice(0,110),
  description:String(n.description||"Occasional helpful notes from Smitha.").trim().slice(0,320),
  frequency:["Occasional","Monthly","Twice a month"].includes(n.frequency)?n.frequency:"Occasional"
 },contact,forwarding:{enabled:f.enabled===true,email:forwardTo}};
}
async function persist(settings,sha){
 const token=process.env.SMITHA_CONFIG_REPO_TOKEN;
 if(!token)throw Error("config_storage_not_connected");
 const safe={...settings,forwarding:{enabled:settings.forwarding.enabled,encryptedEmail:encryptEmail(settings.forwarding.email)}};
 const source="window.SMITHA_OWNER_CONFIG = "+JSON.stringify(safe,null,2)+";\n";
 const response=await fetch(url,{method:"PUT",headers:{...githubHeaders(),"Content-Type":"application/json"},body:JSON.stringify({message:"Update Smitha's site settings from secure owner area",branch:BRANCH,sha,content:Buffer.from(source).toString("base64")}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error(response.status===409?"config_conflict":"config_save_failed");
 return true
}
async function subscribers(){
 if(!process.env.BUTTONDOWN_API_KEY)throw Error("newsletter_not_connected");
 const response=await fetch("https://api.buttondown.com/v1/subscribers?page_size=30",{
  headers:{Authorization:"Token "+process.env.BUTTONDOWN_API_KEY},signal:AbortSignal.timeout(11000)
 });
 if(!response.ok)throw Error("subscriber_list_unavailable");
 const body=await response.json();
 return {count:Number(body.count)||0,results:(body.results||[]).slice(0,30).map(x=>({email:String(x.email_address||""),status:String(x.type||""),date:String(x.creation_date||"")}))};
}
async function handleAdmin(req,res,path,json,allowed,origin){
 if(!path.startsWith("/api/admin/"))return false;
 if(!allowed.has(origin)){json(res,403,{error:"origin_not_allowed"});return true}
 if(path==="/api/admin/public-setup"&&req.method==="GET"){
  json(res,200,{loginConfigured:Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID),clientId:process.env.GOOGLE_OAUTH_CLIENT_ID||"",newsletterConfigured:Boolean(process.env.BUTTONDOWN_API_KEY)});return true
 }
 const owner=await authenticated(req);
 if(!owner){json(res,401,{error:"admin_sign_in_required"});return true}
 if(path==="/api/admin/me"&&req.method==="GET"){json(res,200,{authorized:true,name:owner.name,email:owner.email});return true}
 if(path==="/api/admin/config"&&req.method==="GET"){
  try{const state=await loadConfig();const c=state.settings.forwarding||{};const settings={...state.settings,forwarding:{enabled:c.enabled===true,email:decryptEmail(c.encryptedEmail)}};json(res,200,{settings,editingConnected:Boolean(process.env.SMITHA_CONFIG_REPO_TOKEN),newsletterConnected:Boolean(process.env.BUTTONDOWN_API_KEY),forwardingConnected:Boolean(forwardingKey()&&process.env.RESEND_API_KEY&&process.env.SMITHA_FROM_EMAIL)})}
  catch{json(res,503,{error:"settings_unavailable"})}
  return true
 }
 if(path==="/api/admin/config"&&req.method==="PUT"){
  try{
   if(!process.env.SMITHA_CONFIG_REPO_TOKEN)return json(res,503,{error:"settings_storage_not_connected"}),true;
   const body=await readPayload(req);const safe=cleanSettings(body);
   const previous=await loadConfig();await persist(safe,previous.sha);
   json(res,200,{saved:true,notice:"Changes will appear after the site publishes the new configuration."});
  }catch(err){const code=/^(invalid_|too_large)/.test(err.message)?400:err.message==="config_conflict"?409:503;json(res,code,{error:err.message})}
  return true
 }
 if(path==="/api/admin/subscribers"&&req.method==="GET"){
  try{json(res,200,await subscribers())}catch(err){json(res,503,{error:err.message})}
  return true
 }
 json(res,404,{error:"not_found"});return true
}
module.exports={handleAdmin,authenticated,cleanSettings,validEmail};
