/* Simulateur d'équipement Heroes of History — logique d'interface.
   Les règles de calcul sont volontairement isolées dans formules.js. */

const NOM_SLOT = { Hand: 'Main', Garment: 'Vêtement', Hat: 'Chapeau', Neck: 'Cou', Ring: 'Anneau' };

// Ce que le jeu dessine dans un emplacement vide : la silhouette de la pièce
// attendue. Redessinées en SVG plutôt que découpées dans une capture, pour rester
// nettes à toutes les tailles et suivre la couleur du thème.
const SILHOUETTE = {
  Hand: `<svg class="silhouette" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13.2 3.4 19 9.2l-1.6 1.6-1-1-5.8 5.8 1 1-1.6 1.6-1.5-1.5-3.3 3.3-1.6-1.6 3.3-3.3-1.5-1.5 1.6-1.6 1 1 5.8-5.8-1-1 1.4-1.8Z"/></svg>`,
  Garment: `<svg class="silhouette" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3 5 5.2v5.3c0 4.2 2.9 7.7 7 8.9 4.1-1.2 7-4.7 7-8.9V5.2L15 3l-3 1.8L9 3Z"/></svg>`,
  Hat: `<svg class="silhouette" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v10H8z"/><path d="M3 15h18v2.2H3z"/></svg>`,
  Neck: `<svg class="silhouette" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3a7 7 0 0 0-7 7h2.2A4.8 4.8 0 0 1 12 5.2 4.8 4.8 0 0 1 16.8 10H19a7 7 0 0 0-7-7Z"/>
    <path d="M12 11.5 8.6 17.3h6.8L12 11.5Z"/></svg>`,
  Ring: `<svg class="silhouette" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 8.5a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Zm0 2.3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"/>
    <path d="m9.6 3 2.4 4 2.4-4h-4.8Z"/></svg>`,
};

// Libellés repris mot pour mot de l'écran « Stats de profil » du jeu.
// Ceux qui n'y figuraient pas sont traduits dans le même esprit.
const NOM_STAT = {
  Attack: 'Attaque',
  Defense: 'Défense',
  MaxHitPoints: 'Points de vie',
  HitPoints: 'Points de vie',
  BaseDamage: 'Dégâts de base',
  InitialFocusInSecondsBonus: 'Charge initiale',
  AttackRange: "Portée d'attaque",
  // Le jeu ne stocke pas ces deux durées : il les recalcule à partir de la charge.
  charge_initiale: 'Charge initiale',
  charge_normale: 'Charge normale',
  Focus: 'Charge',
  FocusRegen: 'Régén. de charge',
  SingleTargetDamageAmp: 'Dégâts uniques',
  AoeDamageAmp: 'Dégâts de zone',
  DotDamageAmp: 'Dégâts sur la durée',
  HealGivenAmp: 'Soin prodigué',
  ShieldGivenAmp: 'Bouclier donné',
  BasicAttackDamageAmp: "Dégâts d'attaque de base",
  AttackSpeed: "Vitesse d'attaque",
  CritChance: 'Chances de crit',
  CritDamage: 'Dégâts crit',
  MoveSpeed: 'Vitesse de déplacement',
  Evasion: 'Esquive',
  HealTakenAmp: 'Soins reçus',
  ShieldTakenAmp: 'Bouclier reçu',
  CritHealChance: 'Chances de soin crit',
  BurnDamageAmp: 'Dégâts de brûlure',
  LightningDamageAmp: 'Dégâts de foudre',
  StormcastDamageAmp: 'Dégâts de tempête',
  StunDurationAmp: "Durée d'étourdissement",
  AttackBuffGivenAmp: "Bonus d'attaque donné",
  DefenseBuffGivenAmp: 'Bonus de défense donné',
  DefenseDebuffGivenAmp: 'Réduction de défense infligée',
};

// L'écran « Stats » du jeu range les statistiques en quatre familles, dans cet
// ordre. On le reprend tel quel pour qu'on retrouve ses repères d'un écran à
// l'autre. « charge_initiale » et « charge_normale » ne sont pas des statistiques
// stockées : le jeu les recalcule à partir de la charge (voir formules.js).
const FAMILLES_STATS = [
  { titre: 'Statistiques principales', stats: ['Attack', 'Defense', 'MaxHitPoints', 'BaseDamage'] },
  {
    titre: 'Statistiques de capacité',
    stats: ['charge_initiale', 'charge_normale', 'SingleTargetDamageAmp', 'AoeDamageAmp',
      'DotDamageAmp', 'HealGivenAmp', 'ShieldGivenAmp'],
  },
  {
    titre: 'Statistiques offensives',
    stats: ['BasicAttackDamageAmp', 'AttackRange', 'AttackSpeed', 'CritChance', 'CritDamage'],
  },
  {
    titre: 'Statistiques défensives',
    stats: ['MoveSpeed', 'Evasion', 'HealTakenAmp', 'ShieldTakenAmp'],
  },
];

// Les statistiques que l'écran montre toujours, même à zéro — comme le jeu.
const STATS_AFFICHEES = FAMILLES_STATS.flatMap((f) => f.stats).filter((s) => !s.startsWith('charge_'));

// Les seules statistiques pour lesquelles une valeur de base a du sens à saisir.
const STATS_DE_BASE = ['Attack', 'Defense', 'MaxHitPoints'];

// La première famille de l'écran « Stats ». Ces quatre lignes restent affichées
// d'un héros à l'autre, même quand on ne connaît pas leur valeur : un tableau
// dont les lignes apparaissent et disparaissent se lit mal.
const STATS_PRINCIPALES = FAMILLES_STATS[0].stats;

// Comment écrire chaque statistique. Le jeu ne les montre pas toutes de la même
// façon : la vitesse d'attaque se compte en coups par minute, la charge en
// secondes, le reste en nombre ou en pourcentage.
const FORMAT_STAT = {
  Attack: 'entier', Defense: 'entier', MaxHitPoints: 'entier', BaseDamage: 'entier',
  Focus: 'entier', MaxFocus: 'entier', FocusRegen: 'decimal',
  AttackSpeed: 'coups', AttackRange: 'portee', MoveSpeed: 'vitesse',
  charge_initiale: 'secondes', charge_normale: 'secondes',
};

const NOM_TYPE = () => (window.NOMS_FR || {}).types || {};

// Les ères du jeu, telles qu'il les nomme en français.
const NOM_ERE = {
  DawnAge: 'Aube des temps', StoneAge: 'Âge de pierre', BronzeAge: 'Âge de bronze',
  MinoanEra: 'Ère minoenne', ClassicGreece: 'Grèce classique', EarlyRome: 'Rome antique',
  RomanEmpire: 'Empire romain', ByzantineEra: 'Ère byzantine', AgeOfTheFranks: 'Âge des Francs',
  FeudalAge: 'Époque féodale', IberianEra: 'Ère ibérique', KingdomOfSicily: 'Royaume de Sicile',
  HighMiddleAges: 'Haut Moyen Âge', EarlyGothicEra: 'Ère gothique précoce',
};

// L'éveil s'affiche en chiffres romains dans le jeu, sur la vignette du héros.
const ROMAIN = ['', 'I', 'II', 'III', 'IV', 'V'];

// La rareté d'un héros va de 2 à 5 étoiles. On montre les cinq crans pour que
// la valeur se lise d'un coup d'œil, les manquantes en creux.
// Les crans manquants utilisent un glyphe différent, pas seulement une autre couleur :
// la valeur reste lisible sans distinguer les nuances.
const etoilesHtml = (n) =>
  `<span class="etoiles" title="${n} étoiles sur 5">${'★'.repeat(n)}<span class="creuses">${'☆'.repeat(5 - n)}</span></span>`;

/* ---------------------------------------------------------------- utilitaires */

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const libelleStat = (s) => NOM_STAT[s] || s;

// Repli quand on n'a pas le vrai nom : on aère l'identifiant interne.
// "AbrahamLincoln" -> "Abraham Lincoln", "DArtagnan" -> "D Artagnan"
const joliNom = (id) => String(id)
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

// Les vrais noms français viennent du fichier de traduction du jeu, qui n'est pas
// toujours présent dans l'export. Tant qu'il manque, on affiche l'identifiant aéré.
const libelles = () => (donnees && donnees.libelles) || {};

// heros-jeu.js vient du catalogue du wiki : vrais noms, rareté et statistiques de base.
// Beaucoup d'identifiants internes ne sont pas des noms (SiouxShaman = Sitting Bull).
const fiche = (id) => (window.HEROS_JEU || {})[id];

// Un héros monté en étoiles prend la rareté et les stats de sa variante.
const ficheDuHeros = (h) => (h && fiche(h.montee)) || fiche(h?.id);

// Le fichier de traduction du jeu laisse sept identifiants sans traduction : les
// variantes légendaires, qu'il renvoie telles quelles. Chacune double un héros
// existant, dont le nom, lui, est traduit — on le reprend et on le qualifie.
const traduit = (id) => {
  const nom = libelles().heros?.[id] || (window.NOMS_FR || {}).heros?.[id];
  return nom && nom !== id ? nom : null;
};

