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

// LES COUPS PAR MINUTE S'ÉCRIVENT TOUJOURS EN ENTIER, et le jeu ARRONDIT au plus
// proche — il ne plafonne pas, contrairement aux apports de statistiques (§22).
// Quatre témoins, dont les deux seuls héros dont on possède l'écran complet :
//
//   Marie Curie  équipement 2,1  -> le jeu écrit  +2   (le plafond donnerait 3)
//                total     62,1  -> le jeu écrit   62  (le plafond donnerait 63)
//   Achille      équipement 21,24 -> le jeu écrit +21  (le plafond donnerait 22)
//                total     96,24 -> le jeu écrit   96  (le plafond donnerait 97)
//   Wallace      total     50,58 -> le jeu écrit   51
//   Artémise     total     72,66 -> le jeu écrit   73
//
// On passe donc par cette seule fonction, pour que les trois endroits qui
// affichent une vitesse ne puissent plus diverger.
const coupsMin = (v) => nombre(Math.round(FORMULES.coupsParMinute(v)));

// UNE DURÉE GARDE SES CENTIÈMES. « nombre » n'écrit qu'une décimale — c'est ce
// qu'il faut pour des points de vie, jamais pour une seconde : l'infobulle du jeu
// écrit « -0,36 s » là où le site arrondissait à « -0,4 s ». Relevé par Thomas le
// 23/08/2026, sur plusieurs héros.
const secondes = (v) => Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 2 });

