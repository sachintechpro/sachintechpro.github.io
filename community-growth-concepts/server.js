'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const PORT = Number(process.env.PORT || 10000);
const RATE_LIMIT = new Map();
const allowed = new Set(['/','/index.html','/coverage.html','/valleycircle.html','/lead.js']);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const json = (res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
const clean = (v,n=500)=>String(v||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length<=254;
const delivered = r => r.ok;
async function emailNotice(lead){
 const key=process.env.RESEND_API_KEY, from=process.env.LEAD_FROM_EMAIL, to=process.env.NISHA_NOTIFY_EMAIL;
 if(!key||!from||!to) throw Error('Email not configured');
 const subject=lead.type==='subscribe'?'New Nisha newsletter subscriber':'New Nisha website lead';
 const body=['Lead type: '+lead.type,'Name: '+lead.name,'Email: '+lead.email,'Phone: '+lead.phone,'Topic: '+lead.topic,'Preferred time: '+lead.preferredTime,'Message: '+lead.message,'Newsletter consent: '+lead.subscribe,'Source: '+lead.source,'Recorded: '+new Date().toISOString()].join('\n');
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,text:body,reply_to:lead.email})});
 if(!delivered(r))throw Error('Email provider rejected notification '+r.status);
}
async function smsNotice(lead){
 const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM_NUMBER,to=process.env.NISHA_NOTIFY_PHONE;
 if(!sid||!token||!from||!to)throw Error('SMS not configured');
 const message=lead.type==='subscribe'?'New newsletter subscriber':'New lead';
 const body=message+' for Nisha: '+lead.name+' | '+lead.email+' | '+lead.phone+' | '+lead.topic+' | '+lead.message.slice(0,160);
 const params=new URLSearchParams({From:from,To:to,Body:body});
 const r=await fetch('https://api.twilio.com/2010-04-01/Accounts/'+encodeURIComponent(sid)+'/Messages.json',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(sid+':'+token).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:params});
 if(!delivered(r))throw Error('SMS provider rejected notification '+r.status);
}
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&pathname==='/health')return json(res,200,{ok:true,emailConfigured:!!(process.env.RESEND_API_KEY&&process.env.LEAD_FROM_EMAIL&&process.env.NISHA_NOTIFY_EMAIL),smsConfigured:!!(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_FROM_NUMBER&&process.env.NISHA_NOTIFY_PHONE)});
 if(req.method==='POST'&&pathname==='/api/leads'){
   const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();
   const ipHash=crypto.createHash('sha256').update(ip).digest('hex');
   const now=Date.now(),prior=RATE_LIMIT.get(ipHash)||[];
   const recent=prior.filter(t=>now-t<3600000);
   if(recent.length>=10)return json(res,429,{ok:false,error:'Too many submissions. Please try again later.'});
   RATE_LIMIT.set(ipHash,[...recent,now]);
   if(req.headers['content-type']?.split(';')[0]!=='application/json')return json(res,415,{ok:false,error:'Expected JSON'});
   let raw='';for await(const part of req){raw+=part;if(raw.length>10000)return json(res,413,{ok:false,error:'Submission too large'});}
   let data;try{data=JSON.parse(raw)}catch{return json(res,400,{ok:false,error:'Invalid request'});}
   if(data.website)return json(res,200,{ok:true}); // Honeypot - no notification
   const lead={
     type:data.type==='subscribe'?'subscribe':'contact',
     name:clean(data.name,80),email:clean(data.email,254),phone:clean(data.phone,40),
     topic:clean(data.topic,100),preferredTime:clean(data.preferredTime,100),
     message:clean(data.message,1000),subscribe:data.subscribe===true?'Yes':'No',
     source:clean(data.source,100)
   };
   if(!isEmail(lead.email)||!data.contactConsent|| (lead.type==='contact'&&!lead.message))
     return json(res,400,{ok:false,error:'Please provide a valid email, message (for inquiries), and consent.'});
   if(lead.type==='subscribe'&&data.subscribe!==true)return json(res,400,{ok:false,error:'Newsletter consent is required.'});
   if(!process.env.RESEND_API_KEY||!process.env.LEAD_FROM_EMAIL||!process.env.NISHA_NOTIFY_EMAIL||!process.env.TWILIO_ACCOUNT_SID||!process.env.TWILIO_AUTH_TOKEN||!process.env.TWILIO_FROM_NUMBER||!process.env.NISHA_NOTIFY_PHONE)return json(res,503,{ok:false,error:'Contact delivery is not configured yet. Please contact Nisha directly.'});
   const outcomes=await Promise.allSettled([emailNotice(lead),smsNotice(lead)]);
   if(outcomes.some(o=>o.status==='rejected')){
      console.error('Lead notification delivery failure:',outcomes.map((o,i)=>({channel:i?'sms':'email',status:o.status,reason:o.status==='rejected'?String(o.reason):''})));
      return json(res,502,{ok:false,error:'We could not confirm both notifications. Please contact Nisha directly. Your request may have reached one channel.'});
   }
   return json(res,200,{ok:true,message:lead.type==='subscribe'?'Subscription request received.':'Your message was sent to Nisha.'});
 }
 if(req.method!=='GET'||!allowed.has(pathname))return json(res,404,{ok:false,error:'Not found'});
 const filename=pathname==='/'?'/index.html':pathname;
 fs.readFile(path.join(root,filename),(err,data)=>{if(err)return json(res,404,{ok:false,error:'Not found'});res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'text/plain','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=300','Content-Security-Policy':"frame-ancestors 'self'"});res.end(data)});
});
server.listen(PORT,'0.0.0.0',()=>console.log('Nisha lead site listening',PORT));