const nomHeros = (id) => {
  const direct = traduit(id) || fiche(id)?.nom;
  if (direct && direct !== id) return direct;
  const base = id.replace(/Legendary$/, '');
  if (base !== id) {
    const nomBase = traduit(base) || fiche(base)?.nom;
    if (nomBase && nomBase !== base) return `${nomBase} (légendaire)`;
  }
  return joliNom(id);
};
const nomSet = (id) => libelles().sets?.[id] || (window.NOMS_FR || {}).sets?.[id] || joliNom(id);

// sets-jeu.js vient du catalogue officiel : nombre de pièces et bonus d'ensemble.
const defSet = (id) => (window.SETS_JEU || {})[id];
const nomType = (t) => NOM_TYPE()[t] || t;
const nomsReels = () => Boolean(libelles().heros);

const nombre = (v) => Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 });

// Un multiplicateur s'écrit avec ce qu'il faut de décimales, et pas une de plus :
// « x1 », « x1,156 », « x2,854 ».
const multiplicateur = (v) => Number(v).toFixed(3).replace(/.?0+$/, '').replace('.', ',');

// Le jeu n'écrit pas toutes les valeurs de la même façon. Deux pièges, vus sur
// l'infobulle d'un objet en jeu :
//   - la charge initiale se compte en SECONDES, et s'écrit en négatif : la valeur
//     stockée est un temps gagné, donc « -0,36 s » pour un 0,36 dans les données ;
//   - la vitesse d'attaque s'affiche en coups par minute, soit soixante fois la
//     valeur stockée (« 3 coups/min » pour 0,05).
function valeurAttribut(stat, valeur, type) {
  if (stat === 'InitialFocusInSecondsBonus') return `${signe(-valeur, (v) => nombre(v))} s`;
  if (stat === 'AttackSpeed') return `${signe(valeur, (v) => nombre(FORMULES.coupsParMinute(v)))} coups/min`;
  return type === 'pourcentage' ? signe(valeur, pourcent) : signe(valeur, nombre);
}
const pourcent = (v) => `${(v * 100).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} %`;
const signe = (v, f) => (v > 0 ? '+' : v < 0 ? '−' : '') + f(Math.abs(v));

// Le jeu donne un vrai nom à chaque pièce d'équipement (« Chevalière de Voyageur »),
// qui dépend de son ensemble et de son emplacement. À défaut, on décrit l'objet.
const nomObjet = (o) => libelles().objets?.[o.id]
  || (window.NOMS_FR || {}).objets?.[`${o.set}_${o.emplacement}`]
  || `${NOM_SLOT[o.emplacement] || o.emplacement} · set ${nomSet(o.set)}`;

/* ------------------------------------------------------------------- images */

// Le wiki dont proviennent les illustrations n'a pas toutes les icônes d'équipement :
// on retombe alors sur l'icône du set, puis sur un carré neutre.
// data-repli contient une suite d'adresses de secours, séparées par des virgules :
// on les essaie l'une après l'autre avant de renoncer.
window.repliIcone = (img) => {
  const suite = (img.getAttribute('data-repli') || '').split(',').filter(Boolean);
  if (suite.length) {
    img.setAttribute('data-repli', suite.slice(1).join(','));
    img.src = suite[0];
    return;
  }
  // Une petite pastille vide n'apporte rien : on la retire simplement.
  if (img.classList.contains('pastilleSet')) { img.remove(); return; }
  // Le portrait principal est retrouvé par son identifiant à chaque rendu : on le garde.
  if (img.id) { img.removeAttribute('src'); img.classList.add('sansIcone'); return; }
  const remplacement = document.createElement('span');
  remplacement.className = `${img.className} sansIcone`;
  remplacement.textContent = img.getAttribute('data-initiale') || '';
  img.replaceWith(remplacement);
};

const initiales = (texte) => joliNom(texte).split(' ').map((m) => m[0]).join('').slice(0, 2).toUpperCase();

// Le wiki n'a pas de portrait pour les variantes légendaires. Faute de mieux, on
// montre celui du héros qu'elles doublent : c'est le même personnage.
const portraitsDe = (id, dossier = 'heros') => {
  const chemins = [`images/${dossier}/${encodeURIComponent(id)}.webp`];
  const base = id.replace(/Legendary$/, '');
  if (base !== id) chemins.push(`images/${dossier}/${encodeURIComponent(base)}.webp`);
  return chemins;
};


// Sept sets n'ont pas d'icône sur le wiki : elles ont été découpées dans des captures
// du jeu et enregistrées en .png, d'où le second repli.
const imgObjet = (o) => {
  const set = encodeURIComponent(o.set);
  const piece = encodeURIComponent(`${o.set}_${o.emplacement}`);
  // On cherche d'abord l'objet lui-même, puis seulement à défaut l'icône du set.
  const replis = [
    `images/equipement/${piece}.png`,
    `images/sets/${set}.webp`,
    `images/sets/${set}.png`,
  ];
  return `<img class="icone" src="images/equipement/${piece}.webp"`
    + ` data-repli="${replis.join(',')}" data-initiale="${esc(initiales(o.set))}"`
    + ` alt="" loading="lazy" onerror="repliIcone(this)">`;
};

const imgSet = (set) =>
  `<img class="pastilleSet" src="images/sets/${encodeURIComponent(set)}.webp"`
  + ` data-repli="images/sets/${encodeURIComponent(set)}.png" alt="" loading="lazy" onerror="repliIcone(this)">`;

const imgRelique = (id) =>
  `<img class="iconeRelique" src="images/reliques/${encodeURIComponent(id)}.webp"`
  + ` data-repli="images/reliques/${encodeURIComponent(id)}.png"`
  + ` data-initiale="${esc(initiales(id))}" alt="" loading="lazy" onerror="repliIcone(this)">`;

// Icônes officielles des statistiques. Certaines n'existent qu'en version
// « pourcentage » : on essaie la variante avant d'abandonner.
const imgStat = (stat) =>
  `<img class="iconeStat" src="images/stats/${encodeURIComponent(stat)}.webp"`
  + ` data-repli="images/stats/${encodeURIComponent(stat)}_percent.webp"`
  + ` alt="" loading="lazy" onerror="repliIcone(this)">`;

// Tuile d'objet reprise du jeu : l'illustration sur un fond qui dit la rareté,
// le niveau en pastille, les étoiles au pied. Plus besoin de l'écrire en toutes lettres.
const tuileObjet = (o) => `<span class="tuile r${o.rarete}">
  ${imgObjet(o)}
  <span class="niveauTuile">${o.niveau ?? 0}</span>
  <span class="etoilesTuile">${'★'.repeat(o.rarete || 0)}</span>
</span>`;

// Ce qui compte vraiment sur un objet : tous ses attributs, pas seulement le principal.
function attributsObjetHtml(o) {
  const ligne = (a, principal) => {
    if (!a || !a.attribut) return '';
    // Un attribut verrouillé n'indique pas encore la statistique visée : on la
    // déduit de son nom, « BaseDamageBonus » désignant les dégâts de base.
    const nom = libelleStat(a.stat || a.attribut.replace(/Bonus$/, ''));
    if (a.verrouille || typeof a.valeur !== 'number') {
      return `<span class="attr verrouille" title="Se débloque au niveau ${a.debloqueAuNiveau ?? '?'}">`
        + `<span class="nomAttr">${esc(nom)}</span><b>verrouillé</b></span>`;
    }
    const valeur = valeurAttribut(a.stat, a.valeur, a.type);
    return `<span class="attr ${principal ? 'principalAttr' : ''}">${imgStat(a.stat)}<span class="nomAttr">${esc(nom)}</span><b>${valeur}</b></span>`;
  };
  return `<span class="attributsObjet">${ligne(o.principal, true)}`
    + `${(o.secondaires || []).map((a) => ligne(a, false)).join('')}</span>`;
}


/* ------------------------------------------------------------------- l'état */

let donnees = null;
let objets = new Map();       // id de l'objet -> objet
let herosParId = new Map();   // id du héros   -> héros possédé
let equipeInitial = {};       // configuration réelle du compte
let equipe = {};              // configuration simulée, modifiable
let porteur = new Map();      // id de l'objet -> id du héros qui le porte (simulation)

let taillesDeSet = new Map(); // identifiant du set -> nombre de pièces qui le composent
let statOuverte = null;       // statistique dont on affiche le détail par objet
let selection = null;
let filtre = 'possedes';
let recherche = '';
// Le tri de la colonne de gauche, et son sens. Mémorisés d'une visite à l'autre.
let tri = localStorage.getItem('hoh.tri') || 'attaque';
let triDecroissant = localStorage.getItem('hoh.triSens') !== 'croissant';
let slotEnCours = null;

