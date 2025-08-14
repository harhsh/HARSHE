const CACHE_NAME = 'harsha-pro-v1';
const ASSETS = [
  './','./index.html','./manifest.webmanifest',
  './assets/images/banner-jobs.svg','./assets/images/banner-services.svg','./assets/images/banner-study.svg',
  './assets/logo/logo-128.png','./assets/logo/logo-512.png',
  './app.js','./data/jobs.json','./data/admit_cards.json','./data/official_links.json','./data/services.json'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(resp=> resp || fetch(e.request).then(f=>{
      const copy = f.clone();
      caches.open(CACHE_NAME).then(c=> c.put(e.request, copy));
      return f;
    }).catch(()=> caches.match('./index.html')))
  );
});
