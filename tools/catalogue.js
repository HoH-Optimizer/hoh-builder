// Récupère le catalogue officiel du jeu et le fichier de traduction français,
// tels que le site communautaire Forge of Games les rediffuse.
//
// POURQUOI CETTE SOURCE
// --------------------
// Le compte d'un joueur (notre export) ne contient que son état : quels héros,
// quels objets, à quel niveau. Tout ce qui appartient au JEU — statistiques de
// base, progression par niveau, noms traduits, bonus d'ensemble, effets d'éveil —
// vit dans un catalogue téléchargé séparément par le client, que l'export ne
// capture pas. Forge of Games publie ce catalogue tel quel sur deux adresses :
//
//   /api/hoh/coreData                              catalogue binaire du jeu
//   /api/hoh/coreData/localization?localeCode=…    fichier de traduction
//
// Les deux sont au même format que l'export : du Protocol Buffers sans schéma,
// encodé en base64. On les relit donc avec notre propre décodeur.
//
// Usage : node tools/catalogue.js

const fs = require('node:fs');
const path = require('node:path');
const D = require('../decodeur.js');

const RACINE = path.join(__dirname, '..');
const BASE = 'https://forgeofgames.com/api/hoh/coreData';

/* ------------------------------------------------------------ téléchargement */

async function telecharger(url) {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`${reponse.status} sur ${url}`);
  const { version, data } = await reponse.json();
  return { version, octets: new Uint8Array(Buffer.from(data, 'base64')) };
}

/* ------------------------------------------------- lecture du catalogue brut */

// Le catalogue est un seul énorme message dont chaque numéro de champ est une
// rubrique (bâtiments, unités, héros, technologies…). On ne s'intéresse qu'à
// quatre d'entre elles, repérées en observant les données.
const RUBRIQUE = {
  AGES: 16,        // les âges du jeu et leur ordre
  MODIF_AGE: 22,   // le multiplicateur que chaque âge applique aux reliques
  BATIMENTS: 2,    // tous les bâtiments de la ville, casernes comprises
  UNITES: 3,       // statistiques de base de chaque unité, héros compris
  HEROS: 4,        // fiche de héros : couleur, classe, éveil, capacité
  PROGRESSION: 8,  // vitesse de montée des statistiques par niveau
  EVEIL: 13,       // bonus accordés par chaque palier d'éveil
  RELIQUES: 21,    // paliers de chaque relique et ce qu'ils apportent
  HEROS_BIS: 24,   // même contenu que HEROS, pour les derniers héros ajoutés
  UNITES_BIS: 25,  // idem pour UNITES
};

// En Protocol Buffers, une liste d'un seul élément s'écrit comme une valeur
// simple : tout champ censé être une liste doit passer par ici.
const tableau = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function rubriques(octets) {
  const parNumero = {};
  for (const champ of D.tenterMessage(octets)) (parNumero[champ.numero] ||= []).push(champ.valeur);
  return (...numeros) => numeros.flatMap((n) => (parNumero[n] || []).map((b) => D.decoder(b, 12)));
}

/* ------------------------------------------------------- tables de décodage */

// Le catalogue désigne chaque statistique par un numéro. La correspondance a été
// établie en comparant, pour les 136 héros connus du wiki, les valeurs du
// catalogue à leurs statistiques publiées : un numéro qui vaut 130 là où le wiki
// annonce « Attack: 130 » sur 136 héros ne laisse guère de doute.
const STAT = {
  // Le numéro 9 n'apparaît dans aucune fiche du wiki, mais il vaut 1,25 sur les
  // héros de mêlée et 6 sur les archers : c'est la portée d'attaque.
  9: 'AttackRange',
  4: 'AssetRadius', 5: 'Attack', 10: 'AttackSpeed', 11: 'BaseDamage',
  20: 'Defense', 27: 'Focus', 28: 'FocusRegen', 32: 'HitTime',
  34: 'MaxFocus', 35: 'MaxHitPoints', 36: 'MoveSpeed', 39: 'ProjectileSpeed',
  46: 'SquadRows', 47: 'SquadSize', 48: 'SquadSpacingX', 49: 'SquadSpacingY',
};

// Même méthode pour la couleur et la classe : les numéros du catalogue ont été
// recoupés avec les fiches du wiki. L'accord est net (26 à 29 héros par valeur,
// au plus un désaccord isolé), ce qui confirme la lecture — et signale au passage
// les quelques fiches erronées du wiki.
const COULEUR = { 1: 'blue', 2: 'green', 4: 'purple', 5: 'red', 6: 'yellow' };
const CLASSE = {
  1: 'area_attacker', 4: 'defender', 7: 'healer',
  8: 'manipulator', 9: 'single_striker', 10: 'supporter',
};
const TYPE = { 1: 'Cavalry', 2: 'HeavyInfantry', 3: 'Infantry', 4: 'Ranged', 5: 'Siege' };

