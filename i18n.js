/* LES LANGUES DU SITE
   -----------------------------------------------------------------------------
   Le site a été écrit en français, et le reste : c'est le TEXTE FRANÇAIS
   LUI-MÊME qui sert de clé de traduction, pas un identifiant abstrait. On lit
   donc encore `T('Rétablir mon équipement réel')` dans le code, et non
   `T('header.reset')` — la phrase reste sous les yeux de qui relit, et une
   traduction qui manque retombe sur un français correct plutôt que sur une clé
   nue affichée à l'écran.

   DEUX SOURCES DE MOTS, ET ELLES NE SE TRAITENT PAS PAREIL.

     1. LES MOTS DU SITE — boutons, titres, infobulles, comptes rendus. Ils sont
        ici, traduits à la main.
     2. LES MOTS DU JEU — noms de héros, d'objets, d'ensembles, de reliques, de
        statistiques. Ceux-là ne se traduisent PAS à la main : le jeu a son
        propre fichier de traduction, et « node tools/noms.js en-US en » en tire
        noms-en.js. Écrire « Jackal's Set » soi-même serait s'exposer à ne pas
        dire ce que le joueur lit dans son jeu.

   LES TROUS. Un texte sans traduction s'affiche en français. C'est voulu : mieux
   vaut une phrase française au milieu de l'anglais qu'un blanc ou une clé.
   ========================================================================== */

