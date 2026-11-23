import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const root=path.resolve('smitha-personal');
const pages=fs.readdirSync(root).filter(x=>x.endsWith('.html')).sort();
const server=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const base='http://127.0.0.1:4173';
const errors=[],checks=[];
const verify=async(label,fn)=>{try{await fn();checks.push(label)}catch(e){errors.push(label+': '+e.message)}};
const browser=await chromium.launch();
const prep=async(width)=>{
 const ctx=await browser.newContext({viewport:{width,height:850},isMobile:width<=430,hasTouch:width<=430,reducedMotion:'reduce'});
 await ctx.route('https://**/*',route=>{
  const u=new URL(route.request().url());
  if(u.hostname==='hello-smitha-guide-api.onrender.com'){
   let obj={error:'uat-only'},code=200;
   if(u.pathname==='/health')obj={ok:true,newsletterConfigured:false,aiConfigured:false};
   if(u.pathname==='/api/inquiry/status')obj={enabled:false};
   if(u.pathname==='/api/admin/public-setup')obj={loginConfigured:false,clientId:''};
   if(u.pathname==='/api/chat'||u.pathname==='/api/admin/me')code=503;
   return route.fulfill({status:code,contentType:'application/json',body:JSON.stringify(obj),headers:{'access-control-allow-origin':base}});
  }
  return route.abort();
 });
 return ctx;
};
try{
 await new Promise(r=>setTimeout(r,800));
 for(const width of [320,390,768,1440]){
  const ctx=await prep(width),page=await ctx.newPage();
  for(const name of pages){
   await verify('layout '+width+' '+name,async()=>{
    const response=await page.goto(base+'/'+name,{waitUntil:'domcontentloaded',timeout:15000});
    assert.equal(response.status(),200);
    await page.waitForTimeout(125);
    const m=await page.evaluate(()=>({
     width:document.documentElement.clientWidth,
     content:document.documentElement.scrollWidth,
     bad:[...document.images].filter(x=>x.complete&&x.naturalWidth===0&&x.getBoundingClientRect().width>0).map(x=>x.src)
    }));
    assert(m.content<=m.width+3,'horizontal overflow: '+JSON.stringify(m));
    assert.equal(m.bad.length,0,'broken images: '+m.bad.join(','));
   });
  }
  await ctx.close();
 }
 const ctx=await prep(390),page=await ctx.newPage();
 await page.goto(base+'/experiences.html',{waitUntil:'load'});
 for(const key of ['home','baby','parent','age65','retiring','business']){
  await verify('situation '+key,async()=>{
   await page.locator('[data-example="'+key+'"]').click();
   assert(await page.locator('#cxStoryPreview').isVisible());
   for(const field of ['Situation','Goal','Explore','Outcome'])
    assert((await page.locator('#cxStory'+field).innerText()).length>8);
   await page.locator('#cxTryExample').click();
   assert(await page.locator('#cxExampleNote').isVisible());
   await page.locator('#cxEvaluate').click();
   assert(await page.locator('#cxResult').evaluate(x=>x.classList.contains('ready')));
   const actions=await page.locator('#cxResult .cx-result-actions button').allTextContents();
   assert.equal(actions.length,2);
   assert(actions.join(' ').includes('Talk with Smitha'));
   assert(!/copy|print|pdf/i.test(actions.join(' ')));
  });
 }
 await verify('start own choices',async()=>{
  await page.locator('[data-example="home"]').click();
  await page.locator('#cxStartOwn').click();
  assert.equal(await page.locator('#cx-financial').inputValue(),'');
 });
 await verify('takeaway to contact',async()=>{
  await page.locator('#cxEvaluate').click();
  await page.locator('#cxResult .cx-result-actions button').first().click();
  assert.equal(await page.locator('#connectModal').getAttribute('aria-hidden'),'false');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#connectModal').getAttribute('aria-hidden'),'true');
 });
 await verify('mobile navigation',async()=>{
  await page.goto(base+'/index.html',{waitUntil:'load'});
  await page.locator('#mobileToggle').click();
  assert.equal(await page.locator('#mobileToggle').getAttribute('aria-expanded'),'true');
  await page.locator('#mobileToggle').click();
  assert.equal(await page.locator('#mobileToggle').getAttribute('aria-expanded'),'false');
 });
 await verify('life stage wizard',async()=>{
  await page.goto(base+'/my-path.html',{waitUntil:'load'});
  await page.locator('[data-moment="family"]').click();
  await page.locator('[data-concern="money"]').click();
  assert(await page.locator('#pathResults').isVisible());
  assert.equal(await page.locator('#pathResultCards a').count(),3);
 });
 await verify('direct topic path',async()=>{
  await page.goto(base+'/experiences.html',{waitUntil:'load'});
  await page.locator('[data-journey="care"]').click();
  assert.equal(new URL(page.url()).searchParams.get('tool'),'care');
  await page.locator('#cxEvaluate').click();
  assert(await page.locator('#cxResult').evaluate(x=>x.classList.contains('ready')));
 });
 await page.goto(base+'/experiences.html',{waitUntil:'load'});
 fs.mkdirSync('uat-screenshots',{recursive:true});
 await page.screenshot({path:'uat-screenshots/phone-390.png',fullPage:true});
 await page.setViewportSize({width:1440,height:900});
 await page.screenshot({path:'uat-screenshots/desktop-1440.png',fullPage:true});
 await ctx.close();
}finally{await browser.close();server.kill('SIGTERM')}
console.log(JSON.stringify({pages:pages.length,widths:[320,390,768,1440],passed:checks.length,failed:errors.length,errors},null,2));
if(errors.length)process.exitCode=1;
