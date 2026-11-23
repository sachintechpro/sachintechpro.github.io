(() => {
'use strict';
const cfg = window.SMITHA_SITE_CONFIG || {};
const phone = /^\+[1-9]\d{7,14}$/.test(cfg.contact?.phone?.e164||'') ? cfg.contact.phone.e164 : '+18186264474';
const displayPhone = cfg.contact?.phone?.display || '(818) 626-4474';
const path = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i,'');
const slug = document.body.dataset.topic || path;
const titles = {
  index:'What matters to your family',estate:'Estate planning and decision-makers',
  trusts:'Living trusts and beneficiaries',marriage:'Marriage and shared goals',
  children:"Children's future", 'family-protection':'Family protection',
  'long-term-protection':'Long-term policy value and protection',
  income:'Income interruptions',home:'Homeownership',retirement:'Retirement planning',
  'later-life':'Later-life care',caregiving:'Caring for older family',
  medicare:'Medicare Part B',legacy:'Legacy and final wishes',
  business:'Business continuity',foundations:'Financial foundations',
  grow:'Entrepreneurship and community',plan:'Your next chapter',
  'my-path':'Your life-stage starting points',explore:'Life planning',resources:'Reliable resources',
  handouts:'Educational takeaways','outreach-kit':'Helpful conversation templates'
};
const topic = titles[slug] || document.querySelector('main h1')?.textContent?.trim() || 'your priorities';
function smsUrl(message) {
  const joiner = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
  return 'sms:' + phone + joiner + 'body=' + encodeURIComponent(message);
}
function introText() {
  return 'Hello Smitha, I was reading about ' + topic.toLowerCase() +
    '. I would appreciate a friendly conversation about what to prepare and my next step.';
}
function copy(text, success) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text)
    .then(() => window.smithaToast?.(success || 'Copied.'))
    .catch(() => window.prompt('Copy this text:', text));
  else window.prompt('Copy this text:', text);
}
function node(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent !== undefined) el.textContent = textContent;
  return el;
}
function button(text, className, action) {
  const b = node('button', className, text);
  b.type = 'button';
  b.addEventListener('click', action);
  return b;
}
function link(text, className, href) {
  const a = node('a', className, text);
  a.href = href; return a;
}
function talk() {
  if (typeof window.openSmithaContact === 'function') window.openSmithaContact(introText());
  else location.href = smsUrl(introText());
}
function share() {
  const label = 'Smitha Rangaswamy — ' + topic;
  const detail = 'A practical checklist and questions to consider: ' + location.href;
  if (navigator.share) navigator.share({title:label,text:detail,url:location.href})
    .catch(e => { if(e?.name !== 'AbortError') copy(location.href,'Guide link copied.'); });
  else copy(location.href,'Guide link copied.');
}
function verifiedLink(item) {
  if (!item?.verified || typeof item.url !== 'string') return '';
  try {
    const u = new URL(item.url);
    return u.protocol === 'https:' && !u.hostname.endsWith('.example') ? u.href : '';
  } catch {return '';}
}
function addVerifiedContactChannels() {
  const grid = document.querySelector('#connectModal .channel-grid');
  if (!grid || !cfg.contact) return;
  const c = cfg.contact;
  const items = [
    ['Email',c.email,'✉',c.email?.address && c.email?.verified ?
      'mailto:' + c.email.address + '?subject=' + encodeURIComponent('A question about '+topic):''],
    ['WhatsApp',c.whatsapp,'◉',verifiedLink(c.whatsapp)],
    ['Facebook DM',c.facebook,'f',verifiedLink(c.facebook)],
    ['Instagram DM',c.instagram,'◎',verifiedLink(c.instagram)],
    ['LinkedIn',c.linkedin,'in',verifiedLink(c.linkedin)],
    ['X',c.x,'𝕏',verifiedLink(c.x)],
    ['TikTok',c.tiktok,'♪',verifiedLink(c.tiktok)],
    ['Book a conversation',c.booking,'◷',verifiedLink(c.booking)]
  ];
  items.forEach(([label,settings,icon,url]) => {
    if (!url) return; // Test-data placeholders are deliberately non-clickable.
    const a = link('', 'channel ready smitha-config-channel', url);
    a.setAttribute('aria-label', label + ' with Smitha');
    if (url.startsWith('https:')) { a.target='_blank';a.rel='noopener noreferrer';}
    a.append(node('span','symbol',icon),node('span','',label),
      node('small','',label==='Email'?'Draft an email':'Open '+label));
    grid.append(a);
  });
  const callTile=document.getElementById('callSmitha');
  const textTile=document.getElementById('sendSms');
  const requestTime=document.getElementById('requestTime');
  const textIntro=document.getElementById('sendSms2');
  const enabledSms=c.phone?.verifiedForSms===true||c.phone?.smsDraftEnabled===true;
  if(callTile)callTile.querySelector('small')?.replaceChildren(document.createTextNode('Opens your phone app'));
  if(textTile){textTile.hidden=!enabledSms;textTile.style.display=enabledSms?'':'none';const small=textTile.querySelector('small');if(small)small.textContent='Text draft · delivery not yet confirmed';}
  if(textIntro){textIntro.hidden=!enabledSms;textIntro.style.display=enabledSms?'':'none';}
  if(requestTime){
    const calendar=verifiedLink(c.booking);
    const label=requestTime.querySelector('span:not(.symbol)');
    const small=requestTime.querySelector('small');
    if(label)label.textContent=calendar?'Choose a time':enabledSms?'Request a time':'Arrange by phone';
    if(small)small.textContent=calendar?'Opens the booking calendar':enabledSms?'Prepare a text request':'Arrange privately by call';
  }
  // Owner configuration is the single contact source, including links originally authored in HTML.
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:'+phone});
  // Update printed numbers too; modifying the owner configuration must not leave old numbers on the page.
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const numberNodes=[];
  while(walker.nextNode()){
    const t=walker.currentNode;
    if(t.parentElement?.closest('script,style,textarea'))continue;
    if(/\(?818\)?[\s.\-]*626[\s.\-]*4474/.test(t.textContent))numberNodes.push(t);
  }
  numberNodes.forEach(t=>{t.textContent=t.textContent.replace(/\(?818\)?[\s.\-]*626[\s.\-]*4474/g,displayPhone)});

}
function addNavigation() {
  const nav=document.querySelector('#mainNav');
  if(nav && !nav.querySelector('[href="handouts.html"]')){
    const a=link('Free takeaways','','handouts.html');
    const contact=nav.querySelector('[data-open-contact]');
    if(contact)nav.insertBefore(a,contact); else nav.append(a);
  }
  const foot=document.querySelector('.footlinks');
  if(foot && !foot.querySelector('[href="handouts.html"]')) foot.append(link('Shareable handouts','','handouts.html'));
}
const handoutMap = {
 estate:'estate',trusts:'trusts',children:'children',caregiving:'caregiving',
 'later-life':'retirement',medicare:'retirement',retirement:'retirement',business:'business'
};
const contextualAdvice={
 estate:{title:'Ready to organize your family’s decisions?',desc:'Bring your questions about decision-makers and beneficiaries to a conversation. A qualified California estate attorney should advise on legal documents.',nextText:'Explore living trusts and beneficiaries',nextHref:'trusts.html'},
 trusts:{title:'Wondering whether a trust makes sense?',desc:'Review how assets, successor trustees and beneficiary instructions work together. A qualified California estate attorney is the right professional for trust formation.',nextText:'Start with estate-planning essentials',nextHref:'estate.html'},
 children:{title:'Planning for a child’s future?',desc:'Consider education goals alongside guardianship, beneficiary updates, household responsibilities and an emergency plan.',nextText:'Review family protection',nextHref:'family-protection.html'},
 caregiving:{title:'Helping someone you care about?',desc:'Start with the person’s wishes, daily care needs, decision-making authority and the support family members can realistically provide.',nextText:'Explore later-life care',nextHref:'later-life.html'},
 medicare:{title:'Facing a Medicare enrollment decision?',desc:'Enrollment deadlines can have consequences. Check Medicare or Social Security guidance for your circumstances before making a coverage decision.',nextText:'Check official Part B enrollment timing',nextHref:'https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare'},
 retirement:{title:'Thinking about life after work?',desc:'Start with your expected income sources, changing expenses, healthcare decisions and your need for flexibility.',nextText:'Review Medicare Part B timing',nextHref:'medicare.html'},
 business:{title:'Who could step in if you were unavailable?',desc:'Think through business continuity, decision-making authority, ownership arrangements, and the costs of an interruption.',nextText:'Explore your continuity checklist',nextHref:'handouts.html?topic=business'},
 'family-protection':{title:'Who depends on your financial support?',desc:'Consider ongoing family needs, existing resources, coverage terms and the people who may need help.',nextText:'Explore children and education goals',nextHref:'children.html'},
 'later-life':{title:'How would you prefer to receive care?',desc:'Think about trusted helpers, daily support, expected costs and documents to discuss with a qualified professional.',nextText:'Explore caregiving essentials',nextHref:'caregiving.html'}
};
function addConversationPanel(){
  if(slug==='outreach-kit')return; // Owner draft editor is separate from the visitor journey.
  const main=document.querySelector('main'),foot=document.querySelector('footer');
  if(!main||!foot||document.getElementById('readyToConnect'))return;
  const ctx=contextualAdvice[slug]||{
    title:'What would help you take the next step?',
    desc:'You have been exploring '+topic.toLowerCase()+'. A focused conversation can clarify what to prepare and which professional should help.',
    nextText:'Browse related life-stage topics',nextHref:'explore.html'
  };
  const sec=node('section','section smitha-conversion-section');
  sec.id='readyToConnect';sec.setAttribute('aria-label','Next step: connect with Smitha');
  const contain=node('div','container'),panel=node('div','smitha-conversion-panel'),copyBox=node('div','smitha-conversion-copy');
  copyBox.append(node('div','eyebrow','Your next step'),node('h2','',ctx.title),node('p','',ctx.desc));
  const actions=node('div','smitha-conversion-actions');
  actions.append(link('☎ Call Smitha','btn smitha-call-action','tel:'+phone));
  if(cfg.contact?.phone?.verifiedForSms===true||cfg.contact?.phone?.smsDraftEnabled===true)
    actions.append(link('✉ Text Smitha','btn gold smitha-text-action',smsUrl(introText())));
  else actions.append(button('Copy my question','btn gold',()=>copy(introText(),'Conversation starter copied.')));
  const booking=verifiedLink(cfg.contact?.booking);
  if(booking)actions.append(link('Choose a conversation time','btn outline',booking));
  actions.append(button('Share a STAR introduction ↗','btn outline',talk));
  const extra=node('div','smitha-conversion-related');
  const next=link(ctx.nextText+' ↗','smitha-suggested',ctx.nextHref);
  if(ctx.nextHref.startsWith('https:')){next.target='_blank';next.rel='noopener noreferrer';}
  extra.append(next);
  const handout=handoutMap[slug];
  if(handout){
    extra.append(document.createTextNode('  ·  '),
      link('Save the related takeaway ↗','smitha-suggested','handouts.html?topic='+handout));
  }else if(slug!=='handouts'){
    extra.append(document.createTextNode('  ·  '),
      link('Browse free educational takeaways ↗','smitha-suggested','handouts.html'));
  }
  panel.append(copyBox,actions);contain.append(panel,extra);sec.append(contain);main.append(sec);
}
function addMobileQuickActions(){
  if(slug==='outreach-kit'||document.getElementById('smithaQuickActions'))return;
  const rail=node('nav','smitha-mobile-actions');
  rail.id='smithaQuickActions';rail.setAttribute('aria-label','Quick ways to reach Smitha');
  rail.append(link('☎ Call','','tel:'+phone));
  if(cfg.contact?.phone?.verifiedForSms===true||cfg.contact?.phone?.smsDraftEnabled===true)rail.append(link('✉ Text','',smsUrl(introText())));
  else rail.append(button('✎ Copy note','',()=>copy(introText(),'Conversation starter copied.')));
  rail.append(button('✦ Ask','',()=>document.getElementById('chatLaunch')?.click()));
  rail.append(button('Connect','',talk));
  document.body.append(rail);
}
function addExampleJourneys(){
  if(slug!=='index'||!cfg.sampleJourneys?.length)return;
  const section=document.querySelector('main .journey-cards')?.closest('.section');
  if(!section||section.querySelector('.smitha-examples'))return;
  const wrap=node('div','container smitha-examples');
  wrap.append(node('div','eyebrow','A few everyday situations'),
    node('h2','','Where would you begin?'));
  const grid=node('div','smitha-example-grid');
  cfg.sampleJourneys.slice(0,4).forEach(item=>{
    const a=link('','smitha-example',''+item.topic+'.html');
    a.append(node('strong','',item.label),node('p','',item.situation),
      node('span','', 'Explore questions ↗'));
    grid.append(a);
  });
  wrap.append(grid,node('p','micro','These are illustrative situations, not customer stories or testimonials.'));
  section.append(wrap);
}
function run(){
  addVerifiedContactChannels();
  addNavigation();
  addConversationPanel();
  addMobileQuickActions();
  addExampleJourneys();
}
run();
})();