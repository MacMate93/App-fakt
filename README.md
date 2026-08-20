# Biokémia keresztrejtvény

Magyar nyelvű, böngészőben futó keresztrejtvény-játék biokémiai fogalmakból.
Minden indításnál új rácsot generál: a szótár 111 fogalmából választ, és
keresztezésekre épülő elrendezést épít belőlük.

**Játék indítása:** nyisd meg az `index.html` fájlt bármelyik böngészőben.
Nincs telepítés, build vagy netkapcsolat-igény (a betűtípusok hiányában is
olvasható marad az oldal).

## Amit tud

- **Három nehézségi szint** – Könnyű (10 szó), Haladó (14 szó), Profi (18 szó).
- **Hat témakör** – aminosavak, szénhidrátok, lipidek, nukleinsavak, anyagcsere
  és enzimek, vitaminok. A választott témakör szavai kerülnek előtérbe, a rács
  feltöltéséhez szükséges maradékot a többi kör adja.
- **Teljes billentyűzetes kezelés** – gépelés, `Szóköz` irányváltás, `Tab`
  következő meghatározás, nyilak, `Backspace`.
- **Ékezetes bevitel mindenhol** – a mobil billentyűzetek és a halott
  billentyűs (dead key) beviteli módok szövegbeszúrását is kezeli, ezen felül
  a képernyő-billentyűzeten a teljes magyar ábécé elérhető.
- **Ellenőrzés és tippek** – hibás betűk jelölése, egy betű vagy egy egész szó
  felfedése, teljes megoldás.
- **Haladás, idő, pontszám** – szintenkénti rekord és a félbehagyott játék a
  böngésző tárolójában marad meg.
- **Világos és sötét téma**, valamint mobilra szabott elrendezés.

## Felépítés

Egyetlen önálló fájl, külső függőség nélkül:

- `index.html` – felület, stílusok és a teljes játéklogika
  - szótár (`SZOTAR`): megfejtés, meghatározás és témakör soronként
  - generátor (`keszitsRejtvenyt`): véletlen próbákból választja a legtöbb
    szót tartalmazó, legtömörebb rácsot
  - játékállapot (`allapot`): beírt betűk, tippek, kijelölés, idő

Új fogalmat a `SZOTAR` tömbhöz kell hozzáadni – a megfejtés csak nagybetűs
magyar ábécé lehet, szóköz és kötőjel nélkül. A kétjegyű betűk külön mezőbe
kerülnek (SZERIN = S, Z, E, R, I, N).
