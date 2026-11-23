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
  link.textContent='Admin';link.setAttribute('aria-label','Private owner settings');
  const cta=nav.querySelector('.navcta');
  if(cta)nav.insertBefore(link,cta);else nav.append(link);
  const small=link.cloneNode(true);small.className='smitha-admin-header-link smitha-admin-mobile-link';
  const toggle=document.getElementById('mobileToggle');
  if(toggle)header.insertBefore(small,toggle);else header.append(small);
 }).catch(()=>{});
})();