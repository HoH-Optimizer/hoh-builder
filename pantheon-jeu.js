/* PANTHÉON
   -----------------------------------------------------------------------------
   Ce que rapporte chaque nœud de l'arbre de panthéon.

   D'OÙ ÇA VIENT. Contrairement au reste du catalogue, ces valeurs ne sont NULLE
   PART dans les données : ni dans l'export du compte, ni dans le catalogue du
   jeu, qui ne contient même pas le mot « pantheon ». Elles ont été relevées une
   par une sur l'écran du jeu, nœud par nœud.

   L'export, lui, dit quels nœuds un héros a débloqués
   (« pantheon_node.layer3_node3_SingleStriker ») : il suffit alors de regarder
   ici ce que chacun rapporte.

   CE QUI EST COUVERT. Quatre arbres sur six : ATTAQUANTS INDIVIDUELS, ATTAQUANTS
   DE ZONE, SOIGNEURS et DÉFENSEURS. Manquent les manipulateurs et les soutiens.
   Un nœud inconnu est simplement ignoré, et signalé à l'écran.

   L'ARBRE EST LE MÊME POUR TOUS LES HÉROS D'UNE CLASSE. Vérifié : les
   vingt-deux nœuds relevés sur Léonard de Vinci et sur Marie Curie concordent
   nom pour nom et valeur pour valeur.

   LE PIÈGE, ET IL EST SÉRIEUX : LE NUMÉRO D'UN NŒUD NE SUIT PAS SA POSITION.
   À l'écran, la première ligne se lit « Force sauvage · Précision mortelle ·
   Tranchant létal · Assaut éclair ». Dans l'export, ces mêmes nœuds sont
   node3, node1, node2, node4 — dans cet ordre. La permutation est constante :

       position 1 -> node3 · position 2 -> node1 · position 3 -> node2 · position 4 -> node4

   Elle a été établie en recoupant les noms avec l'arbre des attaquants
   individuels, puis VÉRIFIÉE sur Marie Curie : elle a sept nœuds activés,
   l'export dit lesquels, et les sept tombent exactement sur les sept
   emplacements allumés de sa capture d'écran. Recopier l'ordre visuel donnerait
   un fichier faux qui semblerait juste.

   LA SIXIÈME LIGNE change d'une classe à l'autre : les attaquants montent
   l'attaque (« Ascension de force »), les soigneurs et les défenseurs la défense
   (« Ascension de fer »). Elle ne compte que deux nœuds, qui suivent l'ordre
   visuel.

   TROIS NATURES D'EFFET :
     - "plat"        : +3 coups/min de vitesse d'attaque
     - "pourcentage" : +5 % de chances de crit
     - "amplifie"    : « les gains d'ATQ provenant de l'Équipement augmentent de
                       50 % ». Ce n'est pas un bonus, c'est un multiplicateur sur
                       une AUTRE source. Vérifié sur Achille : 50 % des 305,6
                       d'attaque de son équipement plus 50 % des 129 de sa
                       relique font 217, exactement ce que le jeu porte au crédit
                       du panthéon.
     - "combat"      : un effet qui ne se déclenche qu'en combat (« lorsque le
                       héros réduit les PV d'un ennemi à 0… »). Il n'entre dans
                       aucune statistique de fiche : on l'affiche, on ne le compte pas.
   ========================================================================== */

