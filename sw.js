// 오프라인에서도 열리도록 앱 파일을 캐시합니다. 파일을 수정해 올릴 때는 VERSION 숫자를 올려 주세요.
const VERSION = 'scheduler-v16';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패하면 캐시 (수정본이 바로 반영되고, 오프라인이면 캐시로 열림)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // 구글 폰트·GitHub API 등은 건드리지 않음
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })   // 브라우저 임시저장본이 아니라 항상 최신 파일을 받음
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
