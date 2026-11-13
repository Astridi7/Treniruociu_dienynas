# Treniruočių dienynas

Paprastas vietinis Node.js projektas: pridėkite treniruotės pavadinimą, datą,
trukmę ir pastabas, peržiūrėkite treniruotes nuo naujausios datos.
Duomenys išlieka perkrovus serverį (`data/workouts.json`).

## Paleidimas

Reikia Node.js 22.9 ar naujesnės versijos. Papildomų paketų nėra.

```powershell
Copy-Item .env.example .env
npm start
```

Atidarykite http://127.0.0.1:3000. Kuriant galima naudoti `npm run dev`.

## Savaitės suvestinė

Puslapio viršuje rodoma dabartinės savaitės (pirmadienio–sekmadienio)
ataskaita: treniruočių skaičius, bendra trukmė minutėmis, aktyvių dienų
skaičius ir vidutinė treniruotės trukmė (suapvalinta iki minutės).
Lentelėse pateikiami rezultatai pagal dieną ir treniruotės tipą.
Pasirinkite bet kurią datą arba naudokite rodykles kitai savaitei peržiūrėti;
mygtukas „Ši savaitė“ grąžina dabartinę savaitę pagal vietinę įrenginio datą.
Suvestinė apima visus tipus, nepriklausomai nuo treniruočių sąrašo filtro,
ir atsinaujina pridėjus treniruotę. Senesni įrašai be tipo priskiriami „Kita“.

Skaičiavimų patikra: `npm test`.

## Konfigūracija

`.env.example` pateikia visus naudojamus nustatymus:

- `HOST`: serverio adresas (numatytasis `127.0.0.1`).
- `PORT`: serverio prievadas (numatytasis `3000`).
- `DATA_FILE`: duomenų failo kelias (numatytasis `./data/workouts.json`).

Išorinių paslaugų ar slaptų API raktų šiam projektui nereikia.
Tikras paslaptis laikykite tik `.env`, o pavyzdyje pateikite vien pakaitalus.
Projektas skirtas vietiniam naudojimui, prisijungimo sistemos nėra.

## Git

`.gitignore` ignoruoja `node_modules/`, `.env` ir jo variantus, vietinius
duomenis, žurnalus bei generuojamus failus. `.env.example` įtraukiamas į Git.
Prieš siųsdami pakeitimus patikrinkite `git status`.
Ignoravimo taisyklės neveikia failams, kurie jau buvo sekami Git.
