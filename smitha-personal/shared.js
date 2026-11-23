(()=>{'use strict';
const fallbackPhone='+18186264474';
const contactCfg=()=>window.SMITHA_SITE_CONFIG?.contact||{};
const activePhone=()=>/^\+[1-9]\d{7,14}$/.test(contactCfg().phone?.e164||'')?contactCfg().phone.e164:fallbackPhone;
const smsVerified=()=>contactCfg().phone?.verifiedForSms===true;
const smsDraftAllowed=()=>smsVerified()||contactCfg().phone?.smsDraftEnabled===true;
const displayedPhone=()=>contactCfg().phone?.display||'(818) 626-4474';
const verifiedUrl=item=>{try{if(!item?.verified||!item.url)return '';const u=new URL(item.url);return u.protocol==='https:'&&!u.hostname.endsWith('.example')?u.href:''}catch{return ''}};
const page=document.body.dataset.page||'home';
const $=(id)=>document.getElementById(id);const icons={logo:`<svg viewBox="0 0 50 38" aria-hidden="true"><path d="M2 29 L14 17 L23 24 L33 9 L44 17" fill="none" stroke="#17345e" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 12 L47 2 L35 7" fill="none" stroke="#bf8c30" stroke-width="2.8"/><path d="M3 36 Q22 24 47 31" fill="none" stroke="#c18c2f" stroke-width="2.3"/></svg>`};
const nav=document.querySelector('#mainNav');$('mobileToggle')?.addEventListener('click',()=>{const open=nav.classList.toggle('open');$('mobileToggle').setAttribute('aria-expanded',open)});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.querySelectorAll('[data-open-contact]').forEach(el=>el.addEventListener('click',e=>{
 e.preventDefault();
 const info={topic:document.body.dataset.topic||'',intent:el.dataset.intent||''};
 if(el.hasAttribute('data-guide-questions')&&typeof window.smithaConversationBegin==='function')window.smithaConversationBegin(info);
 else openContact(info.intent);
}));
const contactModal=$('connectModal');const chatPanel=$('chatPanel');const connectLaunch=$('connectLaunch');const chatLaunch=$('chatLaunch');let previousFocus=null;let inertBefore=[];
function openContact(intent=''){if(!contactModal)return;previousFocus=document.activeElement;if(intent){const s=$('starSituation');if(s&&!s.value)s.value=intent;}contactModal.classList.add('open');contactModal.setAttribute('aria-hidden','false');inertBefore=[...document.querySelectorAll('main,header,footer')].filter(x=>!x.inert);inertBefore.forEach(x=>x.inert=true);document.body.style.overflow='hidden';$('closeConnect')?.focus();document.dispatchEvent(new CustomEvent('smitha-contact-open',{detail:{intent}}))}
function closeContact(){if(!contactModal)return;contactModal.classList.remove('open');contactModal.setAttribute('aria-hidden','true');inertBefore.forEach(x=>x.inert=false);inertBefore=[];document.body.style.overflow='';previousFocus?.focus?.()}
window.openSmithaContact=openContact;connectLaunch?.addEventListener('click',()=>openContact());$('closeConnect')?.addEventListener('click',closeContact);contactModal?.addEventListener('click',e=>{if(e.target===contactModal)closeContact()});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(contactModal?.classList.contains('open'))closeContact();if(chatPanel?.classList.contains('open'))closeChat();return}
 if(e.key!=='Tab'||!contactModal?.classList.contains('open'))return;
 const focusables=[...contactModal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled])')].filter(el=>!el.hidden&&el.getClientRects().length);
 if(!focusables.length)return;
 const first=focusables[0],last=focusables[focusables.length-1];
 if(e.shiftKey&&(document.activeElement===first||!contactModal.contains(document.activeElement))){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&(document.activeElement===last||!contactModal.contains(document.activeElement))){e.preventDefault();first.focus()}
});
function starText(){return typeof window.smithaConversationText==='function'?window.smithaConversationText():''}
function composeText(kind){const star=starText();let intro=kind==='time'?"Hello Smitha, I'd appreciate a convenient time for a friendly conversation about my goals.":"Hello Smitha, I have a question about my next financial or family-planning decision.";return intro+(star?'\n\n'+star:'')}
function smsHref(msg){const sep=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?';return `sms:${activePhone()}${sep}body=${encodeURIComponent(msg)}`}
function openSms(kind){if(!smsDraftAllowed()){toast('Texting is not connected; please choose Call instead.');return}location.href=smsHref(composeText(kind));toast('Your messaging app will open a draft. Delivery has not been verified.')}
$('sendSms')?.addEventListener('click',()=>openSms('connect'));
$('requestTime')?.addEventListener('click',()=>{const calendar=verifiedUrl(contactCfg().booking);if(calendar){window.open(calendar,'_blank','noopener,noreferrer');return}if(smsDraftAllowed())openSms('time');else location.href='tel:'+activePhone()});
$('callSmitha')?.addEventListener('click',()=>{location.href='tel:'+activePhone()});
$('copyIntro')?.addEventListener('click',async()=>{const msg=composeText('connect');try{await navigator.clipboard.writeText(msg);toast('Your introduction is copied.')}catch{const txt=document.createElement('textarea');txt.value=msg;document.body.append(txt);txt.select();document.execCommand('copy');txt.remove();toast('Your introduction is ready to paste.')}});
$('requestTimeButton')?.addEventListener('click',()=>{openContact('I’d like to find a time to talk about my goals.');setTimeout(()=>$('requestTime')?.focus(),30)});
function toast(t){const el=$('toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(el._timeout);el._timeout=setTimeout(()=>el.classList.remove('show'),3500)}
window.smithaToast=toast;
const chatMessages=$('chatMessages');const suggestions=$('chatSuggestions');const chatInput=$('chatInput');let chatHistory=[];
const topicTitle=document.querySelector('main h1')?.textContent.trim().replace(/\s+/g,' ')||'this topic';
const firstMessage=page==='topic'?`Hello! I’m Smitha’s illustrated guide. This page is about ${topicTitle.toLowerCase()}. Ask about the checklist, the questions, or the next topic to explore.`:page==='plan'?"Hello! I’m Smitha’s digital guide. Have a life change or financial priority in mind? I can help you start with five useful questions.":page==='grow'?"Hello! I’m Smitha’s digital guide. We can talk through your business idea, possible costs, or a first small test.":"Hello! I’m Smitha’s illustrated guide. Are you thinking about family, estate plans, protection, retirement, or another life stage?";
const chips=page==='topic'?['Where should I start?','What should I ask?','How do I connect?']:page==='plan'?['How do I begin?','What if my goals change?','How can I contact Smitha?']:page==='grow'?['How do I test an idea?','What should a partner do?','How can I connect?']:['What should I start with?','Why plan an estate?','Can I call Smitha?'];
function msg(role,text){const div=document.createElement('div');div.className='bubble '+(role==='user'?'user':'bot');div.textContent=text;chatMessages.append(div);chatMessages.scrollTop=chatMessages.scrollHeight;chatHistory.push({role,text});chatHistory=chatHistory.slice(-8)}
function openChat(){if(!chatPanel)return;chatPanel.classList.add('open');chatLaunch.setAttribute('aria-expanded','true');if(!chatMessages.children.length)msg('assistant',firstMessage);suggestions.replaceChildren();chips.forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',()=>ask(q));suggestions.append(b)});chatInput.focus()}
function closeChat(){chatPanel?.classList.remove('open');chatLaunch?.setAttribute('aria-expanded','false');chatLaunch?.focus()}
chatLaunch?.addEventListener('click',()=>chatPanel.classList.contains('open')?closeChat():openChat());$('closeChat')?.addEventListener('click',closeChat);
const chatFooter=chatPanel?.querySelector('.chat-note');
if(chatFooter&&!chatFooter.querySelector('.smitha-chat-contact')){
  const action=document.createElement('button');
  action.type='button';action.className='smitha-chat-contact';
  action.textContent='Contact Smitha ↗';
  action.addEventListener('click',()=>{closeChat();openContact('I have a question about '+topicTitle.toLowerCase()+'.')});
  chatFooter.append(action);
}
function localAnswer(question){const q=question.toLowerCase();if(/are you (really|actually) smitha|human|real smitha|who are you/.test(q))return 'I’m an illustrated educational guide, not Smitha personally. Choose Let’s Connect to call or prepare a message for her.';
if(/call|phone|number|text|sms|connect|appointment|schedule|meet|contact/.test(q))return 'Open “Let’s connect” to call Smitha privately or prepare a message in your preferred app. A message is not sent until you send it.';
if(/star|situation|action|result|discussion/.test(q))return 'You can answer a few optional questions about what matters, what you have already considered, and the next decision you want to clarify. Then choose how you would like to reach Smitha.';
if(/advic|invest|returns|guarantee|license|fee|commission|product|portfolio|security/.test(q))return 'I can explain general concepts and questions to ask, but not make personalized legal, insurance, tax or investment recommendations. Confirm a professional’s credentials, scope and fees before acting.';
if(/private|privacy|record|stored|data/.test(q))return 'Guide choices stay in your browser. If AI chat is enabled, questions may be sent to an AI provider. Please do not enter account numbers, medical records or other sensitive details.';
if(/email|whatsapp|instagram|facebook|linkedin|tiktok|twitter|social/.test(q))return 'Use “Let’s connect” for a private call or an optional text draft. WhatsApp, Facebook, and Instagram open directly only after the correct profiles are connected.';
if(page==='topic'){
  if(/medicare|part b/.test(q)&&document.body.dataset.topic==='medicare')return 'Medicare Part B generally covers doctor and outpatient care. Verify enrollment timing and employer coverage rules at Medicare.gov; this site cannot enroll you.';
  if(/trust|will|estate|beneficiar/.test(q))return 'For estate planning, consider decision-makers, beneficiaries, property ownership, and whether documents fit together. A California estate attorney can help with legal documents and trust funding.';
  if(/start|where|next|step|guide|checklist|question/.test(q))return `This guide explores ${topicTitle.toLowerCase()}. Review the four essentials, check the relevant items, and use the five questions to prepare a focused conversation.`;
  if(/cost|fee|guarantee|cover|benefit/.test(q))return 'Actual costs, eligibility and benefits depend on specific arrangements. Begin by reviewing limits, fees, exclusions and the official resources linked on this page.';
  return `On ${topicTitle.toLowerCase()}, I suggest starting with the practical checklist and the five questions on this page. You can also explore connected topics before contacting Smitha.`;
}
if(page==='plan'){if(/start|how|step|choose/.test(q))return 'Choose a life moment, the topic you want to understand, and when it matters. You’ll get five questions to bring to a conversation.';return 'Your Next Chapter helps organize questions about major decisions, responsibilities, existing benefits and timing. For details, explore the connected life-stage guides.'}
if(page==='grow'){if(/partner|real|sponsor|affiliate/.test(q))return 'Before collaborating, clarify what each person contributes, customer benefit, costs, disclosures, and how to judge results. This page makes no partnership offer.';return 'Begin with a clear customer problem, a small demand test, expected costs and a way to decide if the idea merits a next step.'}
return 'Use Find my path to connect your life stage with estate essentials, family decisions, later-life care and related topics. You can also explore all life topics.'}
async function ask(question){const text=String(question||'').trim().slice(0,500);if(!text)return;msg('user',text);chatInput.value='';msg('assistant','Quick guide: '+localAnswer(text));const bubble=chatMessages.lastElementChild;const endpoint=document.body.dataset.aiEndpoint||'';if(endpoint){try{const state={page,topic:document.body.dataset.topic||'',topicTitle,guideTitle:document.querySelector('#resultTitle')?.textContent||'',currentGuide:document.querySelector('#guideResult')?.classList.contains('active')?'complete':'in progress'};const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page,state,history:chatHistory.slice(-6),message:text}),signal:controller.signal});clearTimeout(timer);if(res.ok){const data=await res.json();if(data.answer){bubble.textContent=data.answer;return}}bubble.textContent='Quick guide (live AI unavailable): '+localAnswer(text)}catch{bubble.textContent='Quick guide (live AI unavailable): '+localAnswer(text)}}}
$('chatForm')?.addEventListener('submit',e=>{e.preventDefault();ask(chatInput.value)});
})();

/* Load owner-editable contact settings and contextual actions after the core site. */
(() => {
  const cfg=document.createElement('script');
  cfg.src='site-config.js';cfg.defer=true;
  cfg.addEventListener('load',()=>{
    window.dispatchEvent(new Event('smitha-config-ready'));
    const enhancements=document.createElement('script');enhancements.src='site-enhancements.js';enhancements.defer=true;
    enhancements.addEventListener('load',()=>{
      const contact=document.createElement('script');contact.src='contact-upgrade.js';contact.defer=true;
      contact.addEventListener('load',()=>{const booking=document.createElement('script');booking.src='booking-ui.js';booking.defer=true;
 booking.addEventListener('load',()=>{const guide=document.createElement('script');guide.src='conversation-questions.js';guide.defer=true;document.body.append(guide)});
 document.body.append(booking)});
      document.body.append(contact);
    });
    document.body.append(enhancements);
  });
  cfg.addEventListener('error',()=>console.warn('Optional contact configuration unavailable.'));
  document.body.append(cfg);
})();