window.TRADUCTIONS = {
  en: {
    /* --- en-tête ---------------------------------------------------------- */
    'Chargement…': 'Loading…',
    'Thème clair': 'Light theme',
    'Thème sombre': 'Dark theme',
    'Basculer entre le thème sombre et le thème clair': 'Switch between the dark and light themes',
    'Charger un autre export': 'Load another export',
    'Rétablir mon équipement réel': 'Restore my real equipment',
    'Français': 'French',
    'Anglais': 'English',

    /* --- accueil ---------------------------------------------------------- */
    'Bienvenue': 'Welcome',
    "HOH Builder te permet de tester des configurations d'équipement sur tes héros":
      'HOH Builder lets you try equipment setups on your',
    'et de voir leurs statistiques se recalculer en direct, sans toucher à ton compte.':
      'heroes and watch their stats recalculate live, without touching your account.',
    "Tes données ne quittent jamais ton ordinateur : tout se passe dans ton navigateur, rien n'est envoyé nulle part.":
      'Your data never leaves your computer: everything happens in your browser, nothing is sent anywhere.',
    'Pour commencer': 'Getting started',
    "Télécharger l'extension Chrome": 'Download the Chrome extension',
    'Archive légère · fonctionne aussi sur Edge et Brave': 'Small archive · works on Edge and Brave too',
    'Décompresse': 'Unzip',
    "le fichier téléchargé où tu veux (clic droit sur l'archive →":
      'the downloaded file wherever you like (right-click the archive →',
    'Extraire tout': 'Extract all',
    'Ouvre': 'Open',
    ', active le': ', turn on',
    'Mode développeur': 'Developer mode',
    '(interrupteur en haut à droite), puis clique sur': '(switch in the top right), then click',
    "Charger l'extension non empaquetée": 'Load unpacked',
    'et choisis le dossier décompressé.': 'and pick the folder you unzipped.',
    'Ouvre Heroes of History dans Chrome et fais': 'Open Heroes of History in Chrome and press',
    "Reviens ici : c'est tout.": 'Come back here: that’s all.',
    "Tes données apparaissent d'elles-mêmes, et le site les retient pour tes prochaines visites.":
      'Your data appears on its own, and the site remembers it for your next visits.',
    "Aucun fichier à manipuler : l'extension transmet les données au site à l'intérieur de ton navigateur. Le bouton":
      'No file to handle: the extension passes the data to the site inside your browser. The',
    "reste disponible en haut à droite si tu préfères passer par un fichier, ou pour ouvrir la configuration de quelqu'un d'autre.":
      'button stays available in the top right if you would rather use a file, or to open somebody else’s setup.',
    'Projet libre et sans but commercial —': 'Free, non-commercial project —',
    'code source sur GitHub': 'source code on GitHub',
    '. Outil communautaire non officiel, sans lien avec InnoGames.':
      '. Unofficial community tool, not affiliated with InnoGames.',

    /* --- colonne des héros ------------------------------------------------ */
    'Héros': 'Heroes',
    'Rechercher un héros…': 'Search for a hero…',
    'Mes héros': 'My heroes',
    'Tous': 'All',
    'Équipés': 'Equipped',
    'Classer par': 'Sort by',
    "Inverser l'ordre": 'Reverse the order',
    'Du plus grand au plus petit': 'Highest to lowest',
    'Du plus petit au plus grand': 'Lowest to highest',
    'Niveau': 'Level',
    'Rareté': 'Rarity',
    'Éveil': 'Awakening',
    'Compétence': 'Skill',
    'Nom': 'Name',
    'Sélectionne un héros': 'Select a hero',
    'Ce héros peut encore monter': 'This hero can still level up',

    /* --- comparateur ------------------------------------------------------ */
    'Équiper au mieux': 'Equip the best',
    "Cherche, dans ton inventaire, la combinaison qui donne la plus grosse puissance estimée à ce héros — bonus d'ensemble compris.":
      'Searches your inventory for the combination that gives this hero the highest estimated power — set bonuses included.',
    'pour': 'for',
    'avec': 'with',
    'Puissance': 'Power',
    'ensembles au mieux': 'sets as they come',
    'parure complète imposée': 'full jewellery set required',
    'armement complet imposé': 'full weapon set required',
    'les deux imposés': 'both required',
    'Piocher aussi chez les autres héros': 'Also take from other heroes',
    'Équipement actuel': 'Current equipment',
    'celui de ton compte': 'the one on your account',
    'Équipement simulé': 'Simulated equipment',
    'clique pour changer': 'click to change',
    'Retirer cet objet': 'Remove this item',
    'Retirer': 'Remove',
    'Vide': 'Empty',
    'Vide — cliquer pour choisir': 'Empty — click to choose',
    'verrouillé': 'locked',
    'Main': 'Hand',
    'Vêtement': 'Garment',
    'Chapeau': 'Hat',
    'Cou': 'Neck',
    'Anneau': 'Ring',
    'Armement': 'Weaponry',
    'Parure': 'Jewellery',

    /* --- puissance et calibrage ------------------------------------------- */
    'estimée': 'estimated',
    'calibrée': 'calibrated',
    'équipement réel': 'real equipment',
    'Puissance affichée par le jeu': 'Power shown by the game',
    'Caler': 'Calibrate',
    'recalibrer': 'recalibrate',
    'oublier': 'forget',
    'Calibration périmée — refaire': 'Calibration out of date — redo',

    /* --- panneaux --------------------------------------------------------- */
    'Panthéon': 'Pantheon',
    'Statistiques': 'Stats',
    'Statistique': 'Stat',
    'Écart': 'Difference',
    'Relique': 'Relic',
    'En essayer une autre': 'Try another one',
    'Aucun équipement sur ce héros.': 'No equipment on this hero.',
    'Niveau à simuler': 'Level to simulate',
    'son niveau': 'its level',
    'Un niveau de moins': 'One level down',
    'Un niveau de plus': 'One level up',

    /* --- sélecteur d'inventaire ------------------------------------------- */
    'Fermer': 'Close',
    'Ensemble': 'Set',
    'Tous les ensembles': 'All sets',
    'Attribut principal': 'Main attribute',
    'Peu importe': 'Any',
    'Doit aussi porter': 'Must also carry',
    'Masquer ceux portés par un autre héros': 'Hide those worn by another hero',
    'Tout effacer': 'Clear all',
    "Aucun — laisser l'emplacement vide": 'None — leave the slot empty',
    'Aucune pièce ne réunit ces conditions.': 'No piece matches these filters.',
    'équipé ici': 'equipped here',
    'en réserve': 'in reserve',
    'Déséquiper': 'Unequip',
    'Porté': 'Worn',
    'Côté gauche': 'Left side',
    'Côté droit': 'Right side',
    'À l’essai': 'On trial',
    'reçoit ton choix': 'takes your pick',
    'Emplacement vide — choisis une pièce à gauche': 'Empty slot — pick a piece on the left',
    "Laisser l'emplacement vide": 'Leave the slot empty',
    'Ce que tu portes': 'What you wear',

    /* --- phrases à trous -------------------------------------------------- */
    '{0} — niveau {1}': '{0} — level {1}',
    '{0} — pas sur ton compte': '{0} — not on your account',
    'porté par {0}': 'worn by {0}',
    '(légendaire)': '(legendary)',
    '(la plus courte)': '(shortest)',
    "Le jeu classe par « Puissance ». Ce nombre mêle les statistiques, la capacité et sans doute les crits, et sa formule n'a pas encore été reconstituée : le site propose à la place les critères qu'il sait exacts.":
      'The game sorts by “Power”. That number mixes stats, the ability and probably crits, and its formula has not been worked out yet: the site offers the criteria it knows to be exact instead.',

    /* --- unités et mesures ------------------------------------------------ */
    'coups/min': 'hits/min',
    's': 's',
    'pts': 'pts',
    'en pourcentage': 'as a percentage',
    'en points': 'in points',
    'en secondes': 'in seconds',
    'en coups par minute': 'in hits per minute',
  },
};

