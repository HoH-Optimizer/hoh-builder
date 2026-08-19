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

  DEFAUTS: {
    CritChance: 0.05,   // 5 %
    CritDamage: 1.50,   // 150 %
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
    // L'asymétrie est réelle et vérifiée : sur l'ATTAQUE, le même genre de bonus
    // d'ensemble reste sur l'assiette ordinaire — les 5 % du set Mousquetaire de
    // Marie Curie donnent 308, le chiffre du jeu, et 334 si l'on y ajoutait la
    // caserne. Le témoin décisif est Artémise, qui porte 1,64 % de PV venus d'un
    // OBJET sans aucun ensemble complet : 184 sur l'assiette ordinaire contre 261
    // sur l'assiette élargie, pour 185 affichés par le jeu.
    //
    // Faute d'explication, on s'en tient à ce qui est mesuré.
    const pourcentage = apport.pourcentage || 0;
    const pourcentageSet = apport.pourcentageSet || 0;
    const pourcentageObjet = pourcentage - pourcentageSet;

    let partPourcentage;
    if (!this.ABSOLUES.has(stat)) {
      partPourcentage = pourcentage;
    } else {
      const partObjet = auNiveau * pourcentageObjet;
      const assietteSet = this.SET_SUR_CASERNE.has(stat)
        ? auNiveau + partCaserne + partObjet
        : auNiveau;
      partPourcentage = partObjet + assietteSet * pourcentageSet;
    }

    // Ce que l'équipement apporte en propre, avant que le panthéon ne l'amplifie.
    // L'amplification ne porte pas sur les bonus d'ensemble, d'où « apport.set ».
    const partEquipement = (apport.plat || 0) + partPourcentage;
    const amplifiable = partEquipement - (apport.set || 0);

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

  // Un attribut verrouillé est connu du jeu mais sa valeur n'a pas encore été
  // tirée : il ne doit donc rien apporter au calcul.
  attributCompte(attribut) {
    return !attribut.verrouille && typeof attribut.valeur === 'number';
  },
};
