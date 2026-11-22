const CACHE_NAME = 'demoguide-shell-v1';
const SHELL = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin) return;
  event.respondWith(fetch(req).then(response=>{
    if(response.ok && (req.destination==='document'||['script','style','manifest','image'].includes(req.destination))){
      const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,clone)).catch(()=>{});
    }
    return response;
  }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});