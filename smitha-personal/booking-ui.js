(()=>{
'use strict';
const cfg=window.SMITHA_SITE_CONFIG||{},contact=cfg.contact||{},p=cfg.introductionCall||{};
const zone=p.timezone||'America/Los_Angeles',duration=Number(p.durationMinutes)||15;
const phone=/^\+[1-9]\d{7,14}$/.test(contact.phone?.e164||'')?contact.phone.e164:'';
const sms=!!phone&&(contact.phone?.verifiedForSms===true||contact.phone?.smsDraftEnabled===true);
const email=contact.email?.verified&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.address||'')?contact.email.address:'';
const getEl=id=>document.getElementById(id);
const E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const cfgDays=Array.isArray(p.weekdayStarts)?p.weekdayStarts:[1,2,3,4,5];
const weekdays=new Set(cfgDays.filter(x=>Number.isInteger(x)&&x>=1&&x<=5));
const minOffset=Math.max(1,Number(p.daysAheadMinimum)||1),maxOffset=Math.max(minOffset+1,Math.min(180,Number(p.daysAheadMaximum)||60));
const formatter=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
function currentLA(){const parts=Object.fromEntries(formatter.formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day))}
const today=currentLA(),start=new Date(today.getTime()+minOffset*86400000),end=new Date(today.getTime()+maxOffset*86400000);
const key=date=>date.toISOString().slice(0,10);
const fromKey=s=>new Date(s+'T00:00:00Z');
const fmt=date=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(date);
const monthLabel=date=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',year:'numeric'}).format(date);
const dlabel=date=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'short'}).format(date);
const hourLabel=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h>=12?'PM':'AM')};
function availableDay(d){return d>=start&&d<=end&&weekdays.has(d.getUTCDay())}
function safeBooking(){
 if(!contact.booking?.verified||!contact.booking?.url)return '';
 try{const u=new URL(contact.booking.url);
  const domains=['calendly.com','acuityscheduling.com','youcanbook.me','calendar.google.com','cal.com','zcal.co'];
  return u.protocol==='https:'&&domains.some(d=>u.hostname===d||u.hostname==='www.'+d)?u.href:'';
 }catch{return ''}
}
function intro(day,time){
 const subject=document.body.dataset.topic?document.body.dataset.topic.replaceAll('-',' '):'my goals';
 return 'Hello Smitha, I would like to request a friendly '+duration+'-minute introduction call on '+fmt(fromKey(day))+' at '+hourLabel(time)+' Pacific (Los Angeles time). I was exploring '+subject+'. Please confirm whether this works or suggest another time. No appointment has been booked yet.';
}
function smsHref(message){return 'sms:'+phone+(/iPhone|iPad|iPod/.test(navigator.userAgent)?'&':'?')+'body='+encodeURIComponent(message)}
function copy(message){
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(message).then(()=>window.smithaToast?.('Request copied.')).catch(()=>window.prompt('Copy your request:',message));
 else window.prompt('Copy your request:',message);
}
function requestByText(message){if(!sms){copy(message);window.smithaToast?.('Text not connected; request copied instead.');return}location.href=smsHref(message)}
function requestByEmail(message){
 if(!email){requestByText('Hi Smitha, may I have your preferred email address for this introduction-call request?\n\n'+message);return}
 location.href='mailto:'+email+'?subject='+encodeURIComponent('15-minute introduction call — preferred time')+'&body='+encodeURIComponent(message);
}
function tile(label,note,symbol,action,href){
 const el=E(href?'a':'button','smitha-contact-choice book-choice');
 if(href){el.href=href;if(href.startsWith('https:')){el.target='_blank';el.rel='noopener noreferrer'}}
 else{el.type='button';el.addEventListener('click',action)}
 const i=E('span','smitha-choice-icon',symbol),txt=E('span','smitha-choice-copy');
 txt.append(E('strong','',label),E('small','',note));el.append(i,txt);return el;
}
function buildCalendar(host){
 const root=E('div','smitha-scheduler');host.append(root);
 const lead=E('p','smitha-schedule-intro','Choose a preferred date and time for a friendly '+duration+'-minute phone introduction. No sales presentation or obligation.');
 const caveat=E('p','smitha-schedule-caveat','Times below are suggested request windows, not Smitha’s live availability. All times are Pacific (Los Angeles).');
 root.append(lead,caveat);
 const live=safeBooking();
 if(live){
  const l=tile('Open Smitha’s live booking calendar','See actual availability and get a confirmation','◷',null,live);
  l.classList.add('smitha-live-calendar-link');root.append(l);
 }
 let firstValid=new Date(start);while(firstValid<=end&&!availableDay(firstValid))firstValid=new Date(firstValid.getTime()+86400000);
 let month=new Date(Date.UTC(firstValid.getUTCFullYear(),firstValid.getUTCMonth(),1)),selectedDay='',selectedTime='';
 const heading=E('div','smitha-month-head'),back=E('button','smitha-month-arrow','‹'),next=E('button','smitha-month-arrow','›'),caption=E('strong','smitha-month-label');
 back.type='button';next.type='button';back.setAttribute('aria-label','Previous month');next.setAttribute('aria-label','Next month');
 heading.append(back,caption,next);
 const days=E('div','smitha-calendar-grid');days.setAttribute('role','group');days.setAttribute('aria-label','Choose a preferred call date');
 const timeHeading=E('h3','smitha-time-heading','Choose a preferred start time');
 const slots=E('div','smitha-time-slots');
 const result=E('p','smitha-booking-summary');result.setAttribute('role','status');result.setAttribute('aria-live','polite');
 const choices=E('div','smitha-booking-submit');
 const smsBtn=E('button','btn gold','Request by text');
 const emailBtn=E('button','btn outline',email?'Request by email':'Ask for email by text');
 const copyBtn=E('button','btn outline','Copy request');
 for(const b of [smsBtn,emailBtn,copyBtn])b.type='button';
 choices.append(smsBtn,emailBtn,copyBtn);
 const error=E('p','smitha-booking-warning');
 error.setAttribute('role','status');
 root.append(heading,days,timeHeading,slots,result,choices,error);
 function valid(){return !!(selectedDay&&selectedTime)}
 function refresh(){
  const message=valid()?'Preferred: '+fmt(fromKey(selectedDay))+', '+hourLabel(selectedTime)+' Pacific. Smitha must confirm this time.':'Select a date and time to prepare your request.';
  result.textContent=message;
  smsBtn.disabled=!valid()||!sms;smsBtn.hidden=!sms;
  emailBtn.disabled=!valid();copyBtn.disabled=!valid();
  error.textContent=!sms&&!email?'You can copy the request and call Smitha to arrange a time.':'Your preferred time is a request—not a reservation.';
 }
 function showTimes(){
  slots.replaceChildren();
  const minHour=Math.max(8,Number(p.earliestHour)||9),lastHour=Math.min(18,Number(p.latestStartHour)||16);
  const step=[15,30,60].includes(+p.intervalMinutes)?+p.intervalMinutes:30;
  const from=minHour*60,to=lastHour*60;
  for(let t=from;t<=to;t+=step){
   const label=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
   if(t>=720&&t<780)continue; // leave a midday break as a proposed request window
   const btn=E('button','smitha-time-chip'+(selectedTime===label?' selected':''),hourLabel(label));
   btn.type='button';btn.disabled=!selectedDay;btn.setAttribute('aria-pressed',selectedTime===label?'true':'false');
   btn.addEventListener('click',()=>{selectedTime=label;showTimes();refresh()});slots.append(btn);
  }
 }
 function draw(){
  caption.textContent=monthLabel(month);days.replaceChildren();
  for(const label of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])days.append(E('span','smitha-calendar-weekday',label));
  const first=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),1));
  const blanks=(first.getUTCDay()+6)%7;
  for(let i=0;i<blanks;i++)days.append(E('span','smitha-calendar-blank'));
  const total=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
  for(let d=1;d<=total;d++){
   const date=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),d)),iso=key(date);
   const btn=E('button','smitha-calendar-day'+(selectedDay===iso?' selected':''),String(d));
   btn.type='button';btn.disabled=!availableDay(date);
   btn.setAttribute('aria-label',fmt(date)+(btn.disabled?', unavailable for a preferred-time request':''));
   btn.setAttribute('aria-pressed',selectedDay===iso?'true':'false');
   if(!btn.disabled)btn.addEventListener('click',()=>{selectedDay=iso;selectedTime='';draw();showTimes();refresh()});
   days.append(btn);
  }
  const previous=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()-1,1));
  const nextMonth=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1));
  back.disabled=previous<new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),1));
  next.disabled=nextMonth>new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),1));
 }
 back.addEventListener('click',()=>{month=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()-1,1));draw()});
 next.addEventListener('click',()=>{month=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1));draw()});
 smsBtn.addEventListener('click',()=>{if(valid())requestByText(intro(selectedDay,selectedTime))});
 emailBtn.addEventListener('click',()=>{if(valid())requestByEmail(intro(selectedDay,selectedTime))});
 copyBtn.addEventListener('click',()=>{if(valid())copy(intro(selectedDay,selectedTime))});
 draw();showTimes();refresh();
 return {focus(){heading.scrollIntoView({block:'start',behavior:'smooth'})},getState(){return {day:selectedDay,time:selectedTime}},getHost(){return root}};
}
// Contact chooser: put four immediate actions first, leave social channels accessible below.
const modal=document.getElementById('connectModal'),grid=modal?.querySelector('.channel-grid');
if(grid&&modal){
 const call=[...grid.children].find(x=>x.textContent.includes('Call Smitha'));
 const text=[...grid.children].find(x=>x.textContent.includes('Send a text'));
 const primary=E('div','smitha-primary-contact');
 const emailTile=tile('Email Smitha',email?'Open an email draft':'Ask for email by text','@',()=>{
   if(!email)requestByText('Hi Smitha, what email address should I use to reach you privately?');
 },email?'mailto:'+email+'?subject='+encodeURIComponent('A quick introduction to Smitha'):'');
 const bookTile=tile('Book 15 minutes','Select date and preferred time','◷',()=>openBooking(),null);
 if(call&&text){primary.append(emailTile,text,call,bookTile);grid.parentNode.insertBefore(primary,grid)}
 grid.classList.add('smitha-social-grid');
 const label=E('div','smitha-social-label','Or message through a social app');
 grid.parentNode.insertBefore(label,grid);
 const holder=E('details','smitha-booking-details'),summary=E('summary','smitha-booking-toggle','Choose a date & time for a 15-minute call');
 holder.append(summary);const host=E('div','smitha-calendar-box');holder.append(host);
 const optional=modal.querySelector('.smitha-contact-details');
 if(optional)optional.parentNode.insertBefore(holder,optional);else grid.parentNode.append(holder);
 const calendar=buildCalendar(host);
 function openBooking(){holder.open=true;calendar.focus()}
}
// Dedicated contact page: use same date/time rules and channel routing.
const pageCalendar=getEl('smithaContactCalendar');
if(pageCalendar){buildCalendar(pageCalendar)}
const ways=getEl('smithaContactWays');
if(ways){
 const cards=[
  tile('Email',email?'Write to Smitha privately':'Ask for her email by text','@',()=>{if(!email)requestByText('Hi Smitha, may I have your preferred email address for a quick introduction?')},email?'mailto:'+email+'?subject='+encodeURIComponent('A quick introduction'):''),
  tile('Text',sms?'Open your messages app':'Copy a message','✉',()=>requestByText('Hi Smitha, I would love a quick 15-minute introduction call. Could you suggest a convenient time?'),null),
  tile('Call','Open your phone app','☎',()=>{if(phone)location.href='tel:'+phone},null),
  tile('Book 15 min','Select date and preferred time','◷',()=>{const booking=getEl('smithaContactCalendar');booking?.scrollIntoView({behavior:'smooth',block:'start'})},null)
 ];
 ways.append(...cards);
}
})();