const sansPrefixe = (s, p) => (typeof s === 'string' ? s.replace(p, '') : undefined);

/* ------------------------------------------------------------- traductions */

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

// Le jeu balise ses textes (<style=…>, <color=…>) pour les colorer à l'écran.
const sansBalises = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* ------------------------------------------- bonus d'ensemble, en clair puis chiffrés */

// Les effets d'ensemble ne sont écrits nulle part sous forme de nombres : ils
// n'existent que dans leur phrase de description (« Dégâts uniques infligés +5 % »).
// On la relit donc pour retrouver la statistique et la valeur. Les libellés
// varient d'un ensemble à l'autre — abréviations, tournures, apostrophes — d'où
// cette table de synonymes en plus des libellés officiels.
const SYNONYMES = {
  'points de bouclier': 'ShieldTakenAmp',
  'bouclier': 'ShieldTakenAmp',
  'bouclier donne': 'ShieldGivenAmp',
  'soins': 'HealTakenAmp',
  'quantite de soins': 'HealTakenAmp',
  'soins prodigues': 'HealGivenAmp',
  'degats de capacite de zone': 'AoeDamageAmp',
  'degats de zone': 'AoeDamageAmp',
  'deg zone': 'AoeDamageAmp',
  'degats uniques': 'SingleTargetDamageAmp',
  'deg uniques': 'SingleTargetDamageAmp',
  'degats critiques': 'CritDamage',
  'deg crit': 'CritDamage',
  'chance de coup critique': 'CritChance',
  'chances de coup critique': 'CritChance',
  'chance de crit': 'CritChance',
  'chances de crit': 'CritChance',
  'esquive': 'Evasion',
  'charge initiale': 'InitialFocusInSecondsBonus',
  'vitesse d attaque': 'AttackSpeed',
  'vitesse d atq': 'AttackSpeed',
  'vit d atq': 'AttackSpeed',
  'degats d attaque de base': 'BasicAttackDamageAmp',
  'deg d attaque de base': 'BasicAttackDamageAmp',
  'degats d attaque de base subis': 'BasicAttackDamageTakenAmp',
  'deg d attaque de base subis': 'BasicAttackDamageTakenAmp',
  'degats de brulure': 'BurnDamageAmp',
  'burn damage': 'BurnDamageAmp',
  'attack': 'Attack',
  'attaque': 'Attack',
  'defense': 'Defense',
  'points de vie': 'MaxHitPoints',
};

// « Dégâts d’ATQ » et « Dégâts d'ATQ » sont le même libellé : on ramène tout à une
// forme unique (sans accent, sans apostrophe, en minuscules) avant de comparer.
const normaliser = (s) => String(s)
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function lireBonusDEnsemble(phrase, libellesStats) {
  const texte = sansBalises(phrase);
  if (!texte) return { texte: '', bonus: [] };

  const bonus = [];
  for (const morceau of texte.split(/\s+(?:et|and)\s+/i)) {
    const m = morceau.match(/^(.+?)\s*([+-]\s*[\d]+(?:[.,]\d+)?)\s*(%|coups\/minute|s)?\.?$/i);
    if (!m) return { texte, bonus: [] }; // phrase inattendue : on garde le texte seul

    // « Dégâts uniques infligés », « Soins reçus » : le participe précise le sens
    // mais ne fait pas partie du nom de la statistique.
    const libelle = normaliser(m[1]).replace(/ (infliges?|infligee?s?|recus?|recue?s?|dealt|taken)$/, '');
    const valeur = Number(m[2].replace(/\s/g, '').replace(',', '.'));
    const unite = (m[3] || '').toLowerCase();
    // « Charge initiale » nomme deux statistiques dans le jeu : la jauge de départ
    // (Focus) et les secondes gagnées sur le premier déclenchement. L'unité tranche.
    const stat = unite === 's' && libelle === 'charge initiale'
      ? 'InitialFocusInSecondsBonus'
      : libellesStats[libelle] || SYNONYMES[libelle];
    if (!stat) return { texte, bonus: [] };

    bonus.push({
      stat,
      // On range chaque valeur comme les données du jeu la rangent, pas comme
      // la phrase l'écrit :
      //   - un pourcentage devient une fraction ;
      //   - « coups/minute » est un affichage, la donnée est en attaques/seconde ;
      //   - « Charge initiale -1 s » est un affichage lui aussi : la donnée est un
      //     temps GAGNÉ, donc positif. L'infobulle d'un objet en jeu le confirme,
      //     qui écrit « -0,36 s » pour un 0,36 stocké.
      valeur: unite === '%' ? valeur / 100
        : unite === 'coups/minute' ? valeur / 60
        : unite === 's' ? -valeur
        : valeur,
      type: unite === '%' ? 'pourcentage' : 'plat',
    });
  }
  return { texte, bonus };
}

