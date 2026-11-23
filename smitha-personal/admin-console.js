(()=>{
'use strict';
const API='https://hello-smitha-guide-api.onrender.com';
const $=id=>document.getElementById(id);
const login=$('adminSignIn'),workspace=$('adminWorkspace'),status=$('adminLoginStatus'),form=$('adminSettings');
const formField=name=>form.elements.namedItem(name);
const token=()=>sessionStorage.getItem('smithaOwnerToken')||'';
let clientId='',editable=false;
async function api(path,method='GET',value){
 const response=await fetch(API+path,{method,headers:{'Authorization':'Bearer '+token(),...(value?{'Content-Type':'application/json'}:{})},...(value?{body:JSON.stringify(value)}:{})});
 let data={};try{data=await response.json()}catch{}
 if(!response.ok)throw Error(data.error||('service_error_'+response.status));
 return data;
}
function showLogin(message){workspace.hidden=true;login.hidden=false;status.textContent=message||''}
function put(name,value){const input=formField(name);if(!input)return;if(input.type==='checkbox')input.checked=value===true;else input.value=value??''}
function read(name){const input=formField(name);return input?.type==='checkbox'?Boolean(input.checked):String(input?.value||'').trim()}
function fill(settings){
 const c=settings.contact||{},n=settings.newsletter||{},fw=settings.forwarding||{};
 put('phone',c.phone?.e164);put('voiceVerified',c.phone?.verifiedForVoice);put('smsDraftEnabled',c.phone?.smsDraftEnabled);put('smsVerified',c.phone?.verifiedForSms);
 put('contactEmail',c.email?.address);put('emailVerified',c.email?.verified);
 for(const key of ['whatsapp','facebook','instagram','x','linkedin','tiktok','booking']){
  put(key,c[key]?.url);put(key+'Verified',c[key]?.verified)
 }
 put('forwardEmail',fw.email);put('forwardEnabled',fw.enabled);
 put('newsletterEnabled',n.enabled);put('newsletterTitle',n.title);put('newsletterDescription',n.description);put('newsletterFrequency',n.frequency||'Occasional')
}
function snapshot(){
 const links={};for(const key of ['whatsapp','facebook','instagram','x','linkedin','tiktok','booking'])links[key]={url:read(key),verified:read(key+'Verified')};
 return {
  contact:{
   phone:{e164:read('phone'),verifiedForVoice:read('voiceVerified'),verifiedForSms:read('smsVerified'),smsDraftEnabled:read('smsDraftEnabled')},
   email:{address:read('contactEmail'),verified:read('emailVerified')},...links
  },
  forwarding:{enabled:read('forwardEnabled'),email:read('forwardEmail')},
  newsletter:{enabled:read('newsletterEnabled'),title:read('newsletterTitle'),description:read('newsletterDescription'),frequency:read('newsletterFrequency')}
 }
}
async function loadOwner(){
 try{
  const [identity,settings]=await Promise.all([api('/api/admin/me'),api('/api/admin/config')]);
  login.hidden=true;workspace.hidden=false;editable=settings.editingConnected===true;
  $('adminSignedInAs').textContent='Signed in as '+identity.email;
  fill(settings.settings);
  document.dispatchEvent(new CustomEvent('smitha-owner-authorized',{detail:{email:identity.email}}));
  const save=$('adminSave');save.disabled=!editable;
  $('adminSaveStatus').textContent=editable?'':'Saving is not connected yet. The website owner must complete the private configuration.';
  return true;
 }catch(error){
  sessionStorage.removeItem('smithaOwnerToken');
  showLogin(error.message==='settings_unavailable'?'Owner access is verified, but settings could not be loaded. Please try again.':'An authorized account is required.');
  return false
 }
}
async function onCredential(response){
 if(!response?.credential)return;
 sessionStorage.setItem('smithaOwnerToken',response.credential);
 const ok=await loadOwner();
 if(!ok)status.textContent='This account is not authorized for Smitha’s settings.';
}
async function setup(){
 try{
  const response=await fetch(API+'/api/admin/public-setup',{cache:'no-store'});
  if(!response.ok)throw Error('private_signin_unavailable');
  const setup=await response.json();clientId=setup.clientId||'';
  if(!setup.loginConfigured||!clientId){showLogin('Owner sign-in is not activated yet. The authorized site owner needs to connect a verified Google sign-in.');return}
  if(token()&&await loadOwner())return;
  showLogin('');
  // Google's provider script can finish after this page's own deferred scripts.
  let tries=0;
  const render=()=>{
   if(window.google?.accounts?.id){
    google.accounts.id.initialize({client_id:clientId,callback:onCredential,auto_select:false,cancel_on_tap_outside:true});
    google.accounts.id.renderButton($('adminGoogleButton'),{type:'standard',theme:'outline',size:'large',text:'signin_with',shape:'rectangular',width:260});
    return;
   }
   if(++tries<30)setTimeout(render,300);
   else status.textContent='Could not load secure Google sign-in. Please reload or check browser privacy settings.';
  };
  render()
 }catch{showLogin('Could not contact the private sign-in service. Please try again later.')}
}
$('adminSignOut')?.addEventListener('click',()=>{
 sessionStorage.removeItem('smithaOwnerToken');
 if(window.google?.accounts?.id)google.accounts.id.disableAutoSelect();
 location.replace('index.html')
});
form.addEventListener('submit',async event=>{
 event.preventDefault();const state=$('adminSaveStatus');
 if(!editable){state.textContent='Private settings saving is not yet connected.';return}
 if(!form.reportValidity()){state.textContent='Please correct the highlighted fields.';return}
 $('adminSave').disabled=true;state.textContent='Saving settings…';
 try{const r=await api('/api/admin/config','PUT',snapshot());state.textContent=r.notice||'Settings saved.'}
 catch(error){state.textContent='Settings could not be saved: '+error.message}
 finally{$('adminSave').disabled=false}
});
$('adminLoadSubscribers')?.addEventListener('click',async()=>{
 const summary=$('adminSubscriberSummary'),list=$('adminSubscribers');summary.textContent='Checking subscriber list…';list.replaceChildren();
 try{
  const data=await api('/api/admin/subscribers');
  summary.textContent=data.count+' total subscriptions returned by the connected provider.';
  if(!data.results?.length){list.textContent='No records returned.';return}
  const table=document.createElement('table');table.className='admin-subscriber-table';
  const head=document.createElement('thead');const tr=document.createElement('tr');
  for(const v of ['Subscriber','Status','Date']){const th=document.createElement('th');th.textContent=v;tr.append(th)}head.append(tr);table.append(head);
  const body=document.createElement('tbody');
  for(const item of data.results){const tr=document.createElement('tr');for(const value of [item.email,item.status,item.date]){const td=document.createElement('td');td.textContent=value||'—';tr.append(td)}body.append(tr)}
  table.append(body);list.append(table)
 }catch{summary.textContent='Subscriber list is not connected or could not be loaded.'}
});
setup()
})();