function valeurAttribut(stat, valeur, type) {
  if (stat === 'InitialFocusInSecondsBonus') return `${signe(-valeur, secondes)} s`;
  if (stat === 'AttackSpeed') return `${signe(valeur, coupsMin)} coups/min`;
  if (type === 'pourcentage') return signe(valeur, pourcent);
  // UN APPORT SUR UNE STATISTIQUE ENTIÈRE S'ÉCRIT ENTIER, ET LE JEU PLAFONNE.
  // C'est la règle du §22 (voir RECHERCHE-PUISSANCE.md), déjà appliquée aux lignes
  // du tableau : l'attaque, la défense, les points de vie et les dégâts de base ne
  // portent pas de décimale à l'écran. Le collier de Voyageur d'Achille donne 4,5
  // dans les données ; le jeu écrit « +5 », et le site écrivait « +4,5 ».
  //
  // C'EST UN DÉTAIL D'AFFICHAGE : le calcul, lui, garde la valeur exacte — sans
  // quoi cinq pièces arrondies feraient dériver le total de plusieurs points.
  return signe(valeur, (v) => nombre(FORMULES.ENTIERES.has(stat) ? Math.ceil(v) : v));
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
// L'IMAGE SUIT L'IMMORTALISATION. Sept héros existent en deux versions : celle
// qu'on obtient, et celle qu'on immortalise — cinq étoiles, statistiques de base
// plus hautes, ET UNE AUTRE ILLUSTRATION. Le compte garde l'identifiant d'origine
// et signale la seconde par son champ « montee » (hero_star_up).
//
// Le catalogue porte les deux jeux d'images depuis le début ; c'est le site qui
// allait chercher la mauvaise, parce qu'il demandait l'identifiant du compte.
// Thomas l'a vu sur son Hatchepsout : cinq étoiles en jeu, coiffe verte, et le
// site lui montrait le portrait de la version à quatre étoiles.
const identiteHeros = (h) => h?.montee || h?.id;

const portraitsDe = (id, dossier = 'heros') => {
  const identite = identiteHeros(herosParId.get(id)) || id;
  const chemins = [`images/${dossier}/${encodeURIComponent(identite)}.webp`];
  // Deux replis : l'identifiant demandé, puis le nom sans « Legendary ».
  for (const autre of [id, String(identite).replace(/Legendary$/, '')]) {
    const chemin = `images/${dossier}/${encodeURIComponent(autre)}.webp`;
    if (!chemins.includes(chemin)) chemins.push(chemin);
  }
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
  // UN HÉROS, UNE LIGNE. Le catalogue décrit séparément les sept variantes
  // immortalisées ; elles ne sont jamais possédées sous cet identifiant-là — le
  // compte garde l'identifiant d'origine et pointe la variante par « montee ».
  // Les lister à part donnerait deux Hatchepsout dans « Tous », dont une que
  // personne ne peut avoir. On ne garde donc la variante que si le compte la
  // possède vraiment, ce qui n'arrive pas aujourd'hui mais coûte une ligne.
  for (const id of [...ids]) if (/Legendary$/.test(id) && !herosParId.has(id)) ids.delete(id);
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
  for (const { bonus, pieces } of setsComplets(liste)) {
    for (const [rang, b] of bonus.entries()) {
      const e = (total[b.stat] ||= { plat: 0, pourcentage: 0, set: 0 });
      // Le pourcentage d'un ensemble de PARURE (3 pièces) se retient à part :
      // il ne se calcule pas sur la même assiette que celui d'un objet. Celui
      // d'un ensemble d'ARMEMENT (2 pièces), si — mesuré sur Mian Tansen.
      // On le range quand même à part sous « pourcentageSetArmement », parce
      // que le panthéon n'amplifie aucun bonus d'ensemble. Voir formules.js.
      //
      // …ET SEUL LE BONUS PRINCIPAL DE LA PARURE PREND L'ASSIETTE LARGE.
      // Le catalogue ne porte que deux parures qui donnent des points de vie, et
      // elles se comportent différemment :
      //
      //   Chacal          PV +10 %, PUIS soins reçus +5 %      -> assiette large
      //   Égyptien royal  soins prodigués +7,5 %, PUIS PV +7,5 % -> ordinaire
      //
      // Onze mesures le disent, sur trois comptes : huit porteurs du Chacal
      // (Tomoe, Wallace, Isabella, Jeanne, Lily, Qin Shi Huang, Medusa, Ashoka)
      // prennent l'assiette large ; les trois porteurs de l'Égyptien royal
      // (les deux Hatchepsout et Louis Pasteur) prennent l'ordinaire, à deux
      // points près sur des comptes qui n'ont servi à régler rien.
      //
      // Ce qui décide n'est donc pas le nom de l'ensemble mais LE RANG du bonus
      // dans sa fiche : le premier est le bonus principal, il prend l'assiette
      // large ; les suivants se calculent comme un attribut d'objet ordinaire.
      // Voir RECHERCHE-PUISSANCE.md §28.
      if (b.type === 'pourcentage') {
        e.pourcentage += b.valeur;
        const large = pieces >= 3 && rang === 0;
        const cle = large ? 'pourcentageSet' : 'pourcentageSetArmement';
        e[cle] = (e[cle] || 0) + b.valeur;
      } else { e.plat += b.valeur; e.set = (e.set || 0) + b.valeur; }
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
    .map(({ set, def }) => ({ set, bonus: def.bonus, pieces: def.pieces }));
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
const casernePortee = (h) => {
  const type = (ficheDuHeros(h) || {}).type;
  const caserne = donnees?.compte?.casernes?.[type];
  return (window.CASERNES_JEU || {})[caserne?.batiment] || {};
};

function apportCaserne(h) {
  return casernePortee(h).apports || {};
}

// L'ESCOUADE QUI ACCOMPAGNE LE HÉROS. Elle ne touche aucune statistique de sa
// fiche — mais sa puissance s'ajoute à la sienne dans le nombre que le jeu écrit
// sous son nom. C'est ce qu'on a longtemps pris pour une constante (voir
// puissanceEscorte(), dans formules.js).
const escorteDuHeros = (h) => casernePortee(h).unite || null;

// Ce que sa relique lui apporte, au palier où elle est montée.
//
// Les valeurs du catalogue sont des valeurs DE RÉFÉRENCE : le jeu les met à
// l'échelle de l'ère du joueur, puis arrondit au supérieur. À l'Âge de pierre le
// multiplicateur vaut 1, au Haut Moyen Âge 2,854 — d'où un Gant de Fauconnerie
// niveau 15 qui donne +45 attaque de référence, mais +129 en jeu.
// Vérifié ligne à ligne contre le tableau du wiki, aux deux bouts de l'échelle.
/* LA RELIQUE SE SIMULE, comme l'équipement et le panthéon.

   On garde donc deux états : celle que le compte porte, qui ne bouge pas, et
   celle qu'on essaie. La colonne « équipement actuel » reste sur la première —
   c'est ce qui fait que la colonne ÉCART montre aussi ce qu'une autre relique
   ferait gagner.

   LE NIVEAU, LUI, A DEUX SENS. Sur la relique réellement portée, le changer
   corrige l'export — le compte ne donne pas toujours le bon palier, et les deux
   colonnes doivent alors bouger ensemble. Sur une relique qu'on essaie, il fait
   partie de l'essai. D'où la règle : tant qu'on n'a rien changé, le niveau est
   une correction (il est retenu dans ce navigateur) ; dès qu'on a choisi une
   autre relique, il n'appartient plus qu'à la simulation.                     */
let reliqueSimulee = {};   // id du héros -> { relique, niveau, id } ou null

// L'exemplaire que le compte pose sur ce héros, avec le niveau qu'on lui connaît.
const reliqueReelle = (heroId) => {
  const portee = (donnees?.compte?.reliques || []).find((r) => r.porteParHero === heroId);
  return portee ? { relique: portee.relique, niveau: niveauRelique(portee), id: portee.id } : null;
};

// LES DEUX SE DÉSIGNENT PAR L'IDENTIFIANT DU HÉROS, et non par sa fiche de
// compte : on simule aussi sur un héros qu'on ne possède pas, et celui-là n'a
// pas de fiche.
const reliqueDuHeros = (heroId) => (heroId in reliqueSimulee ? reliqueSimulee[heroId] : reliqueReelle(heroId));

function apportRelique(portee) {
  if (!portee) return {};
  const fiche = (window.RELIQUES_JEU || {})[portee.relique];
  const palier = fiche?.paliers?.filter((p) => p.niveau <= portee.niveau).pop();
  if (!palier) return {};
  // LE MODIFICATEUR D'ÈRE NE VAUT QUE POUR LES STATISTIQUES EN POINTS. Une
  // relique qui donne « +50 d'attaque » en donne 143 chez un joueur du Haut Moyen
  // Âge (x2,854, arrondi au supérieur) : c'est vérifié ligne à ligne contre le
  // tableau du wiki. Mais celle qui donne « +10 % de dégâts de zone » en donne
  // 10 %, et pas 29 % : Thomas l'a lu sur son Livre des morts, à cette ère-là.
  // Le passer par le même moulin serait deux fois faux — la mise à l'échelle
  // n'a pas lieu, et l'arrondi au supérieur transformerait 0,285 en 1, soit
  // +100 %. D'où le tri : « en points » d'un côté, « déjà un pourcentage » de
  // l'autre, selon la liste que porte formules.js.
  const modificateur = modificateurDEre();
  return Object.fromEntries(
    Object.entries(palier.apports).map(([stat, valeur]) => [
      stat,
      FORMULES.ABSOLUES.has(stat) ? Math.ceil(valeur * modificateur) : valeur,
    ]),
  );
}

// Ce que le panthéon d'un héros lui apporte. L'export dit quels nœuds sont
// débloqués ; pantheon-jeu.js dit ce que chacun rapporte, par classe de héros.
const CLASSE_PANTHEON = {
  single_striker: 'SingleStriker', area_attacker: 'AreaAttacker', defender: 'Defender',
  healer: 'Healer', manipulator: 'Manipulator', supporter: 'Supporter',
};

// LE PANTHÉON SE SIMULE, comme l'équipement. On garde donc deux états : celui
// du compte, qui ne bouge pas, et celui que le joueur essaie dans l'arbre sous
// le héros. La colonne « équipement actuel » reste sur le premier — c'est ce qui
// permet à la colonne ÉCART de montrer aussi ce qu'un nœud ferait gagner.
let pantheonSimule = {};

// « layer3_node3_SingleStriker » → « layer3_node3 »
const numeroNoeud = (n) => String(n).replace(/_[A-Za-z]+$/, '');
const noeudsReels = (h) => (h?.pantheon || []).map(numeroNoeud);
const noeudsSimules = (h) => pantheonSimule[h?.id] || noeudsReels(h);

function effetsPantheon(h, noeuds) {
  const classe = CLASSE_PANTHEON[(ficheDuHeros(h) || {}).classe];
  const arbre = (window.PANTHEON_JEU || {})[classe];
  const actifs = noeuds || noeudsSimules(h);
  if (!arbre) return { effets: [], inconnus: actifs.length, classe: null };

  const effets = [];
  let inconnus = 0;
  // Ce que les nœuds pèsent dans la FORMULE DE PUISSANCE, en plus de ce qu'ils
  // donnent aux statistiques : depuis le 25/08/2026 le jeu les y compte à part
  // (voir pantheon-jeu.js et le §30 du journal).
  let puissance = 0;
  for (const noeud of actifs) {
    const fiche = arbre.noeuds[numeroNoeud(noeud)];
    if (!fiche) { inconnus++; continue; }
    effets.push(...fiche.effets);
    puissance += fiche.puissance || 0;
  }
  return { effets, inconnus, puissance, classe: arbre.nom };
}

/* ---------------------------------------------------------- la calibration

   Le site calcule la puissance avec la formule du jeu, et il tombe à quelques
   points près — cinq en moyenne sur douze mille. Ces points-là ne viennent pas
   de la formule mais de l'épaisseur du trait : le jeu n'affiche que des entiers
   plafonnés, et calcule sur des valeurs qu'il ne montre pas.

   Alors on demande au joueur. Il lit la puissance sous son héros, il la donne,
   et le site retient l'écart. À partir de là, ce héros tombe PILE — et il
   continue de tomber juste quand on change son équipement, parce que l'écart ne
   dépend presque pas de l'équipement (voir formules.js et le §35 du journal).

   CE QUI PÉRIME UNE CALIBRATION : tout ce qui n'est pas de l'équipement. Un
   niveau, une ascension, un niveau de capacité, une relique améliorée, un nœud
   de panthéon — tout cela déplace la base du calcul, donc l'écart. On enregistre
   donc l'état du héros au moment de la mesure, et on prévient dès qu'il bouge.  */

const CLE_CALIBRATION = 'hoh.calibration';

const lireCalibrations = () => {
  try { return JSON.parse(localStorage.getItem(CLE_CALIBRATION)) || {}; }
  catch { return {}; }
};
let calibrations = lireCalibrations();

const ecrireCalibrations = () => {
  try { localStorage.setItem(CLE_CALIBRATION, JSON.stringify(calibrations)); }
  catch { /* navigation privée : la calibration ne survivra pas, tant pis */ }
};

// L'état du héros hors équipement. Deux signatures différentes, et la mesure ne
// vaut plus.
function signatureHeros(h) {
  // La relique RÉELLE, pas celle qu'on essaie : la mesure a été prise sur le
  // compte, pas sur une simulation.
  const relique = reliqueReelle(h?.id);
  return [
    h?.niveau, h?.ascensions, h?.competence,
    h?.eveil ?? 0,   // le palier d'éveil est un simple compteur dans l'export
    relique ? `${relique.relique}:${relique.niveau}` : '—',
    (h?.pantheon || []).length,
  ].join('/');
}

// L'écart retenu pour ce héros, s'il est encore valable. On ne l'applique JAMAIS
// à une projection à un autre niveau : la mesure a été prise au vrai niveau.
function calibrationDe(h) {
  const c = calibrations[h?.id];
  if (!c || niveauProjete != null) return null;
  return { ...c, perimee: c.signature !== signatureHeros(h) };
}

// Le niveau auquel on regarde le héros. C'est son vrai niveau par défaut, mais
// on peut se projeter plus haut pour voir ce que vaudrait la même configuration.
let niveauProjete = null;
const niveauAffiche = (h) => niveauProjete ?? h?.niveau ?? 1;

// Tout ce dont formules.js a besoin pour situer un héros, hors équipement.
// « noeuds » permet de demander le contexte avec le panthéon RÉEL du compte
// plutôt qu'avec celui qu'on simule : c'est ce dont la colonne de gauche a besoin.
function contexteHeros(heroId, noeuds, relique) {
  const h = herosParId.get(heroId);
  const details = ficheDuHeros(h) || fiche(heroId);
  // Sans précision, on prend la relique qu'on essaie. La colonne du compte, elle,
  // passe la vraie — comme elle passe les vrais nœuds de panthéon.
  const portee = relique === undefined ? reliqueDuHeros(heroId) : relique;
  const apportPantheon = effetsPantheon(h, noeuds);
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
    // L'escouade de sa caserne : elle n'entre dans aucune statistique, elle
    // s'ajoute à la PUISSANCE.
    escorte: escorteDuHeros(h),
    relique: apportRelique(portee),
    // La relique elle-même, pas seulement ce qu'elle apporte : la formule de
    // puissance a besoin de sa RARETÉ et de son NIVEAU, qui n'entrent dans
    // aucune statistique mais multiplient la puissance (voir formules.js).
    //
    // La rareté ne vient PAS du compte — il ne la donne pas — mais du catalogue :
    // c'est une propriété du type de relique, pas de l'exemplaire.
    reliquePortee: portee ? {
      rarete: (window.RELIQUES_JEU || {})[portee.relique]?.rarete ?? null,
      niveau: portee.niveau,
    } : null,
    pantheon: apportPantheon.effets,
    // L'écart mesuré par le joueur sur l'écran du jeu, s'il en a donné un et
    // qu'il vaut encore. Une calibration périmée n'est pas appliquée : mieux
    // vaut un chiffre estimé qu'un chiffre faussement sûr.
    calibration: (() => {
      const c = calibrationDe(h);
      return c && !c.perimee ? c.ecart : 0;
    })(),
    // Le panthéon entre DEUX FOIS dans le nombre affiché sous le héros : par les
    // statistiques qu'il gonfle, et par ce facteur-là, que la formule du jeu
    // porte depuis le 25/08/2026.
    puissancePantheon: apportPantheon.puissance,
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
    // Certains nœuds de panthéon touchent une statistique que rien d'autre
    // n'alimente (la charge initiale, par exemple) : sans cette ligne, leur
    // apport n'apparaîtrait nulle part.
    ...contexte.pantheon.map((e) => e.stat).filter(Boolean),
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
  bornerListe();
}

// Dix rangées de cartes au plus : au-delà, la colonne des héros descendait plus
// bas que les panneaux voisins. Le reste défile.
//
// La mesure se fait ici plutôt qu'en CSS parce qu'une feuille de style ne sait
// pas compter des rangées : la hauteur d'une carte dépend de la largeur de la
// colonne, qui dépend elle-même de celle de l'écran.
const RANGEES_VISIBLES = 10;
function bornerListe() {
  const liste = $('#listeHeros');
  const premiere = liste.querySelector('.carteHeros');
  // Quand l'application tient dans l'écran, la page ne défile plus et c'est le
  // panneau qui donne sa hauteur à la liste : la borner y laisserait un trou.
  const dansLEcran = getComputedStyle(document.body).overflow === 'hidden';
  if (!premiere || dansLEcran) { liste.style.maxHeight = ''; return; }
  const espace = parseFloat(getComputedStyle(liste).rowGap) || 0;
  const rangee = premiere.offsetHeight + espace;
  liste.style.maxHeight = `${rangee * RANGEES_VISIBLES - espace}px`;
}

// La largeur de la colonne change avec celle de la fenêtre, donc la hauteur des
// cartes aussi : la borne se recalcule.
window.addEventListener('resize', bornerListe);

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
      ${h.eveil ? ecussonEveilHtml(h.eveil, 'ecussonCarte') : ''}
      ${etoiles ? `<span class="etoilesCarte">${'★'.repeat(etoiles)}</span>` : ''}
    </span>
    <span class="niveauCarte">${h.possede
      ? `NIV ${h.niveau ?? '?'}${ameliorable ? '<span class="marge" title="Ce héros peut encore monter">▲</span>' : ''}`
      : '—'}</span>
  </li>`;
}

// L'éveil et le type d'unité s'écrivaient en toutes lettres dans la ligne du
// héros. Le jeu, lui, les montre : l'écusson de bronze à chiffre romain, et le
// pictogramme de l'unité. On reprend les deux — l'écusson est celui des cartes,
// dessiné en CSS ; le pictogramme vient des icônes du jeu, et retombe sur le nom
// écrit quand l'icône manque, ce qui est le cas de quatre types sur cinq.
// L'écusson vient de la planche du jeu, découpée par tools/eveil.js. Au-delà du
// cinquième rang — que le catalogue ne connaît pas — on retombe sur le chiffre
// écrit, faute d'image à montrer.
const RANGS_EVEIL_DESSINES = 5;
const ecussonEveilHtml = (eveil, classe = '') => {
  const romain = ROMAIN[eveil] || eveil;
  return eveil <= RANGS_EVEIL_DESSINES
    ? `<img class="ecussonEveil ${classe}" src="images/eveil/${eveil}.png" alt="Éveil ${romain}"
        title="Éveil ${romain}" onerror="this.remove()">`
    : `<span class="eveilEcrit ${classe}" title="Éveil ${romain}">${romain}</span>`;
};

const typeHtml = (type) => {
  const nom = nomType(type);
  return `<span class="typeHeros" title="${esc(nom)}">
    <img class="iconeType" src="images/types/${esc(String(type).toLowerCase())}.webp" alt=""
      data-libelle="${esc(nom)}" onerror="repliType(this)">
    <span class="nomType">${esc(nom)}</span>
  </span>`;
};

// Le nom écrit est là mais masqué : il reprend sa place dès que l'icône manque,
// ce qui vaut mieux qu'un trou dans la ligne.
function repliType(img) {
  const hote = img.closest('.typeHeros');
  img.remove();
  if (hote) hote.classList.add('sansIconeType');
}
window.repliType = repliType;

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
    if (h.eveil) morceaux.push(ecussonEveilHtml(h.eveil, 'ecussonLigne'));
    if (h.competence) morceaux.push(`Compétence ${h.competence}`);
    if (details?.type) morceaux.push(typeHtml(details.type));
    $('#infoHeros').innerHTML = morceaux.join('<span class="separateur">·</span>');
  } else {
    const morceaux = [];
    if (details?.etoiles) morceaux.push(etoilesHtml(details.etoiles));
    if (details?.type) morceaux.push(typeHtml(details.type));
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
  // LA COLONNE DE GAUCHE EST CELLE DU COMPTE, panthéon compris : son contexte
  // reprend donc les nœuds réellement activés, pas ceux qu'on essaie dans
  // l'arbre. Sans ça, activer un nœud ferait bouger les deux colonnes ensemble
  // et la colonne ÉCART resterait obstinément à zéro.
  const contexteReel = contexteHeros(selection, noeudsReels(herosParId.get(selection)), reliqueReelle(selection));
  const simule = feuille(contexte, agreger(objetsEquipes(selection)));
  const actuel = feuille(contexteReel, agreger(Object.values(equipeInitial[selection] || {}).map((id) => objets.get(id)).filter(Boolean)));

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

  // FILET DE SÉCURITÉ. Les quatre statistiques principales sont désormais connues
  // pour les 144 héros — les dégâts de base ont été les derniers à manquer, et ils
  // se déduisent maintenant du catalogue (voir tools/catalogue.js). Ce garde-fou
  // reste en place pour la suite : si un héros ajouté au jeu arrivait sans l'une
  // d'elles, la ligne dirait « ? » plutôt qu'un total faux, et montrerait quand
  // même ce que l'équipement y ajoute.
  const incomplete = (stat) => STATS_PRINCIPALES.includes(stat) && typeof contexte.base[stat] !== 'number';

  $('#tableStats tbody').innerHTML = FAMILLES_STATS.map((famille) => {
    const lignes = famille.stats.filter(utile).map((stat) => ligneStat(stat, simule, actuel, incomplete(stat))).join('');
    return lignes ? `<tr class="famille"><th colspan="4">${esc(famille.titre)}</th></tr>${lignes}` : '';
  }).join('');

  $('#aucuneStat').hidden = true;
  $('#tableStats').hidden = false;
  rendreRelique(contexte);
  rendreCapacite(contexte, simule);
  rendrePuissance(contexte, simule, actuel, contexteReel);
  rendreArbrePantheon(contexte);
}

// La puissance sous le héros, avec ce qu'elle vaut et ce qu'elle ne vaut pas.
//
// Le gros chiffre est APPROCHÉ — 0,05 % d'erreur en moyenne — et l'écran le dit.
// L'écart entre les deux configurations, lui, est bien plus sûr : l'erreur du
// modèle est propre au héros et se simplifie quand on compare deux états du
// même héros.
//
// L'écart est la DIFFÉRENCE DES DEUX NOMBRES AFFICHÉS, comme dans le tableau de
// statistiques : le prendre autrement donnerait une ligne qui ne s'additionne pas.
function rendrePuissance(contexte, simule, actuel, contexteReel = contexte) {
  const bloc = $('#resumePuissance');
  const p = FORMULES.puissance(simule, contexte);
  const p0 = FORMULES.puissance(actuel, contexteReel);
  if (p == null) { bloc.innerHTML = ''; return; }

  const affiche = Math.round(p);
  const ecart = p0 == null ? 0 : affiche - Math.round(p0);
  const signe = ecart > 0 ? 'positif' : ecart < 0 ? 'negatif' : '';
  // Le détail de la puissance : ce qui vient du héros, ce qui vient de son
  // escouade. Les deux s'additionnent — c'est la formule du jeu, plus rien n'est
  // ajusté depuis qu'on a compris d'où venait le second terme.
  const escorte = FORMULES.puissanceEscorte(contexte?.escorte);
  const cal = calibrationDe(contexte?.hero);
  const calibree = cal && !cal.perimee;

  const infobulle = calibree
    ? `Puissance CALIBRÉE : tu as relevé ${nombre(cal.puissanceJeu)} dans le jeu le ${cal.date}, `
      + `et le site en tenait ${cal.ecart > 0 ? '' : '−'}${nombre(Math.abs(Math.round(cal.ecart)))} `
      + "de trop. L'écart est retranché de tous les calculs de ce héros. Il reste valable quand tu "
      + "changes son équipement — c'est mesuré — mais plus s'il monte de niveau, ascensionne, "
      + "améliore sa relique ou débloque un nœud de panthéon."
    : "Puissance calculée avec la formule du jeu, retrouvée dans ses données. "
      + (escorte
        ? `Elle additionne le héros (${nombre(Math.round(affiche - escorte))}) et l'escouade que lui donne `
          + `ta caserne (${nombre(Math.round(escorte))}) : le jeu compte les deux sous son nom. `
        : "La caserne du compte n'est pas connue : la part de l'escouade est approchée. ")
      + "Elle tombe à 0,04 % en moyenne sur les dix héros relevés, soit cinq points sur douze mille. "
      + "Ce qui reste vient des arrondis du jeu, pas de la formule. "
      + "L'écart entre deux configurations est plus fiable encore que le total.";

  // LE RELEVÉ. On ne le propose que sur l'équipement réel : demander au joueur de
  // recopier un chiffre du jeu n'a de sens que si le site regarde la même chose
  // que lui. Sur une simulation ou une projection de niveau, le champ disparaît.
  const relevable = ecart === 0 && niveauProjete == null && contexte?.hero?.id;
  const saisie = !relevable ? '' : `<span class="calibrage">
    ${calibree || cal ? `<button type="button" class="lienCalibrage" data-calibrer="rouvrir">${cal.perimee ? 'Calibration périmée — refaire' : 'recalibrer'}</button>` : ''}
    <span class="formCalibrage" ${calibrations[contexte.hero.id] ? 'hidden' : ''}>
      <label for="champCalibrage">Puissance affichée par le jeu</label>
      <input type="number" id="champCalibrage" inputmode="numeric" min="1" step="1"
             placeholder="${nombre(affiche).replace(/\s/g, '')}" value="${cal ? cal.puissanceJeu : ''}">
      <button type="button" data-calibrer="valider">Caler</button>
      ${cal ? '<button type="button" class="lienCalibrage" data-calibrer="oublier">oublier</button>' : ''}
    </span>
  </span>`;

  bloc.innerHTML = `<span class="blocPuissance ${calibree ? 'calibree' : ''}" title="${esc(infobulle)}">
    <span class="titrePuissance">Puissance <em>${calibree ? 'calibrée' : 'estimée'}</em></span>
    <span class="valeurPuissance">${nombre(affiche)}</span>
    ${ecart !== 0
      ? `<span class="ecartPuissance ${signe}">${ecart > 0 ? '+' : '−'}${nombre(Math.abs(ecart))}</span>`
      : '<span class="ecartPuissance">équipement réel</span>'}
  </span>${saisie}`;

  if (cal && cal.perimee) {
    bloc.insertAdjacentHTML('beforeend',
      `<span class="avertCalibrage">Ce héros a changé depuis ta mesure du ${esc(cal.date)} : `
      + "l'écart n'est plus appliqué.</span>");
  }
}

/* La calibration se pilote depuis le bloc de puissance : un champ, un bouton.
   On enregistre l'écart ET l'état du héros au moment de la mesure. */
$('#resumePuissance').addEventListener('click', (e) => {
  const action = e.target.dataset?.calibrer;
  if (!action) return;
  const h = herosParId.get(selection);
  if (!h) return;

  if (action === 'rouvrir') {
    $('#resumePuissance').querySelector('.formCalibrage')?.removeAttribute('hidden');
    $('#champCalibrage')?.focus();
    return;
  }
  if (action === 'oublier') {
    delete calibrations[h.id];
    ecrireCalibrations();
    rendreHeros();
    return;
  }
  // « Caler » : on relit la puissance BRUTE, celle d'avant toute calibration,
  // pour que recalibrer deux fois de suite ne cumule pas les écarts.
  const saisi = Number($('#champCalibrage')?.value);
  if (!Number.isFinite(saisi) || saisi <= 0) return;
  const contexteNu = { ...contexteHeros(h.id, noeudsReels(h), reliqueReelle(h.id)), calibration: 0 };
  const porte = Object.values(equipeInitial[h.id] || {}).map((id) => objets.get(id)).filter(Boolean);
  const brute = FORMULES.puissance(feuille(contexteNu, agreger(porte)), contexteNu);
  if (brute == null) return;

  calibrations[h.id] = {
    puissanceJeu: Math.round(saisi),
    ecart: brute - saisi,
    date: new Date().toLocaleDateString('fr-FR'),
    signature: signatureHeros(h),
  };
  ecrireCalibrations();
  rendreHeros();
});

/* ----------------------------------------------------------------- panthéon

   L'arbre de panthéon du héros, tel que le jeu le dessine, avec DEUX choses que
   le jeu ne dit pas d'un coup d'œil : ce que chaque nœud rapporterait à CE
   héros-là, en points, et ce qu'il coûte.

   CE QUE CET ÉCRAN NE FAIT PAS : conseiller. Aucun « chemin optimal » n'est
   proposé, et c'est délibéré. Optimiser la puissance affichée donnerait de
   mauvais conseils — « Ruine généralisée » (+10 % de dégâts de zone) ne rapporte
   AUCUNE puissance alors que c'est sans doute l'un des meilleurs nœuds au combat
   pour un attaquant de zone, tandis que l'esquive, qui en rapporte le plus, ne
   sert que si l'on se fait taper dessus. Le site montre les chiffres justes ;
   l'arbitrage appartient au joueur.                                          */

// Six paliers : quatre nœuds chacun, sauf le dernier qui en compte deux.
const PALIERS_PANTHEON = [4, 4, 4, 4, 4, 2];

// PIÈGE, et il est sérieux : le numéro d'un nœud ne suit PAS sa position à
// l'écran. Le jeu range chaque ligne de quatre « node3 · node1 · node2 · node4 ».
// La vérification est dans pantheon-jeu.js ; s'en écarter donne un arbre qui
// semble juste et ne l'est pas.
const ORDRE_VISUEL = [3, 1, 2, 4];

// Ce que coûte l'activation, par palier. Relevé en jeu sur Léonard de Vinci.
// Trois monnaies se succèdent, la dernière étant propre à la classe du héros.
const COUT_PANTHEON = [
  { valeur: 50, monnaie: 'cristaux' }, { valeur: 60, monnaie: 'cristaux' },
  { valeur: 20, monnaie: 'pierres' }, { valeur: 25, monnaie: 'pierres' },
  { valeur: 3, monnaie: 'jetons de classe' }, { valeur: 3, monnaie: 'jetons de classe' },
];

// « Disponible après avoir activé 2 nœuds dans le palier précédent », dit le jeu.
const NOEUDS_POUR_OUVRIR = 2;

// Et l'on n'en prend jamais plus de deux par ligne : c'est ce que montrent les
// quatre paliers remplis d'Achille, deux nœuds allumés sur quatre à chaque fois.
// C'est la SEULE contrainte que l'arbre du site fait respecter.
const MAX_PAR_PALIER = 2;

// Ce qu'un nœud change VRAIMENT sur ce héros. On ne l'estime pas : on refait la
// feuille de statistiques complète avec et sans lui, et l'on regarde ce qui a
// bougé. C'est exactement la chaîne du tableau de statistiques, donc les mêmes
// chiffres — un nœud qui donne « +5 % de dégâts de base » affiche ici les points
// qu'il vaut sur CE héros, à SON niveau, avec SON équipement.
function apportDuNoeud(contexte, apports, fiche) {
  const effets = fiche?.effets || [];
  const sans = { ...contexte, pantheon: contexte.pantheon.filter((e) => !effets.includes(e)) };
  const avec = { ...contexte, pantheon: [...sans.pantheon, ...effets] };
  const a = feuille(avec, apports);
  const b = feuille(sans, apports);
  const lignes = [];
  for (const stat of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ecart = (a[stat]?.total || 0) - (b[stat]?.total || 0);
    if (Math.abs(ecart) > 1e-9) lignes.push({ stat, ecart });
  }
  // Le plus gros apport en premier, en valeur relative : « +154 d'attaque » et
  // « +32 de dégâts de base » ne se comparent pas en points bruts.
  return lignes.sort((x, y) => Math.abs(y.ecart / (b[y.stat]?.total || 1)) - Math.abs(x.ecart / (b[x.stat]?.total || 1)));
}


/* ------------------------------------------- L'ARBRE, SOUS LE HÉROS

   Le panneau de droite EXPLIQUE le panthéon — ce que chaque nœud rapporterait,
   en toutes lettres. Celui-ci le fait MANIPULER : on y clique, et la feuille de
   statistiques suit, exactement comme lorsqu'on change une pièce d'équipement.

   LA MISE EN PAGE EST CELLE DU JEU, reprise de la planche que Thomas a fournie
   et que tools/pantheon.js débite en vingt-deux icônes. Six lignes ; les cinq
   premières portent deux nœuds à gauche, le cadenas du palier, deux nœuds à
   droite ; la sixième n'en a que deux, contre le cadenas.

   ET LE PIÈGE, TOUJOURS LE MÊME : la position à l'écran ne donne pas le numéro
   du nœud. On passe donc par ORDRE_VISUEL, jamais par l'ordre naturel.       */

// Les classes dont Thomas a fourni la planche d'icônes. Les autres retombent
// sur l'icône de la statistique touchée — inutile d'aller chercher un fichier
// qu'on sait absent : cela ne remplirait la console que de 404.
const CLASSES_ILLUSTREES = new Set(['SingleStriker']);
const iconeNoeud = (classe, id) => (CLASSES_ILLUSTREES.has(classe)
  ? 'images/pantheon/' + classe + '/' + id + '.png'
  : '');

// Les paliers d'un arbre, avec leur état : quels nœuds, combien d'actifs, et si
// le palier est ouvert. Le jeu ouvre un palier dès que deux nœuds du précédent
// sont activés — la règle vaut pour la lecture comme pour la simulation.
function paliersPantheon(actifs) {
  const paliers = [];
  PALIERS_PANTHEON.forEach((taille, i) => {
    const ordre = taille === 4 ? ORDRE_VISUEL : [1, 2];
    const numeros = ordre.map((n) => 'layer' + (i + 1) + '_node' + n);
    const actifsIci = numeros.filter((id) => actifs.has(id)).length;
    const ouvert = i === 0 || paliers[i - 1].actifsIci >= NOEUDS_POUR_OUVRIR;
    paliers.push({ palier: i + 1, numeros, actifsIci, ouvert });
  });
  return paliers;
}

function rendreArbrePantheon(contexte) {
  const hote = $('#arbrePantheon');
  const classe = CLASSE_PANTHEON[contexte.details?.classe];
  const arbre = (window.PANTHEON_JEU || {})[classe];
  if (!arbre) {
    const actifs = noeudsReels(contexte.hero).length;
    hote.innerHTML = `<p class="discret videArbre">L'arbre des
      <strong>${esc(nomClasse(contexte.details?.classe))}</strong> n'a pas encore été relevé.${
        actifs ? ` Ses ${actifs} nœud${actifs > 1 ? 's' : ''} activé${actifs > 1 ? 's' : ''} ne ${actifs > 1 ? 'sont' : 'est'} pas compté${actifs > 1 ? 's' : ''}.` : ''}</p>`;
    return;
  }

  const actifs = new Set(noeudsSimules(contexte.hero));
  const reels = new Set(noeudsReels(contexte.hero));
  const paliers = paliersPantheon(actifs);

  const noeudHtml = (id, complet) => {
    const fiche = arbre.noeuds[id];
    if (!fiche) return '<span class="noeudArbre absent"></span>';
    const actif = actifs.has(id);
    const change = actif !== reels.has(id);
    // « complet » : la ligne a déjà ses deux nœuds, celui-ci ne peut plus être
    // pris tant qu'on n'en éteint pas un autre.
    const etats = ['noeudArbre', actif ? 'actif' : 'eteint', !actif && complet ? 'complet' : '',
      CLASSES_ILLUSTREES.has(classe) ? '' : 'sansIcone'];
    return `<button type="button" class="${etats.join(' ')}" data-noeud="${esc(id)}"
      aria-pressed="${actif}" aria-label="${esc(fiche.nom)}">
      ${CLASSES_ILLUSTREES.has(classe) ? `<img src="${iconeNoeud(classe, id)}" alt=""
        onerror="this.closest('.noeudArbre').classList.add('sansIcone'); this.remove()">` : ''}
      <span class="emblemeNoeud">${(() => {
        // Un nœud purement de combat ne touche aucune statistique : il n'a donc
        // pas d'icône à emprunter, et deux épées valent mieux qu'une image vide.
        const stat = (fiche.effets || []).find((e) => e.stat)?.stat;
        return stat ? imgStat(stat) : '<span class="emblemeCombat">⚔</span>';
      })()}</span>
    </button>`;
  };

  const lignes = paliers.map(({ palier, numeros, actifsIci }) => {
    const complet = actifsIci >= MAX_PAR_PALIER;
    const moitie = numeros.length / 2;
    const gauche = numeros.slice(0, moitie).map((id) => noeudHtml(id, complet)).join('<i class="lienNoeud"></i>');
    const droite = numeros.slice(moitie).map((id) => noeudHtml(id, complet)).join('<i class="lienNoeud"></i>');
    const cout = COUT_PANTHEON[palier - 1];
    const titre = `Palier ${palier} — ${actifsIci} nœud${actifsIci > 1 ? 's' : ''} sur ${MAX_PAR_PALIER}`
      + ` · ${cout.valeur} ${cout.monnaie} par nœud`;
    return `<div class="ligneArbre ${complet ? 'ligneComplete' : ''}">
      <span class="coteArbre">${gauche}</span>
      <span class="charniere" title="${esc(titre)}">${palier}</span>
      <span class="coteArbre">${droite}</span>
    </div>`;
  }).join('');

  // L'en-tête ne porte plus que le nom. La description de la classe et le
  // décompte des nœuds ont été retirés : l'arbre juste en dessous les dit déjà,
  // et ce qui a été changé par rapport au compte reste marqué nœud par nœud.
  hote.innerHTML = `<header class="enteteArbre">
      <h3>Panthéon</h3>
    </header>
    <div class="grilleArbre">${lignes}</div>`;
}

// Activer ou éteindre un nœud. ON NE REFUSE RIEN : le jeu, lui, exige deux
// nœuds du palier précédent pour ouvrir le suivant, mais un simulateur qui
// interdirait d'essayer ne servirait à rien. Les nœuds hors des paliers ouverts
// sont donc signalés — un cadenas sur la pastille, une ligne dans l'en-tête —
// et restent cliquables.
//
// C'est un changement demandé par Thomas après essai : la première version
// éteignait en cascade tout ce qui dépendait d'un nœud qu'on retirait. Fidèle
// au jeu, mais brutal — un clic vidait l'arbre.
function basculerNoeud(id) {
  const h = herosParId.get(selection);
  if (!h) return;
  const actifs = new Set(noeudsSimules(h));
  if (actifs.has(id)) {
    actifs.delete(id);
  } else {
    // Deux par ligne, pas plus : le clic de trop ne fait rien, et la ligne
    // pleine se voit — ses nœuds éteints sont marqués « complet ».
    const palier = paliersPantheon(actifs).find((p) => p.numeros.includes(id));
    if (palier && palier.actifsIci >= MAX_PAR_PALIER) return;
    actifs.add(id);
  }
  pantheonSimule[h.id] = [...actifs];
  rendreStats();
}
$('#arbrePantheon').addEventListener('click', (e) => {
  const bouton = e.target.closest('.noeudArbre[data-noeud]');
  if (bouton) basculerNoeud(bouton.dataset.noeud);
});

/* ------------------------------------------------ la bulle de survol

   Le nœud ne porte qu'une icône : tout ce qu'il fait se lit au survol. On y met
   son nom, ce qu'il change SUR CE HÉROS — calculé par la même chaîne que le
   tableau de statistiques, donc les mêmes chiffres — et son effet de combat
   s'il en a un.                                                              */

let bulleAncree = null;

function survolerNoeud(bouton) {
  const bulle = $('#bulleNoeud');
  const contexte = contexteHeros(selection);
  const classe = CLASSE_PANTHEON[contexte.details?.classe];
  const fiche = ((window.PANTHEON_JEU || {})[classe]?.noeuds || {})[bouton.dataset.noeud];
  if (!fiche) return;

  const apport = apportDuNoeud(contexte, agreger(objetsEquipes(selection)), fiche);
  const combat = (fiche.effets || []).filter((e) => e.type === 'combat');
  const actif = bouton.classList.contains('actif');
  const complet = bouton.classList.contains('complet');

  const gains = apport.length
    ? `<ul class="gainsBulle">${apport.map(({ stat, ecart }) => `<li>${imgStat(stat)}
        <span>${esc(libelleStat(stat))}</span>
        <b>${valeurAttribut(stat, ecart, FORMAT_STAT[stat] ? 'plat' : 'pourcentage')}</b></li>`).join('')}</ul>`
    : '';
  const texteCombat = combat.map((e) => `<p class="combatBulle">${esc(e.texte)}</p>`).join('');

  bulle.innerHTML = `<h4>${esc(fiche.nom)}</h4>
    ${gains}${texteCombat}
    ${!gains && !texteCombat ? '<p class="combatBulle">Ne change aucune statistique de fiche.</p>' : ''}
    <p class="piedBulle">${actif ? 'Activé — clique pour éteindre'
      : complet ? '<b>Ligne complète</b> — éteins-en un autre d’abord'
      : 'Clique pour activer'}${
      fiche.parNiveau ? ' · par niveau, jusqu’à 10' : ''}</p>`;

  bulle.hidden = false;
  const cadre = bouton.getBoundingClientRect();
  const taille = bulle.getBoundingClientRect();
  // La bulle se pose au-dessus du nœud, et rentre d'elle-même quand elle
  // dépasserait d'un bord : une infobulle à moitié hors de l'écran ne sert à rien.
  const x = Math.min(Math.max(8, cadre.left + cadre.width / 2 - taille.width / 2), innerWidth - taille.width - 8);
  const y = cadre.top - taille.height - 10 < 8 ? cadre.bottom + 10 : cadre.top - taille.height - 10;
  bulle.style.left = Math.round(x) + 'px';
  bulle.style.top = Math.round(y) + 'px';
  bulleAncree = bouton;
}

const cacherBulle = () => { $('#bulleNoeud').hidden = true; bulleAncree = null; };

$('#arbrePantheon').addEventListener('pointerover', (e) => {
  const bouton = e.target.closest('.noeudArbre[data-noeud]');
  if (bouton && bouton !== bulleAncree) survolerNoeud(bouton);
  else if (!bouton) cacherBulle();
});
$('#arbrePantheon').addEventListener('pointerleave', cacherBulle);
$('#arbrePantheon').addEventListener('focusin', (e) => {
  const bouton = e.target.closest('.noeudArbre[data-noeud]');
  if (bouton) survolerNoeud(bouton);
});
$('#arbrePantheon').addEventListener('focusout', cacherBulle);

const NOM_CLASSE = {
  single_striker: 'attaquants individuels', area_attacker: 'attaquants de zone',
  defender: 'défenseurs', healer: 'soigneurs', manipulator: 'manipulateurs', supporter: 'soutiens',
};
const nomClasse = (c) => NOM_CLASSE[c] || 'cette classe';

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
    case 'coups': return { texte: `${coupsMin(v)} coups/min`, brut: v };
    // Le jeu écrit « Mêlée » plutôt qu'une distance quand le héros frappe au contact.
    case 'portee': return { texte: v <= 1.5 ? 'Mêlée' : nombre(v), brut: v };
    case 'vitesse': return { texte: `${nombre(v)} ${v >= 2.5 ? '(rapide)' : v >= 2 ? '(moyenne)' : '(lente)'}`, brut: v };
    default: return { texte: pourcent(v), brut: v };
  }
}

