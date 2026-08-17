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

// Les icônes de statistiques du jeu portent le nom exact de la stat qu'elles illustrent.
// Certaines n'existent qu'en version « pourcentage » : on tente les deux, les absences
// sont sans conséquence puisque le site retombe sur du texte.
for (const stat of donnees.catalogue.stats) {
  aTelecharger.push({ url: `${BASE}/shared/icons/icon_unit_stat_${stat}.webp`, fichier: path.join(RACINE, 'stats', `${stat}.webp`), facultatif: true });
  aTelecharger.push({ url: `${BASE}/shared/icons/icon_unit_stat_${stat}_percent.webp`, fichier: path.join(RACINE, 'stats', `${stat}_percent.webp`), facultatif: true });
}

// Classe du héros, type d'unité et couleur : trois familles d'icônes du jeu.
for (const classe of ['singlestriker', 'areaattacker', 'defender', 'healer', 'manipulator', 'support', 'tank']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/classIcons/icon_class_${classe}.webp`, fichier: path.join(RACINE, 'classes', `${classe}.webp`), facultatif: true });
}
for (const type of ['melee', 'ranged', 'cavalry', 'infantry', 'heavyinfantry', 'siege']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/unitIcons/icon-flat-unit-${type}.webp`, fichier: path.join(RACINE, 'types', `${type}.webp`), facultatif: true });
}
for (const couleur of ['red', 'blue', 'green', 'yellow', 'purple']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/colorIcons/icon-colour-${couleur}.webp`, fichier: path.join(RACINE, 'couleurs', `${couleur}.webp`), facultatif: true });
}

aTelecharger.push({ url: `${BASE}/heroes/intro/icon_star.webp`, fichier: path.join(RACINE, 'divers', 'etoile.webp'), facultatif: true });
aTelecharger.push({ url: `${BASE}/heroes/battle_power.webp`, fichier: path.join(RACINE, 'divers', 'puissance.webp'), facultatif: true });

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

let faits = 0, ignores = 0;
const echecs = [];

async function telecharger({ url, fichier, facultatif }) {
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
    // Une icône facultative absente est normale : on ne la signale pas comme un échec.
    if (!reponse.ok) { if (!facultatif) echecs.push(`${reponse.status} ${url}`); return; }
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
