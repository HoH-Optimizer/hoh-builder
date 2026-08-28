'use strict';
// Écrit les noms du jeu dans une autre langue que le français.
//
// POURQUOI UN OUTIL SÉPARÉ. « tools/catalogue.js » fait bien plus que des noms :
// il relit les phrases d'effet d'ensemble pour en tirer des chiffres, recompose
// les gabarits de capacité, retrouve les paliers d'éveil. Tout cela repose sur
// la LANGUE française — les libellés de statistiques y sont reconnus par leur
// nom français. Le refaire pour l'anglais demanderait de tout réécrire.
//
// Or les noms, eux, ne demandent rien de tel : le fichier de traduction du jeu
// les donne déjà, clé par clé, dans la langue qu'on lui réclame. C'est donc
// tout ce que cet outil fait — les noms, rien d'autre. Les valeurs chiffrées,
// elles, sont les mêmes dans toutes les langues et restent où elles sont.
//
// LA SOURCE est la même que pour le français : Forge of Games rediffuse le
// fichier de traduction du jeu, un « localeCode » par langue.
//
//   node tools/noms.js en-US en    écrit noms-en.js
//
// Le second argument est le suffixe du fichier, et la clé que le site emploie
// pour désigner la langue.

const fs = require('node:fs');
const path = require('node:path');
const D = require('../decodeur.js');

const RACINE = path.join(__dirname, '..');
const BASE = 'https://forgeofgames.com/api/hoh/coreData';

// Les types d'unité ne sont pas dans le fichier de traduction sous une clé
// commode : ils viennent du jeu sous leur nom anglais, et le site les affiche.
// Les cinq tiennent ici, une langue par colonne.
const TYPES = {
  en: { Ranged: 'Ranged', Infantry: 'Infantry', HeavyInfantry: 'Heavy Infantry', Cavalry: 'Cavalry', Siege: 'Siege' },
};

async function telecharger(url) {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`${reponse.status} sur ${url}`);
  const { version, data } = await reponse.json();
  return { version, octets: new Uint8Array(Buffer.from(data, 'base64')) };
}

// Le fichier de traduction est une simple liste de paires { clé, texte }.
function lireTraductions(octets) {
  const dictionnaire = {};
  for (const champ of D.tenterMessage(octets)) {
    const paire = D.tenterMessage(champ.valeur);
    if (!paire) continue;
    const cle = paire.find((c) => c.numero === 1);
    const texte = paire.find((c) => c.numero === 2);
    if (cle && texte) {
      dictionnaire[Buffer.from(cle.valeur).toString('utf8')] = Buffer.from(texte.valeur).toString('utf8');
    }
  }
  return dictionnaire;
}

const sansBalises = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// LE NOM D'UN ENSEMBLE SE PORTE DIFFÉREMMENT SELON LA LANGUE. Le français dit
// « Ensemble de Chacal » : le site écrivant déjà le mot « ensemble » autour du
// nom, il ne garde que « Chacal ». L'anglais dit « Jackal's Set », où le mot
// vient en second et fait corps avec le nom — « Jackal's » tout seul ne veut
// plus rien dire. On le laisse donc entier.
//
// C'est pour cette raison qu'on ne peut pas nettoyer ces noms par une règle
// unique : chaque langue demande la sienne.
const NETTOYAGE = {
  en: (texte) => texte.replace(/\bset$/, 'Set'),   // le jeu écrit tantôt « Set », tantôt « set »
};
const nomDEnsemble = (texte, langue) => {
  const propre = sansBalises(texte);
  return (NETTOYAGE[langue] || ((t) => t))(propre).trim();
};

async function principal() {
  const [locale, suffixe] = process.argv.slice(2);
  if (!locale || !suffixe) {
    console.error('Usage : node tools/noms.js <localeCode> <suffixe>   ex. node tools/noms.js en-US en');
    process.exit(1);
  }

  console.log(`Téléchargement des traductions ${locale}…`);
  const { version, octets } = await telecharger(`${BASE}/localization?localeCode=${locale}`);
  const dico = lireTraductions(octets);
  console.log(`  ${Object.keys(dico).length} clés reçues, catalogue ${version}`);

  const heros = {};
  for (const [cle, texte] of Object.entries(dico)) {
    const m = cle.match(/^Base\.Heroes\.hero\.([A-Za-z0-9]+)_Name$/);
    if (m) heros[m[1]] = sansBalises(texte);
  }

  const sets = {};
  const objets = {};
  for (const [cle, texte] of Object.entries(dico)) {
    const m = cle.match(/^Base\.EquipmentSets\.equipment_set\.([A-Za-z0-9]+)_(Name|Hand|Garment|Hat|Neck|Ring)(?:_Name)?$/);
    if (!m) continue;
    const [, set, quoi] = m;
    if (quoi === 'Name') sets[set] = nomDEnsemble(texte, suffixe);
    else objets[`${set}_${quoi}`] = sansBalises(texte);
  }

  const reliques = {};
  for (const [cle, texte] of Object.entries(dico)) {
    const m = cle.match(/^Base\.Relics\.([A-Za-z0-9]+)_Name$/);
    if (m) reliques[m[1]] = sansBalises(texte);
  }

  // Le nom que le jeu donne à chaque statistique : c'est lui que le site écrit
  // dans le tableau, dans les cases d'équipement et dans les infobulles.
  const stats = {};
  for (const [cle, texte] of Object.entries(dico)) {
    const m = cle.match(/^Base\.UnitStats\.unit_stat\.([A-Za-z0-9]+)$/);
    if (m) stats[m[1]] = sansBalises(texte);
  }

  const noms = { heros, sets, objets, reliques, stats, types: TYPES[suffixe] || {} };

  const objetParLigne = (o) => '{\n'
    + Object.entries(o).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')
    + '\n}';

  const sortie = path.join(RACINE, `noms-${suffixe}.js`);
  fs.writeFileSync(sortie, [
    `/* NOMS DU JEU — ${locale}`,
    '   -----------------------------------------------------------------------------',
    '   FICHIER GÉNÉRÉ — ne pas modifier à la main.',
    `   Régénéré par « node tools/noms.js ${locale} ${suffixe} ».`,
    `   Version du catalogue : ${version}`,
    "   Les noms tels que le jeu les affiche, tirés de son fichier de traduction.",
    '   ========================================================================== */',
    '',
    `window.NOMS_${suffixe.toUpperCase()} = ${objetParLigne(noms)};`,
    '',
  ].join('\n'));

  console.log(`noms-${suffixe}.js : ${Object.keys(heros).length} héros, ${Object.keys(sets).length} ensembles, `
    + `${Object.keys(objets).length} objets, ${Object.keys(reliques).length} reliques, ${Object.keys(stats).length} statistiques`);
}

principal().catch((e) => { console.error(e); process.exit(1); });
