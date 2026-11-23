(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const toast = msg => typeof window.smithaToast === 'function' ? window.smithaToast(msg) : alert(msg);
 const clean = s => String(s || '').trim();
 const labels = {
   estate:'Estate planning essentials', trusts:'Living trusts & beneficiaries', marriage:'Marriage & partnership',
   children:'Children & education goals', 'family-protection':'Family protection', 'long-term-protection':'Long-term protection & policy value',
   income:'Income & health interruptions', home:'Home & mortgage priorities', retirement:'Retirement & lifetime income',
   'later-life':'My own later-life care', caregiving:'Caring for older family', medicare:'Medicare Part B basics',
   legacy:'Legacy & final arrangements', business:'Business owner continuity', foundations:'Financial foundations'
 };
 const href = slug => slug + '.html';

 // All checklist interactions are on-device and reset when this tab is reloaded.
 const checks = [...document.querySelectorAll('[data-check]')];
 if (checks.length) {
   const counter = document.querySelector('.checklist-progress');
   const update = () => {
     let done = checks.filter(el => el.checked).length;
     if (counter) counter.textContent = `${done} of ${checks.length} considered`;
   };
   // Opt-in, short-lived checklist continuity; checkmarks stay in this browser tab.
   const storageKey='smitha-checklist:'+String(document.body.dataset.topic||'general');
   const actions=document.querySelector('.checklist-actions');
   let saved=null;try{saved=sessionStorage.getItem(storageKey)}catch{}
   const retain=document.createElement('label');
   retain.className='smitha-retain-checks';
   const keep=document.createElement('input');keep.type='checkbox';keep.setAttribute('aria-label','Keep checklist progress in this browser tab');
   const keepText=document.createElement('span');keepText.textContent=' Keep my checkmarks in this tab';
   retain.append(keep,keepText);
   if(actions)actions.append(retain);
   if(saved){try{const marks=JSON.parse(saved);if(Array.isArray(marks)&&marks.length===checks.length){checks.forEach((x,i)=>x.checked=marks[i]===true);keep.checked=true}}catch{}}
   const keepProgress=()=>{try{if(keep.checked)sessionStorage.setItem(storageKey,JSON.stringify(checks.map(x=>x.checked)));else sessionStorage.removeItem(storageKey)}catch{}};
   keep.addEventListener('change',()=>{keepProgress();update()});
   checks.forEach(el=>el.addEventListener('change',()=>{update();keepProgress()}));
   const checklistIntro=document.querySelector('.checklist-box')?.previousElementSibling;
   if(checklistIntro?.textContent.includes('nothing is saved or submitted'))
     checklistIntro.textContent='Use the checks to organize your thoughts. Optionally keep progress in this tab, or copy the list; nothing is submitted.';

   document.querySelector('[data-copy-checklist]')?.addEventListener('click', async () => {
     const lines = checks.map((c,i) => `${c.checked ? '☑' : '☐'} ${i+1}. ${c.nextElementSibling.textContent.trim()}`);
     const txt = `${document.querySelector('h1')?.textContent.trim() || 'My checklist'}\n${lines.join('\n')}\n\nFor discussion only. No sensitive data.`;
     try {await navigator.clipboard.writeText(txt);toast('Checklist copied.');}
     catch {toast('Copy is unavailable here. Use Print / save instead.');}
   });
   update();
 }
 document.querySelectorAll('[data-contact-topic]').forEach(btn => btn.addEventListener('click', () => {
   const intent=`I'd like to discuss ${btn.dataset.contactTopic.toLowerCase()} and the next helpful step.`;
   if(typeof window.smithaConversationBegin==='function')window.smithaConversationBegin({topic:document.body.dataset.topic||'',intent});
   else window.openSmithaContact?.(intent);
 }));

 // Live category filtering on the independent topic directory.
 const search = $('topicSearch');
 if (search) {
   let group = 'all';
   const blocks = [...document.querySelectorAll('.topic-section')];
   const status = $('filterStatus');
   const noResults = $('noResults');
   const run = () => {
     const query = clean(search.value).toLowerCase();
     let total = 0;
     blocks.forEach(section => {
       const groupOkay = group === 'all' || section.dataset.group === group;
       let visible = 0;
       section.querySelectorAll('.journey-card').forEach(card => {
         const yes = groupOkay && (query.length === 0 || card.textContent.toLowerCase().includes(query));
         card.hidden = !yes;
         if (yes) visible++;
       });
       section.hidden = !visible;
       total += visible;
     });
     if (status) status.textContent = `${total} ${total === 1 ? 'topic' : 'topics'} to explore`;
     if (noResults) noResults.hidden = total !== 0;
   };
   search.addEventListener('input', run);
   document.querySelectorAll('[data-group-filter]').forEach(btn => btn.addEventListener('click', () => {
     group = btn.dataset.groupFilter;
     document.querySelectorAll('[data-group-filter]').forEach(x => x.classList.toggle('active', x===btn));
     run();
   }));
   run();
 }

 // Two-question life-stage path builder: no sensitive inputs and no persistence.
 const pathWizard = $('pathWizard');
 if (pathWizard) {
   let moment = '', concern = '', chosen = [];
   const momentMap = {new:'foundations',family:'children',care:'caregiving',later:'retirement',work:'business'};
   const concernMap = {people:'family-protection',money:'retirement',health:'later-life',legacy:'trusts'};
   const special = {
     'family:people':'marriage','family:money':'children','family:health':'family-protection','family:legacy':'trusts',
     'care:people':'caregiving','care:money':'income','care:health':'later-life','care:legacy':'trusts',
     'later:people':'legacy','later:money':'retirement','later:health':'medicare','later:legacy':'trusts',
     'work:people':'business','work:money':'income','work:health':'income','work:legacy':'trusts',
     'new:people':'family-protection','new:money':'foundations','new:health':'income','new:legacy':'trusts'
   };
   const screens = [$('pathChooseMoment'), $('pathChooseConcern'), $('pathResults')];
   const progressLabel = $('pathProgressLabel');
   const progressFill = $('pathProgressBar')?.querySelector('i');
   const show = step => {
     screens.forEach((x,i) => {if(x)x.hidden = i !== step;});
     if(progressLabel)progressLabel.textContent = step === 2 ? 'Your recommended starting points' : `Step ${step+1} of 2`;
     if(progressFill)progressFill.style.width = step === 0 ? '50%' : '100%';
   };
   const pathMatrix = {
   "new:people": [
      "foundations",
      "family-protection",
      "estate"
   ],
   "new:money": [
      "foundations",
      "income",
      "retirement"
   ],
   "new:health": [
      "income",
      "family-protection",
      "estate"
   ],
   "new:legacy": [
      "estate",
      "trusts",
      "foundations"
   ],
   "family:people": [
      "marriage",
      "children",
      "estate"
   ],
   "family:money": [
      "children",
      "foundations",
      "income"
   ],
   "family:health": [
      "family-protection",
      "children",
      "income"
   ],
   "family:legacy": [
      "estate",
      "trusts",
      "children"
   ],
   "care:people": [
      "caregiving",
      "estate",
      "later-life"
   ],
   "care:money": [
      "caregiving",
      "income",
      "later-life"
   ],
   "care:health": [
      "caregiving",
      "later-life",
      "medicare"
   ],
   "care:legacy": [
      "estate",
      "caregiving",
      "trusts"
   ],
   "later:people": [
      "later-life",
      "legacy",
      "estate"
   ],
   "later:money": [
      "retirement",
      "later-life",
      "foundations"
   ],
   "later:health": [
      "medicare",
      "later-life",
      "retirement"
   ],
   "later:legacy": [
      "estate",
      "trusts",
      "legacy"
   ],
   "work:people": [
      "business",
      "income",
      "estate"
   ],
   "work:money": [
      "income",
      "business",
      "foundations"
   ],
   "work:health": [
      "income",
      "family-protection",
      "business"
   ],
   "work:legacy": [
      "business",
      "estate",
      "trusts"
   ]
};
   function results() {
     const key = moment + ':' + concern;
     chosen = (pathMatrix[key] || ['estate','trusts','foundations']).slice();
     const target = $('pathResultCards');
     target.replaceChildren(...chosen.map((slug,i) => {
       const a = document.createElement('a'); a.className='path-result'; a.href=href(slug);
       const small=document.createElement('span');
       small.textContent=['START HERE','ALSO CONSIDER','THEN EXPLORE'][i];
       const h3=document.createElement('h3'); h3.textContent=labels[slug] || slug;
       const p=document.createElement('p');
       p.textContent = slug==='medicare'
         ? 'If Medicare applies to you, check enrollment deadlines and employment coverage with Medicare or Social Security first.'
         : slug==='trusts'
         ? 'Understand when a living trust may help and what a qualified California estate attorney should review.'
         : slug==='caregiving'
         ? 'Clarify care needs, decision-making authority, available support, and the questions to ask next.'
         : slug==='estate'
         ? 'Identify trusted decision-makers, beneficiaries, and the documents worth discussing with an attorney.'
         : 'Explore a practical checklist and focused questions for this part of your life.';
       const arrow=document.createElement('strong'); arrow.textContent='Open guide ↗';
       a.append(small,h3,p,arrow); return a;
     }));
     const introduction = $('pathResults')?.querySelector('p.muted');
     if (introduction) introduction.textContent =
       chosen[0]==='medicare'
         ? 'If you are nearing a Medicare enrollment deadline, review official enrollment guidance first. Other planning topics can follow.'
         : chosen[0]==='caregiving'
         ? 'Start with the person who needs help and the decisions that cannot wait. Review legal and financial arrangements afterward.'
         : 'These starting points reflect the situation and question you selected. Explore them in order, or begin with the one that feels most relevant.';
     show(2); $('pathResults')?.scrollIntoView({behavior:'smooth',block:'nearest'});
   }
   document.querySelectorAll('[data-moment]').forEach(btn=>btn.addEventListener('click',()=>{moment=btn.dataset.moment;show(1)}));
   document.querySelectorAll('[data-concern]').forEach(btn=>btn.addEventListener('click',()=>{concern=btn.dataset.concern;results()}));
   $('backToMoments')?.addEventListener('click',()=>show(0));
   $('resetPath')?.addEventListener('click',()=>{moment='';concern='';chosen=[];show(0)});
   $('copyPath')?.addEventListener('click',async()=>{
     const txt='My starting points with Smitha\n'+chosen.map((s,i)=>`${i+1}. ${labels[s]} — ${location.origin}/${href(s)}`).join('\n');
     try {await navigator.clipboard.writeText(txt);toast('Starting points copied.');}
     catch{toast('Copy is unavailable here. You can open the guides directly.');}
   });
   $('talkAboutPath')?.addEventListener('click',()=>{
     const intent=`I explored my life-stage starting points: ${chosen.map(s=>labels[s]).join(', ')}. I'd like to clarify which question to discuss first.`;
     if(typeof window.smithaConversationBegin==='function')window.smithaConversationBegin({topic:chosen[0]||'estate',intent});
     else window.openSmithaContact?.(intent);
   });
   show(0);
 }
})();
