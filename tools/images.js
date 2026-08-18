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

// Comme le site, on part du catalogue du jeu et non de l'export du compte : ce
// dernier ne mentionne que les héros que le joueur a déjà croisés, et il en
// manquait quatorze. Le portrait devient facultatif du même coup — le wiki peut
// n'avoir pas encore publié celui d'un héros tout juste sorti.
const herosDuJeu = (() => {
  const contexte = {};
  const chemin = path.resolve(__dirname, '..', 'heros-jeu.js');
  if (fs.existsSync(chemin)) new Function('window', fs.readFileSync(chemin, 'utf8'))(contexte);
  return new Set([...Object.keys(contexte.HEROS_JEU || {}), ...donnees.catalogue.heros]);
})();

for (const hero of herosDuJeu) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/icons/Unit_${hero}.webp`, fichier: path.join(RACINE, 'heros', `${hero}.webp`), facultatif: true });
  // Illustration en pied, affichée au centre du comparateur d'équipement.
  aTelecharger.push({ url: `${BASE}/heroes/intro/fullbody/Unit_${hero}_fullbody.webp`, fichier: path.join(RACINE, 'pied', `${hero}.webp`), facultatif: true });
}

for (const set of new Set([...donnees.catalogue.sets, ...Object.keys((() => { const c = {}; const p = path.resolve(__dirname, '..', 'sets-jeu.js'); if (fs.existsSync(p)) new Function('window', fs.readFileSync(p, 'utf8'))(c); return c.SETS_JEU || {}; })())])) {
  aTelecharger.push({ url: `${BASE}/equipment/intro/sets/icon_equipmentset_${set.toLowerCase()}.webp`, fichier: path.join(RACINE, 'sets', `${set}.webp`) });
}

// Toutes les pièces du catalogue, et pas seulement celles du compte : le site
// sert aussi à regarder l'équipement qu'on n'a pas encore.
{
  const contexte = {};
  const chemin = path.resolve(__dirname, '..', 'sets-jeu.js');
  if (fs.existsSync(chemin)) new Function('window', fs.readFileSync(chemin, 'utf8'))(contexte);
  const paires = new Set();
  for (const [set, def] of Object.entries(contexte.SETS_JEU || {})) {
    for (const emplacement of def.emplacements || []) paires.add(`${set}|${emplacement}`);
  }
  // Ce que le compte porte déjà, au cas où le catalogue serait en retard.
  for (const e of donnees.compte.equipements) paires.add(`${e.set}|${e.emplacement}`);
  for (const paire of paires) {
    const [set, emplacement] = paire.split('|');
    aTelecharger.push({
      url: `${BASE}/equipment/intro/icons/icon_equipment_${set.toLowerCase()}_${emplacement.toLowerCase()}.webp`,
      fichier: path.join(RACINE, 'equipement', `${set}_${emplacement}.webp`),
      facultatif: true,
    });
  }
}

// Les icônes de statistiques du jeu portent le nom exact de la stat qu'elles illustrent.
// Certaines n'existent qu'en version « pourcentage » : on tente les deux, les absences
// sont sans conséquence puisque le site retombe sur du texte.
for (const stat of donnees.catalogue.stats) {
  aTelecharger.push({ url: `${BASE}/shared/icons/icon_unit_stat_${stat}.webp`, fichier: path.join(RACINE, 'stats', `${stat}.webp`), facultatif: true });
  aTelecharger.push({ url: `${BASE}/shared/icons/icon_unit_stat_${stat}_percent.webp`, fichier: path.join(RACINE, 'stats', `${stat}_percent.webp`), facultatif: true });
}

// Classe du héros, type d'unité et couleur : trois familles d'icônes du jeu.
for (const classe of ['singlestriker', 'areaattacker', 'defender', 'healer', 'manipulator', 'supporter', 'support', 'tank']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/classIcons/icon_class_${classe}.webp`, fichier: path.join(RACINE, 'classes', `${classe}.webp`), facultatif: true });
}
for (const type of ['melee', 'ranged', 'cavalry', 'infantry', 'heavyinfantry', 'siege']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/unitIcons/icon-flat-unit-${type}.webp`, fichier: path.join(RACINE, 'types', `${type}.webp`), facultatif: true });
}
for (const couleur of ['red', 'blue', 'green', 'yellow', 'purple']) {
  aTelecharger.push({ url: `${BASE}/heroes/intro/colorIcons/icon-colour-${couleur}.webp`, fichier: path.join(RACINE, 'couleurs', `${couleur}.webp`), facultatif: true });
}

// Les reliques du catalogue du jeu, dont le wiki reprend les identifiants exacts.
// On les prend toutes, pas seulement celles du compte : le site les montre aussi
// pour les héros des autres.
{
  const contexte = {};
  const chemin = path.resolve(__dirname, '..', 'reliques-jeu.js');
  if (fs.existsSync(chemin)) {
    new Function('window', fs.readFileSync(chemin, 'utf8'))(contexte);
    for (const relique of Object.keys(contexte.RELIQUES_JEU || {})) {
      aTelecharger.push({
        url: `${BASE}/relics/full/full_relic_${relique}.webp`,
        fichier: path.join(RACINE, 'reliques', `${relique}.webp`),
        facultatif: true,
      });
    }
  }
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
