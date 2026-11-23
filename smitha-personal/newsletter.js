(()=>{
'use strict';
const footer=document.querySelector('footer.foot');
if(!footer||document.getElementById('notes-from-smitha'))return;
const section=document.createElement('section');section.className='smitha-notes-section';section.id='notes-from-smitha';
section.setAttribute('aria-labelledby','smitha-notes-title');
section.innerHTML='<div class="container smitha-notes-layout">'+
 '<div class="smitha-notes-copy">'+
 '<div class="eyebrow">Notes from Smitha</div>'+
 '<h2 id="smitha-notes-title">A little clarity in your inbox.</h2>'+
 '<p>Occasional, thoughtful notes on family, home, estate questions, caregiving and planning ahead. One useful idea at a time—no sales pitch.</p>'+
 '<div class="smitha-notes-preview"><span>Family &amp; home</span><span>Living trusts</span><span>Parents &amp; retirement</span></div>'+
 '</div>'+
 '<form class="smitha-notes-form" id="newsletterSignup" novalidate>'+
 '<label for="newsletterEmail">Where should I send my notes?</label>'+
 '<div class="smitha-notes-entry"><input id="newsletterEmail" name="email" type="email" autocomplete="email" inputmode="email" enterkeyhint="done" autocapitalize="off" spellcheck="false" maxlength="254" placeholder="Your email address" required aria-describedby="newsletterNote newsletterStatus"/>'+
 '<button id="newsletterSubmit" type="submit">Subscribe</button></div>'+
 '<label class="smitha-notes-consent" for="newsletterConsent"><input type="checkbox" name="consent" id="newsletterConsent" required/><span>Yes, I would like occasional educational emails from Smitha. I can unsubscribe at any time.</span></label>'+
 '<div class="smitha-notes-honeypot" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden"><label for="newsletterWebsite">Leave this field empty</label><input id="newsletterWebsite" type="text" name="website" tabindex="-1" autocomplete="off"></div>'+
 '<p class="smitha-notes-note" id="newsletterNote">Please check your inbox to confirm your subscription. You can unsubscribe at any time.</p>'+
 '<p class="smitha-notes-status" id="newsletterStatus" role="status" aria-live="polite"></p>'+
 '</form></div>';
footer.parentNode.insertBefore(section,footer);
const owner=window.SMITHA_SITE_CONFIG?.newsletter||{};
if(owner.enabled===false){section.remove();return}
if(owner.title)section.querySelector('h2').textContent=owner.title;
if(owner.description)section.querySelector('.smitha-notes-copy>p').textContent=owner.description;

const form=document.getElementById('newsletterSignup');
const email=document.getElementById('newsletterEmail');
const consent=document.getElementById('newsletterConsent');
const status=document.getElementById('newsletterStatus');
const button=document.getElementById('newsletterSubmit');
const endpoint='https://hello-smitha-guide-api.onrender.com/api/newsletter/subscribe';
form.addEventListener('submit',async event=>{
 event.preventDefault();
 status.textContent='';status.dataset.kind='';
 const address=email.value.trim();
 if(!email.validity.valid||!address){status.textContent='Please enter a valid email address.';status.dataset.kind='error';email.focus();return}
 if(!consent.checked){status.textContent='Please check the box if you would like to receive Smitha’s notes.';status.dataset.kind='error';consent.focus();return}
 button.disabled=true;button.textContent='Submitting…';
 let controller=null,timeout=null;
 try{
  controller=new AbortController();
  timeout=setTimeout(()=>controller.abort(),15000);
  const response=await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:address,consent:true,website:document.getElementById('newsletterWebsite')?.value||''}),
    signal:controller.signal
  });
  if(response.status===202||response.ok){
   status.textContent='If the address is eligible, you’ll receive a confirmation email. Please check your inbox to finish subscribing.';
   status.dataset.kind='success';
   form.reset();
  }else if(response.status===503){
   status.textContent='Newsletter signup is not connected yet. You can still reach Smitha from the Contact page.';
   status.dataset.kind='error';
  }else if(response.status===429){
   status.textContent='Too many attempts. Please try again later.';
   status.dataset.kind='error';
  }else{
   status.textContent='We could not process the request. No subscription is confirmed; please try again later.';
   status.dataset.kind='error';
  }
 }catch{
  status.textContent='The subscription service could not be reached. Nothing was subscribed. Please try again later.';
  status.dataset.kind='error';
 }finally{
  if(timeout)clearTimeout(timeout);
  button.disabled=false;button.textContent='Subscribe';
 }
});
})();