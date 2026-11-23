(()=>{'use strict';
const phone='+18186264474';const page=document.body.dataset.page||'home';
const $=(id)=>document.getElementById(id);const icons={logo:`<svg viewBox="0 0 50 38" aria-hidden="true"><path d="M2 29 L14 17 L23 24 L33 9 L44 17" fill="none" stroke="#17345e" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 12 L47 2 L35 7" fill="none" stroke="#bf8c30" stroke-width="2.8"/><path d="M3 36 Q22 24 47 31" fill="none" stroke="#c18c2f" stroke-width="2.3"/></svg>`};
const nav=document.querySelector('#mainNav');$('mobileToggle')?.addEventListener('click',()=>{const open=nav.classList.toggle('open');$('mobileToggle').setAttribute('aria-expanded',open)});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.querySelectorAll('[data-open-contact]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openContact(el.dataset.intent||'')}));
const contactModal=$('connectModal');const chatPanel=$('chatPanel');const connectLaunch=$('connectLaunch');const chatLaunch=$('chatLaunch');let previousFocus=null;
function openContact(intent=''){previousFocus=document.activeElement;if(intent){const s=$('starSituation');if(s&&!s.value)s.value=intent;}contactModal.classList.add('open');contactModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeConnect').focus()}
function closeContact(){contactModal.classList.remove('open');contactModal.setAttribute('aria-hidden','true');document.body.style.overflow='';previousFocus?.focus?.()}
window.openSmithaContact=openContact;connectLaunch?.addEventListener('click',()=>openContact());$('closeConnect')?.addEventListener('click',closeContact);contactModal?.addEventListener('click',e=>{if(e.target===contactModal)closeContact()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(contactModal?.classList.contains('open'))closeContact();if(chatPanel?.classList.contains('open'))closeChat()}});
function starText(){const fields=[['Situation','starSituation'],['Task','starTask'],['Action','starAction'],['Result','starResult']];return fields.map(([label,id])=>{const v=$(id)?.value?.trim();return v?`${label}: ${v.slice(0,300)}`:null}).filter(Boolean).join('\n')}
function composeText(kind){const star=starText();let intro=kind==='time'?"Hello Smitha, I'd appreciate a convenient time for a friendly conversation about my goals.":"Hello Smitha, I have a question about my next financial or family-planning decision.";return intro+(star?'\n\n'+star:'')}
function smsHref(msg){const sep=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?';return `sms:${phone}${sep}body=${encodeURIComponent(msg)}`}
function openSms(kind){location.href=smsHref(composeText(kind));toast('Your SMS app will open with a draft. Please send it there.')}
$('sendSms')?.addEventListener('click',()=>openSms('connect'));
$('requestTime')?.addEventListener('click',()=>openSms('time'));
$('callSmitha')?.addEventListener('click',()=>{location.href=`tel:${phone}`});
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
function localAnswer(question){const q=question.toLowerCase();if(/are you (really|actually) smitha|human|real smitha|who are you/.test(q))return 'I’m an illustrated educational guide, not Smitha personally. Choose Let’s Connect to call or prepare a message for her.';
if(/call|phone|number|text|sms|connect|appointment|schedule|meet|contact/.test(q))return 'Use “Let’s connect” to call 818-626-4474, prepare a text, or request a convenient time. No appointment is booked automatically.';
if(/star|situation|action|result|discussion/.test(q))return 'A STAR introduction is a simple way to share your Situation, Task, what you’ve tried (Action), and the Result you want. It keeps a first conversation helpful and focused.';
if(/advic|invest|returns|guarantee|license|fee|commission|product|portfolio|security/.test(q))return 'I can explain general concepts and questions to ask, but not make personalized legal, insurance, tax or investment recommendations. Confirm a professional’s credentials, scope and fees before acting.';
if(/private|privacy|record|stored|data/.test(q))return 'Guide choices stay in your browser. If AI chat is enabled, questions may be sent to an AI provider. Please do not enter account numbers, medical records or other sensitive details.';
if(/email|whatsapp|instagram|facebook|linkedin|tiktok|twitter|social/.test(q))return 'You can call Smitha at 818-626-4474. A text draft can be prepared on your device; delivery to this number has not been verified. No other contact profiles are linked.';
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
async function ask(question){const text=String(question||'').trim().slice(0,500);if(!text)return;msg('user',text);chatInput.value='';msg('assistant',localAnswer(text));const bubble=chatMessages.lastElementChild;const endpoint=document.body.dataset.aiEndpoint||'';if(endpoint){try{const state={page,topic:document.body.dataset.topic||'',topicTitle,guideTitle:document.querySelector('#resultTitle')?.textContent||'',currentGuide:document.querySelector('#guideResult')?.classList.contains('active')?'complete':'in progress'};const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page,state,history:chatHistory.slice(-6),message:text}),signal:controller.signal});clearTimeout(timer);if(res.ok){const data=await res.json();if(data.answer){bubble.textContent=data.answer}}}catch{ /* Immediate browser answer remains visible if AI unavailable. */ }}}
$('chatForm')?.addEventListener('submit',e=>{e.preventDefault();ask(chatInput.value)});
})();

/* Load owner-editable contact settings and contextual actions after the core site. */
(() => {
  const cfg=document.createElement('script');
  cfg.src='site-config.js';cfg.defer=true;
  cfg.addEventListener('load',()=>{
    const enhancements=document.createElement('script');enhancements.src='site-enhancements.js';enhancements.defer=true;
    document.body.append(enhancements);
  });
  cfg.addEventListener('error',()=>console.warn('Optional contact configuration unavailable.'));
  document.body.append(cfg);
})();
