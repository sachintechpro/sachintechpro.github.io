(() => {
'use strict';
const cfg = window.SMITHA_SITE_CONFIG || {};
const phone = cfg.contact?.phone?.e164 || '+18186264474';
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
  if(callTile)callTile.querySelector('small')?.replaceChildren(document.createTextNode(displayPhone));
  if(textTile){
    const sm=textTile.querySelector('small');
    if(sm)sm.textContent = c.phone?.verifiedForSms ? 'Prepare a message' : 'Opens a text draft · delivery unverified';
  }
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
function addConversationPanel(){
  const main=document.querySelector('main'), foot=document.querySelector('footer');
  if(!main||!foot || document.getElementById('readyToConnect'))return;
  const sec=node('section','section smitha-conversion-section');
  sec.id='readyToConnect';sec.setAttribute('aria-label','Next step: connect with Smitha');
  const contain=node('div','container');
  const panel=node('div','smitha-conversion-panel');
  const copyBox=node('div','smitha-conversion-copy');
  copyBox.append(node('div','eyebrow','When you are ready'),
    node('h2','', 'A good conversation starts with one question.'),
    node('p','', 'You’ve been exploring '+topic.toLowerCase()+'. We can begin with what matters, who is affected, and which decision you want to make. No account information is needed here.'));
  const actions=node('div','smitha-conversion-actions');
  actions.append(link('☎ Call '+displayPhone,'btn smitha-call-action','tel:'+phone),
    link('✉ Text Smitha','btn gold smitha-text-action',smsUrl(introText())),
    button('Write a STAR introduction ↗','btn outline',talk),
    button('Share this guide','btn outline smitha-share-action',share));
  const extra=node('div','smitha-conversion-related');
  if(slug!=='estate'&&slug!=='trusts'){
    const a=link('Estate readiness: decisions and documents ↗','smitha-suggested','estate.html');
    extra.append(node('span','', 'A useful foundation for many families: '),a);
  } else {
    const a=link(slug==='estate'?'Explore living trusts & beneficiaries ↗':'Start with the estate essentials ↗',
       'smitha-suggested',slug==='estate'?'trusts.html':'estate.html');
    extra.append(a);
  }
  const kits=link('Save or print a free takeaway ↗','smitha-suggested',
    'handouts.html?topic='+(slug==='trusts'?'trusts':slug==='caregiving'?'caregiving':slug==='children'?'children':slug==='medicare'||slug==='retirement'?'retirement':'estate'));
  extra.append(document.createTextNode('  ·  '),kits);
  panel.append(copyBox,actions);contain.append(panel,extra);sec.append(contain);main.append(sec);
}
function addMobileQuickActions(){
  if(document.getElementById('smithaQuickActions'))return;
  const rail=node('nav','smitha-mobile-actions');
  rail.id='smithaQuickActions';rail.setAttribute('aria-label','Quick contact actions');
  rail.append(link('☎ Call','','tel:'+phone),link('✉ Text','',smsUrl(introText())),
    button('✦ Talk','',talk));
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