// L'ÉCART D'UNE STATISTIQUE, écrit dans son unité — et une seule fois pour tout le
// site : le tableau s'en sert, le banc d'essai aussi, et les deux ne peuvent plus
// diverger.
//
// L'ÉCART D'UNE STATISTIQUE ENTIÈRE EST LA DIFFÉRENCE DES DEUX NOMBRES AFFICHÉS.
// Le jeu n'écrit jamais de décimale sur l'attaque ou les points de vie, et un
// « +128,3 » ne correspondait à rien de visible. Mais arrondir l'écart ne suffit
// pas : arrondi à l'unité supérieure il donnait +49 là où les colonnes montrent
// 8 432 et 8 480, soit 48 — la ligne ne s'additionnait plus. On prend donc
// littéralement la différence de ce qui est écrit, et tout se recoupe.
function ecartHtml(stat, s, a, vide = '<span class="discret">=</span>') {
  const delta = s.brut - a.brut;
  // Sur la charge, gagner du temps c'est descendre : la couleur suit le bénéfice.
  const bon = s.inverse ? delta < 0 : delta > 0;
  const pourAffichage = FORMAT_STAT[stat] === 'entier' ? Math.round(s.brut) - Math.round(a.brut) : delta;
  if (Math.abs(pourAffichage) < 1e-9) return vide;

  // Chaque unité s'écrit comme la colonne l'écrit : « +3 coups/min » et non le
  // « +0,1 » de la donnée brute, « −0,36 s » et non « −0,4 ».
  const ecrire = (x) => {
    switch (FORMAT_STAT[stat]) {
      case 'entier': case 'decimal': case 'portee': case 'vitesse': return nombre(x);
      case 'coups': return `${coupsMin(x)} coups/min`;
      case 'secondes': return `${secondes(x)} s`;
      default: return pourcent(x);
    }
  };
  return `<span class="${bon ? 'hausse' : 'baisse'}">${signe(pourAffichage, ecrire)}</span>`;
}

