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
   checks.forEach(el => el.addEventListener('change', update));
   document.querySelector('[data-copy-checklist]')?.addEventListener('click', async () => {
     const lines = checks.map((c,i) => `${c.checked ? '☑' : '☐'} ${i+1}. ${c.nextElementSibling.textContent.trim()}`);
     const txt = `${document.querySelector('h1')?.textContent.trim() || 'My checklist'}\n${lines.join('\n')}\n\nFor discussion only. No sensitive data.`;
     try {await navigator.clipboard.writeText(txt);toast('Checklist copied.');}
     catch {toast('Copy is unavailable here. Use Print / save instead.');}
   });
   update();
 }
 document.querySelectorAll('[data-contact-topic]').forEach(btn => btn.addEventListener('click', () => {
   window.openSmithaContact?.(`I'd like to discuss ${btn.dataset.contactTopic.toLowerCase()} and the next helpful step.`);
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
   function results() {
     const primary = special[`${moment}:${concern}`] || momentMap[moment];
     const secondary = concernMap[concern] || 'foundations';
     chosen = [...new Set(['estate',primary,secondary,'trusts'])].slice(0,3);
     const target = $('pathResultCards');
     target.replaceChildren(...chosen.map((slug,i) => {
       const a = document.createElement('a');a.className='path-result';a.href=href(slug);
       const small=document.createElement('span');small.textContent=i===0?'FOUNDATION':'EXPLORE NEXT';
       const h3=document.createElement('h3');h3.textContent=labels[slug] || slug;
       const p=document.createElement('p');p.textContent=i===0?'Make your wishes and decision-makers clear.':'Explore practical questions, a checklist, and reliable resources.';
       const arrow=document.createElement('strong');arrow.textContent='Open guide ↗';a.append(small,h3,p,arrow);return a;
     }));
     show(2);$('pathResults')?.scrollIntoView({behavior:'smooth',block:'nearest'});
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
     window.openSmithaContact?.(`I explored my life-stage starting points: ${chosen.map(s=>labels[s]).join(', ')}. I'd like to clarify which question to discuss first.`);
   });
   show(0);
 }
})();