function indexer() {
  statParAttribut = null;
  cacheStats = new Map();   // les statistiques servent au tri : elles changent avec le compte
  objets = new Map(donnees.compte.equipements.map((e) => [e.id, e]));
  herosParId = new Map(donnees.compte.heros.map((h) => [h.id, h]));

  // Un armement se porte en 2 pièces (main, vêtement), une parure en 3 (chapeau,
  // cou, anneau). Le catalogue du jeu le dit ; à défaut, on le déduit des
  // emplacements que le set occupe dans l'inventaire.
  const emplacementsParSet = {};
  for (const o of donnees.compte.equipements) (emplacementsParSet[o.set] ||= new Set()).add(o.emplacement);
  taillesDeSet = new Map(Object.entries(emplacementsParSet).map(([set, emplacements]) => [
    set,
    defSet(set)?.pieces ?? ([...emplacements].every((e) => e === 'Hand' || e === 'Garment') ? 2 : 3),
  ]));

  equipeInitial = {};
  for (const o of donnees.compte.equipements) {
    if (!o.porteParHero) continue;
    (equipeInitial[o.porteParHero] ||= {})[o.emplacement] = o.id;
  }
  equipe = JSON.parse(JSON.stringify(equipeInitial));
  reconstruirePorteurs();

  // On ouvre sur un héros déjà équipé : c'est plus parlant qu'une fiche vide.
  if (!selection || !tousLesHeros().some((h) => h.id === selection)) {
    const equipes = Object.keys(equipeInitial).sort((a, b) => (herosParId.get(b)?.niveau ?? 0) - (herosParId.get(a)?.niveau ?? 0));
    selection = equipes[0] ?? donnees.compte.heros[0]?.id ?? catalogueHeros()[0] ?? null;
  }
}

function reconstruirePorteurs() {
  porteur = new Map();
  for (const [heroId, slots] of Object.entries(equipe)) {
    for (const id of Object.values(slots)) if (id != null) porteur.set(id, heroId);
  }
}

// Les héros du jeu, dans l'ordre où le site les montre. La liste vient de
// `heros-jeu.js`, le catalogue du jeu : l'export du compte, lui, ne mentionne que
// les héros que le joueur a déjà croisés — il en manquait quatorze. On lui laisse
// malgré tout son mot à dire, au cas où il serait en avance sur le catalogue.
const catalogueHeros = () => [
  ...new Set([...Object.keys(window.HEROS_JEU || {}), ...(donnees.catalogue.heros || [])]),
];

function tousLesHeros() {
  const ids = new Set([...catalogueHeros(), ...herosParId.keys()]);
  return [...ids]
    .map((id) => ({ id, ...(herosParId.get(id) || {}), possede: herosParId.has(id) }))
    // On trie sur le nom affiché, pas sur l'identifiant interne : sinon Cuauhtemoc
    // se range à « A » (AztecTlacateccatl) et Barbe Noire à « B » (Blackbeard).
    .sort((a, b) => nomHeros(a.id).localeCompare(nomHeros(b.id), 'fr'));
}

/* -------------------------------------------------------------- équipements */

function equiper(heroId, slot, objetId) {
  const slots = (equipe[heroId] ||= {});
  // Un objet ne peut être porté que par un seul héros : on le retire de son ancien porteur.
  const ancienPorteur = porteur.get(objetId);
  if (ancienPorteur && equipe[ancienPorteur]) {
    for (const [s, id] of Object.entries(equipe[ancienPorteur])) if (id === objetId) delete equipe[ancienPorteur][s];
  }
  slots[slot] = objetId;
  reconstruirePorteurs();
}

function retirer(heroId, slot) {
  if (equipe[heroId]) delete equipe[heroId][slot];
  reconstruirePorteurs();
}

function objetsEquipes(heroId) {
  return Object.values(equipe[heroId] || {}).map((id) => objets.get(id)).filter(Boolean);
}

/* ------------------------------------------------------------------ calculs */

// Additionne les apports de l'équipement, séparément pour les valeurs plates
// et pour les pourcentages, statistique par statistique.
function agreger(liste) {
  const total = {};
  for (const o of liste) {
    for (const a of [o.principal, ...(o.secondaires || [])]) {
      if (!a || !a.stat || !FORMULES.attributCompte(a)) continue;
      const e = (total[a.stat] ||= { plat: 0, pourcentage: 0 });
      if (a.type === 'pourcentage') e.pourcentage += a.valeur;
      else e.plat += a.valeur;
    }
  }
  // Un ensemble complet ajoute son bonus, qui compte autant que les objets eux-mêmes.
  // Il peut être plat comme un attribut d'objet : le set Voyageur apporte à lui seul
  // +5 % de dégâts uniques ET +9 coups/minute de vitesse d'attaque.
  // On retient à part ce qui vient des ensembles : le panthéon amplifie les gains
  // de l'équipement « hors bonus d'ensemble ».
  for (const { bonus } of setsComplets(liste)) {
    for (const b of bonus) {
      const e = (total[b.stat] ||= { plat: 0, pourcentage: 0, set: 0 });
      if (b.type === 'pourcentage') e.pourcentage += b.valeur;
      else { e.plat += b.valeur; e.set = (e.set || 0) + b.valeur; }
    }
  }
  return total;
}

// Les ensembles réunis au complet dans une liste d'objets portés.
function setsComplets(liste) {
  const compte = {};
  for (const o of liste) compte[o.set] = (compte[o.set] || 0) + 1;
  return Object.entries(compte)
    .map(([set, n]) => ({ set, n, def: defSet(set) }))
    .filter(({ n, def }) => def && def.bonus.length && n >= def.pieces)
    .map(({ set, def }) => ({ set, bonus: def.bonus }));
}

// Deux réglages que l'export ne donne pas de façon sûre, et que le joueur peut
// donc corriger. Ils restent dans ce navigateur.
const lireReglage = (cle, defaut) => { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } };
const ecrireReglage = (cle, valeur) => { try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* navigation privée */ } };

// L'ère commande la valeur des reliques. On la déduit de la capitale, mais le
// joueur a le dernier mot.
const ereDuJoueur = () => lireReglage('hoh:ere', null) || donnees?.compte?.age || null;
const modificateurDEre = () => (window.AGES_JEU || {})[ereDuJoueur()]?.modificateur ?? 1;

// Le niveau d'une relique, tel qu'on l'a lu ou tel que le joueur l'a corrigé.
const niveauRelique = (portee) => lireReglage(`hoh:relique:${portee?.porteParHero}`, null) ?? portee?.niveau ?? 0;

// Les paliers d'éveil déjà atteints par un héros. Le jeu les cumule : éveil III
// = les trois premiers paliers.
const paliersEveil = (h) => ((window.EVEIL_JEU || {})[h?.id] || []).slice(0, h?.eveil || 0);

// Ce que la caserne de son arme apporte au héros. Il y en a une par arme : un
// héros d'infanterie profite de la caserne d'infanterie, pas des autres.
function apportCaserne(h) {
  const type = (ficheDuHeros(h) || {}).type;
  const caserne = donnees?.compte?.casernes?.[type];
  return (window.CASERNES_JEU || {})[caserne?.batiment] || {};
}

// Ce que sa relique lui apporte, au palier où elle est montée.
//
// Les valeurs du catalogue sont des valeurs DE RÉFÉRENCE : le jeu les met à
// l'échelle de l'ère du joueur, puis arrondit au supérieur. À l'Âge de pierre le
// multiplicateur vaut 1, au Haut Moyen Âge 2,854 — d'où un Gant de Fauconnerie
// niveau 15 qui donne +45 attaque de référence, mais +129 en jeu.
// Vérifié ligne à ligne contre le tableau du wiki, aux deux bouts de l'échelle.
function apportRelique(h) {
  const portee = (donnees?.compte?.reliques || []).find((r) => r.porteParHero === h?.id);
  if (!portee) return {};
  const fiche = (window.RELIQUES_JEU || {})[portee.relique];
  const palier = fiche?.paliers?.filter((p) => p.niveau <= niveauRelique(portee)).pop();
  if (!palier) return {};
  const modificateur = modificateurDEre();
  return Object.fromEntries(
    Object.entries(palier.apports).map(([stat, valeur]) => [stat, Math.ceil(valeur * modificateur)]),
  );
}

// Ce que le panthéon d'un héros lui apporte. L'export dit quels nœuds sont
// débloqués ; pantheon-jeu.js dit ce que chacun rapporte, par classe de héros.
const CLASSE_PANTHEON = {
  single_striker: 'SingleStriker', area_attacker: 'AreaAttacker', defender: 'Defender',
  healer: 'Healer', manipulator: 'Manipulator', supporter: 'Supporter',
};

function effetsPantheon(h) {
  const classe = CLASSE_PANTHEON[(ficheDuHeros(h) || {}).classe];
  const arbre = (window.PANTHEON_JEU || {})[classe];
  if (!arbre) return { effets: [], inconnus: (h?.pantheon || []).length, classe: null };

  const effets = [];
  let inconnus = 0;
  for (const noeud of h?.pantheon || []) {
    // « layer3_node3_SingleStriker » → « layer3_node3 »
    const fiche = arbre.noeuds[String(noeud).replace(/_[A-Za-z]+$/, '')];
    if (!fiche) { inconnus++; continue; }
    effets.push(...fiche.effets);
  }
  return { effets, inconnus, classe: arbre.nom };
}

