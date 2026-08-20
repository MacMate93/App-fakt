# Metabolic Pathway Builder

**Build it. Understand it. Master metabolism.**

Interaktív biokémia-oktató webalkalmazás egyetemi hallgatóknak (állatorvos-,
orvos-, biológus- és biotechnológus-képzés). A hallgató nem memorizálja az
anyagcsereutakat, hanem **felépíti** őket: enzimeket, metabolitokat,
kofaktorokat és energetikai lépéseket helyez a helyükre, és minden lépésre —
helyesre és helytelenre egyaránt — szakmai magyarázatot kap.

## Állapot

**MVP kész, a glikolízis végigjátszható.** A modul tartalmazza a teljes,
tíz lépéses glikolízist (metabolitok, enzimek, EC-számok, kofaktorok,
reverzibilitás, regulációs pontok, klinikai megjegyzések), öt feladattípust,
három nehézségi szintet, Learning és Exam módot, valamint az Explore nézetet.

## Futtatás

```bash
npm install
npm run dev           # fejlesztői szerver
npm test              # 148 teszt: engine + tartalmi invariánsok
npm run typecheck     # TypeScript ellenőrzés
npm run build         # statikus build a dist/ könyvtárba
npm run build:single  # egyetlen önálló HTML-fájl, külső kérés nélkül
```

A routing hash-alapú és a `base` relatív, így a build alkönyvtárból (LMS,
GitHub Pages) és akár `file://` protokollról is fut, szerveroldali rewrite
szabály nélkül.

## Amit az alkalmazás tud

| Terület | MVP |
| --- | --- |
| Feladattípusok | Build the pathway · Missing metabolite · Missing enzyme · Energy challenge · Cofactor challenge |
| Nehézség | Beginner / Intermediate / Expert — más lefedettség, más kitöltendő kategóriák, több disztraktor |
| Interakció | Pointer-alapú drag & drop (egér, toll, érintés) + koppintásos és billentyűzetes elhelyezés |
| Elrendezés | Az útvonal 2–3 oszlopban, a képernyő magasságához igazítva; a tálca a vászon mellett; a nézet magától a soron következő feladathoz görget |
| Visszajelzés | Azonnali, magyarázó — a rossz válasz megmondja, hogy a választott enzim/molekula *valójában* mit csinál |
| Hint | Háromszintű létra, szintenként −20 XP |
| Pontozás | 100 / 70 / 40 XP próbálkozásonként, hibátlan futásért +500 XP bónusz, streak-számláló |
| Módok | Learning (hint, újrapróbálkozás, magyarázat) és Exam (nincs hint, a végén értékel) |
| Explore | Teljes útvonal, kattintható enzimekkel: reakció, szerep, aktivátorok/inhibitorok, klinikai jegyzet |
| Lezárás | Összefoglaló kérdések + eredményképernyő (XP, pontosság, idő, „mastered” és „needs review” lista) |
| Haladás | `localStorage`, `ProgressStore` interfész mögött — a hallgatóé marad, a felületről törölhető |

## Új anyagcsereút hozzáadása

Ez a projekt legfontosabb tervezési követelménye: **egy új útvonal egy új
adatfájl**. Semmilyen komponenst és route-ot nem kell módosítani.

```ts
// src/data/tcaCycle.ts
export const tcaCycle: Pathway = { id: 'tca-cycle', name: 'Citric Acid Cycle', … };

// src/data/index.ts
export const pathways = [glycolysis, tcaCycle, ...upcomingPathways];
```

Ebből az alkalmazás magától előállítja az Explore nézetet, az öt feladattípust,
a hint-létrát, a disztraktorokat, az ATP/NADH mérleget és az eredménylistákat.
A részletek — mezőről mezőre — a
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) 4. fejezetében.

## Tudományos pontosság

A glikolízis a standard tankönyvi séma szerint készült (Lehninger, Stryer,
Harper — a hivatkozások az Explore nézetben is megjelennek). Nincs kitalált
adat: ahol egy részlet izoenzim-függő vagy vitatott, ott vagy kimarad, vagy a
megjegyzésben szerepel a feltétel. Az energiamérleg (2 ATP befektetés,
4 ATP termelés, nettó 2 ATP, 2 NADH, 2 piruvát) nincs beírva sehová — a
reakciólistából számolódik, és teszt őrzi, hogy egyezzen az összefoglaló
kérdés válaszával.
