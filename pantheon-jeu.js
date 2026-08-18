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

   CE QUI EST COUVERT. L'arbre des ATTAQUANTS INDIVIDUELS, identique pour tous
   les héros de cette classe. Les cinq autres classes ont leur propre arbre,
   qu'on relèvera de la même façon. Un nœud inconnu est simplement ignoré, et
   signalé à l'écran.

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
};
