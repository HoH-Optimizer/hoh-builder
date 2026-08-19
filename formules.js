/* =============================================================================
   FORMULES DE CALCUL
   -----------------------------------------------------------------------------
   C'est LE fichier à corriger quand les valeurs affichées ne collent pas au jeu.
   Tout le reste du site peut rester tel quel.

   LE JEU EMPILE SIX SOURCES pour arriver au chiffre qu'il affiche :

     1. la statistique de base du héros, au niveau 1        (heros-jeu.js)
     2. la montée en niveau et les ascensions               (MONTEE, ci-dessous)
     3. les paliers d'éveil atteints                        (eveil-jeu.js)
     4. la caserne de son arme                              (casernes-jeu.js)
     5. la relique qu'il porte                              (reliques-jeu.js)
     6. son équipement, pièce par pièce, plus les bonus d'ensemble complet

     7. les nœuds de panthéon débloqués                     (pantheon-jeu.js)

   Les valeurs du panthéon ne sont ni dans l'export ni dans le catalogue : elles
   ont été relevées à l'écran, nœud par nœud. Seuls les attaquants individuels
   sont couverts pour l'instant.

   Deux natures de bonus existent :
     - "plat"        : +20 Attaque
     - "pourcentage" : +2,2 % Défense

   LA PUISSANCE EST ICI, MAIS APPROCHÉE. Le nombre que le jeu affiche sous le nom
   du héros n'existe dans AUCUNE donnée : ni dans l'export du compte, ni dans le
   catalogue. Il a fallu le reconstituer par la mesure, et le résultat tombe à
   4,5 % en moyenne, 11 % au pire, sur les 22 héros relevés. Voir puissance(),
   plus bas, qui porte le détail de ce qui est mesuré et de ce qui est ajusté.
   Le journal complet de l'enquête est dans RECHERCHE-PUISSANCE.md : y aller
   AVANT de retenter quoi que ce soit sur ce sujet, tout y est, et rien n'a
   besoin d'être remesuré.
   ========================================================================== */

