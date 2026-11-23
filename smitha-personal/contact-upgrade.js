(()=>{
'use strict';
const cfg=window.SMITHA_SITE_CONFIG||{};
const contact=cfg.contact||{};
const modal=document.getElementById('connectModal');
const panel=modal?.querySelector('.modal');
const head=modal?.querySelector('.modal-head');
const body=modal?.querySelector('.modal-body');
const grid=body?.querySelector('.channel-grid');
if(!modal||!panel||!head||!body||!grid)return;
modal.classList.add('smitha-contact-v2');

const title=head.querySelector('h2');
if(title)title.textContent='How would you like to connect?';
const eyebrow=head.querySelector('.eyebrow');
if(eyebrow)eyebrow.textContent='A PRIVATE CONVERSATION';
const introduction=head.querySelector('p');
if(introduction)introduction.textContent='Choose the way that feels easiest. No form or account needed.';

const id=head.querySelector(':scope > div');
if(id&&!id.querySelector('.smitha-contact-avatar')){
 const portrait=document.createElement('img');
 portrait.className='smitha-contact-avatar';
 portrait.src=cfg.identity?.illustration||'assets/smitha-watercolor.webp';
 portrait.alt='Watercolor illustration';
 id.insertBefore(portrait,id.firstChild);
}
const defaultPhone='+18186264474';
const phone=/^\+[1-9]\d{7,14}$/.test(contact.phone?.e164||'')?contact.phone.e164:defaultPhone;
const smsEnabled=contact.phone?.smsDraftEnabled===true||contact.phone?.verifiedForSms===true;
const pageTitle=document.querySelector('main h1')?.textContent?.replace(/\s+/g,' ').trim()||'my goals';
const topic=document.body.dataset.topic||'';
const subject=topic?topic.replace(/-/g,' '):pageTitle.toLowerCase();
const showNotice=(message)=>window.smithaToast?.(message);
function contextNote(){
 const rows=[['Situation','starSituation'],['Task','starTask'],['Action','starAction'],['Result','starResult']]
 .map(([n,id])=>{const s=document.getElementById(id)?.value?.trim();return s?n+': '+s.slice(0,300):null}).filter(Boolean);
 return rows.join('\n');
}
function messageFor(preferred){
 const intro=preferred?'Hi Smitha, I would prefer to connect on '+preferred+'. Could you share your confirmed account link?':'Hello Smitha, I was exploring '+subject+' and would appreciate a friendly conversation.';
 const note=contextNote();
 return intro+(note?'\n\n'+note:'');
}
function smsLink(message){
 const delimiter=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?';
 return 'sms:'+phone+delimiter+'body='+encodeURIComponent(message);
}
function copyText(message){
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(message)
 .then(()=>showNotice('Message copied. You can paste it into your preferred app.'))
 .catch(()=>window.prompt('Copy your message:',message));
 else window.prompt('Copy your message:',message);
}
function textSmitha(preferred){
 const message=messageFor(preferred);
 if(!smsEnabled){copyText(message);showNotice('Texting has not been connected. Your introduction is ready to copy.');return}
 location.href=smsLink(message);
 showNotice('Your messaging app opens a draft. Nothing is sent automatically.');
}
function safeUrl(entry,domains){
 if(!entry?.verified||typeof entry.url!=='string')return '';
 try{
  const u=new URL(entry.url);
  if(u.protocol!=='https:'||!domains.some(domain=>u.hostname===domain||u.hostname==='www.'+domain))return '';
  if(u.hostname.endsWith('.example'))return '';
  return u.href;
 }catch{return ''}
}
function action(label,icon,note,onClick,href,kind){
 const el=document.createElement(href?'a':'button');
 if(!href)el.type='button'; else{el.href=href;if(href.startsWith('https:')){el.target='_blank';el.rel='noopener noreferrer'}}
 el.className='smitha-contact-choice '+(kind||'');
 const symbol=document.createElement('span');symbol.className='smitha-choice-icon';symbol.textContent=icon;symbol.setAttribute('aria-hidden','true');
 const copy=document.createElement('span');copy.className='smitha-choice-copy';
 const heading=document.createElement('strong');heading.textContent=label;
 const hint=document.createElement('small');hint.textContent=note;
 copy.append(heading,hint);el.append(symbol,copy);
 if(onClick)el.addEventListener('click',onClick);
 return el;
}
grid.replaceChildren();
grid.classList.add('smitha-choice-grid');
grid.append(
 action('Call Smitha','☎','Opens a private phone call',()=>{location.href='tel:'+phone},null,'primary'),
 action('Send a text','✉',contact.phone?.verifiedForSms===true?'Opens your Messages app':'Draft only · receipt not confirmed',()=>textSmitha(''),null,'primary')
);
const messaging=[
 ['WhatsApp','◉',contact.whatsapp,['wa.me','api.whatsapp.com'],'WhatsApp'],
 ['Instagram','◎',contact.instagram,['ig.me','instagram.com'],'Instagram'],
 ['Facebook Messenger','f',contact.facebook,['m.me','messenger.com','facebook.com'],'Facebook Messenger']
];
messaging.forEach(([name,icon,entry,domains,preferred])=>{
 const url=safeUrl(entry,domains);
 const directMessage=url&&((name==='WhatsApp')||(name==='Instagram'&&new URL(url).hostname==='ig.me')||(name==='Facebook Messenger'&&new URL(url).hostname==='m.me'));
 const note=url?(directMessage?'Open direct conversation':'Open verified profile'):(smsEnabled?'Ask for verified link by text':'Link not connected');
 const onClick=url?null:()=>{if(smsEnabled)textSmitha(preferred);else showNotice(name+' is not connected yet. Please choose Call Smitha.')};
 grid.append(action(name,icon,note,onClick,url,url?'connected':'pending'));
});
const extra=[];
for(const [key,name,icon,domains] of [
 ['linkedin','LinkedIn','in',['linkedin.com']],['x','X','𝕏',['x.com','twitter.com']],['tiktok','TikTok','♪',['tiktok.com']]
]){
 const url=safeUrl(contact[key],domains);
 if(url)extra.push(action(name,icon,'Open verified profile',null,url,'connected'));
}
if(extra.length){
 const more=document.createElement('div');more.className='smitha-contact-extra';
 extra.forEach(item=>more.append(item));grid.after(more);
}
const existing=[...body.children].filter(x=>x!==grid&&!x.classList.contains('smitha-contact-extra'));
const details=document.createElement('details');
details.className='smitha-contact-details';
const summary=document.createElement('summary');
summary.textContent='Add a short note before reaching out';
const optional=document.createElement('span');optional.textContent='Optional · about 30 seconds';summary.append(optional);
details.append(summary);
const inner=document.createElement('div');inner.className='smitha-contact-note-inner';
existing.forEach(el=>{
 if(el.classList.contains('divider')){el.remove();return}
 if(el.classList.contains('status-note')){el.remove();return}
 if(el.matches('.eyebrow')){el.textContent='YOUR GOAL';}
 if(el.matches('h3'))el.textContent='What would you like to discuss?';
 if(el.matches('p'))el.textContent='Share only what you are comfortable discussing. You can leave every field blank.';
 inner.append(el);
});
details.append(inner);body.append(details);
const sendNote=document.getElementById('sendSms2');
if(sendNote){
 sendNote.removeAttribute('onclick');
 sendNote.textContent=smsEnabled?'Text my note':'Copy my note';
 sendNote.addEventListener('click',()=>{if(smsEnabled)textSmitha('');else copyText(messageFor(''))});
}
const privacy=document.createElement('p');privacy.className='smitha-contact-privacy';
privacy.textContent='Calls and messages open in your own app; nothing is sent automatically.'+(contact.phone?.verifiedForSms===true?'':' Text delivery has not been confirmed.')+' Social links open directly only after ownership is confirmed. Please avoid private financial or medical details.';
body.append(privacy);
// A visible number should not be necessary for choosing how to connect.
// The actual phone endpoint remains in tel:/sms: links, so this is UI privacy, not telephone-number secrecy.
function removeVisibleNumber(){
 const numbers=new Set([phone,defaultPhone]);
 const expressions=[/\(?818\)?[\s.\-]*626[\s.\-]*4474/g];
 numbers.forEach(n=>{
  const digits=n.replace(/\D/g,'');if(digits.length!==11&&digits.length!==10)return;
  const local=digits.length===11?digits.slice(1):digits;
  expressions.push(new RegExp('\\(?'+local.slice(0,3)+'\\)?[\\s.\\-]*'+local.slice(3,6)+'[\\s.\\-]*'+local.slice(6),'g'));
 });
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const texts=[];while(walk.nextNode()){const n=walk.currentNode;if(n.parentElement?.closest('script,style,textarea,pre,code'))continue;texts.push(n)}
 texts.forEach(n=>{
  if(!expressions.some(rx=>{rx.lastIndex=0;return rx.test(n.nodeValue)}))return;
  let val=n.nodeValue;
  expressions.forEach(rx=>{rx.lastIndex=0;val=val.replace(rx,'Connect privately')});
  n.nodeValue=val;
 });
 document.querySelectorAll('a[href^="tel:"]').forEach(a=>{if(!a.textContent?.trim()||/Connect privately/.test(a.textContent))a.textContent='Call Smitha'});
}
removeVisibleNumber();
})();