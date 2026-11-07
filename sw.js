const C='mae-v6',F=['./','index.html','three.module.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png','favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Stale-while-revalidate: serve the cached copy instantly, refresh it in the background.
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(caches.open(C).then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);if(hit){e.waitUntil(net);return hit}return net})))});
