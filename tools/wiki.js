// Récupère le catalogue des héros (rareté, nom, stats de base) depuis le wiki
// communautaire heroesofhistory.wiki.
//
// Le wiki embarque les définitions officielles du jeu dans un de ses scripts, au
// même format que notre export (HeroUnitDefinitionDTO). C'est notre seule source
// pour les données que le compte ne contient pas : la rareté d'un héros et ses
// statistiques de base ne dépendent pas du joueur, elles appartiennent au jeu.
//
// Usage : node tools/wiki.js

const fs = require('node:fs');
const path = require('node:path');

const BASE = 'https://heroesofhistory.wiki';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36' };

const recuperer = async (url) => {
  const reponse = await fetch(url, { headers: UA });
  if (!reponse.ok) throw new Error(`${reponse.status} sur ${url}`);
  return reponse.text();
};

// L'adresse du script contient une empreinte qui change à chaque mise à jour du
// wiki : on la retrouve à chaque fois plutôt que de la figer.
async function trouverLeCatalogue(pageExemple) {
  const html = await recuperer(pageExemple);
  const scripts = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]))];
  for (const chemin of scripts) {
    const contenu = await recuperer(BASE + chemin);
    if (contenu.includes('HeroUnitDefinitionDTO')) return contenu;
  }
  throw new Error("Le script contenant les définitions de héros est introuvable. Le wiki a peut-être changé de structure.");
}

// La correspondance identifiant interne → nom affiché vient de la page de liste,
// où chaque lien porte l'icône Unit_<Identifiant>.webp.
async function recupererLesNoms() {
  const html = await recuperer(`${BASE}/heroes`);
  const noms = {};
  for (const [, contenu] of html.matchAll(/<a[^>]+href="\/heroes\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const icone = contenu.match(/\/heroes\/intro\/icons\/Unit_([A-Za-z0-9_]+)\.webp/);
    if (!icone) continue;
    const texte = contenu
      .replace(/<[^>]*>/g, ' ')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    if (texte) noms[icone[1]] = texte;
  }
  return noms;
}

function extraireLesHeros(catalogue, noms) {
  const heros = {};
  const definition = /"@type":"type\.googleapis\.com\/HeroUnitDefinitionDTO",id:"unit\.Unit_([A-Za-z0-9_]+)"([\s\S]{0,1200})/g;

  for (const [, identifiant, suite] of catalogue.matchAll(definition)) {
    // La rareté est le premier composant de la définition : elle suit de près.
    const rarete = suite.match(/unit_rarity\.(\d)/);
    const type = suite.match(/unitType:"unit_type\.([A-Za-z]+)"/);
    const couleur = suite.match(/unitColor:"unit_color\.([A-Za-z]+)"/);

    // Les statistiques portent le nom du héros dans leur identifiant : on ne risque
    // donc pas de ramasser celles d'un voisin.
    const stats = {};
    const motif = new RegExp(`unit_stat_value\\.Unit_${identifiant}_Stat_[A-Za-z]+",statDefinitionId:"unit_stat\\.([A-Za-z]+)",value:(-?[\\d.]+)`, 'g');
    for (const [, nom, valeur] of catalogue.matchAll(motif)) stats[nom] = Number(valeur);

    if (!rarete && !Object.keys(stats).length) continue;
    heros[identifiant] = {
      nom: noms[identifiant] || null,
      etoiles: rarete ? Number(rarete[1]) : null,
      type: type ? type[1] : null,
      couleur: couleur ? couleur[1] : null,
      base: stats,
    };
  }
  return heros;
}

(async () => {
  console.log('Recherche du catalogue sur le wiki…');
  const catalogue = await trouverLeCatalogue(`${BASE}/heroes/artemisia-i-of-caria`);
  console.log(`  script trouvé (${(catalogue.length / 1048576).toFixed(1)} Mo)`);

  const noms = await recupererLesNoms();
  console.log(`  ${Object.keys(noms).length} noms affichés récupérés`);

  const tous = extraireLesHeros(catalogue, noms);

  // Le script décrit aussi les unités ennemies : on ne garde que les héros jouables.
  // Les variantes « montées en étoiles » (AshokaTheGreatLegendary…) comptent aussi :
  // un héros monté prend la rareté de sa variante, pas celle de sa version de base.
  const compte = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'compte.json'), 'utf8'));
  const aGarder = new Set([...compte.catalogue.heros, ...Object.keys(noms)]);
  const retenus = {};
  for (const id of [...aGarder].sort()) if (tous[id]) retenus[id] = tous[id];

  const sortie = path.resolve(__dirname, '..', 'heros-jeu.js');
  fs.writeFileSync(sortie, `window.HEROS_JEU = ${JSON.stringify(retenus)};\n`);

  const parEtoiles = {};
  Object.values(retenus).forEach((h) => { parEtoiles[h.etoiles] = (parEtoiles[h.etoiles] || 0) + 1; });
  const sansNom = Object.values(retenus).filter((h) => !h.nom).length;
  const sansStats = Object.values(retenus).filter((h) => !h.base.Attack).length;

  console.log(`\nÉcrit heros-jeu.js — ${Object.keys(retenus).length} héros sur ${compte.catalogue.heros.length}`);
  console.log('  par nombre d\'étoiles :', JSON.stringify(parEtoiles));
  console.log(`  sans nom affiché : ${sansNom} · sans statistiques : ${sansStats}`);
})();