function ligneStat(stat, simule, actuel, incomplete = false) {
  const s = valeurStat(stat, simule);
  const a = valeurStat(stat, actuel);
  const delta = s.brut - a.brut;
  // Sur la charge, gagner du temps c'est descendre : la couleur suit le bénéfice.
  const bon = s.inverse ? delta < 0 : delta > 0;
  // L'ÉCART D'UNE STATISTIQUE ENTIÈRE EST LA DIFFÉRENCE DES DEUX NOMBRES AFFICHÉS.
  // Le jeu n'écrit jamais de décimale sur l'attaque ou les points de vie, et un
  // « +128,3 » ne correspondait à rien de visible. Mais arrondir l'écart ne suffit
  // pas : arrondi à l'unité supérieure il donnait +49 là où les colonnes montrent
  // 8 432 et 8 480, soit 48 — la ligne ne s'additionnait plus. On prend donc
  // littéralement la différence de ce qui est écrit, et tout se recoupe.
  const ecart = ecartHtml(stat, s, a);

  const majeure = STATS_DE_BASE.includes(stat);
  const ouverte = statOuverte === stat;
  // Faute de valeur de départ, on n'écrit pas un total qui serait faux : on montre
  // ce qu'on sait, l'apport de l'équipement, et l'on signale le reste comme manquant.
  const colonne = (v) => {
    if (!incomplete) return v.texte;
    const explication = "Le catalogue du jeu ne donne pas la valeur de départ de ce héros pour cette "
      + "statistique. Ce que l'équipement y ajoute, en revanche, est connu.";
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
    : FORMAT_STAT[stat] === 'coups' ? `${coupsMin(v)} coups/min`
    : nombre(v));

  // Les sources, dans l'ordre où le jeu les empile. On garde le cumul à chaque
  // étape : c'est ce qui rend l'addition lisible sans avoir à la refaire.
  const etapes = [
    ['Base du héros au niveau 1', d.base, 'plat'],
    [`Montée au niveau ${contexteHeros(selection).niveau}`, d.niveau, 'plat'],
    ['Éveil', d.eveil, 'plat'],
    ['Caserne', d.caserne, 'plat'],
    ['Relique', d.relique, 'plat'],
    // UNE SEULE LIGNE POUR L'ÉQUIPEMENT, comme dans le jeu : ce qu'un objet
    // donne à plat et ce qu'il donne en pourcentage de la base y sont déjà
    // additionnés (voir detail(), dans formules.js). Le taux reste écrit à
    // côté, pour qu'on voie d'où sort le chiffre.
    ['Équipement et ensembles', d.equipement, 'plat', d.tauxEquipement],
    ['Panthéon', d.pantheon, 'plat'],
  ].filter(([, v]) => typeof v === 'number' && Math.abs(v) > 1e-9);

  let cumul = 0;
  const lignes = etapes.map(([nom, v, nature, taux]) => {
    cumul += v;
    const apport = nature === 'pourcentage' ? signe(v, pourcent) : signe(v, ecrire);
    // « +305 » ne dit pas d'où il sort : on rappelle le taux qui l'a produit.
    // Inutile, en revanche, sur une statistique qui EST un pourcentage — l'apport
    // y est déjà le taux, et « +3,96 % (+3,96 %) » ne dit rien de plus.
    const precision = taux && !estPourcentage ? ` <span class="taux">(${signe(taux, pourcent)})</span>` : '';
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

  // Le menu ne porte plus que le nombre : il tient dans une pastille, et ce
  // qu'il fallait dire en toutes lettres — « son niveau » — se lit à côté.
  // Le point des dizaines aide à se repérer dans une liste de 160 lignes, mais
  // il n'a rien à faire dans la pastille : on l'enlève de la ligne choisie, la
  // seule que le menu fermé donne à voir.
  const options = [];
  for (let n = 1; n <= max; n++) {
    const marque = n % 10 === 0 && n !== affiche ? ' •' : '';
    options.push(`<option value="${n}" ${n === affiche ? 'selected' : ''}>${n}${marque}</option>`);
  }

  const projection = $('#projection');
  projection.classList.toggle('projete', affiche !== reel);
  projection.innerHTML = `
    <span class="etiquetteNiveau">Niveau</span>
    <span class="reglageNiveau">
      <button type="button" class="pasNiveau" data-pas="-1" ${affiche <= 1 ? 'disabled' : ''}
        title="Un niveau de moins" aria-label="Un niveau de moins">−</button>
      <label class="sr" for="niveauProjete">Niveau à simuler</label>
      <select id="niveauProjete" size="1">${options.join('')}</select>
      <button type="button" class="pasNiveau" data-pas="1" ${affiche >= max ? 'disabled' : ''}
        title="Un niveau de plus" aria-label="Un niveau de plus">+</button>
    </span>
    <input type="range" id="curseurNiveau" min="1" max="${max}" value="${affiche}"
      aria-label="Niveau à simuler">
    ${affiche !== reel
      ? `<button id="revenirNiveau" class="lienDiscret">revenir au ${reel}</button>`
      : '<span class="sonNiveau">son niveau</span>'}`;
}


/* ------------------------------------------------ la capacité du héros

   LA CARTE DE CAPACITÉ, écrite comme le jeu l'écrit. Elle n'invente rien : le
   texte est celui du fichier de traduction, les chiffres sont ceux du palier de
   compétence atteint, et les deux se rejoignent dans capacites-jeu.js.

   Les deux charges, elles, ne viennent pas de là : ce sont des statistiques
   comme les autres, et elles bougent avec l'équipement. On les prend donc dans
   la feuille simulée — la carte suit ce qu'on essaie, comme le reste. */

// Les icônes du jeu, telles que la phrase les appelle, dans nos propres fichiers.
const ICONE_CAPACITE = {
  atk: 'Attack', atkspd: 'AttackSpeed', hp: 'MaxHitPoints', def: 'Defense',
  basedmg: 'BaseDamage', dmg: 'BasicAttackDamageAmp', singledmg: 'SingleTargetDamageAmp',
  areadmg: 'AoeDamageAmp', critchance: 'CritChance', critdmg: 'CritDamage',
  movespd: 'MoveSpeed', evasion: 'Evasion', burndmg: 'BurnDamageAmp',
  lightningdmg: 'LightningDamageAmp', charge: 'Focus',
};

// Un trou de la phrase, écrit comme le jeu l'écrit : « 1115 % », « 8 s », « 3 ».
const valeurCapacite = (valeur, format) => (
  format === 'pourcentage' ? pourcent(valeur)
    : format === 'secondes' ? `${secondes(valeur)} s`
      : nombre(valeur));

// Ce que dit la capacité d'un héros AU PALIER QU'IL A ATTEINT. Un héros qu'on ne
// possède pas est lu au premier palier : c'est ce que le jeu montre aussi.
function capaciteDuHeros(heroId, competence) {
  const fiche = (window.CAPACITES_JEU || {})[heroId];
  if (!fiche) return null;
  const modeles = window.MODELES_CAPACITE || {};
  const palier = Math.min(Math.max(competence || 1, 1), fiche.volets[0].paliers.length);

  const volets = fiche.volets.map((volet) => {
    const [rang, valeurs] = volet.paliers[palier - 1] || volet.paliers[0];
    const modele = modeles[volet.modeles[rang]];
    if (!modele) return null;
    const trous = { ...volet.communs, ...valeurs };
    const lignes = modele.lignes.map((ligne) => esc(ligne)
      .replace(/\{([a-z0-9_]+)\}/g, (tout, nom) => (trous[nom] === undefined ? tout
        : `<b class="chiffreCapacite">${valeurCapacite(trous[nom], volet.formats[nom])}</b>`))
      .replace(/\[\[([a-z0-9]+)\]\]/g, (tout, icone) => (ICONE_CAPACITE[icone] ? imgStat(ICONE_CAPACITE[icone]) : '')));
    return { etiquettes: modele.etiquettes, lignes };
  }).filter(Boolean);

  return { nom: fiche.nom, palier, volets };
}

function rendreCapacite(contexte, simule) {
  const bloc = $('#capacite');
  const capacite = capaciteDuHeros(selection, contexte.hero?.competence);
  if (!capacite) { bloc.hidden = true; bloc.innerHTML = ''; return; }

  const charge = (stat) => valeurStat(stat, simule).texte;
  const volets = capacite.volets.map((volet) => `
    <div class="voletCapacite">
      ${volet.etiquettes.length
    ? `<p class="etiquettesCapacite">${volet.etiquettes.map((e) => `<span>${esc(e)}</span>`).join('')}</p>`
    : ''}
      <ul class="effetsCapacite">${volet.lignes.map((l) => `<li>${l}</li>`).join('')}</ul>
    </div>`).join('');

  bloc.hidden = false;
  bloc.innerHTML = `
    <header class="enteteCapacite">
      <img class="portraitCapacite" src="${portraitsDe(selection)[0]}" alt=""
        data-repli="${portraitsDe(selection).slice(1).join(',')}" onerror="repliIcone(this)">
      <div>
        <h3>${esc(capacite.nom)}</h3>
        <p class="palierCapacite">Niv. ${capacite.palier}</p>
      </div>
      <dl class="chargesCapacite">
        <div><dt>Charge initiale</dt><dd>${charge('charge_initiale')}</dd></div>
        <div><dt>Charge normale</dt><dd>${charge('charge_normale')}</dd></div>
      </dl>
    </header>
    ${volets}`;
}


// La relique portée, avec ses deux réglages : son niveau et l'ère du joueur.
// Les deux commandent directement les chiffres, et aucun des deux n'est fiable
// à 100 % dans l'export — autant les rendre modifiables.
// Ce qu'une relique apporte, écrit comme le tableau l'écrit : en points quand
// c'est un nombre de points, en pourcentage quand c'en est un. Écrire « +0,1 »
// pour dix pour cent de dégâts de zone ne voulait rien dire.
const texteApportRelique = (stat, v) =>
  `${FORMULES.ABSOLUES.has(stat) ? signe(v, nombre) : signe(v, pourcent)} ${libelleStat(stat).toLowerCase()}`;

function rendreRelique(contexte) {
  const portee = reliqueDuHeros(selection);
  const reelle = reliqueReelle(selection);
  const bloc = $('#relique');

  // Le bouton d'échange est proposé même sans relique : c'est justement là qu'on
  // veut savoir ce qu'une relique apporterait.
  const choisir = (etiquette) => `<button type="button" id="changerRelique" class="lienDiscret">${etiquette}</button>`;

  if (!portee) {
    bloc.innerHTML = `<p class="discret">Aucune relique sur ce héros. ${choisir('En essayer une')}</p>`;
    return;
  }

  const ficheRelique = (window.RELIQUES_JEU || {})[portee.relique];
  const paliers = ficheRelique?.paliers || [];
  const dernier = paliers.length ? paliers[paliers.length - 1].niveau : portee.niveau;
  const apports = Object.entries(contexte.relique).filter(([stat]) => !stat.startsWith('stat_'));
  const essayee = reelle?.relique !== portee.relique || reelle?.niveau !== portee.niveau;

  bloc.innerHTML = `
    <div class="carteRelique ${essayee ? 'essayee' : ''}">
      ${imgRelique(portee.relique)}
      <div class="texteRelique">
        <span class="nomRelique">${esc(ficheRelique?.nom || joliNom(portee.relique))}</span>
        <span class="apportRelique">${apports.length
    ? apports.map(([stat, v]) => texteApportRelique(stat, v)).join(' · ')
    : '<span class="discret">effet non chiffré</span>'}</span>
      </div>
    </div>
    <div class="reglagesRelique">
      <span class="reglageNiveau">
        <span class="etiquetteNiveau">Niveau</span>
        <button type="button" class="pasNiveau" data-pas-relique="-1" ${portee.niveau <= 1 ? 'disabled' : ''}
          title="Un niveau de moins" aria-label="Un niveau de moins">−</button>
        <b class="valeurNiveauRelique">${portee.niveau}</b>
        <button type="button" class="pasNiveau" data-pas-relique="1" ${portee.niveau >= dernier ? 'disabled' : ''}
          title="Un niveau de plus" aria-label="Un niveau de plus">+</button>
      </span>
      ${choisir(essayee ? 'Changer' : 'En essayer une autre')}
    </div>
    ${essayee
    ? `<p class="discret noteRelique">Relique essayée — ${reelle
      ? `la colonne de gauche garde ${esc(nomRelique(reelle.relique))}`
      : "sur ton compte, ce héros n'en porte aucune"}.
        <button type="button" id="rendreRelique" class="lienDiscret">annuler l'essai</button></p>`
    : `<p class="discret noteRelique">Le jeu met les reliques à l'échelle de ton ère
        (${esc(NOM_ERE[ereDuJoueur()] || 'inconnue')}) : c'est elle qui fait passer ce palier de
        ${paliers.find((p) => p.niveau === portee.niveau)?.apports.Attack ?? '?'} à
        ${contexte.relique.Attack ?? '?'} d'attaque.</p>`}`;
}

// Le nom d'une relique tel que le jeu l'écrit.
const nomRelique = (id) => (window.RELIQUES_JEU || {})[id]?.nom || joliNom(id);

/* ------------------------------------------------ essayer une autre relique

   MÊME PRINCIPE QUE L'ÉQUIPEMENT : on pioche dans ce que le compte possède, on
   voit le résultat tout de suite, et rien n'est envoyé nulle part. Une relique
   déjà posée sur un autre héros reste proposée — la lui retirer ne coûte, ici,
   qu'un clic — et la ligne le dit.

   L'ÈRE EST RANGÉE ICI, et non dans le panneau de statistiques : elle ne décrit
   pas ce héros mais TON COMPTE, elle ne se règle qu'une fois, et sa liste de
   vingt-trois âges n'avait rien à faire au milieu des chiffres.                */
function ouvrirSelecteurRelique() {
  $('#selecteurReliqueTitre').textContent = `Relique pour ${nomHeros(selection)}`;
  $('#selecteurRelique').hidden = false;
  rendreSelecteurRelique();
}

function rendreSelecteurRelique() {
  const posee = reliqueDuHeros(selection);
  const modificateur = modificateurDEre();

  const lignes = (donnees?.compte?.reliques || [])
    .map((r) => ({ ...r, fiche: (window.RELIQUES_JEU || {})[r.relique] }))
    .sort((a, b) => (b.fiche?.rarete ?? 0) - (a.fiche?.rarete ?? 0) || (b.niveau ?? 0) - (a.niveau ?? 0))
    .map((r) => {
      const niveau = r.porteParHero === selection ? niveauRelique(r) : (r.niveau ?? 0);
      const palier = r.fiche?.paliers?.filter((p) => p.niveau <= niveau).pop();
      const apports = Object.entries(palier?.apports || {})
        .filter(([stat]) => !stat.startsWith('stat_'))
        .map(([stat, v]) => texteApportRelique(stat, FORMULES.ABSOLUES.has(stat) ? Math.ceil(v * modificateur) : v))
        .join(' · ');
      const marque = r.porteParHero === selection ? 'portée ici'
        : r.porteParHero ? `portée par ${nomHeros(r.porteParHero)}`
          : 'en réserve';
      return `<li class="r${r.fiche?.rarete ?? 4} ${posee?.relique === r.relique ? 'choisie' : ''}"
          data-relique="${esc(r.relique)}" data-niveau="${niveau}">
        ${imgRelique(r.relique)}
        <span class="corpsObjet">
          <span class="titre">${esc(nomRelique(r.relique))} <span class="discret">niv. ${niveau}</span></span>
          <span class="attributsObjet">${esc(apports) || '<span class="discret">effet non chiffré</span>'}</span>
        </span>
        <span class="marque">${esc(marque)}</span>
      </li>`;
    }).join('');

  const eres = Object.entries(window.AGES_JEU || {})
    .filter(([nom]) => NOM_ERE[nom])
    .sort((a, b) => a[1].rang - b[1].rang);
  $('#ereJoueur').innerHTML = eres.map(([nom, a]) =>
    `<option value="${nom}" ${nom === ereDuJoueur() ? 'selected' : ''}>${esc(NOM_ERE[nom])} (x${multiplicateur(a.modificateur)})</option>`).join('');

  $('#listeReliques').innerHTML =
    '<li data-relique="" class="titre">Aucune — retirer la relique</li>'
    + (lignes || '<li class="discret">Ton compte ne porte aucune relique.</li>');
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
  // Le banc s'ouvre comme celui du jeu : à droite ce que le héros porte, à
  // gauche la place où poser ce qu'on veut essayer contre.
  essai = { a: null, b: (equipe[selection] || {})[slot] ?? null, actif: 'a' };
  $('#selecteur').hidden = false;
  rendreFiltresObjet();
  rendreSelecteur();
  rendreBanc();
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
    // Ce qui est déjà sur le banc se voit dans la liste : on ne repose pas deux
    // fois la même pièce sans s'en apercevoir.
    const surLeBanc = essai.a === o.id ? 'surBancGauche' : essai.b === o.id ? 'surBancDroit' : '';
    return `<li class="r${o.rarete} ${p && p !== selection ? 'porte' : ''} ${surLeBanc}" data-objet="${o.id}">
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

/* ------------------------------------------------ le banc d'essai

   L'ÉCRAN DE COMPARAISON DU JEU, repris ici : l'inventaire à gauche, deux pièces
   posées côte à côte, et ce qu'elles font aux statistiques à droite.

   UNE DIFFÉRENCE, ET ELLE COMPTE : le jeu compare toujours une pièce à CELLE
   QU'ON PORTE. Ici les deux côtés se changent. On compare donc aussi bien deux
   pièces qu'on ne porte pas — « laquelle de ces deux-là vaut-il mieux viser ? » —
   sans rien poser sur le héros.

   Et le repère ne bouge pas pour autant : la colonne PORTÉ du tableau reste ce
   que le héros porte dans la simulation, et les deux colonnes suivantes disent ce
   que chaque côté y changerait. */

// La pièce posée de chaque côté : un identifiant, ou null pour « emplacement
// vide ». « actif » désigne le côté que le prochain clic dans la liste remplira.
let essai = { a: null, b: null, actif: 'a' };

const pieceEssai = (cote) => (essai[cote] == null ? null : objets.get(essai[cote]));
const pieceEnPlace = () => (equipe[selection] || {})[slotEnCours] ?? null;

function rendreBanc() {
  rendreCartesEssai();
  rendreStatsEssai();
}

function carteEssaiHtml(cote) {
  const o = pieceEssai(cote);
  const enPlace = (essai[cote] ?? null) === pieceEnPlace();
  const actif = essai.actif === cote;
  const p = o ? porteur.get(o.id) : null;
  const def = o ? defSet(o.set) : null;

  const corps = o
    ? `<div class="corpsCarteEssai">
        ${tuileObjet(o)}
        <div class="texteCarteEssai">
          <span class="titre">${esc(nomObjet(o))}</span>
          <span class="discret">${p === selection ? 'équipé ici' : p ? `porté par ${esc(nomHeros(p))}` : 'en réserve'}</span>
        </div>
      </div>
      ${attributsObjetHtml(o)}
      ${def ? `<p class="ensembleCarteEssai">${imgSet(o.set)}<span>${esc(nomSet(o.set))} ${def.pieces}/${def.pieces}
        <span class="discret">${esc(texteBonusSet(def))}</span></span></p>` : ''}`
    : `<div class="corpsCarteEssai vide">
        ${SILHOUETTE[slotEnCours] || ''}
        <span class="discret">Emplacement vide${actif ? ' — choisis une pièce à gauche' : ''}</span>
      </div>`;

  // Un seul bouton par côté : ce côté-là est déjà sur le héros, on le retire ;
  // il ne l'est pas, on le pose. Le reste — remplir la carte — se fait dans la
  // liste, sur le côté choisi.
  const action = enPlace
    ? (o ? `<button type="button" class="bouton" data-deposer="${cote}">Déséquiper</button>`
      : '<span class="discret">rien dans cet emplacement</span>')
    : `<button type="button" class="bouton principal" data-poser="${cote}">${o ? 'Équiper' : "Laisser l'emplacement vide"}</button>`;

  return `<article class="carteEssai ${actif ? 'actif' : ''} ${o ? `r${o.rarete}` : ''}" data-cote="${cote}">
    <header>
      <span class="roleEssai">${enPlace ? 'Ce que tu portes' : 'À l’essai'}</span>
      ${actif ? '<span class="cibleEssai">reçoit ton choix</span>' : ''}
    </header>
    ${corps}
    <footer>${action}</footer>
  </article>`;
}

function rendreCartesEssai() {
  $('#cartesEssai').innerHTML = ['a', 'b'].map(carteEssaiHtml).join('');
}

// Ce que chaque côté ferait aux statistiques, contre ce que le héros porte.
// Le calcul passe par la même chaîne que le grand tableau — même feuille, même
// agrégation, mêmes bonus d'ensemble : les deux ne peuvent pas se contredire.
function rendreStatsEssai() {
  const contexte = contexteHeros(selection);
  const base = { ...(equipe[selection] || {}) };
  const avec = (piece) => {
    const config = { ...base };
    if (piece == null) delete config[slotEnCours];
    else config[slotEnCours] = piece;
    return feuille(contexte, agreger(Object.values(config).map((id) => objets.get(id)).filter(Boolean)));
  };

  const porte = avec(pieceEnPlace());
  const cotes = { a: avec(essai.a), b: avec(essai.b) };

  // On ne montre pas les cinquante lignes du tableau : les quatre principales,
  // et tout ce que l'un des deux côtés fait bouger.
  const bouge = (stat) => ['a', 'b'].some((c) => Math.abs((cotes[c][stat]?.total ?? 0) - (porte[stat]?.total ?? 0)) > 1e-9)
    || ['a', 'b'].some((c) => Math.abs(valeurStat(stat, cotes[c]).brut - valeurStat(stat, porte).brut) > 1e-9);
  const lignes = FAMILLES_STATS.flatMap((f) => f.stats)
    .filter((stat, i, tout) => tout.indexOf(stat) === i)
    .filter((stat) => STATS_PRINCIPALES.includes(stat) || bouge(stat));

  const cellule = (stat, f) => {
    const v = valeurStat(stat, f);
    return `<td><span class="valeurEssai">${v.texte}</span>${ecartHtml(stat, v, valeurStat(stat, porte), '')}</td>`;
  };

  const puissance = (f) => FORMULES.puissance(f, contexte);
  const p0 = puissance(porte);
  const cellulePuissance = (f) => {
    const p = puissance(f);
    if (p == null || p0 == null) return '<td class="discret">—</td>';
    const ecart = Math.round(p) - Math.round(p0);
    return `<td><span class="valeurEssai">${nombre(Math.round(p))}</span>${ecart
      ? `<span class="${ecart > 0 ? 'hausse' : 'baisse'}">${signe(ecart, nombre)}</span>` : ''}</td>`;
  };

  $('#statsEssai').innerHTML = `<table>
    <thead><tr>
      <th>Statistique</th><th>Porté</th><th>Côté gauche</th><th>Côté droit</th>
    </tr></thead>
    <tbody>
      <tr class="lignePuissance">
        <th>Puissance</th>
        <td><span class="valeurEssai">${p0 == null ? '—' : nombre(Math.round(p0))}</span></td>
        ${cellulePuissance(cotes.a)}${cellulePuissance(cotes.b)}
      </tr>
      ${lignes.map((stat) => `<tr>
        <th>${imgStat(stat)}${esc(libelleStat(stat))}</th>
        <td><span class="valeurEssai">${valeurStat(stat, porte).texte}</span></td>
        ${cellule(stat, cotes.a)}${cellule(stat, cotes.b)}
      </tr>`).join('')}
    </tbody>
  </table>`;
}

/* ------------------------------------------------- équiper au mieux

   « Quel est le meilleur équipement pour CE héros ? » — la question que tout
   joueur se pose devant un inventaire de huit cents pièces, et à laquelle la main
   ne sait pas répondre : essayer les cinq emplacements l'un après l'autre, c'est
   des millions de combinaisons.

   CE QUE LE BOUTON CHERCHE SE CHOISIT, dans le menu posé à côté de lui.

   Par défaut, la PUISSANCE ESTIMÉE : c'est le seul critère qui pèse le héros
   entier, puisque la formule multiplie entre elles l'attaque, la défense, les
   points de vie, les crits et la vitesse — un tank et un frappeur n'y gagnent
   donc pas les mêmes pièces. Mais n'importe quelle ligne de la feuille de
   statistiques peut prendre sa place : « le plus de points de vie », « le plus de
   soin prodigué », « la charge la plus courte ». Le jeu, lui, ne classe que par
   puissance ; viser une ligne précise sert quand on sait ce qu'on veut faire du
   héros, et que la puissance n'en dit rien.

   VISER UNE LIGNE COÛTE LE RESTE, et il faut le savoir : maximiser l'attaque seule
   fait volontiers perdre de la puissance. Le compte rendu affiche donc toujours
   les deux — la ligne visée ET la puissance — pour qu'on voie ce qu'on a payé.

   Ce que le bouton propose n'est de toute façon pas un verdict : la configuration
   se retouche ensuite pièce par pièce comme le reste, et « Rétablir mon
   équipement réel » la défait. C'est en cela qu'il ne contredit pas le parti pris
   de l'arbre de panthéon, qui ne conseille rien : un nœud de panthéon se paie et
   ne se reprend pas, un objet se change d'un clic et ne coûte rien.

   COMMENT, sans essayer les millions de combinaisons. Trois temps :

     1. ÉLAGAGE. Chaque objet est essayé seul, à sa place, sur l'équipement du
        moment. On ne garde que les meilleurs — plus, pour chaque ensemble, ses
        deux meilleures pièces par emplacement, sans quoi un bonus d'ensemble ne
        pourrait jamais se former.
     2. PLANS D'ENSEMBLE. Un bonus d'ensemble demande DEUX ou TROIS pièces posées
        en même temps : aucune amélioration pièce par pièce n'y arrive jamais,
        chaque pas isolé faisant perdre. On énumère donc les plans — « armement
        Samouraï complet », « parure libre », etc. — et on les croise.
     3. AFFINAGE. Les meilleurs plans sont repris un par un, et l'on améliore
        emplacement par emplacement tant que ça monte. Un plan qui ne valait pas
        son bonus se défait alors de lui-même : rien n'est imposé, tout est mesuré.

   Le résultat est le meilleur TROUVÉ, pas le meilleur possible — mais chaque
   chiffre qu'il affiche est celui du tableau de statistiques, calculé par la même
   chaîne, et l'écart se lit comme n'importe quelle autre retouche.              */

const SLOTS_OPTIM = ['Hand', 'Garment', 'Hat', 'Neck', 'Ring'];
const SLOTS_ARMEMENT = ['Hand', 'Garment'];
const SLOTS_PARURE = ['Hat', 'Neck', 'Ring'];

// Combien de candidats on garde par emplacement après l'élagage. Assez large pour
// que l'affinage ait de quoi travailler, assez court pour rester instantané.
const CANDIDATS_PAR_SLOT = 14;
const CANDIDATS_PAR_SET = 2;
const PLANS_AFFINES = 8;

// Le menu des critères reprend les familles de l'écran « Stats », dans le même
// ordre : ce qu'on cherche à maximiser se retrouve là où on a l'habitude de le
// lire. Les deux charges y figurent aussi — on les cherche alors les plus
// COURTES, la seule ligne du tableau où descendre est un gain.
const CRITERE_PUISSANCE = 'puissance';
let critereOptimisation = (() => {
  try { return localStorage.getItem('hoh.critere') || CRITERE_PUISSANCE; }
  catch { return CRITERE_PUISSANCE; }
})();

// LE SCORE D'UNE CONFIGURATION. « valeur » est ce qu'on maximise ; « puissance »
// départage les ex æquo, et ils sont légion — des dizaines de configurations
// donnent exactement la même attaque, autant retenir la plus puissante d'entre
// elles plutôt que la première venue.
function evaluer(contexte, choix) {
  const liste = SLOTS_OPTIM.map((s) => objets.get(choix[s])).filter(Boolean);
  const stats = feuille(contexte, agreger(liste));
  const puissance = FORMULES.puissance(stats, contexte) ?? -Infinity;
  if (critereOptimisation === CRITERE_PUISSANCE) return { valeur: puissance, puissance, stats };
  const v = valeurStat(critereOptimisation, stats);
  // Sur les charges, gagner c'est descendre : on maximise l'opposé.
  return { valeur: v.inverse ? -v.brut : v.brut, puissance, stats };
}

const meilleurQue = (a, b) => !b
  || a.valeur > b.valeur + 1e-9
  || (Math.abs(a.valeur - b.valeur) <= 1e-9 && a.puissance > b.puissance + 1e-6);

// L'inventaire disponible pour ce héros, emplacement par emplacement. Ce qu'il
// porte déjà lui reste acquis ; le reste dépend de la case à cocher.
function inventaireDisponible(heroId, chezLesAutres) {
  const dispo = { Hand: [], Garment: [], Hat: [], Neck: [], Ring: [] };
  for (const o of donnees.compte.equipements) {
    if (!dispo[o.emplacement]) continue;
    const p = porteur.get(o.id);
    if (p && p !== heroId && !chezLesAutres) continue;
    dispo[o.emplacement].push(o);
  }
  return dispo;
}

// Premier temps : chaque objet est essayé seul, à sa place, sur la configuration
// de départ. Un classement grossier — il ignore ce que les autres emplacements
// deviendront — mais il suffit à écarter les neuf dixièmes de l'inventaire.
function elaguer(contexte, depart, dispo) {
  const notes = new Map();
  const pool = {};
  for (const slot of SLOTS_OPTIM) {
    const classes = dispo[slot]
      .map((o) => {
        const note = evaluer(contexte, { ...depart, [slot]: o.id });
        notes.set(o.id, note);
        return { o, note };
      })
      .sort((a, b) => (meilleurQue(a.note, b.note) ? -1 : 1));

    const gardes = new Map(classes.slice(0, CANDIDATS_PAR_SLOT).map(({ o }) => [o.id, o]));
    // Les meilleures pièces de chaque ensemble, même médiocres prises seules :
    // c'est le bonus d'ensemble qui les rachètera, et il n'apparaît qu'à deux ou
    // trois pièces posées ensemble.
    const parSet = {};
    for (const { o } of classes) {
      const n = (parSet[o.set] = (parSet[o.set] || 0) + 1);
      if (n <= CANDIDATS_PAR_SET) gardes.set(o.id, o);
    }
    pool[slot] = [...gardes.values()];
  }
  return { pool, notes };
}

// Deuxième temps : les plans. Un plan nomme l'ensemble à réunir sur un groupe
// d'emplacements ; « null » est le plan libre, qui n'impose rien.
function plansPossibles(pool, slots) {
  const plans = [null];
  const occupation = {};
  for (const slot of slots) {
    for (const o of pool[slot]) (occupation[o.set] ||= new Set()).add(slot);
  }
  for (const [set, occupes] of Object.entries(occupation)) {
    const taille = taillesDeSet.get(set) ?? slots.length;
    // Un ensemble d'armement se porte en deux pièces, une parure en trois : le
    // plan n'a de sens que si l'inventaire peut vraiment le compléter ici.
    if (taille <= slots.length && occupes.size >= taille) plans.push(set);
  }
  return plans;
}

// Les pièces qu'un plan pose : celles de l'ensemble là où il en a, les mieux
// classées partout ailleurs.
function remplirSelonPlan(choix, plan, slots, pool, notes) {
  const mieux = (a, b) => (meilleurQue(notes.get(b.id), a ? notes.get(a.id) : null) ? b : a);
  for (const slot of slots) {
    const candidats = plan ? pool[slot].filter((o) => o.set === plan) : pool[slot];
    const retenu = (candidats.length ? candidats : pool[slot]).reduce(mieux, null);
    choix[slot] = retenu ? retenu.id : null;
  }
  return choix;
}

// Troisième temps : on améliore un emplacement à la fois, tant que ça monte.
// Chaque essai est une feuille de statistiques complète — donc de vrais chiffres,
// pas une approximation — et un ensemble qui ne vaut pas son bonus se défait tout
// seul.
function affiner(contexte, choix, pool) {
  let meilleur = evaluer(contexte, choix);
  for (let tour = 0; tour < 6; tour++) {
    let abouge = false;
    for (const slot of SLOTS_OPTIM) {
      let retenu = choix[slot];
      for (const o of pool[slot]) {
        if (o.id === choix[slot]) continue;
        const score = evaluer(contexte, { ...choix, [slot]: o.id });
        if (meilleurQue(score, meilleur)) { meilleur = score; retenu = o.id; }
      }
      if (retenu !== choix[slot]) { choix[slot] = retenu; abouge = true; }
    }
    if (!abouge) break;
  }
  return { choix, score: meilleur };
}

// La recherche complète, pour un héros.
function chercherMeilleurEquipement(heroId, chezLesAutres) {
  const contexte = contexteHeros(heroId);
  const dispo = inventaireDisponible(heroId, chezLesAutres);
  if (SLOTS_OPTIM.every((s) => !dispo[s].length)) return null;

  // On part de ce qui est simulé en ce moment : c'est le point de comparaison du
  // joueur, et un point de départ déjà correct pour l'élagage.
  const depart = {};
  for (const slot of SLOTS_OPTIM) depart[slot] = (equipe[heroId] || {})[slot] ?? null;

  const { pool, notes } = elaguer(contexte, depart, dispo);

  // Les plans d'armement et de parure se croisent : les statistiques se
  // multiplient entre elles, on ne peut donc pas choisir les deux moitiés
  // séparément.
  const combinaisons = [];
  for (const armement of plansPossibles(pool, SLOTS_ARMEMENT)) {
    for (const parure of plansPossibles(pool, SLOTS_PARURE)) {
      const choix = {};
      remplirSelonPlan(choix, armement, SLOTS_ARMEMENT, pool, notes);
      remplirSelonPlan(choix, parure, SLOTS_PARURE, pool, notes);
      combinaisons.push({ choix, score: evaluer(contexte, choix) });
    }
  }
  // L'équipement du moment concourt aussi : si rien ne fait mieux, il gagne.
  const avant = evaluer(contexte, depart);
  combinaisons.push({ choix: { ...depart }, score: avant });

  combinaisons.sort((a, b) => (meilleurQue(a.score, b.score) ? -1 : 1));
  let gagnant = null;
  for (const candidat of combinaisons.slice(0, PLANS_AFFINES)) {
    const affine = affiner(contexte, { ...candidat.choix }, pool);
    if (!gagnant || meilleurQue(affine.score, gagnant.score)) gagnant = affine;
  }
  return { ...gagnant, avant };
}

// Poser le résultat sur le héros. « equiper » se charge de retirer chaque pièce à
// son ancien porteur — c'est déjà ce qui se passe quand on choisit un objet à la
// main dans le sélecteur.
function appliquerEquipement(heroId, choix) {
  let changees = 0;
  for (const slot of SLOTS_OPTIM) {
    const avant = (equipe[heroId] || {})[slot] ?? null;
    const apres = choix[slot] ?? null;
    if (avant === apres) continue;
    changees++;
    if (apres == null) retirer(heroId, slot);
    else equiper(heroId, slot, apres);
  }
  return changees;
}

// CE QUE LA RECHERCHE A TROUVÉ, en une phrase. On y écrit toujours la puissance,
// même quand ce n'est pas elle qu'on visait : c'est le prix de la ligne visée, et
// il est parfois lourd.
function compteRenduOptimisation(changees, score, avant) {
  if (!changees) return 'Rien à changer : c\'est déjà la meilleure configuration trouvée.';
  const pieces = `${changees} pièce${changees > 1 ? 's' : ''} changée${changees > 1 ? 's' : ''}`;
  const ecartPuissance = Math.round(score.puissance) - Math.round(avant.puissance);
  const puissance = `puissance estimée ${signe(ecartPuissance, nombre)}`;

  if (critereOptimisation === CRITERE_PUISSANCE) return `${pieces} · ${puissance}.`;

  // La ligne visée est écrite comme le tableau l'écrit — en points, en secondes
  // ou en pourcentage selon la statistique — et de part et d'autre d'une flèche,
  // parce qu'un écart seul ne dit pas d'où l'on part.
  const nom = libelleStat(critereOptimisation);
  const de = valeurStat(critereOptimisation, avant.stats).texte;
  const a = valeurStat(critereOptimisation, score.stats).texte;
  // La ligne visée ne bouge pas toujours : rien dans l'inventaire ne donne
  // d'esquive, et c'est alors la puissance qui a départagé les ex æquo. Le dire
  // franchement vaut mieux qu'un « 5 % → 5 % » qui a l'air d'une erreur.
  const visee = de === a ? `${nom} sans changement (${a})` : `${nom} ${de} → ${a}`;
  return `${pieces} · ${visee} · ${puissance}.`;
}

function optimiser() {
  const bouton = $('#optimiser');
  const etat = $('#etatOptimisation');
  if (!selection || !donnees?.compte) return;

  // La recherche prend le temps qu'elle prend : on rend d'abord la main au
  // navigateur, pour qu'il ait celui d'écrire « Calcul… ».
  bouton.disabled = true;
  bouton.textContent = 'Calcul…';
  etat.hidden = true;

  setTimeout(() => {
    let resultat = null;
    try {
      resultat = chercherMeilleurEquipement(selection, $('#optimiserToutInventaire').checked);
    } catch (erreur) {
      console.error('HOH Builder — échec de la recherche d\'équipement', erreur);
    }
    bouton.disabled = false;
    bouton.textContent = 'Équiper au mieux';

    if (!resultat) {
      etat.hidden = false;
      etat.textContent = 'Aucun équipement disponible pour ce héros.';
      return;
    }

    const changees = appliquerEquipement(selection, resultat.choix);
    // Le cache des statistiques ne sert que la liste de gauche, qui montre
    // l'équipement RÉEL : la simulation ne l'invalide pas.
    rendreListeHeros();
    rendreHeros();

    etat.hidden = false;
    etat.textContent = compteRenduOptimisation(changees, resultat.score, resultat.avant);
  }, 20);
}

// Le compte rendu ne vaut que pour la configuration qu'il vient de poser : dès
// qu'on change de héros, de critère, ou qu'on rétablit l'équipement réel, il
// s'efface.
function effacerEtatOptimisation() {
  const etat = $('#etatOptimisation');
  etat.hidden = true;
  etat.textContent = '';
}

// Le menu des critères se remplit depuis les familles de l'écran « Stats » : une
// statistique de plus dans le tableau apparaît ici sans qu'on y touche.
$('#critereOptimisation').innerHTML =
  `<option value="${CRITERE_PUISSANCE}">Puissance</option>`
  + FAMILLES_STATS.map((f) => `<optgroup label="${esc(f.titre)}">`
    + f.stats.map((s) => `<option value="${s}">${esc(libelleStat(s))}${s.startsWith('charge_') ? ' (la plus courte)' : ''}</option>`).join('')
    + '</optgroup>').join('');
$('#critereOptimisation').value =
  [...$('#critereOptimisation').options].some((o) => o.value === critereOptimisation)
    ? critereOptimisation : CRITERE_PUISSANCE;

$('#critereOptimisation').addEventListener('change', (e) => {
  critereOptimisation = e.target.value;
  try { localStorage.setItem('hoh.critere', critereOptimisation); } catch { /* navigation privée */ }
  effacerEtatOptimisation();
});

$('#optimiser').addEventListener('click', optimiser);

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
  document.querySelector('.barreOptimisation').hidden = false;
  effacerEtatOptimisation();
  toutRendre();
}

// Sans données, on n'affiche que l'écran d'accueil : c'est le cas du site publié,
// où chaque visiteur charge son propre export.
function etatVide(message) {
  document.querySelector('main').classList.add('vide');
  $('#sousTitre').textContent = message || 'Aucun export chargé';
  $('#avertissement').hidden = true;
  $('#reinitialiser').hidden = true; // sans équipement chargé, il n'y a rien à rétablir
  document.querySelector('.barreOptimisation').hidden = true; // ni rien à optimiser
  effacerEtatOptimisation();
}

$('#listeHeros').addEventListener('click', (e) => {
  const li = e.target.closest('[data-hero]');
  if (!li) return;
  selection = li.dataset.hero;
  // Changer de héros remet la projection sur son vrai niveau : garder celle du
  // héros précédent n'aurait aucun sens.
  niveauProjete = null;
  effacerEtatOptimisation();
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

/* Le bloc de la relique : un niveau qui monte d'un cran à la fois, et la porte
   vers l'inventaire de reliques.

   LE NIVEAU A DEUX SENS, et c'est ici que le partage se fait. Tant qu'on n'a pas
   changé de relique, il corrige l'export — le compte ne donne pas toujours le bon
   palier — et la correction est retenue dans ce navigateur, pour les deux
   colonnes à la fois. Dès qu'on essaie une autre relique, il n'appartient plus
   qu'à l'essai, et la colonne de gauche garde ce que le compte porte. */
$('#relique').addEventListener('click', (e) => {
  if (e.target.closest('#changerRelique')) { ouvrirSelecteurRelique(); return; }
  if (e.target.closest('#rendreRelique')) {
    delete reliqueSimulee[selection];
    rendreHeros();
    return;
  }

  const pas = e.target.closest('[data-pas-relique]');
  if (!pas) return;
  const portee = reliqueDuHeros(selection);
  if (!portee) return;
  const paliers = (window.RELIQUES_JEU || {})[portee.relique]?.paliers || [];
  const vise = portee.niveau + Number(pas.dataset.pasRelique);
  if (vise < 1 || (paliers.length && vise > paliers[paliers.length - 1].niveau)) return;

  const reelle = reliqueReelle(selection);
  if (!(selection in reliqueSimulee) && reelle && reelle.relique === portee.relique) {
    ecrireReglage(`hoh:relique:${selection}`, vise);
  } else {
    reliqueSimulee[selection] = { ...portee, niveau: vise };
  }
  rendreHeros();
});

$('#listeReliques').addEventListener('click', (e) => {
  const li = e.target.closest('[data-relique]');
  if (!li) return;
  const id = li.dataset.relique;
  reliqueSimulee[selection] = id ? { relique: id, niveau: Number(li.dataset.niveau) || 1 } : null;
  $('#selecteurRelique').hidden = true;
  rendreListeHeros();
  rendreHeros();
});

// L'ère vaut pour tout le compte : la changer redessine tout, pas seulement ce héros.
$('#ereJoueur').addEventListener('change', (e) => {
  ecrireReglage('hoh:ere', e.target.value);
  rendreListeHeros();
  rendreHeros();
});

$('#fermerSelecteurRelique').addEventListener('click', () => { $('#selecteurRelique').hidden = true; });
$('#selecteurRelique').addEventListener('click', (e) => {
  if (e.target.id === 'selecteurRelique') $('#selecteurRelique').hidden = true;
});

$('#projection').addEventListener('click', (e) => {
  // Les deux boutons encadrant le nombre avancent d'un niveau à la fois : c'est
  // ce que le curseur ne sait pas faire, et le menu fait mal sur 160 lignes.
  const pas = e.target.closest('.pasNiveau');
  if (pas) {
    const h = herosParId.get(selection);
    const vise = niveauAffiche(h) + Number(pas.dataset.pas);
    if (vise >= 1 && vise <= FORMULES.NIVEAU_MAX) changerNiveau(vise);
    return;
  }
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

/* LE CLIC DANS LA LISTE NE POSE PLUS RIEN SUR LE HÉROS : il remplit le côté
   choisi du banc, et l'on voit aussitôt ce que la pièce ferait. C'est le bouton
   « Équiper » de la carte qui décide, comme le « REMPLACER » du jeu.

   Le clic de plus est le prix de la comparaison : avant, on posait à l'aveugle
   et l'on jugeait après coup, dans le grand tableau. */
$('#listeObjets').addEventListener('click', (e) => {
  const li = e.target.closest('[data-objet]');
  if (!li) return;
  essai[essai.actif] = li.dataset.objet === '' ? null : Number(li.dataset.objet);
  rendreSelecteur();
  rendreBanc();
});

// Le banc : on choisit le côté qu'on remplit, on pose, on retire.
$('#cartesEssai').addEventListener('click', (e) => {
  const appliquer = () => {
    rendreSelecteur();
    rendreBanc();
    rendreListeHeros();
    rendreHeros();
  };

  const poser = e.target.closest('[data-poser]');
  if (poser) {
    const piece = essai[poser.dataset.poser];
    if (piece == null) retirer(selection, slotEnCours);
    else equiper(selection, slotEnCours, piece);
    appliquer();
    return;
  }

  // « Déséquiper » vide l'emplacement sur le héros ET la carte : les deux
  // disaient la même chose, elles doivent tomber ensemble.
  const deposer = e.target.closest('[data-deposer]');
  if (deposer) {
    retirer(selection, slotEnCours);
    essai[deposer.dataset.deposer] = null;
    appliquer();
    return;
  }

  const carte = e.target.closest('[data-cote]');
  if (carte && essai.actif !== carte.dataset.cote) {
    essai.actif = carte.dataset.cote;
    rendreBanc();
  }
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
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  $('#selecteur').hidden = true;
  $('#selecteurRelique').hidden = true;
});

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
  effacerEtatOptimisation();
  pantheonSimule = {};
  reliqueSimulee = {};
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
