# Metabolic Pathway Builder — architektúra

> Ez a dokumentum a kód mellé készült: mi miért van így, és hol kell hozzányúlni,
> ha bővíteni akarod. Ha a kód és a dokumentum eltér, ezt kell frissíteni.

---

## 1. A tervezés egyetlen legfontosabb szabálya

**Az anyagcsereút-adat teljesen el van választva az alkalmazás logikájától.**

```
src/data/glycolysis.ts        ← tartalom: mit tudunk a biokémiáról
src/engine/*.ts               ← logika: ebből hogyan lesz feladat, pontszám, hint
src/components/, src/routes/  ← megjelenítés
```

Az engine React-mentes és determinisztikus, ezért teljes egészében tesztelhető
böngésző nélkül. A komponensek egyetlen glikolízis-specifikus adatot sem
ismernek: minden, amit kirajzolnak, a `Pathway` objektumból származik.

Következmény: egy új útvonal (citrátkör, β-oxidáció, ureaciklus…) **egy új
adatfájl plusz egy sor a registryben**. Sem route, sem komponens nem változik.

---

## 2. Rétegek

| Réteg | Könyvtár | Felelősség |
| --- | --- | --- |
| Tartalom | `src/data/` | Útvonalak, közös kofaktorpárok, registry. **Csak adat.** |
| Típusok | `src/types/` | `pathway.ts` (tartalom), `session.ts` (játékmenet), `progress.ts` (haladás) |
| Engine | `src/engine/` | Feladatgenerálás, hintek, visszajelzés, pontozás, reducer, összegzés, mérleg |
| Interakció | `src/interaction/` | Pointer-alapú drag & drop context |
| Komponensek | `src/components/` | `layout/`, `pathway/`, `game/`, `explore/`, `results/` |
| Route-ok | `src/routes/` | Home, Play, Explore — összesen három |
| Állapot | `src/state/`, `src/storage/` | Haladás provider és `localStorage` implementáció |

Az engine egyik modulja sem importál Reactet; a komponensek egyike sem tartalmaz
játékszabályt.

---

## 3. Adatfolyam

```
Pathway (adat)
   │
   ├─► indexPathway ──────► gyors kikeresés (metabolit, enzim, kofaktor, reakció)
   ├─► buildCanvasModel ──► fej-csomópont + sorok (nyíl + termékkártyák), ×2 osztó, oldalág
   ├─► computeBalance ────► ATP befektetés/termelés, nettó ATP, NADH, végtermékek
   │
   └─► generateSession(mód, nehézség, seed)
            │
            ├─ Slot[]   — melyik pozíció üres, mi a helyes válasz, mi a kérdés
            └─ Token[]  — a tálcán megjelenő kártyák (helyesek + disztraktorok)
                    │
                    ▼
            sessionReducer  ──► SessionState ──► summariseRun ──► eredményképernyő
```

A session `seed`-ből generálódik (`mulberry32`), tehát reprodukálható: ugyanaz a
seed ugyanazt a feladatsort adja. Ez teszi lehetővé a determinisztikus teszteket,
és később azt is, hogy egy vizsgacsoport ugyanazt a feladatsort kapja.

---

## 4. A tartalmi modell mezőről mezőre

```ts
interface Reaction {
  id: string;
  step: number;              // 1-től folytonos; teszt őrzi
  substrates: string[];      // metabolit-id-k
  products: string[];
  enzymeId: string;
  acceptAlso?: string[];     // egyenrangú izoenzim (hexokináz / glukokináz)
  coupleIds: string[];       // ATP→ADP, NAD⁺→NADH … a közös készletből
  consumes?: string[];       // extra kismolekula, pl. ["Pi"]
  releases?: string[];       // pl. ["H₂O"]
  reversible: boolean;
  regulatory?: boolean;      // ⚡ jelölés + kiemelt nyíl
  reactionType: string;
  purpose: string;           // „miért csinálja ezt a sejt”
  explanation: string;       // helyes elhelyezéskor és az Explore-ban
  factor?: 1 | 2;            // hányszor fut glükózonként → ×2 fázis és mérleg
  branch?: boolean;          // oldalágként rajzolódik (DHAP → G3P)
  hints?: { generic?; specific?; reveal?: Partial<Record<BlankKind, string>> };
}
```

Amit az egyes mezők **automatikusan** hoznak magukkal:

- `factor` → a „×2 innentől” osztó a vásznon **és** az ATP/NADH mérleg szorzói.
- `regulatory` + `reversible` → ⚡ ikon, kiemelt nyílszín, „Key regulatory step”
  cimke, és a hint-létra 2. szintjének tartalma.
- `coupleIds` → az Energy és a Cofactor feladattípus helyes válasza. Ha egy
  reakcióhoz nincs adott szerepű kofaktorpár, a helyes válasz a *„No ATP
  involved”* / *„No redox cofactor”* token — ezek is valódi, tanulandó válaszok.
- `acceptAlso` → több helyes válasz ugyanarra a pozícióra.
- `decoys` → a hihető rossz válaszok forrása (gluconeogenesis-enzimek,
  szomszédos utak metabolitjai). Teszt őrzi, hogy egyik se legyen az útvonal
  valódi eleme.
- `keyConcepts` → az eredményképernyő „mastered / needs review” listái.
- `summaryQuiz` → a lezáró kérdések (pl. nettó ATP-hozam).

Ami **hiányozhat**: majdnem minden. Egy vékonyan megírt útvonal is működik,
csak rövidebb kártyákat és generált hinteket kap.

---

## 5. Feladatgenerálás

