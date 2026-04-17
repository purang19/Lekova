/* K-Connect service worker — minimal offline-first shell */
const CACHE = "kconnect-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./api.js",
    "./mock-data.js",
    "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (e) => {
    const req = e.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);

    // Network-first for live PMS calls so profiles stay fresh.
    if (url.pathname.startsWith("/api/")) {
        e.respondWith(fetch(req).catch(() => new Response(null, { status: 504 })));
        return;
    }

    // Cache-first for everything else.
    e.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req)
                .then((res) => {
                    if (res && res.ok && (url.origin === self.location.origin)) {
                        const clone = res.clone();
                        caches.open(CACHE).then((c) => c.put(req, clone));
                    }
                    return res;
                })
                .catch(() => caches.match("./index.html"));
        })
    );
});
