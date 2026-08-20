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
   catalogue. La FORMULE, elle, a été retrouvée dans les données du jeu — voir le §15 du
   journal. Ce qui reste approché est une constante additive d'environ 1 400, et
   le résultat tombe à 0,27 % en moyenne sur les 27 héros relevés. Voir puissance(),
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

  // LES TAUX SONT CEUX DU JEU, plus aucun n'est ajusté. Ils dormaient dans le
  // catalogue depuis le début, à la rubrique 8, que tools/catalogue.js déclarait
  // sans jamais la lire : six entrées, une par famille de statistiques, chacune
  // donnant un couple { par niveau, par ascension } pour les quatre raretés —
  // identique pour les quatre. Deux couples seulement en sortent :
  //
  //     { 0,045 ; 0,20 }   attaque et défense
  //     { 0,04  ; 0,06 }   points de vie et dégâts de base
  //
  // L'ancien couple { 0,0465 ; 0,186 } était un ajustement, et il tombait à
  // 1 à 4 points du jeu — le « biais ordinaire » que le journal traînait depuis
  // le début (§18). Avec les taux du jeu, l'attaque et la défense d'Achille
  // tombent EXACTEMENT sur son écran : 2 945 et 1 799.
  // UNE UNITÉ ORDINAIRE NE MONTE PAS COMME UN HÉROS : elle n'a pas d'ascensions,
  // et son taux par niveau est plus élevé. Ce taux est le troisième champ de la
  // même entrée de la rubrique 8 — 0,06 pour l'attaque et la défense, 0,0465 pour
  // les points de vie et les dégâts de base. Vérifié sur la caserne d'infanterie
  // de Thomas : son unité de niveau 130 affiche 917 / 1223 / 2330 en jeu, et la
  // règle donne 917,7 / 1223,6 / 2330,5.
  MONTEE: {
    MaxHitPoints: { parNiveau: 0.04, parAscension: 0.06, parNiveauUnite: 0.0465 },
    Attack: { parNiveau: 0.045, parAscension: 0.20, parNiveauUnite: 0.06 },
    Defense: { parNiveau: 0.045, parAscension: 0.20, parNiveauUnite: 0.06 },
    // Les dégâts de base montent au même rythme que les points de vie. Mesuré sur
    // onze héros de Thomas, relevés un par un sur l'écran d'amélioration du jeu :
    // niveaux 20 à 110, trois à cinq étoiles, avec ou sans équipement. Les onze
    // tombent à un point près, l'écart résiduel étant l'arrondi que le jeu affiche.
    // Ils manquaient à cette table : le site les laissait à leur valeur de niveau 1,
    // et annonçait 131 là où le jeu affiche 779.
    BaseDamage: { parNiveau: 0.04, parAscension: 0.06, parNiveauUnite: 0.0465 },
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

  /* ------------------------------------- LE JEU NE GARDE QUE DES ENTIERS

     Thomas l'a signalé le 20/08/2026 : dans le jeu, AUCUNE ligne du détail
     d'une statistique ne porte de décimale — sauf les statistiques qui SONT
     des pourcentages, comme les chances de crit. Là où le site écrivait
     « Éveil 327,1 » et « Panthéon 217,3 », son écran affiche 327 et 217.

     Ce n'est pas qu'un habillage : le total écrit par le jeu est la SOMME DE CES
     ENTIERS. Et l'arrondi n'est pas le même partout — c'est Thomas qui a insisté
     pour qu'on le regarde de près, et il avait raison :

       LA MONTÉE EN NIVEAU se TRONQUE ;
       TOUT LE RESTE — éveil, caserne, relique, équipement, panthéon — se
       PLAFONNE, c'est-à-dire s'arrondit vers le HAUT.

     Six lignes lues sur les tableaux « Stats de profil » du jeu le disent, et
     aucune ne dit le contraire :

       Achille, éveil ATQ          326,28 -> 327
       Achille, équipement ATQ     304,95 -> 305
       Achille, panthéon ATQ       216,98 -> 217
       Achille, équipement DÉG      30,03 -> 31
       Wallace (autre compte), équipement DÉG   43,05 -> 44
       Wallace (autre compte), panthéon DÉG     27,14 -> 28

     Les quatre dernières sont décisives : l'arrondi ordinaire y donnerait 30, 43
     et 27, et le jeu écrit 31, 44 et 28. C'est ce plafond qui manquait pour que
     les dégâts de base tombent juste — ils passent de 2 justes sur 8 à 7 sur 8.

     ET LA PUISSANCE NE SE CALCULE PAS LÀ-DESSUS. Elle se calcule sur les valeurs
     EXACTES, sans aucun arrondi intermédiaire : la formule du jeu (§15) ne porte
     qu'un seul arrondi, tout en haut. C'est pour cela que detail() rend aussi un
     champ « exact » à côté du total écrit à l'écran. Mélanger les deux — calculer
     la puissance sur des lignes plafonnées — la fait dériver de dix points.

     ATTENTION AU FAUX AMI. On a d'abord conclu que le jeu TRONQUAIT, sur ce
     témoin : les 17,65 % d'équipement d'Achille valaient 256,605, et le jeu
     compte 305, soit 49 + 256 et non 49 + 257. La conclusion était fausse, et
     la cause était ailleurs : les taux de montée étaient un peu trop hauts.
     Avec ceux du jeu (voir MONTEE), la part vaut 255,95 — et 49 + 255,95
     s'ARRONDIT en 305. Le même chiffre, par la bonne route.

     La leçon, pour la troisième fois dans ce dossier : un écart d'un point
     n'est pas un arrondi, c'est une entrée fausse.                          */

  ENTIERES: new Set(['Attack', 'Defense', 'MaxHitPoints', 'BaseDamage']),

  /* ------------------------------------- LE TOTAL DES DÉGÂTS DE BASE SE PLAFONNE

     Sur les huit héros dont on possède le tableau « Stats de profil », notre
     valeur exacte des dégâts de base tombe TOUJOURS juste en dessous de l'entier
     que le jeu écrit — entre 0,19 et 0,89 en dessous, jamais au-dessus. Huit sur
     huit. Le cas qui tranche est Isabella : 599,11 chez nous, 600 dans le jeu.
     Un arrondi ordinaire donnerait 599.

     Et les parties fractionnaires de nos valeurs (0,11 · 0,34 · 0,38 · 0,43 ·
     0,63 · 0,63 · 0,69 · 0,81) couvrent tout l'intervalle, ce qu'on attend d'un
     plafond et pas d'un manque : si une contribution nous échappait, elles se
     serreraient sous 0,5.

     L'AUTRE LECTURE, qu'il faut garder en tête : nos dégâts de base seraient trop
     bas d'un demi-point, et le jeu arrondirait normalement. Elle explique les
     mêmes chiffres, avec un manque qui varierait de 0 à 0,39 selon le héros —
     moins naturel, mais pas impossible. Huit héros ne suffisent pas à trancher.

     Les trois autres statistiques ne montrent rien de tel : l'attaque et la
     défense se trompent dans les DEUX sens (−0,70 à +0,59), ce qui est la
     signature d'un arrondi ordinaire et de valeurs justes.                     */

  PLAFONNEES: new Set(['BaseDamage']),

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
      // L'ÉVEIL EST DANS L'ASSIETTE. Lily la Tigresse l'a tranché le 20/08/2026 :
      // elle est la première héroïne du compte à cumuler un ensemble de PARURE
      // qui donne des PV (le Chacal, +10 %) ET un éveil qui en donne aussi
      // (+38 %). Chez Wallace, Isabella et Jeanne d'Arc, qui portent le même
      // Chacal, l'éveil ne donne pas de PV : l'assiette sans éveil et l'assiette
      // avec éveil y sont le même nombre, et les deux tombaient juste.
      //   sans l'éveil : 16 641   avec l'éveil : 16 928   le jeu : 16 927
      const assietteParure = this.SET_SUR_CASERNE.has(stat)
        ? apresEveil + partCaserne + partObjet
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

    // CHAQUE APPORT EST ARRONDI, et le total est leur somme — voir ENTIERES,
    // plus haut. L'équipement compte pour UNE ligne : le jeu ne sépare pas ce
    // qu'un objet donne à plat de ce qu'il donne en pourcentage, et le témoin
    // d'Achille (49 + 255,95 -> 305) porte sur leur somme, pas sur chacun.
    const entiere = this.ENTIERES.has(stat);
    const plancher = (x) => (entiere ? Math.floor(x) : x);
    const plafond = (x) => (entiere ? Math.ceil(x) : x);

    const parts = {
      base: plancher(base),
      niveau: plancher(auNiveau - base),   // ce que le niveau seul a ajouté
      eveil: plafond(apresEveil - auNiveau),
      caserne: plafond(partCaserne),
      relique: plafond(partRelique),
      equipement: plafond(partEquipement),
      pantheon: plafond(pantheon),
    };

    return {
      ...parts,
      // Le taux qui a produit la part en pourcentage de l'équipement. Il ne
      // s'additionne pas : il sert à rappeler d'où sort le chiffre.
      tauxEquipement: pourcentage,
      // LE TOTAL N'EST PAS LA SOMME DES LIGNES ÉCRITES, et le jeu non plus ne
      // le fait pas : chaque ligne est plafonnée pour l'affichage, mais le total
      // vient de la somme EXACTE, arrondie une seule fois. Sur Achille, les
      // lignes affichées font 2 946 et le jeu écrit 2 945 — c'est cohérent, pas
      // contradictoire. L'addition à l'écran ne tombe donc pas toujours au point
      // près, exactement comme dans le jeu.
      total: entiere
        ? (this.PLAFONNEES.has(stat) ? Math.ceil : Math.round)(
          apresEveil + partCaserne + partRelique + partEquipement + pantheon)
        : Object.values(parts).reduce((somme, v) => somme + v, 0),
      // La même somme, SANS aucun arrondi. Le jeu arrondit ce qu'il écrit, mais
      // calcule la puissance sur ses valeurs exactes : sa formule ne porte qu'un
      // seul arrondi, tout en haut.
      exact: apresEveil + partCaserne + partRelique + partEquipement + pantheon,
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

     Sur les 27 héros dont la puissance a été relevée dans le jeu, il tombe à
     0,27 % en moyenne — et cinq d'entre eux au point près. Ce n'est PAS le
     chiffre du jeu : il lui manque encore une constante dont on ignore
     l'origine, et le total reste donc approché.

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

     CE QUI EST AJUSTÉ FAUTE DE MIEUX, et il faut le savoir : UN SEUL nombre,
     « constante ». Tous les autres sont ceux du jeu, lus dans son game design
     (§15). La constante, elle, est ajustée sur les 22 héros relevés — et deux
     dispositifs indépendants tombent au même endroit (§13, §16).

     À REFAIRE dès qu'une mesure nouvelle arrive : réajuster « constante » sur
     l'ensemble des puissances relevées.                                       */

  // LES CONSTANTES DU JEU, lues telles quelles dans son fichier de game design.
  // Ce ne sont plus des valeurs ajustées : ce sont les siennes. Les nombres du
  // jeu sont en virgule fixe sur 16 bits, d'où 0,0167999… pour 0,0168.
  PUISSANCE: {
    // TOUTES CES VALEURS SONT DANS LE FICHIER DE GAME DESIGN, à l'octet près, et
    // rassemblées au même endroit — l'arbre de la formule. On y lit ses nœuds
    // (« FormulaMultiplicationDTO », « FormulaDivisionDTO »), ses termes
    // (« HeroUnitStatFormulaTermDTO », « HeroUnitRarityFormulaTermDTO ») et,
    // entre eux, ces constantes-ci, dans cet ordre : 0,5 · 0,0168 · −1,25 ·
    // 1,35 · 0,9 · 2,03 · 1,75 · 0,025 · 0,005 · 0,01 · 1,218 · 1000.
    //
    // Le coefficient y est écrit en DEUX nombres, 1,218 et 1000, reliés par un
    // nœud de division. On l'écrit donc de la même façon plutôt que de recopier
    // un 0,001218002 qui venait du document communautaire — l'écart est
    // infime, mais autant citer la source exactement.
    coefficient: 1.218 / 1000,
    portee: 0.0168,            // par point de portée au-delà de 1,25
    capacite: 0.025,           // par niveau de capacité au-delà du premier
    rarete: { 2: 0.90, 3: 1.35, 4: 1.75, 5: 2.03 },
    // LA RARETÉ D'UNE RELIQUE NE VIENT PAS DU COMPTE — il ne la donne pas — mais
    // du CATALOGUE : c'est une propriété du type de relique. Le catalogue la code
    // par un numéro d'ordre (1 ou 2) que reliques-jeu.js traduit en étoiles ;
    // la correspondance a été vérifiée sur les 39 reliques contre le game design
    // complet du jeu, sans une exception.
    // ATTENTION à un piège voisin : le champ « etoiles » que produisaient les
    // anciennes versions de l'extension n'est PAS une rareté, c'est le surplus de
    // niveau au-delà de 11, que le jeu range à part. Le prendre pour une rareté
    // faussait à la fois le niveau et ce terme-ci.
    rareteRelique: { 4: 0.005, 5: 0.01 },
    // CE N'EST PLUS UNE CONSTANTE — c'est l'ESCOUADE. Voir puissanceEscorte()
    // juste en dessous et le §21 du journal.
    //
    // Ce nombre a été le dernier mystère du dossier : il fallait ajouter environ
    // 1 400 pour que la puissance tombe, sans savoir d'où ça venait. Un second
    // compte a montré qu'il n'était pas constant du tout — il valait 535 chez ce
    // joueur-là. C'est la puissance des trois unités que la caserne du joueur
    // donne au héros : elle s'ajoute à la sienne dans le nombre affiché.
    //
    // La valeur ci-dessous ne sert plus que de FILET, quand le compte ne dit pas
    // quelle caserne le joueur possède. C'est l'ancien ajustement, celui du
    // compte de Thomas.
    constante: 1416,
  },

  /* --------------------------------------------- LA PUISSANCE DE L'ESCOUADE

     Une caserne fait deux choses : elle donne un forfait au héros de son arme,
     et elle lui donne une ESCOUADE. Le jeu additionne les deux puissances dans
     le nombre qu'il écrit sous le héros.

     L'unité monte à un taux par niveau, sans ascensions (voir MONTEE), et sa
     puissance se calcule avec la MÊME formule que celle d'un héros — à deux
     détails près, qui sont dans les données et non dans une hypothèse :

       - une unité ordinaire n'a pas de régénération de focus. Le terme de rareté
         et de capacité est multiplié par ce rapport : il vaut donc ZÉRO, et le
         facteur de combat se réduit à sa vitesse d'attaque ;
       - sa taille d'escouade, elle, ne vaut pas 1 comme celle d'un héros : c'est
         le petit chiffre sous son icône en jeu, et il multiplie tout ;
     LA FORMULE DE L'ESCOUADE EST DANS LE FICHIER, ET C'EST LA MÊME. Le game
     design en porte DEUX, posées côte à côte :

         formula.unit_power_hero        octet 13 908 308
         formula.expected_unit_power    octet 13 912 310

     Leurs deux corps se suivent, et ils sont JUMEAUX — mêmes types de nœuds,
     mêmes constantes, dans le même ordre : 0,5 · 0,0168 · −1,25 · 1,35 · 0,9 ·
     2,03 · 1,75 · 0,025 · 0,005 · 0,01 · 1,218 · 1000. Et les mêmes statistiques,
     CritChance et CritDamage comprises.

     Cela tranche la question qu'on ne savait pas trancher : OUI, le crit compte
     pour l'escouade, avec les valeurs par défaut (5 % et 150 %). Achille disait
     le contraire, les vingt-six autres héros disaient l'inverse, et le fichier
     donne raison aux vingt-six. Le résidu d'Achille vient d'ailleurs.

     CE QUI S'ANNULE, EN REVANCHE : le terme de rareté et de capacité. La formule
     le multiplie par (RégénFocus ÷ RégénFocus sans bonus), et une unité de
     caserne n'a PAS de régénération de focus — sa fiche ne porte que dix
     statistiques, et celle-là n'y est pas. Le facteur de combat se réduit donc à
     sa vitesse d'attaque. Ce n'est pas une hypothèse : c'est ce que donnent ses
     données.

     VÉRIFIÉ SUR DEUX COMPTES, à moins de 1 % :
       caserne d'infanterie au palier 32 -> 1 426, il fallait 1 416
       caserne d'infanterie au palier 23 ->   539, il fallait   535                */

  puissanceEscorte(unite) {
    const stats = unite?.stats;
    if (!stats || !unite.niveau) return null;

    const P = this.PUISSANCE;
    const auNiveau = (nom) => {
      const taux = this.MONTEE[nom]?.parNiveauUnite;
      const brut = (stats[nom] || 0) * (taux ? 1 + taux * (unite.niveau - 1) : 1);
      // Les quatre grandes statistiques s'écrivent en entier, ici comme ailleurs.
      return this.ENTIERES.has(nom) ? Math.trunc(brut) : brut;
    };

    const crit = stats.CritChance ?? this.DEFAUTS.CritChance;
    const critDegats = stats.CritDamage ?? this.DEFAUTS.CritDamage;
    const attendue = stats.ExpectedSquadSize || 1;
    const combat = (stats.AttackSpeed || 1)
      * (1 + P.portee * ((stats.AttackRange ?? 1.25) - 1.25));

    const noyau = auNiveau('Attack') * auNiveau('Defense') * auNiveau('MaxHitPoints')
      * auNiveau('BaseDamage')
      * (1 + crit * (critDegats - 1))
      * (0.5 + 0.5 / attendue)
      * combat;

    if (!(noyau > 0)) return null;
    return P.coefficient * (stats.SquadSize || 1) * Math.sqrt(noyau);
  },

  // La puissance du héros. feuille = ce que rend detail(), contexte = le héros.
  //
  // La structure est celle du jeu, à la parenthèse près — voir RECHERCHE-PUISSANCE.md
  // §15, qui en donne l'arbre. Rend null si une statistique manque.
  // LES QUATRE STATISTIQUES QUE L'ÉCRAN ÉCRIT EN ENTIER. La puissance se calcule
  // sur les nombres ARRONDIS, ceux que le joueur a sous les yeux, et non sur les
  // valeurs internes.
  //
  // C'EST UN CHOIX, ET IL VA CONTRE LE JEU. L'arbre de la formule extrait du
  // game design ne porte qu'UN seul arrondi, tout en haut, qui enveloppe le
  // calcul entier : le jeu détient donc « Défense = 890,6 », en affiche 891, et
  // calcule avec 890,6. Arrondir avant de calculer nous en éloigne un peu.
  //
  // Thomas l'a demandé en connaissance de cause, pour que l'écran soit cohérent
  // de bout en bout : la puissance découle alors exactement des nombres écrits
  // au-dessus, et se vérifie de tête. Le prix est faible et mesuré — de l'ordre
  // de 6 points sur un héros qui en fait 4 000, contre 93 points d'incertitude
  // du modèle lui-même.
  //
  // Depuis que detail() tronque chaque apport (voir ENTIERES), ces quatre totaux
  // sont DÉJÀ entiers : l'arrondi ci-dessous ne fait plus rien. On le garde pour
  // que la règle reste écrite là où elle s'applique.

  puissance(feuille, contexte) {
    // LA PUISSANCE SE CALCULE SUR LES VALEURS EXACTES, pas sur les nombres
    // écrits à l'écran : la formule du jeu ne porte qu'un arrondi, tout en haut.
    const v = (s) => feuille?.[s]?.exact ?? feuille?.[s]?.total ?? 0;
    const P = this.PUISSANCE;
    const esquive = v('Evasion');
    if (esquive >= 1) return null;

    const base = contexte?.details?.base || {};
    const etoiles = contexte?.details?.etoiles;
    const competence = contexte?.hero?.competence ?? 1;
    const relique = contexte?.reliquePortee;

    // Les deux tailles d'escouade valent 1 pour un héros : les facteurs qu'elles
    // commandent valent donc 1 eux aussi. On les écrit quand même, pour que la
    // formule reste lisible à côté de celle du jeu.
    const escouade = base.SquadSize || 1;
    const escouadeAttendue = base.ExpectedSquadSize || 1;

    // Le terme de COMBAT. C'est une SOMME, pas un produit : la portée et la
    // charge y sont, mais diluées — ce qui explique qu'un ajustement les
    // trouvait « sans effet » (§8).
    const vitesseSansBonus = base.AttackSpeed || 1;
    const regenSansBonus = base.FocusRegen || 1;

    // LA VITESSE D'ATTAQUE ENTRE EN COUPS PAR MINUTE ENTIERS. Le jeu ne l'écrit
    // jamais autrement — « 96 coups/min », jamais 96,24 — et c'est Thomas qui a
    // fait remarquer qu'il fallait l'essayer. Les deux héros dont TOUTES les
    // entrées sont vérifiées sur un écran y gagnent : Achille passe de +9 à −2,
    // et le Wallace de l'autre compte de +3 à −1.
    //
    // La vitesse SANS BONUS, elle, reste exacte : l'arrondir aussi renvoie ce
    // même Wallace à −9. C'est cohérent — celle-là ne s'affiche nulle part, elle
    // vient du catalogue.
    const vitesseEcrite = Math.round(v('AttackSpeed') * 60) / 60;
    const combat = vitesseEcrite * (1 + P.portee * (v('AttackRange') - 1.25))
      + ((P.rarete[etoiles] || 0) + (competence - 1) * P.capacite)
        * (v('FocusRegen') / regenSansBonus)
        * vitesseSansBonus;

    const noyau = v('Attack') * v('Defense') * v('MaxHitPoints')
      * (1 / (1 - esquive))
      * v('BaseDamage')
      * (1 + v('CritChance') * (v('CritDamage') - 1))
      * (0.5 + 0.5 / escouadeAttendue)
      * combat
      * (1 + (relique ? (P.rareteRelique[relique.rarete] || 0) * relique.niveau : 0));

    if (!(noyau > 0)) return null;
    // Le héros, PLUS son escouade. Faute de caserne connue, on retombe sur
    // l'ancien ajustement — mieux vaut un ordre de grandeur qu'un héros nu.
    const escorte = this.puissanceEscorte(contexte?.escorte);
    return P.coefficient * escouade * Math.sqrt(noyau) + (escorte ?? P.constante);
  },

  // Un attribut verrouillé est connu du jeu mais sa valeur n'a pas encore été
  // tirée : il ne doit donc rien apporter au calcul.
  attributCompte(attribut) {
    return !attribut.verrouille && typeof attribut.valeur === 'number';
  },
};