Minden játékmód ugyanaz a mechanika: bizonyos pozíciók kiürülnek, és a tálcáról
kell őket feltölteni. A mód azt dönti el, **milyen** pozíciók üresedhetnek ki, a
nehézség azt, hogy **mennyi** és **mennyi disztraktorral**.

| Mód | Kiürülő pozíciók |
| --- | --- |
| Build the pathway | nehézségtől függően enzim → + metabolit → + energetika és kofaktor |
| Missing metabolite | metabolit |
| Missing enzyme | enzim |
| Energy challenge | ATP/ADP |
| Cofactor challenge | redox kofaktor |

| Nehézség | Lefedettség | Feladatszám | Disztraktor/kategória |
| --- | --- | --- | --- |
| Beginner | 40% | 3–5 | 2 |
| Intermediate | 60% | 5–10 | 4 |
| Expert | 100% | 8–26 | 6 |

Két szabály, ami nem esztétikai, hanem tisztességességi kérdés:

1. **Reakciónként legfeljebb egy metabolit üresedhet ki.** Ha az aldoláz mindkét
   termékét (G3P és DHAP) elrejtenénk, a hallgató nem tudhatná, melyik doboz
   melyik — az már nem tudás, hanem találgatás.
2. **Az Energy/Cofactor módban a „nem történik semmi” válaszok száma korlátozott**
   (legfeljebb az aktív lépések fele), különben a feladatsor fele triviális lenne.

---

## 6. Pontozás és visszajelzés

- Helyes elsőre **+100 XP**, másodikra **+70**, harmadikra **+40**, azután **+20**;
  hintenként **−20**, de pozíciónként legalább 10 XP marad.
- Hibátlan futás (minden pozíció elsőre, hint nélkül): **+500 XP**.
- Lezáró kérdés: **+50 XP** darabonként.
- Pontosság = megoldott pozíciók / összes próbálkozás.
- A helytelen válasz sosem csak „Incorrect”: megmondja, hogy a választott enzim
  vagy molekula **valójában** hol szerepel (»A piruvát-kináz a 10. lépést
  katalizálja…«), és a hallgató újra próbálkozhat.

A hint-létra három szintje: (1) a reakcióról szól, (2) az enzim/molekula
osztályáról, (3) a konkrét célról — ez utóbbi generált (rövidítés, szénatomszám,
foszfátszám), ha az adatfájl nem ír felül.

---

## 7. Képernyőn tartás

Egy tíz lépéses útvonal függőlegesen három képernyő magas, a tálca meg a lap
alján van: minden egyes kártyáért le-fel kellene görgetni. Négy dolog együtt
oldja meg:

1. **Több oszlop.** A `splitRowsIntoColumns` a reakciókat kiegyensúlyozott
   oszlopokra bontja — nem darabszám, hanem becsült magasság szerint (az
   oldalág és a kétterméses hasítás magasabb sor). Glikolízisnél a kettes
   bontás pontosan a befektetési és a kifizetődési fázis határán vág.
   Oszlopszám: 1 (< 760 px), 2, majd 3 széles képernyőn.
2. **Magasságra kötött elrendezés.** A játéknézet nem összeadja a magasságokat,
   hanem elosztja: a feladatpanel annyit kap, amennyi kell, a vászon a
   maradékot (`flex: 1; min-height: 0`). Így a *lap* nem görgethető — csak a
   diagram, a saját panelján belül.
3. **A tálca a vászon mellett van** (≥ 1000 px), alatta pedig a képernyő aljára
   rögzített sávban. Nincs többé oda-vissza út a kártya és a hely között.
4. **Automatikus méretezés.** A `useFitZoom` a legnagyobb olyan méretet
   választja (100 / 90 / 80%), amely még belefér a panelba; a fejlécben lévő
   vezérlővel felülírható. 80% alá nem megy: az alatt a felirat már nem
   olvasható kényelmesen, és inkább egy rövid görgetés a jobb csere.

Ezen felül a vászon **magától a soron következő feladathoz görget**
(`scrollIntoView`, `block: 'nearest'`), tehát a hallgatónak sosem kell keresnie,
hol tart.

## 8. Interakció

Egyetlen pointer-alapú megvalósítás fedi le az egeret, a tollat és az érintést —
ezért működik iPaden külön kód nélkül. A drag & drop **soha nem az egyetlen út**:

- koppintás a kártyára → koppintás a pozícióra (ugyanez billentyűzetről is:
  Enter a kártyán, Tab a pozícióra, Enter),
- amint egy kártya „a kézben van”, minden fogadóképes pozíció kiemelődik,
- a megoldott pozíció visszaváltozik valódi kártyává, hogy a végén tényleg egy
  kész útvonal álljon a képernyőn.

---

## 9. Ami tudatosan kimaradt az MVP-ből

| Elem | Hol kapcsolódik majd |
| --- | --- |
| Integrated Metabolism (glikolízis → PDH → citrátkör → ETC) | több `Pathway` összefűzése; a `Reaction` már bír több szubsztrátot/terméket |
| Fed / fasting, szövetspecifikus metabolizmus | az enzim `activators`/`inhibitors` mezői már megvannak hozzá |
| Klinikai esetek | `Enzyme.clinical` már tartalmazza a hiánybetegségeket |
| Teacher Mode | `ProgressStore` interfész: a `localStorage` implementáció cserélhető szerveresre; a `RunRecord` és a `wrongTokenIds` már azt gyűjti, ami a „leggyakrabban összekevert enzimek” statisztikához kell |
| Tailwind | helyette CSS Modules + design tokenek, a testvéralkalmazással közös stílusrendszerben és külön build-függőség nélkül |