// Le niveau auquel on regarde le héros. C'est son vrai niveau par défaut, mais
// on peut se projeter plus haut pour voir ce que vaudrait la même configuration.
let niveauProjete = null;
const niveauAffiche = (h) => niveauProjete ?? h?.niveau ?? 1;

// Tout ce dont formules.js a besoin pour situer un héros, hors équipement.
function contexteHeros(heroId) {
  const h = herosParId.get(heroId);
  const details = ficheDuHeros(h) || fiche(heroId);
  return {
    hero: h,
    details,
    base: details?.base || {},
    niveau: niveauAffiche(h),
    // Le compte connaît le vrai nombre d'ascensions : un héros niveau 160 en a
    // quinze, pas seize. On ne le garde que si on regarde le héros à SON niveau.
    ascensions: niveauProjete == null ? h?.ascensions : undefined,
    eveil: paliersEveil(h),
    caserne: apportCaserne(h),
    relique: apportRelique(h),
    pantheon: effetsPantheon(h).effets,
  };
}

// La feuille de statistiques complète, pour une configuration d'équipement donnée.
// Une valeur saisie à la main par le joueur remplace la base calculée.
function feuille(contexte, apports) {
  const sortie = {};
  const stats = new Set([
    ...STATS_AFFICHEES,
    ...Object.keys(contexte.base),
    ...Object.keys(apports),
    ...Object.keys(contexte.caserne),
    ...Object.keys(contexte.relique),
    ...contexte.eveil.map((p) => p.stat),
  ]);
  for (const stat of stats) {
    sortie[stat] = FORMULES.detail(stat, { ...contexte, base: contexte.base[stat] }, apports[stat]);
  }
  return sortie;
}

/* ------------------------------------------------------------------- rendus */

function rendreEntete() {
  const c = donnees.compte;
  const portes = c.equipements.filter((e) => e.porteParHero).length;
  const separateur = '<span class="separateur">·</span>';
  const sousTitre = $('#sousTitre');
  sousTitre.innerHTML =
    `<span class="chiffre">${c.heros.length}</span>/${catalogueHeros().length} héros`
    + `${separateur}<span class="chiffre">${c.equipements.length}</span> équipements`
    + `${separateur}<span class="chiffre">${portes}</span> portés`;
  sousTitre.title = `Compte ${c.joueur.nom || 'inconnu'}`;

  // L'avertissement se réduit à une pastille : l'explication tient dans l'infobulle.
  // Les noms français sont livrés avec le site (noms-fr.js, tiré du fichier de
  // traduction du jeu) : il ne reste à signaler que les héros trop récents pour y figurer.
  const inconnus = c.heros.filter((h) => !nomsReels() && !(window.NOMS_FR || {}).heros?.[h.id]).length;
  const alerte = $('#avertissement');
  alerte.hidden = inconnus === 0;
  alerte.textContent = `${inconnus} héros sans nom traduit`;
  alerte.title = "Ces héros sont plus récents que le fichier de traduction livré avec le site. "
    + "« node tools/catalogue.js » le remet à jour.";
}

/* --------------------------------------------------------------------- tri */

// Le jeu classe ses héros par « Puissance ». Ce nombre-là, on ne sait pas encore
// le calculer : il mêle les statistiques, le niveau de capacité et sans doute les
// crits, et cinq relevés d'écran ne suffisent pas à le reconstituer (voir README).
// Plutôt qu'un classement approché présenté comme la puissance du jeu, on propose
// les critères qu'on sait exacts — dont les statistiques que le site calcule.
const TRIS = [
  { cle: 'attaque', libelle: 'Attaque', valeur: (h) => statCalculee(h.id, 'Attack') },
  { cle: 'defense', libelle: 'Défense', valeur: (h) => statCalculee(h.id, 'Defense') },
  { cle: 'pv', libelle: 'Points de vie', valeur: (h) => statCalculee(h.id, 'MaxHitPoints') },
  { cle: 'niveau', libelle: 'Niveau', valeur: (h) => (h.possede ? (h.niveau ?? 0) : -1) },
  { cle: 'rarete', libelle: 'Rareté', valeur: (h) => (ficheDuHeros(h) || fiche(h.id) || {}).etoiles || 0 },
  { cle: 'eveil', libelle: 'Éveil', valeur: (h) => h.eveil ?? 0 },
  { cle: 'competence', libelle: 'Compétence', valeur: (h) => h.competence ?? 0 },
  { cle: 'nom', libelle: 'Nom', valeur: (h) => nomHeros(h.id), texte: true },
];

// Calculer la feuille complète de cent quarante-quatre héros à chaque frappe dans
// la recherche serait du gâchis : le résultat ne dépend que de l'équipement réel,
// qui ne bouge pas. On le garde donc jusqu'au prochain chargement de compte.
let cacheStats = new Map();

function statCalculee(heroId, stat) {
  if (!cacheStats.has(heroId)) {
    const contexte = contexteHeros(heroId);
    const porte = Object.values(equipeInitial[heroId] || {}).map((id) => objets.get(id)).filter(Boolean);
    cacheStats.set(heroId, feuille(contexte, agreger(porte)));
  }
  return cacheStats.get(heroId)[stat]?.total ?? 0;
}

function rendreListeHeros() {
  const terme = recherche.trim().toLowerCase();
  const liste = tousLesHeros().filter((h) => {
    if (terme && !nomHeros(h.id).toLowerCase().includes(terme)) return false;
    if (filtre === 'possedes') return h.possede;
    if (filtre === 'equipes') return Object.keys(equipe[h.id] || {}).length > 0;
    return true;
  });

  const critere = TRIS.find((t) => t.cle === tri) || TRIS[0];
  liste.sort((a, b) => {
    const va = critere.valeur(a), vb = critere.valeur(b);
    const ordre = critere.texte ? String(va).localeCompare(String(vb), 'fr') : vb - va;
    return triDecroissant ? ordre : -ordre;
  });

  $('#listeHeros').innerHTML = liste.map(carteHeros).join('')
    || '<li class="aucunHeros">Aucun héros ne correspond.</li>';
  $('#compteHeros').textContent = liste.length ? `${liste.length} héros` : '';
}

// Vignette reprise de l'écran des héros du jeu : le portrait, et par-dessus, en
// haut à gauche, un fanion qui empile la couleur d'affinité et la classe ; sous
// lui l'écusson d'éveil en chiffres romains ; les étoiles au pied de l'image, et
// le niveau sur un bandeau, avec la flèche qui dit qu'il reste de la marge.
function carteHeros(h) {
  const details = ficheDuHeros(h) || fiche(h.id) || {};
  const couleur = details.couleur || 'red';
  const classe = (details.classe || '').replace(/_/g, '');
  const etoiles = details.etoiles || 0;
  const ameliorable = h.possede && h.niveau != null && h.niveauMax != null && h.niveau < h.niveauMax;
  const infobulle = `${nomHeros(h.id)}${h.possede ? ` — niveau ${h.niveau}` : ' — pas sur ton compte'}`;

  return `<li class="carteHeros ${h.id === selection ? 'actif' : ''} ${h.possede ? '' : 'nonPossede'}"
      data-hero="${esc(h.id)}" title="${esc(infobulle)}">
    <span class="vignetteCarte teinte-${esc(couleur)}">
      <img class="portraitCarte" src="${portraitsDe(h.id)[0]}" alt=""
        loading="lazy" data-repli="${portraitsDe(h.id).slice(1).join(',')}"
        data-initiale="${esc(initiales(h.id))}" onerror="repliIcone(this)">
      <span class="fanion">
        <span class="fanionCouleur fond-${esc(couleur)}">
          <img src="images/couleurs/${esc(couleur)}.webp" alt="" onerror="repliIcone(this)">
        </span>
        ${classe ? `<span class="fanionClasse">
          <img src="images/classes/${esc(classe)}.webp" alt="" onerror="repliIcone(this)">
        </span>` : ''}
      </span>
      ${h.eveil ? `<span class="badgeEveil" title="Éveil ${ROMAIN[h.eveil] || h.eveil}">${ROMAIN[h.eveil] || h.eveil}</span>` : ''}
      ${etoiles ? `<span class="etoilesCarte">${'★'.repeat(etoiles)}</span>` : ''}
    </span>
    <span class="niveauCarte">${h.possede
      ? `NIV ${h.niveau ?? '?'}${ameliorable ? '<span class="marge" title="Ce héros peut encore monter">▲</span>' : ''}`
      : '—'}</span>
  </li>`;
}

