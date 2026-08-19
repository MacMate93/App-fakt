# From Pathway to Therapy

**Interactive Cases in Medical and Veterinary Biochemistry**
Biokémiai innovációk az orvos- és állatorvostudományban

Egyetemi oktatási webalkalmazás egy 7 × 90 perces fakultációhoz. Az előadások után
a hallgatók 10–15 perces, alkalmazásorientált interaktív eseteken keresztül
gyakorolják a transzlációs gondolkodást:

> molekuláris adat → értelmezés → mechanizmus → biomarker → terápiás célpont → evidenciaszint

## Állapot

**MVP kész, a Week 3 végigjátszható.** A modul 20 pontozott elemből áll
(7 stage-es állatorvosi eset, 5 Mechanism or Hype állítás, 6 lépéses Therapy Builder),
összesen 100 pontért. A Week 1–2 és 4–7 zárolt kártyaként jelenik meg.

## Futtatás

```bash
npm install
npm run dev        # fejlesztői szerver
npm test           # pontozási logika és tartalmi invariánsok
npm run typecheck  # TypeScript ellenőrzés
npm run build      # statikus build a dist/ könyvtárba
npm run build:single  # egyetlen, önálló HTML-fájl (dist/from-pathway-to-therapy.html)
```

A `build:single` egy ~275 kB-os, külső kérés nélküli HTML-fájlt állít elő. Ez
megnyitható közvetlenül a fájlrendszerről, feltölthető bárhová, vagy beágyazható
egy LMS-be — szerver nélkül is fut.

A build relatív `base`-szel készül, így alkönyvtárból (pl. GitHub Pages
project site) is működik; a routing hash-alapú, ezért nincs szükség
szerveroldali rewrite szabályra.

## Architektúra dióhéjban

```
Course → Week → Case → Stage → Question → Answer → Feedback
```

- `src/types/` — a tartalom és a haladás TypeScript modelljei
- `src/engine/` — determinisztikus, React-mentes logika: kiértékelés, pontozás,
  visszajelzés, modul-flow. **AI nélkül működik**, és teljes egészében tesztelt.
- `src/content/` — **kizárólag adat**. Új hét = új adatfájl a `weeks/` alatt és egy
  sor a registryben; nem kell sem új route, sem új komponens.
- `src/components/` — layout, kurzus, eset, kérdéstípusok, modulok, visszajelzés, grafikonok
- `src/routes/` — 4 route az egész kurzusra; **nincs** hetenkénti oldal

A részletes terv, az adatmodellek és a döntések indoklása:
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Adatvédelem

Az alkalmazás a hallgató által megadott azonosítón és a saját eredményein kívül
semmilyen adatot nem kezel. A haladás a böngésző `localStorage`-ában tárolódik, és
a felületről törölhető. A perzisztencia egy `ProgressStore` interfész mögött van,
így egy későbbi backend cseréje nem érinti a UI-t.
