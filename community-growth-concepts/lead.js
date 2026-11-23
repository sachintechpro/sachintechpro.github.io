(function(){
  'use strict';
  // Demo-only: never transmit or persist visitor-entered information.
  function bind(formId,type){
    const form=document.getElementById(formId);
    if(!form)return;
    const status=form.querySelector('[data-lead-status]');
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(!form.reportValidity())return;
      // Simulate the happy path locally. No fetch, email, SMS, database or analytics.
      status.hidden=false;
      status.setAttribute('data-demo-success','true');
      status.textContent=type==='subscribe'
        ? '✓ Subscription demo completed! In a live version, Nisha would receive an email and text alert. This demo did not send or save your information.'
        : '✓ Connection request demo completed! In a live version, Nisha would receive an email and text alert. This demo did not send or save your information.';
      form.reset();
    });
  }
  bind('nishaLeadContact','contact');
  bind('nishaLeadSubscribe','subscribe');
})();