function rendreHeros() {
  if (!selection) return;
  const h = herosParId.get(selection);
  $('#nomHeros').textContent = nomHeros(selection);
  const portrait = $('#portraitHeros');
  portrait.classList.remove('sansIcone');
  portrait.setAttribute('data-repli', portraitsDe(selection).slice(1).join(','));
  portrait.src = portraitsDe(selection)[0];
  const details = fiche(selection);
  if (h) {
    const morceaux = [`Niveau ${h.niveau ?? '?'}<span class="surMax">/${h.niveauMax ?? '?'}</span>`];
    const rarete = ficheDuHeros(h)?.etoiles;
    if (rarete) morceaux.push(etoilesHtml(rarete));
    if (h.eveil) morceaux.push(`Éveil ${ROMAIN[h.eveil] || h.eveil}`);
    if (h.competence) morceaux.push(`Compétence ${h.competence}`);
    if (details?.type) morceaux.push(esc(nomType(details.type)));
    $('#infoHeros').innerHTML = morceaux.join('<span class="separateur">·</span>');
  } else {
    const morceaux = [];
    if (details?.etoiles) morceaux.push(etoilesHtml(details.etoiles));
    if (details?.type) morceaux.push(esc(nomType(details.type)));
    morceaux.push("Pas sur ton compte — tu peux quand même simuler un équipement dessus.");
    $('#infoHeros').innerHTML = morceaux.join('<span class="separateur">·</span>');
  }

  const pied = $('#portraitPied');
  pied.classList.remove('sansIcone');
  const enPied = portraitsDe(selection, 'pied');
  pied.setAttribute('data-repli', [...enPied.slice(1), ...portraitsDe(selection)].join(','));
  pied.src = enPied[0];

  $('#emplacementsActuels').innerHTML = emplacementsHtml(equipeInitial[selection] || {}, false);
  $('#emplacements').innerHTML = emplacementsHtml(equipe[selection] || {}, true);

  rendreSets();
  rendreStats();
}

// Les deux colonnes du comparateur partagent le même rendu : à gauche la
// configuration réelle du compte, figée ; à droite celle qu'on modifie.
function emplacementsHtml(slots, modifiable) {
  // Le jeu sépare l'armement (main, vêtement) de la parure (chapeau, cou, anneau)
  // et les pose de part et d'autre du héros. On garde ces deux groupes.
  const groupes = [
    { nom: 'Armement', slots: ['Hand', 'Garment'] },
    { nom: 'Parure', slots: ['Hat', 'Neck', 'Ring'] },
  ];

  return groupes.map(({ nom, slots: liste }) => {
    const cases = liste.map((slot) => {
      const o = objets.get(slots[slot]);
      const corps = o
        ? `${tuileObjet(o)}
           <span class="corpsObjet">
             <span class="titre">${esc(nomObjet(o))}</span>
             ${attributsObjetHtml(o)}
           </span>
           ${modifiable ? `<button class="retirer" data-retirer="${slot}" title="Retirer cet objet" aria-label="Retirer">×</button>` : '<span></span>'}`
        // Emplacement libre : le jeu y montre la silhouette de la pièce attendue
        // et un « + ». On reprend le même repère, dessiné en SVG.
        : `<span class="tuile libre">${SILHOUETTE[slot]}${modifiable ? '<span class="plus">+</span>' : ''}</span>
           <span class="vide">${modifiable ? 'Vide — cliquer pour choisir' : 'Vide'}</span><span></span>`;
      // Un <div> et non un <bouton> : il contient déjà le bouton « Retirer ».
      // Le nom de l'emplacement n'est plus écrit dans la ligne — la silhouette et
      // l'objet lui-même le disent — mais il reste dans l'infobulle.
      return `<div class="emplacement ${o ? `r${o.rarete}` : 'estLibre'} ${modifiable ? '' : 'fige'}"
          title="${NOM_SLOT[slot]}"
          ${modifiable ? `data-slot="${slot}" role="button" tabindex="0"` : ''}>
        ${corps}
      </div>`;
    }).join('');
    return `<div class="groupeEmplacements" data-groupe="${nom}">${cases}</div>`;
  }).join('');
}

function rendreSets() {
  $('#setsActuels').innerHTML = setsHtml(Object.values(equipeInitial[selection] || {}));
  $('#sets').innerHTML = setsHtml(Object.values(equipe[selection] || {}));
}

function setsHtml(identifiants) {
  const compte = {};
  for (const id of identifiants) {
    const o = objets.get(id);
    if (o) compte[o.set] = (compte[o.set] || 0) + 1;
  }
  return Object.entries(compte).sort((a, b) => b[1] - a[1]).map(([set, n]) => {
    const def = defSet(set);
    const taille = taillesDeSet.get(set) ?? 3;
    const complet = n >= taille;
    const bonus = texteBonusSet(def);
    const infobulle = complet
      ? `Set complet — ${bonus || 'bonus inconnu'}`
      : `Il manque ${taille - n} pièce(s). Complet, ce set donnerait ${bonus || 'un bonus inconnu'}.`;
    return `<span class="badgeSet ${complet ? 'complet' : ''}" title="${esc(infobulle)}">
      ${imgSet(set)}${esc(nomSet(set))} ${n}/${taille}${complet && bonus ? `<span class="bonusSet">${esc(bonus)}</span>` : ''}
    </span>`;
  }).join('');
}

const texteBonusSet = (def) => (def?.bonus || [])
  .map((b) => `${valeurAttribut(b.stat, b.valeur, b.type)} ${libelleStat(b.stat).toLowerCase()}`)
  .join(' · ') || def?.effet || '';


let curseurEnCours = false;

function rendreStats() {
  const contexte = contexteHeros(selection);
  const simule = feuille(contexte, agreger(objetsEquipes(selection)));
  const actuel = feuille(contexte, agreger(Object.values(equipeInitial[selection] || {}).map((id) => objets.get(id)).filter(Boolean)));

  if (!curseurEnCours) rendreProjection(contexte);

  // Une statistique que le héros n'a pas du tout, et que rien n'alimente, n'a pas
  // à s'afficher. Les quatre principales font exception : elles restent en place
  // d'un héros à l'autre, quitte à dire qu'on ne connaît pas leur valeur — un
  // tableau dont les lignes changent de place est plus déroutant qu'un trou.
  const utile = (stat) => STATS_PRINCIPALES.includes(stat)
    || stat.startsWith('charge_')
    || typeof contexte.base[stat] === 'number'
    || FORMULES.DEFAUTS[stat] !== undefined
    || Math.abs(simule[stat]?.total || 0) > 1e-9
    || Math.abs(actuel[stat]?.total || 0) > 1e-9;

  // Le catalogue ne donne les dégâts de base que de seize héros sur cent quarante-
  // quatre, et rien ne permet de les déduire pour les autres : le rapport à
  // l'attaque va de 0,21 à 1,19 d'un héros au suivant. Là où la valeur manque, on
  // le dit — l'apport de l'équipement, lui, reste connu et l'écart reste juste.
  const incomplete = (stat) => STATS_PRINCIPALES.includes(stat) && typeof contexte.base[stat] !== 'number';

  $('#tableStats tbody').innerHTML = FAMILLES_STATS.map((famille) => {
    const lignes = famille.stats.filter(utile).map((stat) => ligneStat(stat, simule, actuel, incomplete(stat))).join('');
    return lignes ? `<tr class="famille"><th colspan="4">${esc(famille.titre)}</th></tr>${lignes}` : '';
  }).join('');

  $('#aucuneStat').hidden = true;
  $('#tableStats').hidden = false;
  rendreRelique(contexte);
}

// La valeur d'une statistique, écrite comme le jeu l'écrit.
function valeurStat(stat, feuilleStats) {
  if (stat === 'charge_initiale') {
    const avance = feuilleStats.InitialFocusInSecondsBonus?.total || 0;
    return { texte: `${nombre(FORMULES.chargeInitiale(feuilleStats, avance))} s`, brut: FORMULES.chargeInitiale(feuilleStats, avance), inverse: true };
  }
  if (stat === 'charge_normale') {
    const v = FORMULES.chargeNormale(feuilleStats);
    return { texte: `${nombre(v)} s`, brut: v, inverse: true };
  }
  const v = feuilleStats[stat]?.total ?? 0;
  switch (FORMAT_STAT[stat]) {
    case 'entier': return { texte: nombre(Math.round(v)), brut: v };
    case 'decimal': return { texte: nombre(v), brut: v };
    case 'coups': return { texte: `${nombre(Math.round(FORMULES.coupsParMinute(v)))} coups/min`, brut: v };
    // Le jeu écrit « Mêlée » plutôt qu'une distance quand le héros frappe au contact.
    case 'portee': return { texte: v <= 1.5 ? 'Mêlée' : nombre(v), brut: v };
    case 'vitesse': return { texte: `${nombre(v)} ${v >= 2.5 ? '(rapide)' : v >= 2 ? '(moyenne)' : '(lente)'}`, brut: v };
    default: return { texte: pourcent(v), brut: v };
  }
}

