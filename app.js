/* Simulateur d'équipement Heroes of History — logique d'interface.
   Les règles de calcul sont volontairement isolées dans formules.js. */

const ORDRE_SLOTS = ['Hand', 'Garment', 'Hat', 'Neck', 'Ring'];

const NOM_SLOT = { Hand: 'Main', Garment: 'Vêtement', Hat: 'Chapeau', Neck: 'Cou', Ring: 'Anneau' };

const NOM_STAT = {
  Attack: 'Attaque', Defense: 'Défense', MaxHitPoints: 'Points de vie', HitPoints: 'Points de vie',
  BaseDamage: 'Dégâts de base', AttackSpeed: "Vitesse d'attaque", MoveSpeed: 'Vitesse de déplacement',
  CritChance: 'Chance de critique', CritDamage: 'Dégâts critiques', CritHealChance: 'Chance de soin critique',
  Evasion: 'Esquive', Focus: 'Focus', FocusRegen: 'Régénération de focus',
  InitialFocusInSecondsBonus: 'Focus initial (s)',
  AoeDamageAmp: 'Dégâts de zone', BasicAttackDamageAmp: "Dégâts d'attaque de base",
  SingleTargetDamageAmp: 'Dégâts mono-cible', BurnDamageAmp: 'Dégâts de brûlure',
  DotDamageAmp: 'Dégâts sur la durée', LightningDamageAmp: 'Dégâts de foudre',
  StormcastDamageAmp: 'Dégâts Stormcast', StunDurationAmp: "Durée d'étourdissement",
  HealGivenAmp: 'Soins prodigués', HealTakenAmp: 'Soins reçus',
  ShieldGivenAmp: 'Bouclier donné', ShieldTakenAmp: 'Bouclier reçu',
  AttackBuffGivenAmp: "Bonus d'attaque donné", DefenseBuffGivenAmp: 'Bonus de défense donné',
  DefenseDebuffGivenAmp: 'Réduction de défense infligée',
};

// Les seules statistiques pour lesquelles une valeur de base a du sens à saisir.
const STATS_DE_BASE = ['Attack', 'Defense', 'MaxHitPoints'];

const NOM_TYPE = {
  Ranged: 'À distance',
  Infantry: 'Infanterie',
  HeavyInfantry: 'Infanterie lourde',
  Cavalry: 'Cavalerie',
  Siege: 'Siège',
};

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

const nomHeros = (id) => libelles().heros?.[id] || fiche(id)?.nom || joliNom(id);
const nomSet = (id) => libelles().sets?.[id] || joliNom(id);
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
window.repliIcone = (img) => {
  const repli = img.getAttribute('data-repli');
  if (repli) { img.removeAttribute('data-repli'); img.src = repli; return; }
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

const imgObjet = (o) =>
  `<img class="icone" src="images/equipement/${encodeURIComponent(`${o.set}_${o.emplacement}`)}.webp"`
  + ` data-repli="images/sets/${encodeURIComponent(o.set)}.webp" data-initiale="${esc(initiales(o.set))}"`
  + ` alt="" loading="lazy" onerror="repliIcone(this)">`;

const imgSet = (set) =>
  `<img class="pastilleSet" src="images/sets/${encodeURIComponent(set)}.webp" alt="" loading="lazy" onerror="repliIcone(this)">`;
const detailObjet = (o) => `Rareté ${o.rarete} · Niveau ${o.niveau ?? 0}`;

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

let selection = null;
let filtre = 'possedes';
let recherche = '';
let slotEnCours = null;

function indexer() {
  objets = new Map(donnees.compte.equipements.map((e) => [e.id, e]));
  herosParId = new Map(donnees.compte.heros.map((h) => [h.id, h]));

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
  return [...ids].sort((a, b) => a.localeCompare(b, 'fr')).map((id) => ({
    id,
    ...(herosParId.get(id) || {}),
    possede: herosParId.has(id),
  }));
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
  return total;
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

  $('#listeHeros').innerHTML = liste.map((h) => {
    const nb = Object.keys(equipe[h.id] || {}).length;
    return `<li data-hero="${esc(h.id)}" class="${h.id === selection ? 'actif' : ''} ${h.possede ? '' : 'nonPossede'}">
      ${imgHeros(h.id)}
      <span>${esc(nomHeros(h.id))}</span>
      ${nb ? `<span class="pastille">${nb}/5</span>` : ''}
      <span class="niveau">${h.possede ? `Niv. ${h.niveau ?? '?'}` : 'non possédé'}</span>
    </li>`;
  }).join('') || '<li class="nonPossede">Aucun héros ne correspond.</li>';
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
    if (h.competence) morceaux.push(`Compétence ${h.competence}`);
    if (details?.type) morceaux.push(esc(NOM_TYPE[details.type] || details.type));
    $('#infoHeros').innerHTML = morceaux.join('<span class="separateur">·</span>');
  } else {
    const morceaux = [];
    if (details?.etoiles) morceaux.push(etoilesHtml(details.etoiles));
    if (details?.type) morceaux.push(esc(NOM_TYPE[details.type] || details.type));
    morceaux.push("Pas sur ton compte — tu peux quand même simuler un équipement dessus.");
    $('#infoHeros').innerHTML = morceaux.join('<span class="separateur">·</span>');
  }

  const slots = equipe[selection] || {};
  $('#emplacements').innerHTML = ORDRE_SLOTS.map((slot) => {
    const o = objets.get(slots[slot]);
    const corps = o
      ? `${imgObjet(o)}
         <span><span class="titre">${esc(nomObjet(o))}</span><br>
           <span class="detail">${esc(detailObjet(o))} · ${texteAttribut(o.principal)}</span></span>
         <button class="retirer" data-retirer="${slot}">Retirer</button>`
      : '<span class="icone sansIcone"></span><span class="vide">Emplacement vide — cliquer pour choisir</span><span></span>';
    // Un <div> et non un <bouton> : il contient déjà le bouton « Retirer ».
    return `<div class="emplacement ${o ? `r${o.rarete}` : ''}" data-slot="${slot}" role="button" tabindex="0">
      <span class="type">${NOM_SLOT[slot]}</span>${corps}
    </div>`;
  }).join('');

  rendreSets();
  rendreStats();
}

