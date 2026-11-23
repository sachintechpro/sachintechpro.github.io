(()=>{
'use strict';
const host=document.getElementById('smithaMessageForm'),form=document.getElementById('smithaInquiry'),msg=document.getElementById('smithaInquiryStatus');
if(!host||!form||!msg)return;
const API='https://hello-smitha-guide-api.onrender.com';
fetch(API+'/api/inquiry/status',{cache:'no-store'}).then(r=>r.ok?r.json():{enabled:false}).then(state=>{
 host.hidden=state.enabled!==true;
}).catch(()=>{host.hidden=true});
form.addEventListener('submit',async e=>{
 e.preventDefault();msg.textContent='';msg.dataset.kind='';
 const email=form.elements.namedItem('replyEmail'),message=form.elements.namedItem('message'),consent=form.elements.namedItem('consent');
 if(!email.validity.valid||!message.validity.valid||!consent.checked){
  msg.textContent='Please add a valid reply email, a short message, and your consent to be contacted.';
  msg.dataset.kind='error';return
 }
 const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Sending…';
 const data={firstName:form.elements.namedItem('firstName').value,replyEmail:email.value,topic:form.elements.namedItem('topic').value,message:message.value,consent:consent.checked,website:form.elements.namedItem('website').value};
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
 try{
  const response=await fetch(API+'/api/inquiry/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:abort.signal});
  if(response.status===202){
   msg.textContent='Your note has been handed to the email service. Thank you for reaching out; delivery and a reply cannot be guaranteed.';
   msg.dataset.kind='success';form.reset();
  }else{
   msg.textContent='Your note could not be sent. Please use Call, Text, or another contact option above.';
   msg.dataset.kind='error';
  }
 }catch{
  msg.textContent='Your note could not be sent. Please choose another contact method above.';
  msg.dataset.kind='error';
 }finally{clearTimeout(timer);button.disabled=false;button.textContent='Send my note to Smitha'}
});
})();