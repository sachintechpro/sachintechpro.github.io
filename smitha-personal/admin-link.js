(()=>{
 'use strict';
 const token=sessionStorage.getItem('smithaOwnerToken');
 if(!token)return;
 fetch('https://hello-smitha-guide-api.onrender.com/api/admin/me',{headers:{Authorization:'Bearer '+token},cache:'no-store'})
 .then(async response=>{
  if(!response.ok){sessionStorage.removeItem('smithaOwnerToken');return}
  const admin=await response.json();
  if(!admin.authorized)return;
  const nav=document.getElementById('mainNav'),header=document.querySelector('.topbar > .container');
  if(!nav||!header||document.querySelector('.smitha-admin-header-link'))return;
  const link=document.createElement('a');link.href='admin.html';link.className='smitha-admin-header-link';
  let due=0;
  try{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
    const date=parts.year+'-'+parts.month+'-'+parts.day;
    const saved=JSON.parse(localStorage.getItem('smitha_public_connections_v1_'+admin.email.toLowerCase())||'[]');
    due=Array.isArray(saved)?saved.filter(item=>item&&typeof item.next==='string'&&item.next<=date).length:0;
  }catch{}
  link.textContent=due?'Admin · '+due+' to review':'Admin';
  link.setAttribute('aria-label','Private owner settings'+(due?' — '+due+' connections to review':''));
  const cta=nav.querySelector('.navcta');
  if(cta)nav.insertBefore(link,cta);else nav.append(link);
  const small=link.cloneNode(true);small.className='smitha-admin-header-link smitha-admin-mobile-link';
  const toggle=document.getElementById('mobileToggle');
  if(toggle)header.insertBefore(small,toggle);else header.append(small);
 }).catch(()=>{});
})();