function rendreSets() {
  const compte = {};
  for (const o of objetsEquipes(selection)) compte[o.set] = (compte[o.set] || 0) + 1;
  const entrees = Object.entries(compte).sort((a, b) => b[1] - a[1]);

  $('#sets').innerHTML = entrees.length
    ? entrees.map(([set, n]) => {
        const actif = n >= FORMULES.SEUIL_SET_MINIMUM;
        const paliers = FORMULES.BONUS_DE_SET[set] || [];
        const bonus = paliers.filter((p) => n >= p.pieces).map((p) => p.texte).join(' · ');
        return `<span class="badgeSet ${actif ? 'actif' : ''}" title="${esc(bonus || 'Bonus de set non encore connus')}">
          ${imgSet(set)}${esc(nomSet(set))} ${n}/5${bonus ? ` — ${esc(bonus)}` : ''}
        </span>`;
      }).join('')
    : '';
}

function rendreStats() {
  const actuel = agreger(objetsEquipes(selection));
  const avant = agreger(Object.values(equipeInitial[selection] || {}).map((id) => objets.get(id)).filter(Boolean));
  const bases = basesDe(selection);

  for (const champ of document.querySelectorAll('[data-base]')) champ.value = bases[champ.dataset.base] ?? '';

  const stats = [...new Set([...Object.keys(actuel), ...Object.keys(avant)])].sort((a, b) => {
    const ia = STATS_DE_BASE.indexOf(a), ib = STATS_DE_BASE.indexOf(b);
    if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return libelleStat(a).localeCompare(libelleStat(b), 'fr');
  });

  $('#aucuneStat').hidden = stats.length > 0;
  $('#tableStats').hidden = stats.length === 0;

  $('#tableStats tbody').innerHTML = stats.map((stat) => {
    const a = actuel[stat] || { plat: 0, pourcentage: 0 };
    const v = avant[stat] || { plat: 0, pourcentage: 0 };

    const apport = [
      a.plat ? signe(a.plat, nombre) : null,
      a.pourcentage ? signe(a.pourcentage, pourcent) : null,
    ].filter(Boolean).join(' et ') || '—';

    let total;
    const base = bases[stat];
    if (typeof base === 'number') total = nombre(FORMULES.appliquer(base, a.plat, a.pourcentage));
    else if (STATS_DE_BASE.includes(stat)) total = '<span class="inconnu">base à saisir</span>';
    else if (a.plat && a.pourcentage) total = `${signe(a.plat, nombre)} et ${signe(a.pourcentage, pourcent)}`;
    else total = a.pourcentage ? signe(a.pourcentage, pourcent) : signe(a.plat, nombre);

    const dPlat = a.plat - v.plat, dPct = a.pourcentage - v.pourcentage;
    const morceaux = [
      dPlat ? `<span class="${dPlat > 0 ? 'hausse' : 'baisse'}">${signe(dPlat, nombre)}</span>` : null,
      dPct ? `<span class="${dPct > 0 ? 'hausse' : 'baisse'}">${signe(dPct, pourcent)}</span>` : null,
    ].filter(Boolean);

    return `<tr>
      <td class="${STATS_DE_BASE.includes(stat) ? 'principal' : ''}">${esc(libelleStat(stat))}</td>
      <td>${apport}</td>
      <td class="${STATS_DE_BASE.includes(stat) ? 'principal' : ''}">${total}</td>
      <td>${morceaux.join(' ') || '<span class="discret">=</span>'}</td>
    </tr>`;
  }).join('');
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
    const attributs = [o.principal, ...(o.secondaires || [])].map(texteAttribut).filter(Boolean).join(' · ');
    return `<li class="r${o.rarete} ${p && p !== selection ? 'porte' : ''}" data-objet="${o.id}">
      ${imgObjet(o)}
      <span class="titre">${esc(nomObjet(o))}</span>
      <span class="marque">${esc(marque)}</span>
      <span class="detail discret">${esc(detailObjet(o))}</span>
      <span class="attributs">${attributs}</span>
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
