(()=>{
'use strict';
const $=id=>document.getElementById(id);
const list=$('leadList'),message=$('leadFeedback');
if(!list||!message)return;
let owner='',items=[],storageKey='';
const inputs={name:'leadPublicName',context:'leadPublicContext',linkedin:'leadLinkedIn',facebook:'leadFacebook',instagram:'leadInstagram',x:'leadX',frequency:'leadReviewFrequency'};
const platforms={
 linkedin:{domain:['linkedin.com'],query:'site:linkedin.com/in/'},
 facebook:{domain:['facebook.com','fb.com'],query:'site:facebook.com/'},
 instagram:{domain:['instagram.com'],query:'site:instagram.com/'},
 x:{domain:['x.com','twitter.com'],query:'site:x.com/'}
};
const today=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const obj=Object.fromEntries(p.map(x=>[x.type,x.value]));return obj.year+'-'+obj.month+'-'+obj.day};
function nextReview(days){const d=new Date(today()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
const el=(tag,cls,copy)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(copy!==undefined)x.textContent=copy;return x};
const text=id=>String($(id)?.value||'').trim();
function validURL(platform,input){
 if(!input)return '';
 const url=new URL(input);
 if(url.protocol!=='https:'||url.username||url.password||url.href.length>450)throw Error('Only a secure, public '+platform+' URL is allowed.');
 if(!platforms[platform].domain.some(domain=>url.hostname===domain||url.hostname==='www.'+domain))throw Error('That '+platform+' URL does not match its platform.');
 return url.href;
}
function save(){
 if(!owner)return;
 try{localStorage.setItem(storageKey,JSON.stringify(items))}
 catch{message.textContent='This device could not save the list. Check private browsing or storage settings.';return false}
 return true
}
function a(title,url,cls='admin-lead-action'){
 const item=el('a',cls,title);item.href=url;item.target='_blank';item.rel='noopener noreferrer';return item
}
function render(){
 list.replaceChildren();
 if(!items.length){list.append(el('p','admin-leads-empty','No public profiles saved on this device yet. Add a person above to begin.'));return}
 items.slice().sort((a,b)=>a.next.localeCompare(b.next)).forEach(item=>{
  const box=el('article','admin-lead-card'),title=el('div','admin-lead-title'),detail=el('div','admin-lead-info');
  title.append(el('strong','',item.name));
  if(item.context)title.append(el('small','',item.context));
  const due=item.next<=today();
  detail.append(el('span',due?'Time to check for a relevant update':'Review again: '+item.next));
  box.append(title,detail);
  const links=el('div','admin-lead-links');
  for(const [platform,config] of Object.entries(platforms)){
   if(item.links?.[platform])links.append(a('View '+(platform==='x'?'X':platform[0].toUpperCase()+platform.slice(1))+' ↗',item.links[platform]));
   else{
    const query=config.query+' '+item.name+' '+(item.context||'');
    links.append(a('Find public '+(platform==='x'?'X':platform[0].toUpperCase()+platform.slice(1))+' ↗','https://www.google.com/search?q='+encodeURIComponent(query),'admin-lead-search'))
   }
  }
  box.append(links);
  const actions=el('div','admin-lead-actions');
  const mark=el('button','admin-text-button','Reviewed — remind me in '+item.frequency+' days');
  mark.type='button';mark.addEventListener('click',()=>{item.next=nextReview(item.frequency);if(save())render()});
  const remove=el('button','admin-text-button','Remove');remove.type='button';
  remove.addEventListener('click',()=>{items=items.filter(x=>x.id!==item.id);if(save())render()});
  actions.append(mark,remove);box.append(actions);list.append(box)
 })
}
function submit(){
 message.textContent='';
 if(!owner){message.textContent='Please sign in as an authorized owner.';return}
 const name=text(inputs.name),context=text(inputs.context);
 if(name.length<2||name.length>90){message.textContent='Enter a public name with at least two characters.';return}
 if(context.length>100){message.textContent='Please shorten the matching context.';return}
 if(items.length>=25){message.textContent='This list is limited to 25 connections. Remove one first.';return}
 const links={};
 try{for(const key of Object.keys(platforms))links[key]=validURL(key,text(inputs[key]))}
 catch(error){message.textContent=error.message;return}
 const frequency=Number(text(inputs.frequency));
 const days=[7,14,30].includes(frequency)?frequency:7;
 const entry={id:crypto?.randomUUID?.()||String(Date.now())+'-'+String(Math.random()).slice(2),name,context,links,frequency:days,next:nextReview(days)};
 items.push(entry);
 if(!save())return;
 for(const id of Object.values(inputs).filter(x=>x!=='leadReviewFrequency'))$(id).value='';
 message.textContent='Saved on this device. Open a verified public profile and engage only when it feels genuine.';
 render()
}
$('leadSave')?.addEventListener('click',submit);
document.addEventListener('smitha-owner-authorized',event=>{
 owner=String(event.detail?.email||'').toLowerCase();
 if(!owner)return;
 storageKey='smitha_public_connections_v1_'+owner;
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  items=Array.isArray(saved)?saved.filter(x=>x&&typeof x.name==='string'&&x.name.length<=90&&typeof x.next==='string'&&x.links&&typeof x.links==='object').slice(0,25):[];
 }catch{items=[]}
 render();
});
})();