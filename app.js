/* Simulateur d'équipement Heroes of History — logique d'interface.
   Les règles de calcul sont volontairement isolées dans formules.js. */

const ORDRE_SLOTS = ['Hand', 'Garment', 'Hat', 'Neck', 'Ring'];

const NOM_SLOT = { Hand: 'Main', Garment: 'Vêtement', Hat: 'Chapeau', Neck: 'Cou', Ring: 'Anneau' };

// Libellés repris mot pour mot de l'écran « Stats de profil » du jeu.
// Ceux qui n'y figuraient pas sont traduits dans le même esprit.
const NOM_STAT = {
  Attack: 'Attaque',
  Defense: 'Défense',
  MaxHitPoints: 'Points de vie',
  HitPoints: 'Points de vie',
  BaseDamage: 'Dégâts de base',
  InitialFocusInSecondsBonus: 'Charge initiale',
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

// Ordre d'affichage du jeu, pour retrouver ses repères d'un écran à l'autre.
const ORDRE_STATS = [
  'Attack', 'Defense', 'MaxHitPoints', 'BaseDamage',
  'InitialFocusInSecondsBonus', 'Focus', 'FocusRegen',
  'SingleTargetDamageAmp', 'AoeDamageAmp', 'DotDamageAmp',
  'HealGivenAmp', 'ShieldGivenAmp', 'BasicAttackDamageAmp',
  'AttackSpeed', 'CritChance', 'CritDamage',
  'MoveSpeed', 'Evasion', 'HealTakenAmp', 'ShieldTakenAmp',
];

// Les seules statistiques pour lesquelles une valeur de base a du sens à saisir.
const STATS_DE_BASE = ['Attack', 'Defense', 'MaxHitPoints'];

const NOM_TYPE = () => (window.NOMS_FR || {}).types || {};

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

const nomHeros = (id) =>
  libelles().heros?.[id] || (window.NOMS_FR || {}).heros?.[id] || fiche(id)?.nom || joliNom(id);
const nomSet = (id) => libelles().sets?.[id] || (window.NOMS_FR || {}).sets?.[id] || joliNom(id);

// sets-jeu.js vient du catalogue officiel : nombre de pièces et bonus d'ensemble.
const defSet = (id) => (window.SETS_JEU || {})[id];
const nomType = (t) => NOM_TYPE()[t] || t;
const nomsReels = () => Boolean(libelles().heros);

const nombre = (v) => Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const pourcent = (v) => `${(v * 100).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} %`;
const signe = (v, f) => (v > 0 ? '+' : v < 0 ? '−' : '') + f(Math.abs(v));

// Le jeu donne un vrai nom à chaque objet, absent de l'export tant qu'on n'a pas
// les traductions. En attendant on décrit l'objet : « Main · set Archer ».
const nomObjet = (o) => libelles().objets?.[o.id]
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

const imgHeros = (id) =>
  `<img class="vignette" src="images/heros/${encodeURIComponent(id)}.webp" alt="" loading="lazy"`
  + ` data-initiale="${esc(initiales(id))}" onerror="repliIcone(this)">`;

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

// Icônes officielles des statistiques. Certaines n'existent qu'en version
// « pourcentage » : on essaie la variante avant d'abandonner.
const imgStat = (stat) =>
  `<img class="iconeStat" src="images/stats/${encodeURIComponent(stat)}.webp"`
  + ` data-repli="images/stats/${encodeURIComponent(stat)}_percent.webp"`
  + ` alt="" loading="lazy" onerror="repliIcone(this)">`;
const detailObjet = (o) => `Rareté ${o.rarete} · Niveau ${o.niveau ?? 0}`;

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
        + `${esc(nom)} <b>verrouillé</b></span>`;
    }
    const valeur = a.type === 'pourcentage' ? signe(a.valeur, pourcent) : signe(a.valeur, nombre);
    return `<span class="attr ${principal ? 'principalAttr' : ''}">${imgStat(a.stat)}${esc(nom)} <b>${valeur}</b></span>`;
  };
  return `<span class="attributsObjet">${ligne(o.principal, true)}`
    + `${(o.secondaires || []).map((a) => ligne(a, false)).join('')}</span>`;
}

