# Sejtmembrán keresztrejtvény

Háromnyelvű (magyar · angol · német), böngészőben futó keresztrejtvény-játék a
*Cell membrane* előadás anyagából. Minden indításnál új rácsot generál: a
szótár 72 fogalmából választ, és keresztezésekre épülő elrendezést épít
belőlük.

**Játék indítása:** nyisd meg az `index.html` fájlt bármelyik böngészőben.
Nincs telepítés, build vagy netkapcsolat-igény (a betűtípusok hiányában is
olvasható marad az oldal).

## Amit tud

- **Három nyelv egy kattintással** – magyar, angol és német. Nemcsak a felület
  fordul le: a megfejtések és a meghatározások is nyelvenként külön szótárból
  jönnek (KETTŐSRÉTEG / BILAYER / DOPPELSCHICHT), ezért a nyelvváltás új rácsot
  generál.
  Induláskor a böngésző nyelve, illetve a legutóbbi választás dönt.
- **Három nehézségi szint** – Könnyű (10 szó), Haladó (14 szó), Profi (18 szó).
- **Hat témakör az előadás felépítése szerint** – membránlipidek,
  szfingolipidek, koleszterin, membránfehérjék, membráncukrok, valamint
  szerkezet és dinamika. A választott témakör szavai kerülnek előtérbe, a rács
  feltöltéséhez szükséges maradékot a többi kör adja.
- **Teljes billentyűzetes kezelés** – gépelés, `Szóköz` irányváltás, `Tab`
  következő meghatározás, nyilak, `Backspace`.
- **Ékezetes és umlautos bevitel mindenhol** – a mobil billentyűzetek és a
  halott billentyűs (dead key) beviteli módok szövegbeszúrását is kezeli, ezen
  felül a képernyő-billentyűzet a mindenkori nyelv teljes ábécéjét kínálja.
- **Ellenőrzés és tippek** – hibás betűk jelölése, egy betű vagy egy egész szó
  felfedése, teljes megoldás.
- **Haladás, idő, pontszám** – nyelvenkénti és szintenkénti rekord, valamint a
  félbehagyott játék a böngésző tárolójában marad meg.
- **Világos és sötét téma**, mobilra szabott elrendezés, győzelmi konfetti.

## A címer elhelyezése

A fejléc bal oldalán megjelenik az egyetem címere, mellette az intézmény neve
(nyelvenként a megfelelő alakban). A képfájl kétféleképpen kerülhet a helyére:

1. **Fájlként a játék mellé** – tegyen egy `cimer.svg`, `cimer.png` vagy
   `cimer.jpg` nevű fájlt az `index.html` mellé (a repóban, a webszerveren
   vagy a Moodle-erőforrásban). A játék induláskor megkeresi és betölti.
2. **Beágyazva** – az `index.html`-ben a `CIMER_ADAT` állandóba írt `data:` URL
   is működik. Ez akkor kell, ha a játékot egyetlen fájlként adja tovább,
   mellékelt képfájl nélkül.

Ha egyik sincs meg, a fejléc egyszerűen címer nélkül jelenik meg – a játék
működését ez nem érinti. Sötét témán a címer fehér, kör alakú alapra kerül,
hogy a bordó rajz jól látszódjon.

## Saját kérdések feltöltése

A beépített 72 fogalom mellé (vagy helyette) bármikor betölthető saját
szólista. Három út vezet ide, ugyanazzal a táblázatformátummal.

### 1. A játékon belül – „Saját szavak" gomb

Az alsó eszközsor **Saját szavak** gombjára kattintva feltölthető egy CSV-fájl,
vagy egyszerűen beilleszthetők a táblázat sorai (Excelből kimásolt sorok is
jók). A játék soronként visszajelzi, mi ment át és mi maradt ki, miért. A lista
a böngésző tárolójában marad, tehát arra a gépre/böngészőre vonatkozik.

A **„Miből álljon a rejtvény?"** választóval állítható, hogy a beépített lista,
a saját lista, vagy a kettő együtt adja a szavakat. A saját, témakör nélküli
fogalmak külön „Saját szavak" témakörbe kerülnek, és a témakörválasztóban is
megjelennek.

### 2. Mindenkinek egyszerre – `szavak.csv` a játék mellé

Ha a játékot webszerverről szolgálod ki (GitHub Pages, Moodle, iskolai
tárhely), tegyél egy **`szavak.csv`** nevű fájlt az `index.html` mellé: a játék
induláskor magától beolvassa, és minden hallgató ezzel a listával játszik.
Így nem kell semmit sem kézzel feltölteniük. Moodle-ben ehhez a két fájlt
ugyanabba a Fájl-erőforrásba töltsd fel (fő fájl az `index.html`).

A kézi feltöltés erősebb: ha valaki a játékon belül tölt fel listát, azt a
`szavak.csv` nem írja felül. A saját lista törlése után újra a szerveroldali
fájl lép életbe.

### 3. A beépített szótár bővítése

Tartós bővítéshez a `SZOTAR` tömbhöz kell új sort adni az `index.html`-ben,
mind a három nyelven.

### A táblázat formátuma

Minta: **`szavak-minta.csv`** (nyisd meg Excelben vagy szövegszerkesztőben).

```
temakor;megfejtes_hu;meghatarozas_hu;megfejtes_en;meghatarozas_en;megfejtes_de;meghatarozas_de
feherje;AKVAPORIN;Vízcsatorna-fehérje a membránban;AQUAPORIN;Water channel protein;AQUAPORIN;Wasserkanalprotein
```

- **Elválasztó**: pontosvessző, vessző vagy tabulátor – a játék felismeri. A
  fejlécsor elhagyható.
- **Idegen nyelvű oszlopok elhagyhatók**: az a fogalom csak azokon a nyelveken
  jelenik meg, ahol ki van töltve. Rövid alak is jó: `megfejtés;meghatározás`
  vagy `témakör;megfejtés;meghatározás` – ilyenkor az éppen beállított nyelvre
  kerül a sor.
- **Témakör**: `lipid`, `szfingo`, `szterin`, `feherje`, `szenhidrat`,
  `dinamika` (a magyar, angol vagy német nevük is elfogadott). Bármi más a
  „Saját szavak" körbe kerül.
- **Megfejtés**: 3–20 betű, csak az adott nyelv ábécéjéből. A szóköz, a kötőjel
  és a pont automatikusan kiesik (FATTY ACID → FATTYACID), a számjegy viszont
  hibának számít – az ilyen sor kimarad, és a játék meg is mondja, miért.

## Felépítés

Egyetlen önálló fájl, külső függőség nélkül:

- `index.html` – felület, stílusok és a teljes játéklogika
  - felületi szövegek (`SZOVEGEK`): nyelvenként azonos kulcskészlettel
  - nyelvenkénti ábécé (`ABC`): ez adja a képernyő-billentyűzetet és a
    beírható betűk körét
  - szótár (`SZOTAR`): soronként `[témakör, [magyar megfejtés, meghatározás],
    [angol …], [német …]]`
  - generátor (`keszitsRejtvenyt`): véletlen próbákból választja a legtöbb
    szót tartalmazó, legtömörebb rácsot
  - játékállapot (`allapot`): beírt betűk, tippek, kijelölés, idő

Új fogalomhoz egyetlen sort kell hozzáadni a `SZOTAR` tömbhöz mind a három
nyelven. A megfejtés csak az adott nyelv ábécéjének nagybetűiből állhat, szóköz
és kötőjel nélkül; a kétjegyű betűk külön mezőbe kerülnek (SZERIN = S, Z, E, R,
I, N).
