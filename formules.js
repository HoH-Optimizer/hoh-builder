/* =============================================================================
   FORMULES DE CALCUL
   -----------------------------------------------------------------------------
   C'est LE fichier à corriger quand les valeurs affichées ne collent pas au jeu.
   Tout le reste du site peut rester tel quel.

   Deux natures de bonus existent dans les données du jeu :
     - "plat"        : +20 Attaque          (attributs Attack, Defense, MaxHitPoints...)
     - "pourcentage" : +2,2 % Défense       (attributs finissant par "Bonus", et les crits)

   ATTENTION : l'ordre d'application ci-dessous est une HYPOTHÈSE de départ,
   à confirmer avec les vraies règles du jeu.
   ========================================================================== */

window.FORMULES = {
  // Hypothèse : les pourcentages du même type s'additionnent entre eux,
  // puis s'appliquent une seule fois au total (base + bonus plats).
  //   total = (base + somme des plats) x (1 + somme des pourcentages)
  // Si le jeu multiplie les pourcentages entre eux, remplacer la ligne marquée (A).
  appliquer(base, plat, pourcentage) {
    return (base + plat) * (1 + pourcentage); // (A)
  },

  /* ------------------------------------------------ montée en niveau du héros

     Le catalogue du jeu ne donne les statistiques d'un héros qu'AU NIVEAU 1.
     La façon dont elles montent ensuite n'y figure pas sous forme de table :
     c'est une formule, reconstituée en comparant le calculateur de Forge of Games
     à ses propres constantes, sur quatre héros de types, classes et raretés
     différents (Achille, Ramsès II, Montezuma Ier, Ada Lovelace).

     La montée est LINÉAIRE, proportionnelle à la valeur de départ :

         valeur = base x (1 + parNiveau x (niveau - 1) + parAscension x paliers)

     avec `paliers` = le nombre de dizaines franchies, soit floor(niveau / 10).
     Chaque ascension vaut donc un bonus en plus de la montée ordinaire — c'est
     ce qui fait accélérer la courbe tous les dix niveaux.

     Les deux taux « par niveau » se lisent tels quels dans le catalogue du jeu
     (rubrique 8) : 4 % pour les points de vie, 4,65 % pour l'attaque et la
     défense. Les taux « par ascension » ont été mesurés : 6 % pour les points de
     vie — le catalogue le donne aussi — et 18,6 % pour l'attaque et la défense,
     soit exactement quatre niveaux de montée ordinaire.

     Vérification sur Achille (base 130 / 108 / 1900) :
       niveau  40+1 pièces  jeu           calcul
         50    587/495/6594  →  587,1 / 494,5 / 6594   (caserne comprise, cf. plus bas)
        100   1010/846/10964 → 1010,3 / 846,1 / 10964
        160   1517/1267/16208 → 1517,9 / 1267,9 / 16208
     Les points de vie tombent juste au point près ; l'attaque et la défense
     peuvent différer d'une unité, le jeu arrondissant à un endroit qu'on ne voit
     pas. C'est sans effet sur les écarts entre configurations.                */

  MONTEE: {
    MaxHitPoints: { parNiveau: 0.04, parAscension: 0.06 },
    Attack: { parNiveau: 0.0465, parAscension: 0.186 },
    Defense: { parNiveau: 0.0465, parAscension: 0.186 },
  },

  // La caserne ajoute un montant fixe, identique pour tous les héros et
  // indépendant de leur niveau (+40 attaque, +40 défense, +400 points de vie au
  // premier palier). Son niveau n'est pas dans l'export : ce bonus n'est donc
  // pas compté, et les totaux affichés sont ceux du héros seul.

  // Statistique d'un héros à son niveau réel, éveil compris.
  // `eveil` est la liste des paliers déjà atteints (voir eveil-jeu.js).
  statAuNiveau(base, stat, niveau, eveil = []) {
    if (typeof base !== 'number') return undefined;
    const montee = this.MONTEE[stat];
    const n = Math.max(1, Number(niveau) || 1);

    const valeur = montee
      ? base * (1 + montee.parNiveau * (n - 1) + montee.parAscension * Math.floor(n / 10))
      : base; // les autres statistiques (vitesse, portée…) ne montent pas avec le niveau

    // Les paliers d'éveil qui touchent cette statistique s'ajoutent ensuite :
    // les pourcentages s'appliquent à la valeur montée en niveau, les valeurs
    // plates s'ajoutent telles quelles.
    const paliers = eveil.filter((p) => p.stat === stat);
    const pourcentage = paliers.filter((p) => p.type === 'pourcentage').reduce((s, p) => s + p.valeur, 0);
    const plat = paliers.filter((p) => p.type !== 'pourcentage').reduce((s, p) => s + p.valeur, 0);

    return valeur * (1 + pourcentage) + plat;
  },

  // Effets des bonus de set : ils viennent maintenant de sets-jeu.js, généré
  // depuis le fichier de traduction du jeu (« Dégâts uniques infligés +5 % »).
  // Un ensemble d'armement compte 2 pièces (main, vêtement), un ensemble de
  // parure en compte 3 (chapeau, cou, anneau).
  BONUS_DE_SET: {},

  // Un attribut verrouillé est connu du jeu mais sa valeur n'a pas encore été tirée :
  // il ne doit donc rien apporter au calcul.
  attributCompte(attribut) {
    return !attribut.verrouille && typeof attribut.valeur === 'number';
  },
};
