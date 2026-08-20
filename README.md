# Biokémia keresztrejtvény

Háromnyelvű (magyar · angol · német), böngészőben futó keresztrejtvény-játék
biokémiai fogalmakból. Minden indításnál új rácsot generál: a szótár 111
fogalmából választ, és keresztezésekre épülő elrendezést épít belőlük.

**Játék indítása:** nyisd meg az `index.html` fájlt bármelyik böngészőben.
Nincs telepítés, build vagy netkapcsolat-igény (a betűtípusok hiányában is
olvasható marad az oldal).

## Amit tud

- **Három nyelv egy kattintással** – magyar, angol és német. Nemcsak a felület
  fordul le: a megfejtések és a meghatározások is nyelvenként külön szótárból
  jönnek (GLÜKÓZ / GLUCOSE / GLUCOSE), ezért a nyelvváltás új rácsot generál.
  Induláskor a böngésző nyelve, illetve a legutóbbi választás dönt.
- **Három nehézségi szint** – Könnyű (10 szó), Haladó (14 szó), Profi (18 szó).
- **Hat témakör** – aminosavak, szénhidrátok, lipidek, nukleinsavak, anyagcsere
  és enzimek, vitaminok. A választott témakör szavai kerülnek előtérbe, a rács
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