function ligneStat(stat, simule, actuel, incomplete = false) {
  const s = valeurStat(stat, simule);
  const a = valeurStat(stat, actuel);
  const delta = s.brut - a.brut;
  // Sur la charge, gagner du temps c'est descendre : la couleur suit le bénéfice.
  const bon = s.inverse ? delta < 0 : delta > 0;
  const ecart = Math.abs(delta) < 1e-9
    ? '<span class="discret">=</span>'
    : `<span class="${bon ? 'hausse' : 'baisse'}">${signe(delta, (x) => (FORMAT_STAT[stat] || 'pct') === 'pct' || !FORMAT_STAT[stat] ? pourcent(x) : nombre(x))}</span>`;

  const majeure = STATS_DE_BASE.includes(stat);
  const ouverte = statOuverte === stat;
  // Faute de valeur de départ, on n'écrit pas un total qui serait faux : on montre
  // ce qu'on sait, l'apport de l'équipement, et l'on signale le reste comme manquant.
  const colonne = (v) => {
    if (!incomplete) return v.texte;
    const explication = "Le catalogue du jeu ne donne cette valeur que pour seize héros sur cent quarante-quatre, "
      + "et rien ne permet de la déduire pour les autres. Ce que l'équipement y ajoute, en revanche, est connu.";
    const connu = Math.abs(v.brut) > 1e-9 ? `&nbsp;+&nbsp;${v.texte}` : '';
    return `<span class="partielle" title="${esc(explication)}">?${connu}</span>`;
  };
  return `<tr class="${Math.abs(delta) > 1e-9 ? 'modifiee' : ''} ${ouverte ? 'ouverte' : ''}" data-stat="${esc(stat)}">
    <td class="libelle ${majeure ? 'principal' : ''}">
      <span class="chevron">${ouverte ? '▾' : '▸'}</span>${imgStat(stat)}${esc(libelleStat(stat))}
    </td>
    <td>${colonne(a)}</td>
    <td class="${majeure ? 'principal' : ''}">${colonne(s)}</td>
    <td>${ecart}</td>
  </tr>${ouverte ? detailHtml(stat, simule, actuel) : ''}`;
}

// Le détail d'une statistique. Il répond à une seule question — « pourquoi ce
// chiffre ? » — et y répond comme on additionne à la main : une source par ligne,
// avec le sous-total qui monte au fil de la colonne de droite.
function detailHtml(stat, simule, actuel) {
  if (stat.startsWith('charge_')) {
    return `<tr class="detail"><td colspan="4"><div class="detailStat">
      <p class="explication">Le jeu ne stocke pas cette durée, il la recalcule :
      <b>(charge maximale − charge initiale) ÷ charge par seconde</b>, moins l'avance
      donnée par l'équipement.</p>
    </div></td></tr>`;
  }

  const d = simule[stat] || {};
  const estPourcentage = !FORMULES.ABSOLUES.has(stat);
  const ecrire = (v) => (estPourcentage ? pourcent(v)
    : FORMAT_STAT[stat] === 'coups' ? `${nombre(FORMULES.coupsParMinute(v))} coups/min`
    : nombre(v));

  // Les sources, dans l'ordre où le jeu les empile. On garde le cumul à chaque
  // étape : c'est ce qui rend l'addition lisible sans avoir à la refaire.
  const etapes = [
    ['Base du héros au niveau 1', d.base, 'plat'],
    [`Montée au niveau ${contexteHeros(selection).niveau}`, d.niveau, 'plat'],
    ['Éveil', d.eveil, 'plat'],
    ['Caserne', d.caserne, 'plat'],
    ['Relique', d.relique, 'plat'],
    ['Équipement et ensembles', d.equipementPlat, 'plat'],
    ['Équipement, en pourcentage de la base', d.apportPourcentage, 'plat', d.equipementPourcentage],
    ['Panthéon', d.pantheon, 'plat'],
  ].filter(([, v]) => typeof v === 'number' && Math.abs(v) > 1e-9);

  let cumul = 0;
  const lignes = etapes.map(([nom, v, nature, taux]) => {
    cumul += v;
    const apport = nature === 'pourcentage' ? signe(v, pourcent) : signe(v, ecrire);
    // « +257 » ne dit pas d'où il sort : on rappelle le taux qui l'a produit.
    const precision = taux ? ` <span class="taux">(${signe(taux, pourcent)})</span>` : '';
    return `<tr>
      <th>${esc(nom)}</th>
      <td class="apport">${apport}${precision}</td>
      <td class="cumul">${ecrire(cumul)}</td>
    </tr>`;
  }).join('');

  const cascade = etapes.length
    ? `<table class="cascade">
         <thead><tr><th>Source</th><th>Apport</th><th>Cumul</th></tr></thead>
         <tbody>${lignes}</tbody>
         <tfoot><tr><th>Total</th><td></td><td class="cumul">${valeurStat(stat, simule).texte}</td></tr></tfoot>
       </table>`
    : '<p class="explication">Rien n\'alimente cette statistique sur ce héros.</p>';

  // Ce que chaque pièce apporte, côte à côte, pour voir ce que le changement fait.
  const colonne = (config) => {
    const lignesObjets = Object.values(config || {}).map((id) => objets.get(id)).filter(Boolean).map((o) => {
      let plat = 0, pourcentage = 0;
      for (const at of [o.principal, ...(o.secondaires || [])]) {
        if (!at || at.stat !== stat || !FORMULES.attributCompte(at)) continue;
        if (at.type === 'pourcentage') pourcentage += at.valeur;
        else plat += at.valeur;
      }
      if (!plat && !pourcentage) return '';
      const apport = [
        plat ? valeurAttribut(stat, plat, 'plat') : null,
        pourcentage ? signe(pourcentage, pourcent) : null,
      ].filter(Boolean).join(' ');
      return `<li>${imgObjet(o)}<span class="nomPiece">${esc(nomObjet(o))}</span><span class="apport">${apport}</span></li>`;
    }).filter(Boolean).join('');
    return lignesObjets || '<li class="rien">Aucune pièce n\'y touche.</li>';
  };

  const change = Math.abs((simule[stat]?.total || 0) - (actuel[stat]?.total || 0)) > 1e-9;

  return `<tr class="detail"><td colspan="4">
    <div class="detailStat">
      ${change ? `<p class="transition">Ton changement fait passer ${esc(libelleStat(stat).toLowerCase())} de
        <span class="depuis">${valeurStat(stat, actuel).texte}</span>
        <span class="fleche">→</span>
        <span class="vers">${valeurStat(stat, simule).texte}</span></p>` : ''}
      ${cascade}
      <div class="pieces">
        <div><h4>Équipement actuel</h4><ul>${colonne(equipeInitial[selection])}</ul></div>
        <div><h4>Équipement simulé</h4><ul>${colonne(equipe[selection])}</ul></div>
      </div>
    </div>
  </td></tr>`;
}

// Le sélecteur de niveau : voir la même configuration à un autre niveau.
//
// TOUS les niveaux, pas seulement les dizaines : entre 151 et 152, le héros gagne
// déjà de quoi changer un arbitrage d'équipement, et c'est précisément ce qu'on
// vient regarder ici.
//
// Le nombre d'ascensions suit : le jeu en accorde une tous les dix niveaux de
// plafond, donc un niveau 151 en demande quinze, comme un niveau 160. C'est ce
// que fait formules.js à défaut de nombre connu.
function rendreProjection(contexte) {
  const reel = contexte.hero?.niveau ?? 1;
  const affiche = niveauAffiche(contexte.hero);
  const max = FORMULES.NIVEAU_MAX;

  const options = [];
  for (let n = 1; n <= max; n++) {
    const marque = n === reel ? ' — son niveau' : n % 10 === 0 ? ' •' : '';
    options.push(`<option value="${n}" ${n === affiche ? 'selected' : ''}>${n}${marque}</option>`);
  }

  $('#projection').innerHTML = `
    <label for="niveauProjete">Voir au niveau</label>
    <select id="niveauProjete" size="1">${options.join('')}</select>
    <input type="range" id="curseurNiveau" min="1" max="${max}" value="${affiche}"
      aria-label="Niveau à simuler">
    ${affiche !== reel
      ? `<button id="revenirNiveau" class="lienDiscret">revenir au niveau ${reel}</button>`
      : ''}`;
}


// La relique portée, avec ses deux réglages : son niveau et l'ère du joueur.
// Les deux commandent directement les chiffres, et aucun des deux n'est fiable
// à 100 % dans l'export — autant les rendre modifiables.
function rendreRelique(contexte) {
  const h = contexte.hero;
  const portee = (donnees?.compte?.reliques || []).find((r) => r.porteParHero === h?.id);

  if (!portee) {
    $('#relique').innerHTML = '<p class="discret">Aucune relique sur ce héros.</p>';
    return;
  }

  const ficheRelique = (window.RELIQUES_JEU || {})[portee.relique];
  const paliers = ficheRelique?.paliers || [];
  const niveau = niveauRelique(portee);
  const apports = Object.entries(contexte.relique).filter(([stat]) => !stat.startsWith('stat_'));

  const ere = ereDuJoueur();
  const eres = Object.entries(window.AGES_JEU || {})
    .filter(([nom]) => NOM_ERE[nom])
    .sort((a, b) => a[1].rang - b[1].rang);

  $('#relique').innerHTML = `
    <div class="carteRelique">
      ${imgRelique(portee.relique)}
      <div class="texteRelique">
        <span class="nomRelique">${esc(ficheRelique?.nom || joliNom(portee.relique))}</span>
        <span class="apportRelique">${apports.length
          ? apports.map(([stat, v]) => `${signe(v, nombre)} ${libelleStat(stat).toLowerCase()}`).join(' · ')
          : '<span class="discret">effet non chiffré</span>'}</span>
      </div>
    </div>
    <div class="reglagesRelique">
      <label>Niveau
        <select id="niveauRelique">
          ${paliers.map((p) => `<option value="${p.niveau}" ${p.niveau === niveau ? 'selected' : ''}>${p.niveau}</option>`).join('')}
        </select>
      </label>
      <label>Ère
        <select id="ereJoueur">
          ${eres.map(([nom, a]) => `<option value="${nom}" ${nom === ere ? 'selected' : ''}>${esc(NOM_ERE[nom])} (x${multiplicateur(a.modificateur)})</option>`).join('')}
        </select>
      </label>
    </div>
    <p class="discret noteRelique">Le jeu met les reliques à l'échelle de ton ère : c'est elle qui
    fait passer ce palier de ${paliers.find((p) => p.niveau === niveau)?.apports.Attack ?? '?'} à
    ${contexte.relique.Attack ?? '?'} d'attaque.</p>`;
}