/* ------------------------------------------------------------- le mécanisme */

window.I18N = (() => {
  const DISPONIBLES = ['fr', 'en'];
  let langue = 'fr';
  try {
    const gardee = localStorage.getItem('hoh.langue');
    if (DISPONIBLES.includes(gardee)) langue = gardee;
  } catch { /* navigation privée */ }

  const dico = () => window.TRADUCTIONS[langue] || {};

  // Les paramètres sont numérotés : « Palier {0} — {1} nœuds » se traduit sans
  // que l'ordre des mots ait à suivre celui du français.
  const remplir = (modele, params) =>
    String(modele).replace(/\{(\d+)\}/g, (_, i) => (params[i] === undefined ? `{${i}}` : params[i]));

  const T = (francais, ...params) => remplir(dico()[francais] ?? francais, params);

  /* LA PAGE STATIQUE. index.html est écrit en français, et le reste : plutôt
     que d'y semer des marqueurs, on la parcourt une fois pour toutes et l'on
     remplace ce qui a une traduction. Le texte français d'origine est gardé à
     côté de chaque nœud — sans lui, repasser à l'anglais après un aller-retour
     chercherait la traduction d'une phrase déjà traduite, et ne trouverait
     rien. */
  const originaux = new WeakMap();
  const ATTRIBUTS = ['title', 'placeholder', 'aria-label'];

  function traduireDom(racine = document.body) {
    const marche = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    for (let n = marche.nextNode(); n; n = marche.nextNode()) {
      if (n.parentElement && n.parentElement.closest('script,style')) continue;
      let origine = originaux.get(n);
      if (origine === undefined) {
        origine = n.nodeValue;
        originaux.set(n, origine);
      }
      const nu = origine.replace(/\s+/g, ' ').trim();
      if (!nu) continue;
      const traduit = dico()[nu];
      // L'ESPACE AUTOUR DU TEXTE PORTE LA MISE EN PAGE — c'est lui qui sépare
      // « Ouvre » du <code> qui suit. On remplace donc la phrase à l'intérieur
      // du nœud, sans toucher à ce qui l'entoure.
      n.nodeValue = traduit === undefined ? origine : origine.replace(nu, traduit);
    }
    for (const el of racine.querySelectorAll('[title],[placeholder],[aria-label]')) {
      for (const attribut of ATTRIBUTS) {
        const valeur = el.getAttribute(attribut);
        if (valeur === null) continue;
        const memoire = `fr${attribut.replace(/-/g, '')}`;
        if (el.dataset[memoire] === undefined) el.dataset[memoire] = valeur;
        const origine = el.dataset[memoire];
        const traduit = dico()[origine.replace(/\s+/g, ' ').trim()];
        el.setAttribute(attribut, traduit === undefined ? origine : traduit);
      }
    }
    document.documentElement.lang = langue;
  }

  function changer(code) {
    if (!DISPONIBLES.includes(code) || code === langue) return false;
    langue = code;
    try { localStorage.setItem('hoh.langue', code); } catch { /* navigation privée */ }
    traduireDom();
    return true;
  }

  return {
    DISPONIBLES,
    T,
    traduireDom,
    changer,
    get langue() { return langue; },
  };
})();

window.T = window.I18N.T;