/* ------------------------------------------------------------------ écriture */

const entete = (titre, version, lignes) => `/* ${titre}
   -----------------------------------------------------------------------------
   FICHIER GÉNÉRÉ — ne pas modifier à la main.
   Régénéré par « node tools/catalogue.js » depuis le catalogue du jeu.
   Version du catalogue : ${version}
${lignes.map((l) => `   ${l}`).join('\n')}
   ========================================================================== */\n\n`;

// Un objet par ligne : le fichier reste lisible dans un diff, sans être un pavé.
function objetParLigne(objet) {
  const entrees = Object.entries(objet).map(([cle, valeur]) => `  ${JSON.stringify(cle)}: ${JSON.stringify(valeur)}`);
  return `{\n${entrees.join(',\n')}\n}`;
}

/* ---------------------------------------------------------------- programme */

async function principal() {
  console.log('Téléchargement du catalogue du jeu…');
  const catalogue = await telecharger(BASE);
  console.log('Téléchargement des traductions françaises…');
  const traductions = await telecharger(`${BASE}/localization?localeCode=fr-FR`);
  const version = catalogue.version;
  console.log(`Catalogue ${version} (${catalogue.octets.length} octets)`);

  const lire = rubriques(catalogue.octets);
  const fr = lireTraductions(traductions.octets);

  /* --- héros --------------------------------------------------------------- */

  const unites = new Map(
    lire(RUBRIQUE.UNITES, RUBRIQUE.UNITES_BIS).map((u) => [u.f2, u]),
  );

  const heros = {};
  for (const h of lire(RUBRIQUE.HEROS, RUBRIQUE.HEROS_BIS)) {
    const unite = unites.get(h.f2);
    if (!unite) continue;

    const base = {};
    for (const stat of tableau(unite.f4)) {
      const nom = STAT[stat?.f1 ?? 0];
      if (nom) base[nom] = stat.f2 ?? 0;
    }

    heros[h.f1] = {
      nom: fr[`Base.Heroes.hero.${h.f1}_Name`] || h.f1,
      etoiles: Number(sansPrefixe(unite.f6, 'unit_rarity.')) || 0,
      type: TYPE[unite.f5] || null,
      couleur: COULEUR[unite.f1] || null,
      classe: CLASSE[h.f4] || null,
      base,
    };
  }
  const nbHeros = Object.keys(heros).length;

  /* --- éveil --------------------------------------------------------------- */

  // Cinq paliers par héros. Un palier porte sur une statistique (numéro) et une
  // valeur ; le champ f1 marque les valeurs exprimées en pourcentage de la base.
  //
  // PIÈGE : tous les héros n'ont pas leur propre table. Les plus courants partagent
  // un éveil générique, nommé d'après leur classe et leur rareté
  // (« hero_awakening.Manipulator_Star_2 »). La fiche du héros dit laquelle il utilise :
  // il faut passer par cette référence, pas par son identifiant.
  const tables = {};
  for (const bloc of lire(RUBRIQUE.EVEIL)) {
    const nom = sansPrefixe(bloc.f1, 'hero_awakening.');
    if (!nom) continue;
    tables[nom] = tableau(bloc.f2).map((palier) => ({
      stat: STAT[palier?.f2 ?? 0] || `stat_${palier?.f2}`,
      valeur: palier?.f3 ?? 0,
      type: palier?.f1 === 1 ? 'pourcentage' : 'plat',
    }));
  }

  const eveil = {};
  let sansEveil = 0;
  for (const h of lire(RUBRIQUE.HEROS, RUBRIQUE.HEROS_BIS)) {
    const table = tables[sansPrefixe(h.f5, 'hero_awakening.')];
    if (table) eveil[h.f1] = table;
    else if (heros[h.f1]) sansEveil++;
  }

  /* --- casernes ------------------------------------------------------------ */

  // Chaque caserne accorde un forfait aux héros de son arme (« hero_building_boost »).
  // C'est la dernière source chiffrée qui manquait : le compte dit quelle caserne
  // le joueur possède, le catalogue dit ce qu'elle rapporte.
  const casernes = {};
  for (const batiment of lire(RUBRIQUE.BATIMENTS)) {
    for (const partie of tableau(batiment.f4)) {
      const boost = partie?.f105;
      if (typeof boost?.f1 !== 'string' || !/_Barracks_/.test(boost.f1)) continue;
      const apports = {};
      for (const s of tableau(boost.f2)) {
        const nom = STAT[s?.f1 ?? 0];
        if (nom) apports[nom] = s.f2 ?? 0;
      }
      casernes[boost.f1.replace('hero_building_boost.', '')] = apports;
    }
  }

  /* --- âges ---------------------------------------------------------------- */

  // Chaque âge a un rang (pour savoir lequel est le plus avancé) et un
  // multiplicateur, qui sert à mettre les reliques à l'échelle du joueur.
  const ages = {};
  for (const a of lire(RUBRIQUE.AGES)) if (typeof a.f1 === 'string') ages[a.f1] = { rang: a.f2 ?? 0, modificateur: 1 };
  for (const a of lire(RUBRIQUE.MODIF_AGE)) if (ages[a.f1]) ages[a.f1].modificateur = a.f2 ?? 1;

  /* --- reliques ------------------------------------------------------------ */

  // Une relique se monte en paliers ; chaque palier remplace le précédent (les
  // valeurs sont cumulées dans la définition, pas à additionner entre elles).
  const reliques = {};
  for (const bloc of lire(RUBRIQUE.RELIQUES)) {
    const id = sansPrefixe(bloc.f1, 'relic.');
    if (!id) continue;
    // PIÈGE : le champ f4 n'est pas le niveau de la relique — il plafonne à 11 et
    // se répète. Le vrai niveau est le suffixe du nom de la capacité du palier
    // (« ability.FalconryGlove_12 »), et à défaut le rang dans la liste.
    const paliers = tableau(bloc.f2).map((p, rang) => {
      const apports = {};
      for (const b of tableau(p.f6)) {
        const detail = b?.f2;
        if (!detail || typeof detail !== 'object') continue;
        const nom = STAT[detail.f4 ?? 0] || `stat_${detail.f4}`;
        apports[nom] = (apports[nom] || 0) + (detail.f5 ?? 0);
      }
      const suffixe = /_(\d+)$/.exec(String(p.f1 || ''));
      return { niveau: suffixe ? Number(suffixe[1]) : rang + 1, apports };
    }).sort((a, b) => a.niveau - b.niveau);

    reliques[id] = {
      nom: fr[`Base.Relics.${id}_Name`] || id,
      description: sansBalises(fr[`Base.Relics.${id}_Desc`]),
      paliers,
    };
  }

  /* --- ensembles d'équipement ---------------------------------------------- */

  // Le nom français de chaque statistique, pour relire les phrases d'effet.
  const libellesStats = {};
  for (const [cle, texte] of Object.entries(fr)) {
    const m = cle.match(/^Base\.UnitStats\.unit_stat\.([A-Za-z0-9]+)(?:_Percent)?$/);
    if (m) libellesStats[normaliser(texte).replace(/ %$/, '')] = m[1];
  }

  const sets = {};
  const nomsSets = {};
  const nomsObjets = {};
  for (const [cle, texte] of Object.entries(fr)) {
    const m = cle.match(/^Base\.EquipmentSets\.equipment_set\.([A-Za-z0-9]+)_(Name|Desc|Hand|Garment|Hat|Neck|Ring)(?:_Name)?$/);
    if (!m) continue;
    const [, set, quoi] = m;
    const fiche = (sets[set] ||= { emplacements: [] });
    if (quoi === 'Name') nomsSets[set] = texte.replace(/^Ensemble d[e’']\s*/i, '').replace(/^Ensemble\s+/i, '');
    else if (quoi === 'Desc') fiche.phrase = texte;
    else { fiche.emplacements.push(quoi); nomsObjets[`${set}_${quoi}`] = texte; }
  }

  let chiffres = 0;
  const setsJeu = {};
  for (const [set, fiche] of Object.entries(sets)) {
    if (!fiche.emplacements.length) continue;
    const { texte, bonus } = lireBonusDEnsemble(fiche.phrase, libellesStats);
    if (bonus.length) chiffres++;
    setsJeu[set] = {
      // Un ensemble d'armement compte 2 pièces (main, vêtement), un ensemble de
      // parure en compte 3 (chapeau, cou, anneau) : le jeu le dit en listant les
      // emplacements auxquels l'ensemble donne un objet.
      pieces: fiche.emplacements.length,
      emplacements: fiche.emplacements.sort(),
      effet: texte,
      bonus,
    };
  }

  /* --- écriture ------------------------------------------------------------ */

  const noms = {
    heros: Object.fromEntries(Object.entries(heros).map(([id, h]) => [id, h.nom])),
    sets: nomsSets,
    objets: nomsObjets,
    types: {
      Ranged: 'À distance', Infantry: 'Infanterie', HeavyInfantry: 'Infanterie lourde',
      Cavalry: 'Cavalerie', Siege: 'Siège',
    },
  };

  fs.writeFileSync(
    path.join(RACINE, 'heros-jeu.js'),
    entete('CATALOGUE DES HÉROS', version, [
      `${nbHeros} héros : nom français, rareté, type, couleur, classe et`,
      'statistiques de base au niveau 1, telles que le jeu les définit.',
      'La montée par niveau est calculée par formules.js.',
    ]) + `window.HEROS_JEU = ${objetParLigne(heros)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'sets-jeu.js'),
    entete("ENSEMBLES D'ÉQUIPEMENT", version, [
      "Nombre de pièces et effet de chaque ensemble. L'effet n'existe dans le jeu",
      "que sous forme de phrase : « bonus » en est la relecture chiffrée, vide",
      'quand la phrase ne se laisse pas relire — « effet » reste alors affichable.',
    ]) + `window.SETS_JEU = ${objetParLigne(setsJeu)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'eveil-jeu.js'),
    entete("PALIERS D'ÉVEIL", version, [
      "Les cinq paliers d'éveil de chaque héros, dans l'ordre. Un héros éveillé au",
      'niveau III cumule les trois premiers. Les statistiques encore non identifiées',
      'sont nommées « stat_<numéro> » : elles sont affichées mais non comptées.',
    ]) + `window.EVEIL_JEU = ${objetParLigne(eveil)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'casernes-jeu.js'),
    entete('CASERNES', version, [
      "Ce que chaque caserne apporte aux héros de son arme. L'export du compte dit",
      'laquelle le joueur possède ; ce fichier dit ce qu\'elle vaut.',
    ]) + `window.CASERNES_JEU = ${objetParLigne(casernes)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'reliques-jeu.js'),
    entete('RELIQUES', version, [
      'Les paliers de chaque relique. Les valeurs sont celles du palier atteint,',
      'elles ne se cumulent pas entre paliers.',
      '',
      "ATTENTION : ce sont des valeurs DE RÉFÉRENCE. Le jeu les met à l'échelle de",
      "l'âge du joueur — c'est ce que fait « relic_boost_age_modifier » dans le",
      "catalogue. La valeur réellement accordée est arrondie au supérieur :",
      '  valeur = ceil(référence x modificateur de l\'âge)   voir ages-jeu.js',
      'Vérifié ligne à ligne contre le tableau du wiki, aux deux extrémités de',
      "l'échelle (Âge de pierre, x1, et Haut Moyen Âge, x2,854).",
    ]) + `window.RELIQUES_JEU = ${objetParLigne(reliques)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'ages-jeu.js'),
    entete('ÂGES', version, [
      "Le rang de chaque âge (pour savoir lequel est le plus avancé) et le",
      "multiplicateur qu'il applique aux reliques.",
    ]) + `window.AGES_JEU = ${objetParLigne(ages)};\n`,
  );

  fs.writeFileSync(
    path.join(RACINE, 'noms-fr.js'),
    entete('NOMS FRANÇAIS', version, [
      'Les noms tels que le jeu les affiche, tirés de son fichier de traduction.',
    ]) + `window.NOMS_FR = ${objetParLigne(noms)};\n`,
  );

  console.log(`heros-jeu.js  : ${nbHeros} héros`);
  console.log(`sets-jeu.js   : ${Object.keys(setsJeu).length} ensembles, ${chiffres} effets chiffrés`);
  console.log(`eveil-jeu.js  : ${Object.keys(eveil).length} héros (${Object.keys(tables).length} tables, ${sansEveil} héros sans éveil)`);
  console.log(`casernes-jeu.js : ${Object.keys(casernes).length} paliers de caserne`);
  console.log(`reliques-jeu.js : ${Object.keys(reliques).length} reliques`);
  console.log(`ages-jeu.js   : ${Object.keys(ages).length} âges`);
  console.log(`noms-fr.js    : ${Object.keys(noms.heros).length} héros, ${Object.keys(nomsSets).length} ensembles, ${Object.keys(nomsObjets).length} objets`);
}

principal().catch((e) => { console.error(e.message); process.exit(1); });
