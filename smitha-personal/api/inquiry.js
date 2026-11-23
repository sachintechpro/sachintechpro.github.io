"use strict";
const crypto=require("node:crypto");
const ORIGINS=new Set(["https://hello-smitha-personal.onrender.com","http://localhost:3000","http://127.0.0.1:3000"]);
const TOPICS=new Set(["estate","trusts","family","caregiving","medicare","retirement","business","general"]);
const validEmail=s=>typeof s==="string"&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean=s=>String(s||"").replace(/[\u0000-\u001F\u007F]/g," ").trim();
const attempts=new Map();let cached=null,expires=0;
async function getSettings(){
 if(cached&&Date.now()<expires)return cached;
 try{
  const r=await fetch("https://api.github.com/repos/sachintechpro/sachintechpro.github.io/contents/smitha-personal/owner-config.js?ref=demo%2Fsmitha-rangaswamy-personal-2026",{
   headers:{"Accept":"application/vnd.github+json","User-Agent":"Smitha-Personal-Inquiry"},signal:AbortSignal.timeout(7000)
  });
  if(!r.ok)throw Error("settings_unavailable");
  const o=await r.json(),src=Buffer.from(String(o.content||"").replace(/\s/g,""),"base64").toString("utf8");
  const content=JSON.parse(src.replace(/^\s*window\.SMITHA_OWNER_CONFIG\s*=\s*/,"").replace(/;\s*$/,""));
  const f=content.forwarding||{};
  let decrypted="";
  if(f.encryptedEmail){
   try{
    const key=Buffer.from(process.env.SMITHA_FORWARDING_KEY||"","base64");
    if(key.length!==32)throw Error("missing_key");
    const parts=String(f.encryptedEmail).split(".");
    if(parts.length!==4||parts[0]!=="v1")throw Error("bad_cipher");
    const d=crypto.createDecipheriv("aes-256-gcm",key,Buffer.from(parts[1],"base64url"));
    d.setAuthTag(Buffer.from(parts[3],"base64url"));
    decrypted=Buffer.concat([d.update(Buffer.from(parts[2],"base64url")),d.final()]).toString("utf8");
   }catch{decrypted=""}
  }
  cached={enabled:f.enabled===true,email:validEmail(decrypted)?decrypted:""};
  expires=Date.now()+60000;return cached
 }catch{if(cached)return cached;return{enabled:false,email:""}}
}
const providerReady=()=>Boolean(process.env.RESEND_API_KEY&&process.env.SMITHA_FROM_EMAIL);
async function available(){const c=await getSettings();return Boolean(providerReady()&&c.enabled&&c.email)}
function json(res,status,data){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(data))}
async function read(req){let raw="";for await(const part of req){raw+=part.toString();if(raw.length>8000)throw Error("too_large")}return JSON.parse(raw||"{}")}
async function handleInquiry(req,res,path,origin){
 if(!["/api/inquiry/status","/api/inquiry/send"].includes(path))return false;
 if(!ORIGINS.has(origin)){json(res,403,{error:"origin_not_allowed"});return true}
 if(path==="/api/inquiry/status"&&req.method==="GET"){json(res,200,{enabled:await available()});return true}
 if(path!=="/api/inquiry/send"||req.method!=="POST"){json(res,405,{error:"method_not_allowed"});return true}
 const ip=String(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"unknown").split(",")[0].slice(0,100);
 const now=Date.now(),recent=(attempts.get(ip)||[]).filter(t=>t>now-3600000);
 if(recent.length>=5){json(res,429,{error:"too_many_requests"});return true}
 recent.push(now);attempts.set(ip,recent);if(attempts.size>1500)attempts.clear();
 try{
  if(!await available()){json(res,503,{error:"contact_form_unavailable"});return true}
  const input=await read(req);
  if(input.website){json(res,202,{status:"request_received"});return true}
  const email=clean(input.replyEmail).toLowerCase(),name=clean(input.firstName).slice(0,90);
  const topic=clean(input.topic).toLowerCase(),message=String(input.message||"").trim();
  if(!validEmail(email)||message.length<10||message.length>2400||input.consent!==true){json(res,400,{error:"invalid_or_missing_fields"});return true}
  const category=TOPICS.has(topic)?topic:"general";
  const target=await getSettings();
  if(!target.enabled||!target.email){json(res,503,{error:"contact_form_unavailable"});return true}
  const sender=String(process.env.SMITHA_FROM_EMAIL||"").trim();
  const senderEmail=sender.replace(/^.*</,"").replace(/>.*$/,"");
  if(!validEmail(senderEmail)){json(res,503,{error:"mail_delivery_not_configured"});return true}
  const mailBody=["New website inquiry for Smitha","","Topic: "+category,"First name: "+(name||"Not supplied"),"Reply email: "+email,"","Message:",message,"","The visitor consented to Smitha using these submitted details for a reply.","This is a website inquiry, not an external social message or phone call."].join("\n");
  const response=await fetch("https://api.resend.com/emails",{
   method:"POST",headers:{"Authorization":"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},
   body:JSON.stringify({from:sender,to:[target.email],reply_to:email,subject:"Website inquiry for Smitha: "+category,text:mailBody}),signal:AbortSignal.timeout(11000)
  });
  if(!response.ok){console.error("Email provider rejected inquiry",response.status);json(res,502,{error:"email_provider_unavailable"});return true}
  json(res,202,{status:"sent_to_provider"});
 }catch(e){console.error("Website inquiry failed",e.name);json(res,502,{error:"email_provider_unavailable"})}
 return true
}
module.exports={handleInquiry,available,validEmail};
