(()=>{
'use strict';
const $=id=>document.getElementById(id),form=$('cxForm'),area=$('cxInputs'),out=$('cxResult');
if(!form||!area||!out)return;
const F=(id,label,options,help)=>({id,label,options,help:help||''});
const data={
estate:{title:"Let’s make your wishes easier to follow.",intro:"Explore the people, instructions and legal documents worth discussing. This is not a legal assessment.",fields:[
F('financial','Who could handle financial decisions?',['Already documented','Needs review','Not sure']),
F('health','Who could communicate healthcare wishes?',['Already documented','Needs review','Not sure']),
F('beneficiary','Account beneficiaries',['Reviewed recently','May need updates','Not sure']),
F('documents','A will and other estate documents',['Reviewed with counsel','Need a review','Not yet explored']),
F('property','Home or property ownership',['Not applicable','Reviewed with counsel','Unclear how it would pass']),
F('instructions','Who knows where key instructions are kept?',['Trusted people know','Not yet discussed','Not sure'])]},
trust:{title:"Get ready for a trust discussion.",intro:"Look at the categories an attorney may need to examine. Signing a trust alone does not necessarily transfer assets into it.",fields:[
F('property','Real estate or a home',['Not part of my situation','Ownership reviewed','Title needs review','Not sure']),
F('accounts','Bank and investment accounts',['Not part of my situation','Ownership/beneficiaries reviewed','Need review','Not sure']),
F('policies','Insurance beneficiaries',['Not part of my situation','Beneficiaries reviewed','Need review','Not sure']),
F('business','Business ownership',['Not part of my situation','Ownership reviewed','Needs succession review','Not sure']),
F('trustee','Successor trustee',['Discussed with counsel','Have someone in mind','Not sure'])]},
family:{title:"Explore your family's future.",intro:"Adjust hypothetical savings figures to see how time and contributions interact. This is an illustration, not a forecast.",fields:[
F('purpose','What are you preparing for?',['Education or training','Future flexibility for a child','A broader family goal','Not sure']),
F('start','Illustrative starting savings ($)',null,'Example amount only; no account details.',0),
F('monthly','Illustrative monthly contribution ($)',null,'Change this to explore another scenario.',150),
F('years','Years until the goal',null,'Between 1 and 30 years.',15),
F('rate','Assumed annual rate (%)',null,'Between 0% and 8%; not guaranteed.',4),
F('legal','Guardianship and beneficiaries',['Reviewed with legal guidance','Would like to review','Not sure'])]},
care:{title:"Make caring for someone easier to coordinate.",intro:"Start with your loved one's wishes, legal decision-making roles, daily support and possible costs.",fields:[
F('wishes','Their preferences and independence',['Discussed together','Not yet discussed','Not sure']),
F('medical','Authority for medical decisions',['Relevant documents reviewed','Need to check','Not sure']),
F('financial','Authority for financial decisions',['Relevant documents reviewed','Need to check','Not sure']),
F('help','Daily support and backup helpers',['Roles and backup clear','Helpers need coordinating','Not sure']),
F('costs','Care costs and coverage',['Sources and limits reviewed','Need to explore','Assuming Medicare pays for all care'])]},
medicare:{title:"Check the questions that affect Part B timing.",intro:"Medicare and Social Security determine applicable enrollment rules. This helps you identify what to verify, not your eligibility.",fields:[
F('age','Where are you in the process?',['Turning 65 within a year','Already 65 or older','Medicare may apply for another reason','Helping someone else','Not sure']),
F('coverage','What coverage applies?',['Current employer coverage','Spouse’s current-employment coverage','COBRA or retiree coverage','No work-based coverage','Not sure']),
F('change','Is work-based coverage ending?',['Soon or recently','No known change','Not sure']),
F('size','If active employer coverage applies, employer size',['20 or more employees','Fewer than 20','Not sure','Not applicable'])]},
continuity:{title:"Plan for retirement or business interruptions.",intro:"Compare a simple monthly retirement scenario or identify what could interrupt a business if you became unavailable.",fields:[
F('focus','What are you exploring?',['Retirement','My business']),
F('expenses','Illustrative monthly retirement expenses ($)',null,'Use broad example figures only.',4000),
F('income','Illustrative expected monthly income ($)',null,'Do not enter account or benefit identifiers.',2800),
F('authority','Who could make business decisions?',['Authorized backup identified','Helper exists but authority unclear','No backup','Not applicable']),
F('operations','Key business operations',['Documented with backup','Some depend on me','Not documented','Not applicable'])]}
};
const links={
estate:[['California Courts estate documents','https://selfhelp.courts.ca.gov/wills-estates-probate/legal-documents'],['Living trusts','trusts.html']],
trust:[['California Courts estate documents','https://selfhelp.courts.ca.gov/wills-estates-probate/legal-documents'],['Estate basics','estate.html']],
family:[['Investor.gov compound interest calculator','https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator'],['Children and education goals','children.html']],
care:[['Caring for an older family member','caregiving.html'],['Later-life care','later-life.html']],
medicare:[['Medicare: When can I sign up?','https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare'],['Medicare: Apply for Part A or B','https://www.medicare.gov/basics/get-started-with-medicare/sign-up/ready-to-sign-up-for-part-a-part-b']],
continuity:[['Retirement decisions','retirement.html'],['Business continuity','business.html']]
};
const el=(tag,klass,text)=>{let x=document.createElement(tag);if(klass)x.className=klass;if(text!==undefined)x.textContent=String(text);return x};
const currency=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.round(n));
const clamp=(v,a,b,d)=>Number.isFinite(Number(v))?Math.min(b,Math.max(a,Number(v))):d;
let active='estate';
function setTool(key){
 if(!data[key])return;
 active=key;area.replaceChildren();out.replaceChildren(el('div','cx-result-idle','Make a few choices, then select “See my takeaway.”'));
 $('cxToolTitle').textContent=data[key].title;$('cxToolIntro').textContent=data[key].intro;
 $('cxEyebrow').textContent={estate:'Estate readiness',trust:'Trust preparation',family:'Children and family',care:'Aging family care',medicare:'Medicare Part B',continuity:'Financial continuity'}[key];
 document.querySelectorAll('[data-journey]').forEach(btn=>{const isOn=btn.dataset.journey===key;btn.classList.toggle('active',isOn);btn.setAttribute('aria-pressed',String(isOn))});
 data[key].fields.forEach(f=>{
  const row=el('div','cx-field');row.dataset.id=f.id;
  const label=el('label','cx-label',f.label);label.htmlFor='cx-'+f.id;row.append(label);
  let input;
  if(f.options){
   input=el('select','cx-control');let initial=el('option','','Choose what fits…');initial.value='';input.append(initial);
   f.options.forEach((text,i)=>{let opt=el('option','',text);opt.value=String(i);input.append(opt)})
  }else{
   input=el('input','cx-control');input.type='number';input.inputMode='decimal';input.min=f.id==='years'?'1':'0';input.max=f.id==='years'?'30':f.id==='rate'?'8':'1000000';input.step=f.id==='rate'?'0.5':'1';input.value=String(f.help!==undefined?f.initial||0:0);
  }
  input.id='cx-'+f.id;input.name=f.id;row.append(input);
  if(f.help){const hint=el('p','cx-field-note',f.help);hint.id=input.id+'-hint';input.setAttribute('aria-describedby',hint.id);row.append(hint)}
  if(key==='continuity'){
   if(['expenses','income'].includes(f.id))row.dataset.branch='retirement';
   if(['authority','operations'].includes(f.id))row.dataset.branch='business';
  }
  area.append(row)
 });
 if(key==='continuity'){area.querySelector('[name="focus"]').addEventListener('change',showBranch);showBranch()}
 const url=new URL(location.href);url.searchParams.set('tool',key);history.replaceState(null,'',url.pathname+url.search+url.hash);
}
function showBranch(){
 const isBusiness=area.querySelector('[name="focus"]')?.value==='1';
 area.querySelectorAll('[data-branch]').forEach(row=>row.hidden=row.dataset.branch!==(isBusiness?'business':'retirement'))
}
function values(){
 const out={};for(const f of data[active].fields){
  const input=area.querySelector('[name="'+f.id+'"]');
  out[f.id]=f.options?(input?.value===''?null:Number(input?.value)):Number(input?.value);
 }return out;
}
const choice=(field,i)=>i===null?'Not chosen':data[active].fields.find(f=>f.id===field).options[i]||'Not sure';
const item=(title,explanation)=>({title,explanation});
function standardResult(ids,v,header,note,extra){
 const rows=ids.map(([id,title,action])=>({id,title,action,text:choice(id,v[id])}));
 const toReview=rows.filter(x=>x.text==='Not chosen'||/not sure|need|not yet|may|unclear|assuming/i.test(x.text));
 const selected=toReview.length?toReview:rows.slice(0,3);
 return{heading:header,description:note+(toReview.length?' You identified '+toReview.length+' areas needing clarification.':' You have already considered several areas.'),metric:toReview.length+' / '+rows.length,metricLabel:'topics to check',steps:selected.map(x=>item(x.title,x.action)),warnings:extra};
}
function estate(v){return standardResult([
 ['financial','Who could handle financial decisions?','Ask a California estate attorney about a financial power of attorney and a backup person.'],
 ['health','Who could communicate healthcare wishes?','Review an advance health-care directive and trusted decision-makers.'],
 ['beneficiary','Who receives account benefits?','Check named beneficiaries and how account rules interact with other documents.'],
 ['documents','Which legal documents are current?','Bring existing documents to a qualified estate attorney for review.'],
 ['property','How does property ownership work?','Review deeds, ownership and title questions with an estate attorney.'],
 ['instructions','Who knows where instructions are?','Make a secure plan for trusted people to find appropriate documents and contacts.']
 ],v,'These are questions worth discussing.','A checklist helps organize the conversation; it does not establish legal readiness.',['A living trust is one possible arrangement, not a requirement for everyone.','A qualified California estate attorney should advise on and prepare legal documents.'])}
function trust(v){return standardResult([
 ['property','What would happen to real estate?','Have a California estate attorney check relevant deeds and title arrangements.'],
 ['accounts','How should financial accounts be coordinated?','Check ownership and beneficiaries with appropriate institutions and counsel.'],
 ['policies','Are beneficiary instructions current?','Ask how beneficiary designations interact with any proposed trust.'],
 ['business','How would business ownership be handled?','Review ownership agreements and succession with appropriate legal and tax professionals.'],
 ['trustee','Who could serve as successor trustee?','Discuss responsibilities, competence, backups and how the role begins.']
 ],v,'Prepare questions about assets, titles and decision-makers.','A signed trust does not automatically mean all assets are funded into it.',['Do not change deeds or account registrations based only on this checklist.','Trust suitability and preparation belong with a qualified California estate attorney.'])}
function projected(s,m,y,rate){
 const n=y*12,r=rate/1200;
 return !r?s+m*n:s*Math.pow(1+r,n)+m*(Math.pow(1+r,n)-1)/r
}
function family(v){
 const start=clamp(v.start,0,1e6,0),monthly=clamp(v.monthly,0,1e4,150),years=clamp(v.years,1,30,15),rate=clamp(v.rate,0,8,4),paid=start+monthly*12*years,future=projected(start,monthly,years,rate);
 return {heading:'Explore the effect of time and contributions.',description:'At '+rate+'% hypothetical annual growth over '+years+' years, this example reaches '+currency(future)+'. Total contributions would be '+currency(paid)+'. At 0% growth, the example would equal contributions only.',metric:currency(future),metricLabel:'hypothetical future amount',steps:[
 item('Name the goal','Start with '+choice('purpose',v.purpose).toLowerCase()+' and think about your time horizon and flexibility.'),
 item('Compare different scenarios','Try changing the savings amount, years and assumed rate. Actual results may be lower, negative or vary over time.'),
 item('Review family protections',v.legal===0?'You indicated legal family arrangements were reviewed. Revisit after significant changes.':'Discuss guardianship and beneficiaries with an appropriate legal professional; savings and family legal arrangements are separate.')
 ],warnings:['Illustrative monthly compounding only; excludes fees, taxes, withdrawals and inflation. No outcome is guaranteed.','This is not an investment, insurance or savings product recommendation.']};
}
function care(v){return standardResult([
 ['wishes','What does your loved one want?','Start by listening to care preferences and respecting privacy and independence.'],
 ['medical','Who could make medical decisions?','Check advance healthcare directives and authorized healthcare contacts.'],
 ['financial','Who has financial authority?','A family member or emergency contact does not automatically have legal authority. Ask an attorney about applicable documents.'],
 ['help','Who will handle daily needs?','Identify realistic support, transportation, scheduling and backup helpers.'],
 ['costs','What type of care might be needed?','Compare skilled services and ongoing personal help. Medicare generally does not cover most custodial care.']
 ],v,'Begin with the person, their wishes and immediate needs.','This organizes care-related questions but is not a medical or legal assessment.',['Avoid entering medical information or confidential records here.','Coordinate care with relevant professionals and legal documents with qualified counsel.'])}
function medicare(v){
 let steps=[];
 if(v.coverage===2)steps.push(item('COBRA or retiree coverage','These are not the same as coverage from current employment. Do not assume they let you delay Part B without consequences.'));
 else if(v.coverage===0||v.coverage===1)steps.push(item('Confirm current employment coverage','Ask which employer provides coverage and whether it coordinates with Medicare. Employer size can matter.'));
 else steps.push(item('Confirm what coverage applies','Before deciding when to enroll, identify whether you have active work coverage or another arrangement.'));
 if(v.size===1||v.size===2)steps.push(item('Clarify employer size','The employer size may change which plan pays first. Ask the benefits administrator and Medicare.'));
 if(v.change===0||v.age===0||v.age===1)steps.push(item('Verify your enrollment timing','Use Medicare or Social Security’s official guidance for your actual circumstances and enrollment period.'));
 steps.push(item('Check official information before delaying','Review Medicare’s enrollment questions and forms directly, rather than relying on a generic deadline estimator.'));
 return{heading:'The next step is to verify official timing.',description:'Your choices: '+choice('age',v.age)+'; '+choice('coverage',v.coverage)+'; coverage change: '+choice('change',v.change)+'. This site does not determine eligibility, dates or penalties.',metric:'Timing matters',metricLabel:'consult Medicare or Social Security',steps,warnings:['Missing an enrollment period can cause coverage gaps or late penalties for some people.','Medicare Part B does not generally cover most ongoing custodial long-term care.']};
}
function continuity(v){
 if(v.focus===1)return{heading:'What would happen if you were unavailable?',description:'A small continuity plan starts with business responsibilities, permissions, customers, payments and the family affected by a disruption.',metric:'3 steps',metricLabel:'to prepare a practical backup',steps:[
 item('Confirm decision authority',v.authority===0?'You identified an authorized backup. Check they can access the necessary information.':'Identify who could act and ask qualified counsel what authority or approvals would be required.'),
 item('Write down key processes',v.operations===0?'You have a process backup in mind. Keep it current.':'List customers, payments, suppliers, service commitments and a realistic operational backup.'),
 item('Connect ownership with family wishes','Review succession, ownership interests and beneficiaries with appropriate legal and tax professionals.')
 ],warnings:['Operational access is not the same as legal authority.','This does not guarantee business income or business continuity.']};
 const expenses=clamp(v.expenses,0,1e6,4000),income=clamp(v.income,0,1e6,2800),gap=expenses-income;
 return{heading:gap>0?'Your example has a monthly difference to explore.':'Your example shows no monthly shortfall.',description:'Example expenses: '+currency(expenses)+' monthly; expected income: '+currency(income)+'. The arithmetic difference is '+currency(Math.abs(gap))+' '+(gap>0?'below expenses.':gap<0?'above expenses.':'(equal).')+' This is not a retirement forecast.',metric:currency(Math.abs(gap)),metricLabel:gap>0?'illustrative monthly gap':'illustrative monthly difference',steps:[
 item('Compare income sources','Separate contractual guarantees from variable or conditional income, and check start dates.'),
 item('Consider changing expenses','Include possible healthcare, caregiving, taxes and inflation when building a real plan.'),
 item('Review access and beneficiaries','Check liquidity, fees and who could handle decisions if you were unavailable.')
 ],warnings:['An individualized retirement plan requires complete circumstances and appropriately qualified guidance.','The example does not calculate eligibility, inflation, taxes, investment volatility or lifetime sufficiency.']};
}
const evaluators={estate,trust,family,care,medicare,continuity};
const makeLink=(text,url)=>{const a=el('a','cx-resource',text+' ↗');a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}return a};
function summary(r){
 return 'Hello Smitha, I explored '+active+' questions.\n\n'+r.heading+'\n'+r.description+'\n\nQuestions to discuss:\n'+r.steps.slice(0,4).map((x,i)=>(i+1)+'. '+x.title+': '+x.explanation).join('\n')+'\n\nCould we have a short introductory conversation?';
}
function copy(t){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>window.smithaToast?.('Your takeaway was copied.')).catch(()=>window.prompt('Copy this note:',t));else window.prompt('Copy this note:',t)}
function message(t){const c=window.SMITHA_SITE_CONFIG?.contact||{},p=c.phone||{};if(!(p.smsDraftEnabled||p.verifiedForSms)||!/^\+[1-9]\d{7,14}$/.test(p.e164||'')){copy(t);return}location.href='sms:'+p.e164+(/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?')+'body='+encodeURIComponent(t)}
function contact(r){
 if(typeof window.smithaConversationSetContext==='function')window.smithaConversationSetContext({topic:active==='trust'?'trusts':active==='family'?'children':active==='care'?'caregiving':active==='continuity'?(values().focus===1?'business':'retirement'):active,intent:'I have questions about '+active});
 if(typeof window.openSmithaContact==='function')window.openSmithaContact('I explored '+active+' and would like to discuss my next step.');
 else location.href='contact.html';
}
function renderResult(r){
 out.replaceChildren();out.classList.add('ready');
 const name=el('h3','cx-result-heading',r.heading);name.id='cxResultTitle';
 const intro=el('p','cx-result-intro',r.description);
 const metric=el('div','cx-result-metric');metric.append(el('strong','',r.metric),el('span','',r.metricLabel));
 out.append(el('div','cx-result-kicker','Your takeaway · '+active),name,intro,metric,el('h4','cx-next-header','What to consider next'));
 const list=el('ol','cx-next-list');r.steps.forEach(x=>{const li=el('li');li.append(el('strong','',x.title),el('p','',x.explanation));list.append(li)});out.append(list);
 const cautions=el('div','cx-result-context');r.warnings.forEach(x=>cautions.append(el('p','',x)));out.append(cautions);
 const refs=el('div','cx-result-resources');refs.append(el('h4','','Helpful information'));links[active].forEach(([text,url])=>refs.append(makeLink(text,url)));out.append(refs);
 const actions=el('div','cx-result-actions'),b=(label,cls,fn)=>{const n=el('button',cls,label);n.type='button';n.addEventListener('click',fn);return n};
 actions.append(b('Talk with Smitha ↗','btn gold',()=>contact(r)),b('Text my questions','btn outline',()=>message(summary(r))),b('Copy my takeaway','cx-text-action',()=>copy(summary(r))),b('Print / save as PDF','cx-text-action',()=>window.print()));
 out.append(actions,el('p','cx-result-privacy','No information is sent to Smitha unless you choose to send it in your own app. A message draft is not a sent message.'));
 out.scrollIntoView({behavior:'smooth',block:'nearest'});
}
form.addEventListener('submit',e=>{e.preventDefault();renderResult(evaluators[active](values()))});
$('cxStartOver')?.addEventListener('click',()=>setTool(active));
document.querySelectorAll('[data-journey]').forEach(b=>b.addEventListener('click',()=>{setTool(b.dataset.journey);$('cxWorkspace')?.scrollIntoView({behavior:'smooth',block:'start'})}));
const selected=new URLSearchParams(location.search).get('tool');setTool(data[selected]?selected:'estate');
})();