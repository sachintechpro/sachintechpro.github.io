(() => {
'use strict';
const topics={
 estate:{
  tag:'ESTATE READINESS',title:'Estate readiness: a five-point starting checklist',
  intro:'An estate plan can help identify who should make decisions, who will receive property, and what loved ones need to know. A trust is one possible tool, not a universal requirement.',
  checklist:[
   'Identify people you trust for financial and health decisions if you cannot act yourself.',
   'Make a general inventory of important accounts, property, documents, and where records can be found.',
   'Review beneficiary designations and how jointly owned assets are titled.',
   'Think about caregivers and guardians for minor children, where relevant.',
   'Ask a California estate attorney which documents fit your situation and when to review them.'
  ],questions:[
   'Who can manage my affairs if I am temporarily or permanently unable to?',
   'How should a will, financial power of attorney, and advance health-care directive work together?',
   'Does a living trust make sense for my assets and family circumstances?',
   'Who needs to know where the finalized documents are kept?'
  ],source:'https://selfhelp.courts.ca.gov/wills-estates-probate/legal-documents',sourceLabel:'California Courts',note:'Trusts, wills, guardianship and power-of-attorney documents require legal review. Smitha is not being represented as an estate attorney.'
 },
 trusts:{
  tag:'LIVING TRUST CONVERSATION',title:'A living trust: questions before you decide',
  intro:'A trust may provide a way to manage and transfer certain assets. It works only as intended when the document, asset ownership, trustee selection, and beneficiary instructions are coordinated.',
  checklist:[
   'List the broad types of property, accounts, and beneficiaries involved without entering account numbers here.',
   'Consider who would act as successor trustee and what responsibilities that person would assume.',
   'Ask which assets need to be retitled or transferred into a trust and which should not.',
   'Review beneficiary designations that may pass outside the trust.',
   'Discuss cost, administration, alternatives, and periodic updates with an estate attorney.'
  ],questions:[
   'Would a trust help with my specific goals, or is another arrangement more suitable?',
   'How will trust funding be verified after the documents are signed?',
   'How does the trust coordinate with the will, powers of attorney, and health directives?',
   'What changes after marriage, divorce, a home purchase, or a new beneficiary?'
  ],source:'https://oag.ca.gov/consumers/general/estate-finance',sourceLabel:'California Department of Justice',note:'Only a qualified California estate attorney should prepare or advise on individualized trust formation documents.'
 },
 children:{
  tag:'CHILDREN & FUTURE GOALS',title:'Planning for a child: more than an education account',
  intro:'Education goals matter, but a child's security also depends on caregiving plans, household resilience, and clear instructions for unexpected events.',
  checklist:[
   'Set a broad education goal and approximate timeline without sharing account details.',
   'Discuss who would care for a child if a parent became unavailable.',
   'Review your emergency reserves, family responsibilities, and beneficiary information.',
   'Compare education savings approaches for flexibility, eligibility and potential tax effects.',
   'Review the estate-planning documents and protections that support your family.'
  ],questions:[
   'What family obligations would continue during an unexpected interruption?',
   'What choices exist for education savings, and what are the restrictions?',
   'Who needs authority to help a child in an emergency?',
   'When should plans be reviewed as the child grows?'
  ],source:'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/introduction-529-plans-investor-bulletin',sourceLabel:'SEC Investor.gov',note:'Guardianship and estate documents should be discussed with a qualified attorney. Education options may have tax and eligibility implications.'
 },
 caregiving:{
  tag:'CARE FOR OLDER FAMILY',title:'Caring for an aging parent: begin with a plan',
  intro:'Caregiving can involve health preferences, transportation, bills, family responsibilities and difficult timing decisions.',
  checklist:[
   'Ask what help is wanted now and what help may be needed later.',
   'Identify who may make medical and financial decisions if capacity changes.',
   'Locate existing health directives, financial powers of attorney, and key contacts.',
   'Learn what Medicare generally covers and what ongoing custodial care often requires.',
   'Discuss how family members will communicate and share responsibilities.'
  ],questions:[
   'Which decisions should be documented while the person can still participate?',
   'Which care costs might fall outside existing health coverage?',
   'How will transportation, home safety and daily support be coordinated?',
   'Which professional should review legal documents or care planning?'
  ],source:'https://www.medicare.gov/coverage/long-term-care',sourceLabel:'Medicare.gov',note:'Medicare generally does not pay for most ongoing custodial care. Consult official Medicare resources and qualified legal or care professionals as appropriate.'
 },
 retirement:{
  tag:'RETIREMENT & MEDICARE',title:'Preparing for later life: seven questions to organize',
  intro:'Planning for the years ahead means coordinating your income sources, health coverage, daily living needs, trusted helpers, and flexibility.',
  checklist:[
   'Outline your expected retirement timing and spending categories.',
   'Consider how reliable income, savings, and liquidity may work together.',
   'Review the possible effect of work-based coverage on Medicare Part B enrollment.',
   'Think about long-term care preferences and who may help with decisions.',
   'Check beneficiaries and estate documents after major changes.'
  ],questions:[
   'How might my income needs and health costs change over time?',
   'What Medicare Part B enrollment period applies to me, including any employer-coverage exception?',
   'What expenses or care needs are unlikely to be covered by Medicare?',
   'What credentials, fees and conflicts should I verify before choosing a financial professional?'
  ],source:'https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare',sourceLabel:'Medicare.gov',note:'Medicare enrollment rules can affect eligibility and penalties; confirm your own situation with Medicare or Social Security. This guide is not individualized coverage advice.'
 },
 business:{
  tag:'BUSINESS CONTINUITY',title:'When a small business depends on you',
  intro:'A small business has customers, obligations, decision-makers and family responsibilities. Planning for interruptions can help people know what to do.',
  checklist:[
   'Identify who can operate the business during a short unexpected absence.',
   'Write down essential functions, vendor contacts and payment commitments in a secure place.',
   'Consider ownership, succession and how estate documents relate to the business.',
   'Review cash-flow reserves and obligations that continue when revenue slows.',
   'Identify an attorney, accountant and appropriately licensed financial professional for specialized questions.'
  ],questions:[
   'Who can authorize urgent decisions if I am unavailable?',
   'What happens to ownership interests if a partner dies or leaves?',
   'How should business and personal estate arrangements be coordinated?',
   'What small continuity exercise would reveal the biggest gaps?'
  ],source:'https://www.sba.gov/business-guide/plan-your-business',sourceLabel:'U.S. Small Business Administration',note:'Business agreements, ownership transfers and legal documents should be reviewed by qualified professionals.'
 }
};
const $=id=>document.getElementById(id);
const cards=$('handoutOptions'), preview=$('handoutPreview');
if(!cards||!preview)return;
function el(tag,txt){const n=document.createElement(tag);if(txt)n.textContent=txt;return n;}
function renderCards(){
 cards.replaceChildren();
 for(const [key,t] of Object.entries(topics)){
  const card=el('article');card.className='handout-card';
  const h=el('h3',t.title),p=el('p',t.intro);
  const row=el('div');row.className='button-row';
  const a=el('a','Open takeaway ↗');a.className='btn outline';a.href='?topic='+key+'#handoutPreview';
  a.addEventListener('click',e=>{e.preventDefault();history.replaceState(null,'','?topic='+key+'#handoutPreview');show(key,true);});
  row.append(a);card.append(h,p,row);cards.append(card);
 }
}
let current='estate';
function show(key,scroll){current=Object.hasOwn(topics,key)?key:'estate';const t=topics[current];
 $('takeawayCategory').textContent=t.tag;$('takeawayTitle').textContent=t.title;$('takeawayIntro').textContent=t.intro;
 $('takeawayChecklist').replaceChildren(...t.checklist.map(v=>el('li',v)));
 $('takeawayQuestions').replaceChildren(...t.questions.map(v=>el('li',v)));
 $('takeawayLegal').textContent=t.note;
 const a=$('takeawaySource');a.href=t.source;a.textContent=t.sourceLabel;
 if(scroll)preview.scrollIntoView({block:'start',behavior:'smooth'});
}
function plainText(){const t=topics[current];return [t.title,t.intro,'A practical checklist:',...t.checklist.map((s,i)=>(i+1)+'. '+s),'Questions to discuss:',...t.questions.map((s,i)=>(i+1)+'. '+s),'Source: '+t.source, 'Smitha Rangaswamy | (818) 626-4474',t.note].join('\n');}
$('printTakeaway')?.addEventListener('click',()=>window.print());
$('copyTakeaway')?.addEventListener('click',async()=>{
 const text=plainText();
 try{await navigator.clipboard.writeText(text);window.smithaToast?.('Takeaway copied.');}
 catch{window.prompt('Copy this takeaway:',text);}
});
$('shareTakeaway')?.addEventListener('click',async()=>{
 const url=new URL(location.href);url.searchParams.set('topic',current);url.hash='handoutPreview';
 const share={title:topics[current].title,text:'A useful life-planning checklist from Smitha:',url:url.href};
 if(navigator.share){try{await navigator.share(share);}catch(e){if(e.name!=='AbortError')window.prompt('Share this link:',url.href);}}
 else {try{await navigator.clipboard.writeText(url.href);window.smithaToast?.('Share link copied.');}catch{window.prompt('Share this link:',url.href);}}
});
renderCards();show(new URLSearchParams(location.search).get('topic')||'estate',false);
})();