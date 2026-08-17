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

  // Effets des bonus de set, encore inconnus.
  // Un set d'armement compte 2 pièces (main, vêtement), un set de parure en compte 3
  // (chapeau, cou, anneau) — le site déduit cette taille des données.
  // Dès qu'on connaîtra les effets, remplir ce tableau, par exemple :
  //   Archer: [{ pieces: 2, texte: '+7,5 % dégâts mono-cible' }]
  BONUS_DE_SET: {},

  // Un attribut verrouillé est connu du jeu mais sa valeur n'a pas encore été tirée :
  // il ne doit donc rien apporter au calcul.
  attributCompte(attribut) {
    return !attribut.verrouille && typeof attribut.valeur === 'number';
  },
};
