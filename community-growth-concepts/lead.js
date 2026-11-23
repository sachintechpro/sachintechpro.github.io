(function(){
 'use strict';
 function bind(formId,type){
  const form=document.getElementById(formId);if(!form)return;
  const status=form.querySelector('[data-lead-status]'),submit=form.querySelector('button[type=submit]');
  form.addEventListener('submit',async function(event){
   event.preventDefault();
   if(!form.reportValidity())return;
   const data=Object.fromEntries(new FormData(form).entries());
   if(data.website)return;
   const payload={type,name:data.name||'',email:data.email||'',phone:data.phone||'',topic:data.topic||'',message:data.message||'',preferredTime:data.preferredTime||'',source:document.body.dataset.page||location.pathname,subscribe:!!data.subscribe,contactConsent:!!data.contactConsent,website:data.website||''};
   status.textContent='Sending securely…';status.hidden=false;
   submit.disabled=true;
   try{
    const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.ok)throw Error(result.error||'We could not send this request.');
    status.textContent=type==='subscribe'?'Thanks! Your subscription request has been sent to Nisha.':'Thank you! Your message has been sent to Nisha.';
    form.reset();
   }catch(error){status.textContent=(error.message||'Delivery unavailable.')+' You can email Nisha directly at nrawal@farmersagent.com.';}
   finally{submit.disabled=false;}
  });
 }
 bind('nishaLeadContact','contact');
 bind('nishaLeadSubscribe','subscribe');
})();