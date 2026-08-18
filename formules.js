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

   Seul le panthéon manque encore : ses nœuds sont listés dans l'export, mais
   leurs valeurs n'apparaissent ni là, ni dans le catalogue du jeu.

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
  },

  // Le niveau maximum d'un héros : dix par ascension. Le jeu s'arrête à 200.
  NIVEAU_MAX: 200,

  /* ------------------------------------------------------ valeurs de départ

     Certaines statistiques ne sont pas dans la fiche du héros parce qu'elles
     sont les mêmes pour tout le monde. Relevées sur l'écran « Stats » d'Achille
     en jeu, en retranchant ce que son équipement apportait.                   */

  DEFAUTS: {
    CritChance: 0.10,   // 10 %
    CritDamage: 1.50,   // 150 %
    Evasion: 0.05,      // 5 %
    HealTakenAmp: 0.10, // 10 %
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

    // OÙ S'APPLIQUE UN POURCENTAGE. Un objet qui donne « +17,65 % d'attaque » ne
    // majore pas tout ce que le héros a accumulé : il majore SA STATISTIQUE DE
    // BASE, celle qu'il tient de son niveau. Le reste — caserne, relique,
    // panthéon — s'ajoute ensuite, intact.
    //
    // Vérifié sur l'écran du jeu, pour Achille : 17,65 % de sa base (1 454) font
    // 257, plus 49 à plat = 306, et le jeu compte bien 305 pour l'équipement.
    // La lecture multiplicative en donnait 441.
    const pourcentage = apport.pourcentage || 0;
    const partPourcentage = this.ABSOLUES.has(stat) ? auNiveau * pourcentage : pourcentage;
    const total = apresEveil + partCaserne + partRelique + (apport.plat || 0) + partPourcentage;

    return {
      base,
      niveau: auNiveau - base,          // ce que le niveau seul a ajouté
      eveil: apresEveil - auNiveau,
      caserne: partCaserne,
      relique: partRelique,
      equipementPlat: apport.plat || 0,
      equipementPourcentage: pourcentage,
      apportPourcentage: partPourcentage,
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