/* -------------------------------------------------- fenêtre de choix d'objet */

/* ------------------------------------------------ recherche d'un équipement

   Chercher « un chapeau avec de l'attaque en pourcentage, et si possible des
   points de vie et de la vitesse d'attaque » est la vraie question qu'on se pose
   devant son inventaire. Le filtre est donc bâti là-dessus : l'attribut
   principal d'un côté, les attributs à trouver EN PLUS de l'autre.               */

// L'attribut principal d'un objet, sous une forme comparable : la statistique
// visée et sa nature. « Attaque en pourcentage » et « attaque à plat » sont deux
// choses différentes quand on cherche une pièce.
const clefAttribut = (a) => (a && a.stat ? `${a.stat}|${a.type}` : null);

const libelleAttribut = (clef) => {
  const [stat, type] = clef.split('|');
  return `${libelleStat(stat)}${type === 'pourcentage' ? ' %' : ''}`;
};

// Un attribut verrouillé ne dit pas encore quelle statistique il vise — le jeu
// garde la valeur pour lui. Mais le même attribut, déverrouillé sur une autre
// pièce, la donne : on relève la correspondance une fois pour toutes.
let statParAttribut = null;
function statDeLAttribut(attribut) {
  if (!statParAttribut) {
    statParAttribut = new Map();
    for (const o of donnees?.compte?.equipements || []) {
      for (const a of [o.principal, ...(o.secondaires || [])]) {
        if (a?.attribut && a.stat) statParAttribut.set(a.attribut, a.stat);
      }
    }
  }
  return statParAttribut.get(attribut) || attribut.replace(/Bonus$/, '');
}

// Toutes les statistiques qu'un objet porte, principal et secondaires confondus.
// Les attributs verrouillés comptent : le joueur cherche ce que la pièce
// DEVIENDRA, pas seulement ce qu'elle donne aujourd'hui.
function clefsDeLObjet(o) {
  const clefs = new Set();
  for (const a of [o.principal, ...(o.secondaires || [])]) {
    if (!a?.attribut && !a?.stat) continue;
    clefs.add(`${a.stat || statDeLAttribut(a.attribut)}|${a.type}`);
  }
  return clefs;
}

let filtrePrincipal = '';
let filtreSecondaires = new Set();

function ouvrirSelecteur(slot) {
  slotEnCours = slot;
  $('#selecteurTitre').textContent = `${NOM_SLOT[slot]} pour ${nomHeros(selection)}`;
  $('#rechercheObjet').value = '';
  filtrePrincipal = '';
  filtreSecondaires = new Set();
  $('#selecteur').hidden = false;
  rendreFiltresObjet();
  rendreSelecteur();
}

// Les choix proposés ne sont pas une liste figée : ce sont les attributs qui
// existent réellement sur cet emplacement, dans cet inventaire. On ne propose
// jamais un filtre qui ne rendrait rien.
function rendreFiltresObjet() {
  const pieces = donnees.compte.equipements.filter((o) => o.emplacement === slotEnCours);

  const principaux = new Map();
  const secondaires = new Map();
  for (const o of pieces) {
    const p = clefAttribut(o.principal);
    if (p) principaux.set(p, (principaux.get(p) || 0) + 1);
    for (const clef of clefsDeLObjet(o)) secondaires.set(clef, (secondaires.get(clef) || 0) + 1);
  }
  const parNom = (a, b) => libelleAttribut(a[0]).localeCompare(libelleAttribut(b[0]), 'fr');

  $('#filtrePrincipal').innerHTML = '<option value="">Peu importe</option>'
    + [...principaux].sort(parNom).map(([clef, n]) =>
      `<option value="${esc(clef)}" ${clef === filtrePrincipal ? 'selected' : ''}>${esc(libelleAttribut(clef))} (${n})</option>`).join('');

  $('#filtreSecondaires').innerHTML = [...secondaires].sort(parNom).map(([clef]) =>
    `<button type="button" class="pastille ${filtreSecondaires.has(clef) ? 'active' : ''}" data-clef="${esc(clef)}">
      ${imgStat(clef.split('|')[0])}${esc(libelleAttribut(clef))}
    </button>`).join('');
}

function rendreSelecteur() {
  const terme = $('#rechercheObjet').value.trim().toLowerCase();
  const masquerPortes = $('#seulementLibres').checked;
  const pieces = donnees.compte.equipements.filter((o) => o.emplacement === slotEnCours);

  const candidats = pieces
    .filter((o) => !terme || nomSet(o.set).toLowerCase().includes(terme) || nomObjet(o).toLowerCase().includes(terme))
    .filter((o) => !filtrePrincipal || clefAttribut(o.principal) === filtrePrincipal)
    // « Doit aussi porter » : toutes les cases cochées, pas seulement une.
    .filter((o) => {
      if (!filtreSecondaires.size) return true;
      const clefs = clefsDeLObjet(o);
      return [...filtreSecondaires].every((c) => clefs.has(c));
    })
    .filter((o) => {
      const p = porteur.get(o.id);
      return !masquerPortes || !p || p === selection;
    })
    .sort((a, b) => b.rarete - a.rarete || (b.niveau ?? 0) - (a.niveau ?? 0));

  const lignes = candidats.map((o) => {
    const p = porteur.get(o.id);
    const marque = p === selection ? 'équipé ici' : p ? `porté par ${nomHeros(p)}` : 'en réserve';
    return `<li class="r${o.rarete} ${p && p !== selection ? 'porte' : ''}" data-objet="${o.id}">
      ${tuileObjet(o)}
      <span class="corpsObjet">
        <span class="titre">${esc(nomObjet(o))}</span>
        ${attributsObjetHtml(o)}
      </span>
      <span class="marque">${esc(marque)}</span>
    </li>`;
  }).join('');

  $('#compteObjets').textContent = `${candidats.length} sur ${pieces.length}`;
  $('#listeObjets').innerHTML =
    `<li data-objet="" class="titre">Aucun — laisser l'emplacement vide</li>`
    + (lignes || '<li class="discret">Aucune pièce ne réunit ces conditions.</li>');
}

/* ------------------------------------------------------------- branchements */

function toutRendre() {
  rendreEntete();
  rendreListeHeros();
  rendreHeros();
}

function charger(nouvelles) {
  donnees = nouvelles;
  indexer();
  document.querySelector('main').classList.remove('vide');
  $('#reinitialiser').hidden = false;
  toutRendre();
}

// Sans données, on n'affiche que l'écran d'accueil : c'est le cas du site publié,
// où chaque visiteur charge son propre export.
function etatVide(message) {
  document.querySelector('main').classList.add('vide');
  $('#sousTitre').textContent = message || 'Aucun export chargé';
  $('#avertissement').hidden = true;
  $('#reinitialiser').hidden = true; // sans équipement chargé, il n'y a rien à rétablir
}

$('#listeHeros').addEventListener('click', (e) => {
  const li = e.target.closest('[data-hero]');
  if (!li) return;
  selection = li.dataset.hero;
  // Changer de héros remet la projection sur son vrai niveau : garder celle du
  // héros précédent n'aurait aucun sens.
  niveauProjete = null;
  rendreListeHeros();
  rendreHeros();
});

// Se projeter à un autre niveau : le héros et son équipement ne bougent pas,
// seule la montée en niveau est recalculée.
// Le menu et le curseur commandent la même chose : on prend l'un ou l'autre.
const changerNiveau = (valeur) => {
  const h = herosParId.get(selection);
  const choisi = Number(valeur);
  niveauProjete = choisi === h?.niveau ? null : choisi;
  rendreHeros();
};

$('#projection').addEventListener('change', (e) => {
  if (e.target.id === 'niveauProjete' || e.target.id === 'curseurNiveau') changerNiveau(e.target.value);
});

