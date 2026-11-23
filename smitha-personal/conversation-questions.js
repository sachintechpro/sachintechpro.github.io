(()=>{
'use strict';
const host=document.getElementById('smithaConversationGuide');
const details=host?.closest('.smitha-contact-details');
if(!host||!details)return;
const phone=window.SMITHA_SITE_CONFIG?.contact?.phone?.e164||'';
const verifiedEmail=()=>{const entry=window.SMITHA_SITE_CONFIG?.contact?.email;return entry?.verified&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.address||'')?entry.address:''};
const canText=()=>window.SMITHA_SITE_CONFIG?.contact?.phone?.smsDraftEnabled===true||window.SMITHA_SITE_CONFIG?.contact?.phone?.verifiedForSms===true;
const el=(tag,klass,copy)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(copy!==undefined)n.textContent=copy;return n};
const profile={
 estate:{name:'Estate planning',
  situations:['I own a home or have assets to organize','My family or beneficiaries have changed','I need to choose trusted decision-makers','I am considering an estate plan for the first time'],
  priorities:['Who could act if I could not','How property, wills and beneficiaries fit together','Whether a living trust might make sense','What to ask a California estate attorney'],
  outcomes:['A practical estate-readiness checklist','Questions for an estate attorney','Understanding what to review first','A friendly conversation about next steps'],
  caution:'Legal documents, will preparation and trust formation belong with a qualified California estate attorney.'},
 trusts:{name:'Living trusts',
  situations:['I want to know whether a trust could help','I have a trust but am unsure it was funded','I need to review trustees or beneficiaries','A home purchase or family change raised new questions'],
  priorities:['When a trust is useful compared with alternatives','Which assets need title or beneficiary review','Choosing and preparing a successor trustee','Coordinating the trust with other estate documents'],
  outcomes:['A checklist to take to an estate attorney','Questions about trust funding','Understanding what a trustee would do','Deciding which issue to discuss next'],
  caution:'A California estate attorney should determine whether a trust is appropriate and prepare or review legal documents.'},
 marriage:{name:'Marriage and partnership',
  situations:['We are getting married','We have recently married','Our shared obligations are changing','We want to update existing plans'],
  priorities:['Shared expenses, savings and responsibilities','Beneficiaries and existing documents','Planning for a home or children','Protection if either of us loses income'],
  outcomes:['A shared-priorities checklist','Understanding which documents to review','Questions about household protection','A useful first conversation'],
  caution:'Property and estate-law questions should be reviewed with appropriately qualified legal counsel.'},
 children:{name:'Children and education',
  situations:['We are expecting or welcoming a child','We are saving for a child’s education','Our child’s needs or plans may change','We are reviewing guardians or beneficiaries'],
  priorities:['What future expenses we want to support','Flexibility if a child chooses another path','Guardianship and household continuity','Savings options and their rules'],
  outcomes:['A clear family-goal checklist','Questions to compare savings approaches','Documents to review with an estate attorney','A friendly discussion about next steps'],
  caution:'Guardianship and legal arrangements belong with a qualified attorney; savings choices need individual review.'},
 'family-protection':{name:'Family protection',
  situations:['My family relies on my income','We recently had a child or married','My work benefits or coverage are changing','I want to understand what we already have'],
  priorities:['What expenses would need to be supported','Which benefits we may already have','How long a protection arrangement lasts','Costs, exclusions and beneficiary details'],
  outcomes:['A household priorities checklist','Questions to ask about existing coverage','Understanding important policy limitations','A conversation about what to review'],
  caution:'Coverage suitability, eligibility, policy terms and costs need review with an appropriately licensed professional.'},
 'long-term-protection':{name:'Long-term protection and policy value',
  situations:['I am exploring protection that lasts longer','I have an existing policy with accumulated value','I am comparing illustrations or contract terms','My income or premium budget has changed'],
  priorities:['What is guaranteed versus projected','Charges, crediting rules and potential changes','Policy loans, withdrawals and lapse risks','How complexity compares with the original goal'],
  outcomes:['Questions to review contract terms','A list of costs and risks to understand','Preparation for a licensed professional review','A clearer next decision'],
  caution:'Policy values and projections are not guaranteed unless stated in the contract; loans, fees and lapse can have consequences.'},
 income:{name:'Income interruptions',
  situations:['My job or income may change','I am recovering from an unexpected interruption','I may need time away to care for someone','I want a more resilient household plan'],
  priorities:['How long essential expenses could be managed','Existing workplace benefits and resources','Potential extra medical or caregiving expenses','Waiting periods and protection limits'],
  outcomes:['An income-continuity checklist','Questions about existing benefits','A short list of immediate priorities','A focused conversation'],
  caution:'Do not enter personal income amounts or account details here.'},
 home:{name:'Homeownership',
  situations:['I am preparing to buy a home','I already own a home','Our household income is changing','I am considering how property passes later'],
  priorities:['Expenses beyond the monthly mortgage','What happens if income stops','Property title and ownership questions','Whether estate documents should be updated'],
  outcomes:['A home-planning checklist','Questions for qualified legal guidance','A discussion about household responsibilities','A clearer next step'],
  caution:'Changes to deeds, ownership and trusts should be evaluated with a qualified California estate attorney.'},
 retirement:{name:'Retirement',
  situations:['I am planning to retire soon','Retirement is a few years away','I am already retired','I am reviewing care and family needs'],
  priorities:['Possible income sources and timing','Inflation and unexpected expenses','Liquidity, fees and access to money','Beneficiaries and health coverage timing'],
  outcomes:['Questions to compare retirement choices','A checklist of income and care priorities','Official resources to verify first','A useful introduction with Smitha'],
  caution:'Investment and retirement decisions are individual; use appropriately licensed guidance and official benefit sources.'},
 'later-life':{name:'My later-life care',
  situations:['I want to stay independent as I age','I might need help with daily activities','I want to choose future decision-makers','I am comparing possible care arrangements'],
  priorities:['Care preferences and trusted helpers','What ongoing personal care can cost','Who can legally make decisions','How care preferences fit estate documents'],
  outcomes:['A later-life planning checklist','Care questions for my family','Documents to discuss with an attorney','A clear next conversation'],
  caution:'Medicare generally does not cover most ongoing custodial long-term care; verify current benefits at Medicare.gov.'},
 caregiving:{name:'Caring for older family',
  situations:['I am beginning to help an aging parent','Our family needs more daily-care support','I am coordinating decisions with relatives','We need to understand available care services'],
  priorities:['What my loved one wants and can do','Health and financial decision authority','Medical versus ongoing personal care','Sharing responsibilities fairly'],
  outcomes:['A family caregiving checklist','Questions for official care resources','Understanding legal decision-making roles','A conversation about family priorities'],
  caution:'Respect your family member’s wishes and privacy. A contact designation does not automatically create legal decision authority.'},
 medicare:{name:'Medicare Part B',
  situations:['I am approaching age 65','I still work and have employer coverage','My work-based coverage is ending','I am helping someone understand Medicare'],
  priorities:['Which enrollment window applies','How employer coverage affects timing','What Part B covers and costs','Which other coverage decisions are separate'],
  outcomes:['Official deadlines to verify with Medicare or SSA','A list of enrollment questions to ask','Understanding how benefits fit other needs','A short discussion about planning priorities'],
  caution:'Part B enrollment deadlines can matter. Verify your situation directly with Medicare or Social Security before delaying enrollment.'},
 legacy:{name:'Legacy and loved ones',
  situations:['I want to organize important instructions','Our family has experienced a major change','I am reviewing beneficiaries or final wishes','I want to make things easier for loved ones'],
  priorities:['Where important instructions are kept','Who would have legal authority to act','Coordination of beneficiaries and documents','How to discuss wishes with family'],
  outcomes:['A legacy-organization checklist','Questions to ask a California estate attorney','A plan for a family conversation','A clearer next step'],
  caution:'Beneficiary designations, legal titles and estate documents may operate differently; seek appropriate legal advice.'},
 business:{name:'Business continuity and entrepreneurship',
  situations:['I run a business that relies on me','I am exploring a business or side-income idea','I am considering a partnership','I want to plan for unexpected disruption'],
  priorities:['Who depends on business continuity','Who can legally act if I cannot','Time, cost and customer demand','Business succession or ownership decisions'],
  outcomes:['A small next-step checklist','Questions for a qualified business or legal adviser','A way to test an idea carefully','An introductory conversation'],
  caution:'Business decisions may require legal, tax and licensing review. No earnings or partnership outcome is guaranteed.'},
 foundations:{name:'Financial foundations',
  situations:['I want to get organized','My financial priorities have changed','I am preparing for a major life decision','I need to understand where to start'],
  priorities:['Essential expenses and emergency planning','Existing benefits and resources','Near-term versus long-term goals','Who could help with important decisions'],
  outcomes:['A short priorities checklist','Questions for a qualified professional','A first step I can take','A friendly conversation'],
  caution:'General educational information only, not personalized financial, investment or tax advice.'}
};
const generalChoices=[
 {label:'Estate planning or trusts',topic:'estate'},
 {label:'Children, marriage or family protection',topic:'children'},
 {label:'Retirement, caregiving or Medicare',topic:'retirement'},
 {label:'Income or business plans',topic:'business'}
];
const stageNotes=['What brings you here?','What matters most right now?','What have you looked at so far?','What would be helpful next?'];
const progressText=['Your situation','Your question','Where you are now','A helpful outcome'];
const tried=[
 'I am just starting to look into this',
 'I have reviewed some information or documents',
 'I have already spoken with a professional',
 'My circumstances changed, so I want to revisit it'
];
let pageTopic=document.body.dataset.topic||'';
const filename=location.pathname.split('/').pop()?.replace(/\.html$/,'')||'index';
if(!profile[pageTopic])pageTopic=profile[filename]?filename:(filename==='grow'?'business':filename==='plan'?'foundations':'');
let chosenTopic=pageTopic,contextHint='',step=0,answers=[],additional='';
const summary=el('summary');summary.textContent='Answer a few helpful questions before we talk';
const optional=el('span','', 'Optional · tailored to this topic');summary.append(optional);
details.replaceChildren(summary,host);
const holder=el('div','smitha-qflow-inner');host.append(holder);
function current(){return profile[chosenTopic]||profile.foundations}
function normalizedTopic(topic){return profile[topic]?topic:''}
function setContext(info={}){
 if(typeof info==='string')info={intent:info};
 const newTopic=normalizedTopic(info.topic);
 if(newTopic&&newTopic!==chosenTopic){chosenTopic=newTopic;step=0;answers=[];additional=''}
 if(info.intent&&typeof info.intent==='string')contextHint=info.intent.slice(0,220);
 render();
}
function resultText(){
 const topic=chosenTopic?current().name:'My starting point';
 const rows=['Topic: '+topic];
 if(contextHint&&!answers.length)rows.push('I am exploring: '+contextHint);
 if(answers[0])rows.push('My situation: '+answers[0]);
 if(answers[1])rows.push('What I would like to clarify: '+answers[1]);
 if(answers[2])rows.push('What I have considered: '+answers[2]);
 if(answers[3])rows.push('A useful outcome: '+answers[3]);
 if(additional.trim())rows.push('Additional note: '+additional.trim().slice(0,240));
 return rows.join('\n');
}
window.smithaConversationText=resultText;
window.smithaConversationSetContext=setContext;
function getGreeting(){return 'Hello Smitha, I have a question about '+(chosenTopic?current().name.toLowerCase():'my next step')+'.\n\n'+resultText()+'\n\nWould you be available for a friendly discussion?'}
function emailHref(){
 const email=window.SMITHA_SITE_CONFIG?.contact?.email;
 return email?.verified&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.address||'')?
  'mailto:'+email.address+'?subject='+encodeURIComponent('An introduction: '+(chosenTopic?current().name:'My priorities'))+'&body='+encodeURIComponent(getGreeting()):'';
}
function textHref(msg){
 const number=window.SMITHA_SITE_CONFIG?.contact?.phone?.e164||'';
 return 'sms:'+number+(/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?')+'body='+encodeURIComponent(msg);
}
function goText(){
 const cfg=window.SMITHA_SITE_CONFIG?.contact?.phone||{};
 if(!cfg.smsDraftEnabled&&!cfg.verifiedForSms){copySummary();return}
 location.href=textHref(getGreeting());
 window.smithaToast?.('Message draft opened. Nothing has been sent yet.');
}
function copySummary(){const msg=getGreeting();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(msg).then(()=>window.smithaToast?.('Your conversation note is copied.')).catch(()=>window.prompt('Copy this note:',msg));else window.prompt('Copy this note:',msg)}
function goEmail(){
 const href=emailHref();
 if(href)location.href=href;
 else{
  const cfg=window.SMITHA_SITE_CONFIG?.contact?.phone||{};
  if(cfg.smsDraftEnabled||cfg.verifiedForSms)location.href=textHref(getGreeting()+'\n\nPlease share your preferred email address for this conversation.');
  else copySummary();
 }
}
function goCall(){
 const phone=window.SMITHA_SITE_CONFIG?.contact?.phone?.e164||'';
 if(phone)location.href='tel:'+phone;
}
function goBooking(){
 const booking=document.querySelector('#connectModal .smitha-booking-details');
 if(booking){booking.open=true;booking.scrollIntoView({block:'start',behavior:'smooth'});return}
 const target='contact.html#smithaContactCalendar';
 location.href=target;
}
function addButton(label,cls,action){
 const b=el('button',cls,label);b.type='button';b.addEventListener('click',action);return b
}
function render(){
 holder.replaceChildren();
 const bank=current(),isGeneral=!chosenTopic&&step===0,done=step>=4;
 const lead=el('div','smitha-qflow-eyebrow',done?'Ready to connect with Smitha':(step+1)+' of 4 · '+progressText[step]);
 const heading=el('h3','smitha-qflow-heading',done?'You have a useful starting point.':isGeneral?'What brings you here today?':stageNotes[step]);
 const desc=el('p','smitha-qflow-desc',done?'Here is what you can share if you wish. You can still call, text, email, or request a time without sending this note.':
  step===0?(chosenTopic?'Choose the situation that feels closest.':'Select the area you are thinking about.'):
  step===1?'Thinking about '+(answers[0]||'this situation').toLowerCase()+', what would you most like to clarify?':
  step===2?'A quick sense of where you are now is enough—no private details.':
  'What would make a short conversation useful for you?');
 holder.append(lead,heading,desc);
 if(done){
  const summaryText=el('div','smitha-qflow-recap');
  const lines=resultText().split('\n');
  lines.forEach((line,i)=>{const p=el('p','',line);if(i===0)p.className='smitha-qflow-subject';summaryText.append(p)});
  holder.append(summaryText);
  const noteLabel=el('label','smitha-qflow-note-label','Anything else you want Smitha to know? (Optional)');
  const note=el('textarea','smitha-qflow-note');note.rows=2;note.maxLength=240;
  note.placeholder='A short question only—no account, policy, or health details';
  note.value=additional;
  note.addEventListener('input',()=>{additional=note.value});
  noteLabel.append(note);holder.append(noteLabel);
  const actions=el('div','smitha-qflow-contact-actions');
  actions.append(
   addButton('Text Smitha','btn gold',goText),
   addButton(emailHref()?'Email Smitha':'Ask for email by text','btn outline',goEmail),
   addButton('Book 15 min','btn outline',goBooking),
   addButton('Call Smitha','btn outline',goCall)
  );
  holder.append(actions);
  const last=el('div','smitha-qflow-last');
  last.append(addButton('Copy my conversation','smitha-qflow-link',copySummary),addButton('Change an answer','smitha-qflow-link',()=>{step=0;render()}));
  holder.append(last);
  holder.append(el('p','smitha-qflow-privacy',bank.caution+' Sharing answers is optional and happens only if you complete the action in your chosen app.'));
  return;
 }
 const opts=step===0?(isGeneral?generalChoices.map(x=>x.label):bank.situations):
  step===1?bank.priorities:step===2?tried:bank.outcomes;
 const options=el('div','smitha-qflow-options');
 opts.forEach((item,index)=>{
  const label=typeof item==='string'?item:item.label;
  const choice=addButton(label,'smitha-qflow-choice'+(answers[step]===label?' selected':''),()=>{
   answers[step]=label;
   if(step===0&&isGeneral){chosenTopic=generalChoices[index].topic;contextHint='';}
   step++;render()
  });
  choice.setAttribute('aria-label',label);
  options.append(choice)
 });
 holder.append(options);
 const footer=el('div','smitha-qflow-navigation');
 if(step>0)footer.append(addButton('← Back','smitha-qflow-link',()=>{step--;render()}));
 footer.append(addButton('Connect without questions ↗','smitha-qflow-link',()=>{details.open=false;document.querySelector('#connectModal .smitha-primary-contact')?.scrollIntoView({block:'nearest',behavior:'smooth'})}));
 holder.append(footer);
 holder.append(el('p','smitha-qflow-privacy','Please do not share account numbers, Social Security information, policy numbers, or medical details.'));
}
window.smithaConversationBegin=(info={})=>{
 if(info&&typeof info==='object'&&('topic' in info||'intent' in info))setContext(info);
 if(typeof window.openSmithaContact==='function')window.openSmithaContact(info?.intent||'');
 details.open=true;
 render();
 const h=holder.querySelector('.smitha-qflow-choice');
 if(h)h.focus({preventScroll:true});
};
document.addEventListener('smitha-contact-open',event=>{
 const intent=event?.detail?.intent||'';
 if(intent&&!contextHint)contextHint=intent.slice(0,220);
});
render();
})();