window.FORMULES = {

  /* ------------------------------------------------ montée en niveau du héros

     Le catalogue ne donne les statistiques qu'AU NIVEAU 1. La façon dont elles
     montent n'y figure sous aucune forme de table : c'est une formule,
     reconstituée en comparant le calculateur de Forge of Games à ses propres
     constantes, sur quatre héros de types, classes et raretés différents
     (Achille, Ramsès II, Montezuma Ier, Ada Lovelace) :

         valeur = base x (1 + parNiveau x (niveau - 1) + parAscension x ascensions)

     Chaque ascension vaut un bonus en plus de la montée ordinaire — c'est ce qui
     fait accélérer la courbe tous les dix niveaux.

     ATTENTION : le nombre d'ascensions vient du COMPTE, pas d'un calcul sur le
     niveau. Un héros niveau 160 en a quinze, pas seize : son niveau maximum est
     (ascensions + 1) x 10. Le calculateur de Forge of Games se trompe d'une
     ascension sur ce point, et c'est ce qui nous éloignait du jeu.

     Les taux « par niveau » se lisent tels quels dans le catalogue ; les taux
     « par ascension » ont été mesurés. Les points de vie tombent au point près,
     l'attaque et la défense à une unité près.                                 */

  MONTEE: {
    MaxHitPoints: { parNiveau: 0.04, parAscension: 0.06 },
    Attack: { parNiveau: 0.0465, parAscension: 0.186 },
    Defense: { parNiveau: 0.0465, parAscension: 0.186 },
    // Les dégâts de base montent au même rythme que les points de vie. Mesuré sur
    // onze héros de Thomas, relevés un par un sur l'écran d'amélioration du jeu :
    // niveaux 20 à 110, trois à cinq étoiles, avec ou sans équipement. Les onze
    // tombent à un point près, l'écart résiduel étant l'arrondi que le jeu affiche.
    // Ils manquaient à cette table : le site les laissait à leur valeur de niveau 1,
    // et annonçait 131 là où le jeu affiche 779.
    BaseDamage: { parNiveau: 0.04, parAscension: 0.06 },
  },

  // Le niveau maximum d'un héros : dix par ascension. Le jeu s'arrête à 200.
  NIVEAU_MAX: 200,

  /* ------------------------------------------------------ valeurs de départ

     Certaines statistiques ne sont pas dans la fiche du héros parce qu'elles
     sont les mêmes pour tout le monde. Relevées sur l'écran « Stats » d'Achille
     en jeu, en retranchant ce que son équipement apportait.                   */

  // CONFIRMÉ À LA SOURCE depuis. Le catalogue du jeu porte une table de valeurs
  // par défaut, une ligne par catégorie d'unité (rubrique 19 de coreData), et
  // elle donne 0,05 et 1,5 partout — exactement les deux chiffres relevés à la
  // main sur Achille. Aucun héros ne porte ces statistiques dans sa propre fiche :
  // ce sont bien des défauts, ce qui explique qu'on ne les ait trouvées nulle part
  // en cherchant héros par héros.
  DEFAUTS: {
    CritChance: 0.05,   // 5 %  — stat n° 18 du catalogue
    CritDamage: 1.50,   // 150 % — stat n° 19 du catalogue
    // L'esquive et les soins reçus valent zéro au départ : les 5 % et 10 % qu'on
    // lisait sur Achille venaient de son panthéon, pas de lui.
  },

  /* --------------------------------------------- deux natures de statistiques

     Une statistique ABSOLUE se compte en points : 2 836 d'attaque, 21 073 de
     points de vie. Un bonus en pourcentage la MULTIPLIE : +6,6 % d'attaque, c'est
     6,6 % de tout le reste.

     Une statistique qui EST déjà un pourcentage (les chances de crit, les dégâts
     de zone, l'esquive…) fonctionne autrement : un objet qui donne « +2,8 % de
     chances de crit » ajoute 2,8 POINTS, il ne multiplie rien.

     Vérifié sur l'écran du jeu, pour Achille :
       chances de crit  10 % (départ) + 1,16 + 2,8  = 13,96 %  — le jeu affiche 13,96 %
       dégâts crit     150 % (départ) + 5,9  + 2,1  = 158 %    — le jeu affiche 158 %
     La lecture multiplicative donnait 10,4 % et 162 % : nettement faux.         */

  ABSOLUES: new Set([
    'Attack', 'Defense', 'MaxHitPoints', 'BaseDamage',
    'AttackSpeed', 'MoveSpeed', 'AttackRange', 'ProjectileSpeed',
    'Focus', 'FocusRegen', 'MaxFocus', 'InitialFocusInSecondsBonus',
  ]),

  // Les statistiques dont le bonus d'ENSEMBLE se calcule sur la caserne en plus
  // de la statistique de niveau. Seuls les points de vie sont dans ce cas à la
  // mesure ; le détail et les relevés sont commentés dans detail(), plus bas.
  SET_SUR_CASERNE: new Set(['MaxHitPoints']),

  /* ------------------------------------------------------- feuille complète */

  // Rassemble toutes les sources pour une statistique donnée et rend le détail,
  // pas seulement le total : l'écran doit pouvoir dire d'où vient chaque point.
  //
  //   contexte = { base, niveau, eveil, caserne, relique }
  //   apport   = { plat, pourcentage } venant de l'équipement et des ensembles
  //
  // L'ordre d'application suit celui observé en jeu : tout ce qui est plat
  // s'additionne d'abord, le pourcentage s'applique une fois sur le tout.
  detail(stat, contexte, apport = { plat: 0, pourcentage: 0 }) {
    const { niveau = 1, eveil = [], caserne = {}, relique = {} } = contexte;
    const base = typeof contexte.base === 'number' ? contexte.base : this.DEFAUTS[stat] ?? 0;

    const montee = this.MONTEE[stat];
    // Sans nombre d'ascensions connu (projection à un autre niveau), on prend le
    // minimum qu'il faudrait pour atteindre ce niveau.
    const ascensions = contexte.ascensions ?? Math.max(0, Math.ceil(niveau / 10) - 1);
    const auNiveau = montee
      ? base * (1 + montee.parNiveau * (niveau - 1) + montee.parAscension * ascensions)
      : base;

    // L'éveil s'applique à la valeur montée en niveau, avant tout le reste.
    const paliers = eveil.filter((p) => p.stat === stat);
    const eveilPct = paliers.filter((p) => p.type === 'pourcentage').reduce((s, p) => s + p.valeur, 0);
    const eveilPlat = paliers.filter((p) => p.type !== 'pourcentage').reduce((s, p) => s + p.valeur, 0);
    const apresEveil = auNiveau * (1 + eveilPct) + eveilPlat;

    const partCaserne = caserne[stat] || 0;
    const partRelique = relique[stat] || 0;

    // LE PANTHÉON. Trois façons d'agir, et la troisième est la plus surprenante :
    // certains nœuds ne donnent rien par eux-mêmes, ils AMPLIFIENT ce qu'apporte
    // une autre source. « Les gains d'ATQ provenant de l'Équipement augmentent de
    // 50 % » vaut, sur Achille, autant que tous les autres nœuds réunis.
    const noeuds = contexte.pantheon || [];
    const partPantheon = noeuds
      .filter((e) => e.stat === stat && (e.type === 'plat' || e.type === 'pourcentage'))
      .reduce((s, e) => s + e.valeur, 0);
    const proportionnel = noeuds
      .filter((e) => e.stat === stat && e.type === 'proportionnel')
      .reduce((s, e) => s + e.valeur, 0);
    const amplifie = (source) => noeuds
      .filter((e) => e.type === 'amplifie' && e.stat === stat && e.source === source)
      .reduce((s, e) => s + e.valeur, 0);

    // OÙ S'APPLIQUE UN POURCENTAGE. Un objet qui donne « +17,65 % d'attaque » ne
    // majore pas tout ce que le héros a accumulé : il majore SA STATISTIQUE DE
    // BASE, celle qu'il tient de son niveau. Le reste — caserne, relique,
    // panthéon — s'ajoute ensuite, intact.
    //
    // Vérifié sur l'écran du jeu, pour Achille : 17,65 % de sa base (1 454) font
    // 257, plus 49 à plat = 306, et le jeu compte bien 305 pour l'équipement.
    // La lecture multiplicative en donnait 441.
    // …SAUF le pourcentage d'un ENSEMBLE sur les points de vie, qui prend une
    // assiette plus large : la statistique de niveau, PLUS la caserne, PLUS ce
    // que les pourcentages d'objet viennent d'apporter. Mesuré sur deux héros de
    // Thomas, au point près :
    //
    //   Tomoe Gozen  : 178 plat + 10 % x (6 180 + 4 670)              = 1 263
    //   W. Wallace   : 134 plat + 1,84 % x 12 516 = 230, puis
    //                  10 % x (12 516 + 4 670 + 230)                  = 2 106
    //
    // Les deux tombent exactement sur le chiffre du jeu, là où l'assiette
    // ordinaire donnait 796 et 1 616.
    //
    // CE QUI DÉPARTAGE LES DEUX ASSIETTES : LA TAILLE DE L'ENSEMBLE.
    // On a longtemps cru que seuls les POINTS DE VIE prenaient l'assiette large,
    // faute d'explication. C'était une coïncidence de l'échantillon. Mian Tansen
    // l'a tranchée : ses 5 % de PV viennent du set Dharma, un ensemble
    // d'ARMEMENT (2 pièces), et le jeu les compte sur l'assiette ORDINAIRE.
    //
    //   Mian Tansen : 84 plat + 1,64 % x 6 588 + 5 % x 6 588  = 521
    //                 total 12 174 — exactement le chiffre du jeu.
    //   L'assiette large en donnait 760, soit 12 414 : 240 de trop.
    //
    // Tomoe et Wallace, eux, tiennent leurs 10 % de PV du set Chacal, un
    // ensemble de PARURE (3 pièces) — et là, l'assiette large est la bonne.
    // Marie Curie complète le tableau : ses 5 % d'ATTAQUE viennent du
    // Mousquetaire, armement, et restent sur l'assiette ordinaire.
    //
    //   parure (3 pièces)    -> niveau + caserne + ce que les % ont déjà apporté
    //   armement (2 pièces)  -> assiette ordinaire, comme un attribut d'objet
    //
    // CE QUI RESTE NON MESURÉ : aucun ensemble de PARURE du compte ne donne de
    // pourcentage d'ATTAQUE. On ne sait donc pas si l'assiette large vaut pour
    // toute statistique ou seulement pour les points de vie ; on garde donc la
    // restriction aux PV (SET_SUR_CASERNE), qui est ce qui est mesuré.
    // Le témoin d'Artémise tient toujours : 1,64 % de PV venus d'un OBJET, sans
    // aucun ensemble complet, donnent 185 sur l'assiette ordinaire — le chiffre
    // du jeu — contre 261 sur l'assiette élargie.
    const pourcentage = apport.pourcentage || 0;
    // Seuls les ensembles de PARURE arrivent ici : app.js range le pourcentage
    // d'un ensemble d'armement avec ceux des objets, puisqu'il se calcule pareil.
    const pourcentageParure = apport.pourcentageSet || 0;
    const pourcentageObjet = pourcentage - pourcentageParure;

    let partPourcentage;
    let partParure = 0;
    if (!this.ABSOLUES.has(stat)) {
      partPourcentage = pourcentage;
    } else {
      const partObjet = auNiveau * pourcentageObjet;
      const assietteParure = this.SET_SUR_CASERNE.has(stat)
        ? auNiveau + partCaserne + partObjet
        : auNiveau;
      partParure = assietteParure * pourcentageParure;
      partPourcentage = partObjet + partParure;
    }

    // Ce que l'équipement apporte en propre, avant que le panthéon ne l'amplifie.
    //
    // L'AMPLIFICATION NE PORTE PAS SUR LES BONUS D'ENSEMBLE — ni les plats
    // (apport.set), ni les pourcentages. Mesuré sur Marie Curie, qui a le nœud
    // « Équipement affûté » (+50 % sur les gains d'ATQ de l'équipement) :
    //   ses 308 d'attaque d'équipement contiennent 56,6 venus du set Mousquetaire ;
    //   50 % des 251,4 restants font 125,7 — et la colonne PANTHÉON du jeu
    //   affiche 126. En amplifiant les 308 entiers on obtenait 154.
    const partSet = (apport.set || 0)
      + partParure
      + auNiveau * (apport.pourcentageSetArmement || 0);
    const partEquipement = (apport.plat || 0) + partPourcentage;
    const amplifiable = partEquipement - partSet;

    const pantheon = partPantheon
      + proportionnel * apresEveil
      + amplifiable * amplifie('equipement')
      + partRelique * amplifie('relique');

    const total = apresEveil + partCaserne + partRelique + partEquipement + pantheon;

    return {
      base,
      niveau: auNiveau - base,          // ce que le niveau seul a ajouté
      eveil: apresEveil - auNiveau,
      caserne: partCaserne,
      relique: partRelique,
      equipementPlat: apport.plat || 0,
      equipementPourcentage: pourcentage,
      apportPourcentage: partPourcentage,
      pantheon,
      total,
    };
  },

  /* ----------------------------------------------- statistiques dérivées

     Le jeu n'affiche pas ces deux-là telles qu'elles sont stockées : il les
     recalcule à partir de la charge. Vérifié sur Achille, qui affiche 6,1 s de
     charge initiale pour (100 - 35) / 10 = 6,5 s moins 0,36 s d'équipement.

     ATTENTION AU SIGNE : dans les données, InitialFocusInSecondsBonus est un
     nombre POSITIF de secondes gagnées ; le jeu l'écrit en négatif, parce que
     c'est de l'attente en moins.                                              */

  chargeInitiale(feuille, avance = 0) {
    const max = feuille.MaxFocus?.total ?? 100;
    const depart = feuille.Focus?.total ?? 0;
    const regen = feuille.FocusRegen?.total || 1;
    return Math.max(0, (max - depart) / regen - avance);
  },

  chargeNormale(feuille) {
    const max = feuille.MaxFocus?.total ?? 100;
    const regen = feuille.FocusRegen?.total || 1;
    return max / regen;
  },

  // Le jeu compte la vitesse d'attaque en coups par minute, pas en attaques
  // par seconde. Vérifié sur Achille : 1 + 0,2 (anneau) + 0,05 (casque)
  // + 0,15 (ensemble) + 0,2 (éveil) = 1,6, soit les 96 coups/min affichés.
  coupsParMinute: (attaquesParSeconde) => attaquesParSeconde * 60,

  /* ------------------------------------------------------ la PUISSANCE

     ⚠ CE CHIFFRE EST APPROCHÉ, ET IL FAUT LE DIRE À L'ÉCRAN.

     Sur les 22 héros dont la puissance a été relevée dans le jeu, il tombe à
     4,5 % en moyenne et à 10,7 % dans le pire cas. Ce n'est PAS le chiffre du
     jeu : c'est le meilleur modèle qu'on ait, et il est affiché parce qu'un
     ordre de grandeur vaut mieux qu'un vide, pas parce qu'il serait juste.

     CE QUI EST FIABLE, EN REVANCHE : l'ÉCART ENTRE DEUX CONFIGURATIONS du même
     héros. L'erreur du modèle est un facteur propre au héros, qui multiplie les
     deux états de la même façon et disparaît donc dans leur rapport. Autrement
     dit : « +3,2 % de puissance » est nettement plus sûr que « 14 815 ».

     CE QUI EST MESURÉ, ET QUI TIENT (voir RECHERCHE-PUISSANCE.md §8 à §10) :
       - huit grandeurs seulement entrent : attaque, défense, PV, dégâts de base,
         chances de crit, dégâts crit, vitesse d'attaque, esquive. Ni les dégâts
         de zone, ni la charge, ni la portée, ni rien d'autre ;
       - chacune entre en RACINE. Mesuré au nœud de panthéon sur trois héros de
         trois classes : dix-huit relevés entre 0,483 et 0,489 ;
       - la capacité entre LINÉAIREMENT (quatre crans mesurés d'affilée) ;
       - une CONSTANTE s'ajoute. C'est elle qui fait que les exposants mesurés
         valent 0,485 et non ½ : elle dilue les variations. Deux méthodes
         indépendantes la retrouvent.

     CE QUI EST AJUSTÉ FAUTE DE MIEUX, et il faut le savoir :
       - « vitesse » vaut 0,400 ici parce que c'est ce qui minimise l'erreur
         d'affichage. Le survol des nœuds, lui, MESURE 0,13. Les deux ne
         s'accordent pas, et on ne sait pas encore pourquoi (§10) ;
       - « capacite » et « constante » sont ajustés sur les 22 héros.

     À REFAIRE dès qu'une mesure nouvelle arrive : les coefficients sortent de
     « fit22 », l'ajustement décrit au §9.                                     */

  PUISSANCE: { facteur: 0.002182, constante: 1018, vitesse: 0.400, capacite: 0.0049 },

  // feuille = la feuille de statistiques rendue par detail(), contexte = celui du héros.
  // Rend null quand une statistique manque : mieux vaut ne rien afficher.
  puissance(feuille, contexte) {
    const v = (s) => feuille?.[s]?.total ?? 0;
    const facteurCrit = 1 + v('CritChance') * (v('CritDamage') - 1);
    const esquive = v('Evasion');
    if (esquive >= 1) return null;
    const facteurEsquive = 1 / (1 - esquive);
    const noyau = v('Attack') * v('Defense') * v('MaxHitPoints') * v('BaseDamage')
      * facteurCrit * facteurEsquive;
    if (!(noyau > 0)) return null;
    const P = this.PUISSANCE;
    const competence = contexte?.hero?.competence ?? 1;
    return P.facteur * Math.sqrt(noyau)
      * Math.pow(v('AttackSpeed') || 1, P.vitesse)
      * (1 + P.capacite * (competence - 1))
      + P.constante;
  },

  // Un attribut verrouillé est connu du jeu mais sa valeur n'a pas encore été
  // tirée : il ne doit donc rien apporter au calcul.
  attributCompte(attribut) {
    return !attribut.verrouille && typeof attribut.valeur === 'number';
  },
};