// Le curseur se suit en direct : on ne redessine que les chiffres, pas le curseur
// lui-même, sinon il perdrait le doigt qui le tient.
$('#projection').addEventListener('input', (e) => {
  if (e.target.id !== 'curseurNiveau') return;
  const menu = $('#niveauProjete');
  if (menu) menu.value = e.target.value;
  const h = herosParId.get(selection);
  niveauProjete = Number(e.target.value) === h?.niveau ? null : Number(e.target.value);
  curseurEnCours = true;
  rendreStats();
  curseurEnCours = false;
});

// Les deux réglages de la relique : son niveau et l'ère du joueur.
$('#relique').addEventListener('change', (e) => {
  if (e.target.id === 'niveauRelique') {
    ecrireReglage(`hoh:relique:${selection}`, Number(e.target.value));
  } else if (e.target.id === 'ereJoueur') {
    ecrireReglage('hoh:ere', e.target.value);
  } else return;
  rendreHeros();
});

$('#projection').addEventListener('click', (e) => {
  if (e.target.id !== 'revenirNiveau') return;
  niveauProjete = null;
  rendreHeros();
});

$('#recherche').addEventListener('input', (e) => { recherche = e.target.value; rendreListeHeros(); });

// Cliquer une statistique déplie le détail objet par objet.
$('#tableStats').addEventListener('click', (e) => {
  const ligne = e.target.closest('tr[data-stat]');
  if (!ligne) return;
  statOuverte = statOuverte === ligne.dataset.stat ? null : ligne.dataset.stat;
  rendreStats();
});

for (const bouton of document.querySelectorAll('.filtre')) {
  bouton.addEventListener('click', () => {
    filtre = bouton.dataset.filtre;
    for (const b of document.querySelectorAll('.filtre')) b.classList.toggle('actif', b === bouton);
    rendreListeHeros();
  });
}

// Le menu de tri est rempli depuis la table : une entrée de plus s'y ajoute sans
// toucher au balisage.
$('#tri').innerHTML = TRIS.map((t) => `<option value="${t.cle}">${esc(t.libelle)}</option>`).join('');
$('#tri').value = TRIS.some((t) => t.cle === tri) ? tri : TRIS[0].cle;
$('#tri').title = "Le jeu classe par « Puissance ». Ce nombre mêle les statistiques, la capacité "
  + "et sans doute les crits, et sa formule n'a pas encore été reconstituée : le site propose "
  + "à la place les critères qu'il sait exacts.";

const rendreSensTri = () => {
  const bouton = $('#sensTri');
  bouton.classList.toggle('croissant', !triDecroissant);
  bouton.title = triDecroissant ? 'Du plus grand au plus petit' : 'Du plus petit au plus grand';
};

$('#tri').addEventListener('change', (e) => {
  tri = e.target.value;
  localStorage.setItem('hoh.tri', tri);
  rendreListeHeros();
});

$('#sensTri').addEventListener('click', () => {
  triDecroissant = !triDecroissant;
  localStorage.setItem('hoh.triSens', triDecroissant ? 'decroissant' : 'croissant');
  rendreSensTri();
  rendreListeHeros();
});

rendreSensTri();

$('#emplacements').addEventListener('click', (e) => {
  const boutonRetirer = e.target.closest('[data-retirer]');
  if (boutonRetirer) {
    e.stopPropagation();
    retirer(selection, boutonRetirer.dataset.retirer);
    rendreListeHeros();
    rendreHeros();
    return;
  }
  const emplacement = e.target.closest('[data-slot]');
  if (emplacement) ouvrirSelecteur(emplacement.dataset.slot);
});

$('#listeObjets').addEventListener('click', (e) => {
  const li = e.target.closest('[data-objet]');
  if (!li) return;
  const id = li.dataset.objet;
  if (id === '') retirer(selection, slotEnCours);
  else equiper(selection, slotEnCours, Number(id));
  $('#selecteur').hidden = true;
  rendreListeHeros();
  rendreHeros();
});

$('#rechercheObjet').addEventListener('input', rendreSelecteur);
$('#seulementLibres').addEventListener('change', rendreSelecteur);

$('#filtrePrincipal').addEventListener('change', (e) => { filtrePrincipal = e.target.value; rendreSelecteur(); });

// Les attributs à trouver en plus se cochent et se décochent d'un clic.
$('#filtreSecondaires').addEventListener('click', (e) => {
  const pastille = e.target.closest('[data-clef]');
  if (!pastille) return;
  const clef = pastille.dataset.clef;
  if (filtreSecondaires.has(clef)) filtreSecondaires.delete(clef);
  else filtreSecondaires.add(clef);
  pastille.classList.toggle('active', filtreSecondaires.has(clef));
  rendreSelecteur();
});

$('#viderFiltres').addEventListener('click', () => {
  $('#rechercheObjet').value = '';
  filtrePrincipal = '';
  filtreSecondaires = new Set();
  $('#seulementLibres').checked = false;
  rendreFiltresObjet();
  rendreSelecteur();
});
$('#fermerSelecteur').addEventListener('click', () => { $('#selecteur').hidden = true; });
$('#selecteur').addEventListener('click', (e) => { if (e.target.id === 'selecteur') $('#selecteur').hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#selecteur').hidden = true; });

// Deux thèmes améthyste, l'un sombre et l'autre clair. Le choix reste dans ce
// navigateur, et c'est le petit script d'index.html qui le repose au chargement
// suivant — assez tôt pour qu'on ne voie jamais la mauvaise couleur.
$('#theme').addEventListener('click', () => {
  const clair = document.documentElement.dataset.theme !== 'clair';
  document.documentElement.dataset.theme = clair ? 'clair' : 'sombre';
  try { localStorage.setItem('hoh.theme', clair ? 'clair' : 'sombre'); } catch { /* navigation privée */ }
});

$('#reinitialiser').addEventListener('click', () => {
  equipe = JSON.parse(JSON.stringify(equipeInitial));
  reconstruirePorteurs();
  rendreListeHeros();
  rendreHeros();
});


// Le site accepte aussi bien l'export brut de l'extension que le fichier déjà extrait.
$('#fichier').addEventListener('change', async (e) => {
  const fichier = e.target.files[0];
  if (!fichier) return;
  try {
    const brut = JSON.parse(await fichier.text());
    charger(brut.compte && brut.catalogue ? brut : HOH_DECODEUR.extraire(brut));
    $('#sousTitre').title = `Chargé depuis ${fichier.name}`;
  } catch (erreur) {
    // Le message brut d'une erreur technique n'aide personne : on explique quoi faire,
    // et on laisse le détail complet dans la console pour pouvoir diagnostiquer.
    console.error('HOH Builder — échec de lecture de', fichier.name, erreur);
    etatVide(`Impossible de lire « ${fichier.name} ». Vérifie qu'il s'agit bien du fichier`
      + ' produit par l\'extension. Détail technique dans la console du navigateur (touche F12).');
  }
  e.target.value = '';
});

/* ------------------------------------------- provenance et mémoire des données */

const CLE_MEMOIRE = 'hoh:dernierCompte';

// Garder les données d'une visite à l'autre évite de tout recharger à chaque fois.
// Elles restent dans ce navigateur : localStorage n'est jamais transmis à un serveur.
function memoriser(donneesAGarder) {
  try { localStorage.setItem(CLE_MEMOIRE, JSON.stringify(donneesAGarder)); }
  catch { /* navigation privée, ou quota dépassé : on continue sans mémoriser */ }
}

function restaurer() {
  try {
    const texte = localStorage.getItem(CLE_MEMOIRE);
    return texte ? JSON.parse(texte) : null;
  } catch { return null; }
}

// L'extension dépose les données déjà décodées dans la page. Le message vient
// forcément de cette fenêtre : rien ne transite par le réseau.
window.addEventListener('message', (evenement) => {
  const d = evenement.data;
  if (evenement.source !== window || d?.source !== 'hoh-builder-pont') return;

  if (d.type === 'presence') {
    const note = $('#etatExtension');
    note.hidden = false;
    note.textContent = d.aDesDonnees
      ? 'Extension détectée — chargement de tes données…'
      : "Extension détectée, mais elle n'a encore rien lu. Ouvre Heroes of History et recharge la page (Ctrl+F5).";
    return;
  }

  if (d.type === 'compte' && d.compte?.compte) {
    charger(d.compte);
    memoriser(d.compte);
    $('#sousTitre').title = 'Reçu directement depuis l\'extension';
  }
});

// Au démarrage, on affiche ce qu'on a de plus rapide sous la main. Si l'extension
// répond ensuite, ses données sont plus fraîches et prennent le relais.
(() => {
  const memorise = restaurer();
  const script = document.createElement('script');
  script.src = 'donnees.js';
  const suite = () => {
    if (window.DONNEES) charger(window.DONNEES);
    else if (memorise) { charger(memorise); $('#sousTitre').title = 'Dernières données reçues, gardées dans ce navigateur'; }
    else etatVide();
    // On signale notre présence : si l'extension est là, elle répondra.
    window.postMessage({ source: 'hoh-builder-site', type: 'demande' }, window.location.origin);
  };
  script.onload = suite;
  script.onerror = suite;
  document.head.append(script);
})();