function texteAttribut(a) {
  if (!a || !a.attribut) return '';
  const nom = libelleStat(a.stat || a.attribut);
  if (a.verrouille || typeof a.valeur !== 'number') {
    return `<span class="verrouille">${esc(nom)} — verrouillé jusqu'au niveau ${a.debloqueAuNiveau ?? '?'}</span>`;
  }
  return `${esc(nom)} ${a.type === 'pourcentage' ? signe(a.valeur, pourcent) : signe(a.valeur, nombre)}`;
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
let slotEnCours = null;

function indexer() {
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
    selection = equipes[0] ?? donnees.compte.heros[0]?.id ?? donnees.catalogue.heros[0] ?? null;
  }
}

function reconstruirePorteurs() {
  porteur = new Map();
  for (const [heroId, slots] of Object.entries(equipe)) {
    for (const id of Object.values(slots)) if (id != null) porteur.set(id, heroId);
  }
}

// Le catalogue contient tous les héros du jeu ; on y superpose ceux qu'on possède.
function tousLesHeros() {
  const ids = new Set([...donnees.catalogue.heros, ...herosParId.keys()]);
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
  // Un ensemble complet ajoute son bonus. Il compte autant que les objets eux-mêmes :
  // le set Voyageur apporte à lui seul +15 % de vitesse d'attaque.
  for (const { bonus } of setsComplets(liste)) {
    for (const b of bonus) (total[b.stat] ||= { plat: 0, pourcentage: 0 }).pourcentage += b.valeur;
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

const cleBase = (heroId) => `hoh:base:${heroId}`;

function basesDe(heroId) {
  try { return JSON.parse(localStorage.getItem(cleBase(heroId))) || {}; } catch { return {}; }
}

function enregistrerBase(heroId, stat, valeur) {
  const bases = basesDe(heroId);
  if (valeur === '' || valeur == null || Number.isNaN(Number(valeur))) delete bases[stat];
  else bases[stat] = Number(valeur);
  try { localStorage.setItem(cleBase(heroId), JSON.stringify(bases)); } catch { /* navigation privée */ }
}

/* ------------------------------------------------------------------- rendus */

function rendreEntete() {
  const c = donnees.compte;
  const portes = c.equipements.filter((e) => e.porteParHero).length;
  const separateur = '<span class="separateur">·</span>';
  const sousTitre = $('#sousTitre');
  sousTitre.innerHTML =
    `<span class="chiffre">${c.heros.length}</span>/${donnees.catalogue.heros.length} héros`
    + `${separateur}<span class="chiffre">${c.equipements.length}</span> équipements`
    + `${separateur}<span class="chiffre">${portes}</span> portés`;
  sousTitre.title = `Compte ${c.joueur.nom || 'inconnu'}`;

  // L'avertissement se réduit à une pastille : l'explication tient dans l'infobulle.
  const alerte = $('#avertissement');
  alerte.hidden = nomsReels();
  alerte.textContent = 'Noms en anglais';
  alerte.title = "Les noms viennent du wiki communautaire et sont donc en anglais. "
    + "Les noms français demandent le fichier de traduction du jeu, pas encore capturé.";
}

function rendreListeHeros() {
  const terme = recherche.trim().toLowerCase();
  const liste = tousLesHeros().filter((h) => {
    if (terme && !nomHeros(h.id).toLowerCase().includes(terme)) return false;
    if (filtre === 'possedes') return h.possede;
    if (filtre === 'equipes') return Object.keys(equipe[h.id] || {}).length > 0;
    return true;
  });

  $('#listeHeros').innerHTML = liste.map(carteHeros).join('')
    || '<li class="aucunHeros">Aucun héros ne correspond.</li>';
}

// Vignette dans l'esprit des cartes du jeu : portrait sur fond coloré, pastilles
// de couleur et de classe, badge d'éveil en chiffres romains, étoiles et niveau.
function carteHeros(h) {
  const details = ficheDuHeros(h) || fiche(h.id) || {};
  const couleur = details.couleur || 'red';
  const classe = (details.classe || '').replace(/_/g, '');
  const etoiles = details.etoiles || 0;
  const infobulle = `${nomHeros(h.id)}${h.possede ? ` — niveau ${h.niveau}` : ' — pas sur ton compte'}`;

  return `<li class="carteHeros ${h.id === selection ? 'actif' : ''} ${h.possede ? '' : 'nonPossede'}"
      data-hero="${esc(h.id)}" title="${esc(infobulle)}">
    <span class="vignetteCarte teinte-${esc(couleur)}">
      <img class="portraitCarte" src="images/heros/${encodeURIComponent(h.id)}.webp" alt=""
        loading="lazy" data-initiale="${esc(initiales(h.id))}" onerror="repliIcone(this)">
      <span class="coins">
        <img class="pastilleCouleur" src="images/couleurs/${esc(couleur)}.webp" alt="" onerror="repliIcone(this)">
        ${classe ? `<img class="pastilleClasse" src="images/classes/${esc(classe)}.webp" alt="" onerror="repliIcone(this)">` : ''}
      </span>
      ${h.eveil ? `<span class="badgeEveil">${ROMAIN[h.eveil] || h.eveil}</span>` : ''}
      ${etoiles ? `<span class="etoilesCarte">${'★'.repeat(etoiles)}</span>` : ''}
    </span>
    <span class="niveauCarte">${h.possede ? `NIV ${h.niveau ?? '?'}` : '—'}</span>
  </li>`;
}

function rendreHeros() {
  if (!selection) return;
  const h = herosParId.get(selection);
  $('#nomHeros').textContent = nomHeros(selection);
  const portrait = $('#portraitHeros');
  portrait.classList.remove('sansIcone');
  portrait.src = `images/heros/${encodeURIComponent(selection)}.webp`;
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
  pied.src = `images/pied/${encodeURIComponent(selection)}.webp`;
  pied.setAttribute('data-repli', `images/heros/${encodeURIComponent(selection)}.webp`);

  $('#emplacementsActuels').innerHTML = emplacementsHtml(equipeInitial[selection] || {}, false);
  $('#emplacements').innerHTML = emplacementsHtml(equipe[selection] || {}, true);

  rendreSets();
  rendreStats();
}

// Les deux colonnes du comparateur partagent le même rendu : à gauche la
// configuration réelle du compte, figée ; à droite celle qu'on modifie.
function emplacementsHtml(slots, modifiable) {
  return ORDRE_SLOTS.map((slot) => {
    const o = objets.get(slots[slot]);
    const corps = o
      ? `${tuileObjet(o)}
         <span class="corpsObjet">
           <span class="titre">${esc(nomObjet(o))}</span>
           ${attributsObjetHtml(o)}
         </span>
         ${modifiable ? `<button class="retirer" data-retirer="${slot}" title="Retirer cet objet" aria-label="Retirer">×</button>` : '<span></span>'}`
      : `<span class="tuile vide"></span><span class="vide">${modifiable ? 'Vide — cliquer pour choisir' : 'Vide'}</span><span></span>`;
    // Un <div> et non un <bouton> : il contient déjà le bouton « Retirer ».
    return `<div class="emplacement ${o ? `r${o.rarete}` : ''} ${modifiable ? '' : 'fige'}"
        ${modifiable ? `data-slot="${slot}" role="button" tabindex="0"` : ''}>
      <span class="type">${NOM_SLOT[slot]}</span>${corps}
    </div>`;
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
  .map((b) => `${signe(b.valeur, pourcent)} ${libelleStat(b.stat).toLowerCase()}`)
  .join(' · ');

// Une case du tableau : apport plat et/ou pourcentage, dans l'esprit du jeu.
const celluleApport = (e) => [
  e.plat ? signe(e.plat, nombre) : null,
  e.pourcentage ? signe(e.pourcentage, pourcent) : null,
].filter(Boolean).join(' ') || '<span class="discret">—</span>';

function rendreStats() {
  const simule = agreger(objetsEquipes(selection));
  const actuel = agreger(Object.values(equipeInitial[selection] || {}).map((id) => objets.get(id)).filter(Boolean));
  const bases = basesDe(selection);

  for (const champ of document.querySelectorAll('[data-base]')) champ.value = bases[champ.dataset.base] ?? '';

  // On suit l'ordre du jeu, puis on ajoute à la suite les statistiques qu'il ne
  // montre pas sur cet écran mais que l'équipement peut apporter.
  const presentes = new Set([...Object.keys(simule), ...Object.keys(actuel)]);
  const stats = [
    ...ORDRE_STATS.filter((s) => presentes.has(s)),
    ...[...presentes].filter((s) => !ORDRE_STATS.includes(s)).sort((a, b) => libelleStat(a).localeCompare(libelleStat(b), 'fr')),
  ];

  $('#aucuneStat').hidden = stats.length > 0;
  $('#tableStats').hidden = stats.length === 0;

  $('#tableStats tbody').innerHTML = stats.map((stat) => {
    const vide = { plat: 0, pourcentage: 0 };
    const s = simule[stat] || vide;
    const a = actuel[stat] || vide;

    const dPlat = s.plat - a.plat;
    const dPct = s.pourcentage - a.pourcentage;
    const ecart = [
      dPlat ? `<span class="${dPlat > 0 ? 'hausse' : 'baisse'}">${signe(dPlat, nombre)}</span>` : null,
      dPct ? `<span class="${dPct > 0 ? 'hausse' : 'baisse'}">${signe(dPct, pourcent)}</span>` : null,
    ].filter(Boolean).join(' ') || '<span class="discret">=</span>';

    const majeure = STATS_DE_BASE.includes(stat);
    const ouverte = statOuverte === stat;
    return `<tr class="${dPlat || dPct ? 'modifiee' : ''} ${ouverte ? 'ouverte' : ''}" data-stat="${esc(stat)}">
      <td class="libelle ${majeure ? 'principal' : ''}">
        <span class="chevron">${ouverte ? '▾' : '▸'}</span>${imgStat(stat)}${esc(libelleStat(stat))}
      </td>
      <td>${celluleApport(a)}</td>
      <td class="${majeure ? 'principal' : ''}">${celluleApport(s)}</td>
      <td>${ecart}</td>
    </tr>${ouverte ? detailHtml(stat) : ''}`;
  }).join('');

  rendreTotaux(simule, actuel, bases);
  rendreSources();
}

// Ce que chaque objet apporte à une statistique donnée : c'est la réponse
// concrète à « d'où viennent ces chiffres ».
function detailHtml(stat) {
  const colonne = (config) => {
    const lignes = Object.values(config || {}).map((id) => objets.get(id)).filter(Boolean).map((o) => {
      let plat = 0, pourcentage = 0;
      for (const a of [o.principal, ...(o.secondaires || [])]) {
        if (!a || a.stat !== stat || !FORMULES.attributCompte(a)) continue;
        if (a.type === 'pourcentage') pourcentage += a.valeur;
        else plat += a.valeur;
      }
      if (!plat && !pourcentage) return '';
      return `<li><span>${imgObjet(o)}${esc(nomObjet(o))}</span><span>${celluleApport({ plat, pourcentage })}</span></li>`;
    }).filter(Boolean).join('');
    return lignes || '<li class="discret">Aucun objet n\'apporte cette statistique.</li>';
  };

  // Rappel de la transition en toutes lettres : « on passe de X à Y ».
  const vide = { plat: 0, pourcentage: 0 };
  const a = agreger(Object.values(equipeInitial[selection] || {}).map((id) => objets.get(id)).filter(Boolean))[stat] || vide;
  const s = agreger(objetsEquipes(selection))[stat] || vide;
  const change = a.plat !== s.plat || a.pourcentage !== s.pourcentage;
  const resume = change
    ? `<p class="transition">${esc(libelleStat(stat))} : <span class="depuis">${celluleApport(a)}</span>
       <span class="fleche">→</span> <span class="vers">${celluleApport(s)}</span></p>`
    : `<p class="transition discret">${esc(libelleStat(stat))} : inchangé par rapport à ton équipement actuel.</p>`;

  return `<tr class="detail"><td colspan="4">
    <div class="detailStat">
      ${resume}
      <div><h4>Équipement actuel</h4><ul>${colonne(equipeInitial[selection])}</ul></div>
      <div><h4>Équipement simulé</h4><ul>${colonne(equipe[selection])}</ul></div>
    </div>
  </td></tr>`;
}

// Le jeu additionne plusieurs sources. On dit franchement lesquelles on sait
// chiffrer et lesquelles restent hors de portée, plutôt que de faire comme si
// l'équipement était le seul apport.
function rendreSources() {
  const h = herosParId.get(selection);
  const objetsPortes = objetsEquipes(selection).length;
  const noeuds = h?.pantheon?.length || 0;
  const reliques = (donnees.compte.reliques || []).filter((r) => r.porteParHero === selection);

  const ligne = (nom, quantite, etat, chiffre) => `<div class="source ${chiffre ? 'chiffree' : ''}">
    <span class="nomSource">${esc(nom)}</span>
    <span class="quantite">${esc(quantite)}</span>
    <span class="etatSource">${esc(etat)}</span>
  </div>`;

  const complets = setsComplets(objetsEquipes(selection));

  $('#sources').innerHTML = [
    ligne('Équipement', `${objetsPortes} objet${objetsPortes > 1 ? 's' : ''}`, 'détaillé ci-contre', true),
    ligne(
      'Bonus de set',
      complets.length ? complets.map((c) => nomSet(c.set)).join(', ') : 'aucun set complet',
      complets.length ? complets.flatMap((c) => c.bonus).map((b) => `${signe(b.valeur, pourcent)} ${libelleStat(b.stat).toLowerCase()}`).join(' · ') : '—',
      complets.length > 0,
    ),
    ligne('Panthéon', noeuds ? `${noeuds} nœuds` : 'aucun', noeuds ? 'valeurs inconnues' : '—', false),
    ligne('Reliques', reliques.length ? reliques.map((r) => `${joliNom(r.relique)} niv. ${r.niveau}`).join(', ') : 'aucune', reliques.length ? 'valeurs inconnues' : '—', false),
    ligne('Caserne', '—', "absent de l'export", false),
    ligne('Éveil', h?.eveil ? `niveau ${ROMAIN[h.eveil] || h.eveil}` : '—', h?.eveil ? 'valeurs inconnues' : '—', false),
  ].join('');
}

// Quand on a saisi les statistiques de base d'un héros, on peut afficher les totaux
// absolus. Sans elles, on ne montre rien plutôt qu'un chiffre trompeur.
function rendreTotaux(simule, actuel, bases) {
  const lignes = STATS_DE_BASE.filter((stat) => typeof bases[stat] === 'number').map((stat) => {
    const s = simule[stat] || { plat: 0, pourcentage: 0 };
    const a = actuel[stat] || { plat: 0, pourcentage: 0 };
    const totalSimule = FORMULES.appliquer(bases[stat], s.plat, s.pourcentage);
    const totalActuel = FORMULES.appliquer(bases[stat], a.plat, a.pourcentage);
    const delta = totalSimule - totalActuel;
    return `<div class="totalStat">
      <span class="nom">${imgStat(stat)}${esc(libelleStat(stat))}</span>
      <span class="valeur">${nombre(totalSimule)}</span>
      ${delta ? `<span class="${delta > 0 ? 'hausse' : 'baisse'}">${signe(delta, nombre)}</span>` : '<span class="discret">=</span>'}
    </div>`;
  }).join('');

  $('#totaux').innerHTML = lignes;
  $('#totaux').hidden = !lignes;
}

/* -------------------------------------------------- fenêtre de choix d'objet */

function ouvrirSelecteur(slot) {
  slotEnCours = slot;
  $('#selecteurTitre').textContent = `${NOM_SLOT[slot]} pour ${nomHeros(selection)}`;
  $('#rechercheObjet').value = '';
  $('#selecteur').hidden = false;
  rendreSelecteur();
}

function rendreSelecteur() {
  const terme = $('#rechercheObjet').value.trim().toLowerCase();
  const masquerPortes = $('#seulementLibres').checked;

  const candidats = donnees.compte.equipements
    .filter((o) => o.emplacement === slotEnCours)
    .filter((o) => !terme || nomSet(o.set).toLowerCase().includes(terme))
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

  $('#listeObjets').innerHTML =
    `<li data-objet="" class="titre">Aucun — laisser l'emplacement vide</li>`
    + (lignes || '<li class="discret">Aucun objet ne correspond.</li>');
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
  rendreListeHeros();
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
$('#fermerSelecteur').addEventListener('click', () => { $('#selecteur').hidden = true; });
$('#selecteur').addEventListener('click', (e) => { if (e.target.id === 'selecteur') $('#selecteur').hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#selecteur').hidden = true; });

$('#reinitialiser').addEventListener('click', () => {
  equipe = JSON.parse(JSON.stringify(equipeInitial));
  reconstruirePorteurs();
  rendreListeHeros();
  rendreHeros();
});

for (const champ of document.querySelectorAll('[data-base]')) {
  champ.addEventListener('input', () => { enregistrerBase(selection, champ.dataset.base, champ.value); rendreStats(); });
}

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
