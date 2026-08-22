/* Szolgáltatásszál: a játék netkapcsolat nélkül is elindul.
   A frissítések viszont mindig elsőbbséget élveznek, ha van hálózat. */
const GYORSITOTAR = "membran-kr-v1";
const ALAP_FAJLOK = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "ikon-192.png",
  "ikon-512.png",
  "ikon-maskable-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(GYORSITOTAR)
      .then((tar) => tar.addAll(ALAP_FAJLOK))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((kulcsok) => Promise.all(
        kulcsok.filter((k) => k !== GYORSITOTAR).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/** Hálózat elsőbbséggel: mindig a friss változat, offline a mentett. */
async function halozatElsokent(keres) {
  try {
    const valasz = await fetch(keres);
    if (valasz && valasz.ok) {
      const tar = await caches.open(GYORSITOTAR);
      tar.put(keres, valasz.clone());
    }
    return valasz;
  } catch (e) {
    const mentett = await caches.match(keres);
    if (mentett) return mentett;
    if (keres.mode === "navigate") {
      const kezdo = await caches.match("index.html");
      if (kezdo) return kezdo;
    }
    throw e;
  }
}

/** Gyorsítótár elsőbbséggel, háttérben frissítve (betűtípusok, ikonok). */
async function tarElsokent(keres) {
  const mentett = await caches.match(keres);
  const halozat = fetch(keres)
    .then((valasz) => {
      if (valasz && (valasz.ok || valasz.type === "opaque")) {
        caches.open(GYORSITOTAR).then((tar) => tar.put(keres, valasz.clone()));
      }
      return valasz;
    })
    .catch(() => mentett);
  return mentett || halozat;
}

self.addEventListener("fetch", (ev) => {
  const keres = ev.request;
  if (keres.method !== "GET") return;

  const cim = new URL(keres.url);
  const sajat = cim.origin === self.location.origin;
  const frissKell = keres.mode === "navigate" ||
    cim.pathname.endsWith("index.html") ||
    cim.pathname.endsWith("szavak.csv");

  if (sajat && frissKell) ev.respondWith(halozatElsokent(keres));
  else if (sajat || /fonts\.(googleapis|gstatic)\.com$/.test(cim.hostname)) ev.respondWith(tarElsokent(keres));
});
