// sw.js — tiny cache for ACI WV
const CACHE = "aciwv-v1";
const PRECACHE = [
  "/", "/index.html",
  "/wvdoh.html",
  "/topics/", "/topics/index.html",
  "/assets/aciwv_logo_body.png?v=5",
  "/assets/aciwv_logo_favicon_256x256.png",
  "/manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  if (e.request.method !== "GET" || !sameOrigin) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((resp) => {
        caches.open(CACHE).then((c) => c.put(e.request, resp.clone())).catch(() => {});
        return resp;
      }).catch(() => cached || caches.match("/wvdoh.html"));

      return cached || networkFetch;
    })
  );
});
