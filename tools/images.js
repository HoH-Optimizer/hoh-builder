// Télécharge une fois pour toutes les illustrations nécessaires au site.
// Elles proviennent du wiki communautaire heroesofhistory.wiki, dont les adresses
// reprennent exactement les identifiants internes du jeu.
//
// Usage : node tools/images.js
// Les fichiers déjà présents sont ignorés : relancer le script ne retélécharge rien.

const fs = require('node:fs');
const path = require('node:path');

const BASE = 'https://heroesofhistory.wiki';
const RACINE = path.resolve(__dirname, '..', 'images');
const SIMULTANE = 4;      // on reste discret sur le serveur du wiki
const PAUSE_MS = 120;

const donnees = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'compte.json'), 'utf8'));

const aTelecharger = [];

for (const hero of donnees.catalogue.heros) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/icons/Unit_${hero}.webp`, fichier: path.join(RACINE, 'heros', `${hero}.webp`) });
}

for (const set of donnees.catalogue.sets) {
  aTelecharger.push({ url: `${BASE}/equipment/intro/sets/icon_equipmentset_${set.toLowerCase()}.webp`, fichier: path.join(RACINE, 'sets', `${set}.webp`) });
}

// Un set ne couvre que certains emplacements : on ne demande que les paires réellement utilisées.
const paires = new Set(donnees.compte.equipements.map((e) => `${e.set}|${e.emplacement}`));
for (const paire of paires) {
  const [set, emplacement] = paire.split('|');
  aTelecharger.push({
    url: `${BASE}/equipment/intro/icons/icon_equipment_${set.toLowerCase()}_${emplacement.toLowerCase()}.webp`,
    fichier: path.join(RACINE, 'equipement', `${set}_${emplacement}.webp`),
  });
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

let faits = 0, ignores = 0;
const echecs = [];

async function telecharger({ url, fichier }) {
  if (fs.existsSync(fichier)) { ignores++; return; }
  try {
    // Sans ces en-têtes, le wiki refuse une partie des requêtes.
    const reponse = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
        accept: 'image/webp,image/*,*/*;q=0.8',
        referer: `${BASE}/equipment`,
      },
    });
    if (!reponse.ok) { echecs.push(`${reponse.status} ${url}`); return; }
    fs.mkdirSync(path.dirname(fichier), { recursive: true });
    fs.writeFileSync(fichier, Buffer.from(await reponse.arrayBuffer()));
    faits++;
  } catch (erreur) {
    echecs.push(`${erreur.message} ${url}`);
  }
  await attendre(PAUSE_MS);
}

(async () => {
  console.log(`${aTelecharger.length} images à récupérer…`);
  const file = [...aTelecharger];
  await Promise.all(Array.from({ length: SIMULTANE }, async () => {
    while (file.length) await telecharger(file.pop());
  }));
  console.log(`Téléchargées : ${faits} · déjà présentes : ${ignores} · échecs : ${echecs.length}`);
  echecs.slice(0, 15).forEach((e) => console.log('  ', e));
})();