window.PANTHEON_JEU = {
  "SingleStriker": {
    "nom": "Attaquants individuels",
    "noeuds": {
      "layer1_node1": { "nom": "Précision mortelle", "effets": [{ "stat": "CritChance", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node2": { "nom": "Tranchant létal", "effets": [{ "stat": "CritDamage", "valeur": 0.20, "type": "pourcentage" }] },
      "layer1_node3": { "nom": "Force sauvage", "effets": [{ "stat": "BasicAttackDamageAmp", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node4": { "nom": "Assaut éclair", "effets": [{ "stat": "AttackSpeed", "valeur": 0.05, "type": "plat" }] },

      "layer2_node1": { "nom": "Grâce réparatrice", "effets": [{ "stat": "HealTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node2": { "nom": "Garde-bouclier", "effets": [{ "stat": "ShieldTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node3": { "nom": "Marche rapide", "effets": [{ "stat": "MoveSpeed", "valeur": 0.10, "type": "proportionnel" }] },
      "layer2_node4": { "nom": "Pas fantôme", "effets": [{ "stat": "Evasion", "valeur": 0.05, "type": "pourcentage" }] },

      "layer3_node1": { "nom": "Esprit vif", "effets": [{ "stat": "InitialFocusInSecondsBonus", "valeur": 1, "type": "plat" }] },
      "layer3_node2": { "nom": "Puissance brute", "effets": [{ "stat": "BaseDamage", "valeur": 0.05, "type": "proportionnel" }] },
      "layer3_node3": { "nom": "Tranchant de l'exécuteur", "effets": [{ "stat": "SingleTargetDamageAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer3_node4": { "nom": "Impulsion du vainqueur", "effets": [{ "type": "combat", "texte": "Tuer un ennemi accélère la prochaine charge de capacité de 0,50 s, toutes les 10 s" }] },

      "layer4_node1": { "nom": "Équipement affûté", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node2": { "nom": "Équipement renforcé", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Defense", "valeur": 0.50 }] },
      "layer4_node3": { "nom": "Fureur de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node4": { "nom": "Rempart de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Defense", "valeur": 0.50 }] },

      "layer5_node1": { "nom": "Triomphe prédateur", "effets": [{ "type": "combat", "texte": "Tuer un héros ennemi augmente l'attaque de 15 % pendant 5 s" }] },
      "layer5_node2": { "nom": "Frappe frénétique", "effets": [{ "type": "combat", "texte": "Tuer un ennemi augmente la vitesse d'attaque de 10 % pendant 5 s" }] },
      "layer5_node3": { "nom": "Coups massifs", "effets": [{ "type": "combat", "texte": "Au début du combat, +10 % de dégâts de base pendant 20 s" }] },
      "layer5_node4": { "nom": "Visée mortelle", "effets": [{ "type": "combat", "texte": "Au début du combat, +10 % de chances de coup critique pendant 20 s" }] },

      // Les deux derniers se montent de 1 à 10, et chaque niveau vaut 1 %.
      "layer6_node1": { "nom": "Ascension de force", "parNiveau": true, "effets": [{ "stat": "Attack", "valeur": 0.01, "type": "proportionnel" }] },
      "layer6_node2": { "nom": "Ascension de vitalité", "parNiveau": true, "effets": [{ "stat": "MaxHitPoints", "valeur": 0.01, "type": "proportionnel" }] },
    },
  },
  /* --------------------------------------------------------------------------
     ATTAQUANTS DE ZONE — relevé sur Léonard de Vinci, puis REFAIT en entier sur
     Marie Curie : les vingt-deux nœuds concordent, nom pour nom et valeur pour
     valeur. Deux héros indépendants, comme la règle du projet l'exige.

     Et la numérotation est VÉRIFIÉE, pas supposée : Marie Curie a sept nœuds
     activés, l'export dit lesquels, et les sept se retrouvent exactement aux
     sept emplacements allumés sur sa capture. Ses totaux de panthéon tombent
     ensuite au point près (voir RECHERCHE-PUISSANCE.md).
     ----------------------------------------------------------------------- */
  "AreaAttacker": {
    "nom": "Attaquants de zone",
    "noeuds": {
      "layer1_node1": { "nom": "Précision mortelle", "effets": [{ "stat": "CritChance", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node2": { "nom": "Tranchant létal", "effets": [{ "stat": "CritDamage", "valeur": 0.20, "type": "pourcentage" }] },
      "layer1_node3": { "nom": "Force sauvage", "effets": [{ "stat": "BasicAttackDamageAmp", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node4": { "nom": "Assaut éclair", "effets": [{ "stat": "AttackSpeed", "valeur": 0.05, "type": "plat" }] },

      "layer2_node1": { "nom": "Grâce réparatrice", "effets": [{ "stat": "HealTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node2": { "nom": "Garde-bouclier", "effets": [{ "stat": "ShieldTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node3": { "nom": "Marche rapide", "effets": [{ "stat": "MoveSpeed", "valeur": 0.10, "type": "proportionnel" }] },
      "layer2_node4": { "nom": "Pas fantôme", "effets": [{ "stat": "Evasion", "valeur": 0.05, "type": "pourcentage" }] },

      "layer3_node1": { "nom": "Esprit vif", "effets": [{ "stat": "InitialFocusInSecondsBonus", "valeur": 1, "type": "plat" }] },
      "layer3_node2": { "nom": "Puissance brute", "effets": [{ "stat": "BaseDamage", "valeur": 0.05, "type": "proportionnel" }] },
      // Le pendant, pour cette classe, du « Tranchant de l'exécuteur » des
      // attaquants individuels : même emplacement, même 10 %, mais sur les
      // dégâts de ZONE au lieu des dégâts uniques.
      "layer3_node3": { "nom": "Ruine généralisée", "effets": [{ "stat": "AoeDamageAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer3_node4": { "nom": "Poussée d'élan", "effets": [{ "type": "combat", "texte": "Lorsque la capacité du héros affecte un ennemi, accélère sa prochaine charge de 0,05 s, jusqu'à 10 ennemis" }] },

      "layer4_node1": { "nom": "Équipement affûté", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node2": { "nom": "Équipement renforcé", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Defense", "valeur": 0.50 }] },
      "layer4_node3": { "nom": "Fureur de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node4": { "nom": "Rempart de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Defense", "valeur": 0.50 }] },

      "layer5_node1": { "nom": "Soif de sang", "effets": [{ "type": "combat", "texte": "Réduire les PV d'un ennemi à 0 augmente l'attaque de 5 % pendant 5 s, cumulable jusqu'à 3 fois" }] },
      "layer5_node2": { "nom": "Frappe scindée", "effets": [{ "type": "combat", "texte": "Une attaque de base a 10 % de chances d'infliger 100 % des dégâts de base aux ennemis dans un rayon de 1 autour de la cible" }] },
      "layer5_node3": { "nom": "Coups massifs", "effets": [{ "type": "combat", "texte": "Au début du combat, +10 % de dégâts de base pendant 20 s" }] },
      "layer5_node4": { "nom": "Visée mortelle", "effets": [{ "type": "combat", "texte": "Au début du combat, +10 % de chances de coup critique pendant 20 s" }] },

      "layer6_node1": { "nom": "Ascension de force", "parNiveau": true, "effets": [{ "stat": "Attack", "valeur": 0.01, "type": "proportionnel" }] },
      "layer6_node2": { "nom": "Ascension de vitalité", "parNiveau": true, "effets": [{ "stat": "MaxHitPoints", "valeur": 0.01, "type": "proportionnel" }] },
    },
  },

  /* --------------------------------------------------------------------------
     SOIGNEURS — relevé sur Hatchepsout, les vingt-deux nœuds.

     CE QUE CE RELEVÉ NE PROUVE PAS. Aucun héros du compte n'a encore débloqué
     le moindre nœud de soigneur : rien ne vient donc confirmer que le NUMÉRO
     d'un nœud est bien celui écrit ici. Les noms et les valeurs, eux, sont lus
     à l'écran et certains. La numérotation suit la règle établie et vérifiée
     sur les deux autres classes (voir l'en-tête). Elle ne coûte rien tant que
     personne n'a de nœud, et sera à confirmer au premier soigneur que Thomas
     fera monter.
     ----------------------------------------------------------------------- */
  "Healer": {
    "nom": "Soigneurs",
    "noeuds": {
      "layer1_node1": { "nom": "Précision mortelle", "effets": [{ "stat": "CritChance", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node2": { "nom": "Tranchant létal", "effets": [{ "stat": "CritDamage", "valeur": 0.20, "type": "pourcentage" }] },
      "layer1_node3": { "nom": "Force sauvage", "effets": [{ "stat": "BasicAttackDamageAmp", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node4": { "nom": "Assaut éclair", "effets": [{ "stat": "AttackSpeed", "valeur": 0.05, "type": "plat" }] },

      "layer2_node1": { "nom": "Grâce réparatrice", "effets": [{ "stat": "HealTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node2": { "nom": "Garde-bouclier", "effets": [{ "stat": "ShieldTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node3": { "nom": "Marche rapide", "effets": [{ "stat": "MoveSpeed", "valeur": 0.10, "type": "proportionnel" }] },
      "layer2_node4": { "nom": "Pas fantôme", "effets": [{ "stat": "Evasion", "valeur": 0.05, "type": "pourcentage" }] },

      "layer3_node1": { "nom": "Esprit vif", "effets": [{ "stat": "InitialFocusInSecondsBonus", "valeur": 1, "type": "plat" }] },
      "layer3_node2": { "nom": "Puissance brute", "effets": [{ "stat": "BaseDamage", "valeur": 0.05, "type": "proportionnel" }] },
      "layer3_node3": { "nom": "Mains bénies", "effets": [{ "type": "combat", "texte": "Au début du combat, augmente de 8 % les soins et boucliers prodigués par le héros" }] },
      "layer3_node4": { "nom": "Barrière de débordement", "effets": [{ "type": "combat", "texte": "Soigner un allié au-delà de ses PV max lui confère un bouclier valant 50 % des soins excédentaires, pendant 5 s" }] },

      "layer4_node1": { "nom": "Équipement affûté", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node2": { "nom": "Équipement renforcé", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Defense", "valeur": 0.50 }] },
      "layer4_node3": { "nom": "Fureur de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node4": { "nom": "Rempart de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Defense", "valeur": 0.50 }] },

      "layer5_node1": { "nom": "Prière gardienne", "effets": [{ "type": "combat", "texte": "Lorsqu'un héros allié est vaincu, augmente la défense de tous les alliés de 10 % de celle du héros pendant 5 s" }] },
      "layer5_node2": { "nom": "Secours prompt", "effets": [{ "type": "combat", "texte": "Lorsqu'un allié est vaincu, soigne un allié au hasard de 5 % des PV max du héros" }] },
      "layer5_node3": { "nom": "Instinct de survie", "effets": [{ "type": "combat", "texte": "Tant que les PV du héros sont sous 20 %, les soins qu'il reçoit augmentent de 50 %" }] },
      "layer5_node4": { "nom": "Intervention divine", "effets": [{ "type": "combat", "texte": "La première fois que ses PV passent sous 20 %, le héros se soigne de 20 % de ses PV max" }] },

      // La sixième ligne change d'une classe à l'autre : les soigneurs montent
      // la DÉFENSE là où les attaquants montent l'attaque.
      "layer6_node1": { "nom": "Ascension de fer", "parNiveau": true, "effets": [{ "stat": "Defense", "valeur": 0.01, "type": "proportionnel" }] },
      "layer6_node2": { "nom": "Ascension de vitalité", "parNiveau": true, "effets": [{ "stat": "MaxHitPoints", "valeur": 0.01, "type": "proportionnel" }] },
    },
  },
  /* --------------------------------------------------------------------------
     DÉFENSEURS — relevé sur William Wallace.

     Même réserve que pour les soigneurs : aucun héros du compte n'a débloqué de
     nœud de défenseur, donc rien ne CONFIRME la numérotation. Les noms et les
     valeurs, eux, sont lus à l'écran. La numérotation suit la règle vérifiée sur
     les attaquants (voir l'en-tête).
     ----------------------------------------------------------------------- */
  "Defender": {
    "nom": "Défenseurs",
    "noeuds": {
      "layer1_node1": { "nom": "Précision mortelle", "effets": [{ "stat": "CritChance", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node2": { "nom": "Tranchant létal", "effets": [{ "stat": "CritDamage", "valeur": 0.20, "type": "pourcentage" }] },
      "layer1_node3": { "nom": "Force sauvage", "effets": [{ "stat": "BasicAttackDamageAmp", "valeur": 0.05, "type": "pourcentage" }] },
      "layer1_node4": { "nom": "Assaut éclair", "effets": [{ "stat": "AttackSpeed", "valeur": 0.05, "type": "plat" }] },

      "layer2_node1": { "nom": "Grâce réparatrice", "effets": [{ "stat": "HealTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node2": { "nom": "Garde-bouclier", "effets": [{ "stat": "ShieldTakenAmp", "valeur": 0.10, "type": "pourcentage" }] },
      "layer2_node3": { "nom": "Marche rapide", "effets": [{ "stat": "MoveSpeed", "valeur": 0.10, "type": "proportionnel" }] },
      "layer2_node4": { "nom": "Pas fantôme", "effets": [{ "stat": "Evasion", "valeur": 0.05, "type": "pourcentage" }] },

      "layer3_node1": { "nom": "Esprit vif", "effets": [{ "stat": "InitialFocusInSecondsBonus", "valeur": 1, "type": "plat" }] },
      "layer3_node2": { "nom": "Puissance brute", "effets": [{ "stat": "BaseDamage", "valeur": 0.05, "type": "proportionnel" }] },
      "layer3_node3": { "nom": "Commandement de choc", "effets": [{ "type": "combat", "texte": "Utiliser sa capacité étourdit un ennemi au hasard pendant 1 s" }] },
      "layer3_node4": { "nom": "Volonté de fer", "effets": [{ "type": "combat", "texte": "Utiliser sa capacité augmente la défense du héros de 10 % pendant 5 s" }] },

      "layer4_node1": { "nom": "Équipement affûté", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node2": { "nom": "Équipement renforcé", "effets": [{ "type": "amplifie", "source": "equipement", "stat": "Defense", "valeur": 0.50 }] },
      "layer4_node3": { "nom": "Fureur de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Attack", "valeur": 0.50 }] },
      "layer4_node4": { "nom": "Rempart de Reliques", "effets": [{ "type": "amplifie", "source": "relique", "stat": "Defense", "valeur": 0.50 }] },

      "layer5_node1": { "nom": "Mur inflexible", "effets": [{ "type": "combat", "texte": "Au début du combat, +1 % de défense par ennemi, jusqu'à 15 %, pendant 20 s" }] },
      "layer5_node2": { "nom": "Buveur de vie", "effets": [{ "type": "combat", "texte": "Réduire les PV d'un ennemi à 0 soigne le héros de 10 % de ses PV max, une fois toutes les 15 s" }] },
      "layer5_node3": { "nom": "Derniers sacrements", "effets": [{ "type": "combat", "texte": "À sa mort, le héros soigne les alliés dans un rayon de 5 de 20 % de ses PV max" }] },
      "layer5_node4": { "nom": "Sursauts d'agonie", "effets": [{ "type": "combat", "texte": "À sa mort, le héros inflige 20 % de ses PV max en dégâts aux ennemis dans un rayon de 2,5" }] },

      // Comme les soigneurs, les défenseurs montent la DÉFENSE et non l'attaque.
      "layer6_node1": { "nom": "Ascension de fer", "parNiveau": true, "effets": [{ "stat": "Defense", "valeur": 0.01, "type": "proportionnel" }] },
      "layer6_node2": { "nom": "Ascension de vitalité", "parNiveau": true, "effets": [{ "stat": "MaxHitPoints", "valeur": 0.01, "type": "proportionnel" }] },
    },
  },
};
