/* ENSEMBLES D'ÉQUIPEMENT
   -----------------------------------------------------------------------------
   FICHIER GÉNÉRÉ — ne pas modifier à la main.
   Régénéré par « node tools/catalogue.js » depuis le catalogue du jeu.
   Version du catalogue : 2026-08-20_15-08-50
   Nombre de pièces et effet de chaque ensemble. L'effet n'existe dans le jeu
   que sous forme de phrase : « bonus » en est la relecture chiffrée, vide
   quand la phrase ne se laisse pas relire — « effet » reste alors affichable.
   ========================================================================== */

window.SETS_JEU = {
  "General": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Points de bouclier reçus +5%","bonus":[{"stat":"ShieldTakenAmp","valeur":0.05,"type":"pourcentage"}]},
  "RoyalEgyptian": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Soins prodigués +7,5 % et Points de vie +7,5 %","bonus":[{"stat":"HealGivenAmp","valeur":0.075,"type":"pourcentage"},{"stat":"MaxHitPoints","valeur":0.075,"type":"pourcentage"}]},
  "Lancer": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts d’attaque de base infligés +5%","bonus":[{"stat":"BasicAttackDamageAmp","valeur":0.05,"type":"pourcentage"}]},
  "Warden": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Points de bouclier reçus +7,5 % et Esquive +5 %","bonus":[{"stat":"ShieldTakenAmp","valeur":0.075,"type":"pourcentage"},{"stat":"Evasion","valeur":0.05,"type":"pourcentage"}]},
  "Berserker": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Dégâts de capacité de zone infligés +8 % et Dégâts critiques infligés +10 %","bonus":[{"stat":"AoeDamageAmp","valeur":0.08,"type":"pourcentage"},{"stat":"CritDamage","valeur":0.1,"type":"pourcentage"}]},
  "Ninja": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Dégâts uniques infligés +7,5 % et soins reçus +5 %","bonus":[{"stat":"SingleTargetDamageAmp","valeur":0.075,"type":"pourcentage"},{"stat":"HealTakenAmp","valeur":0.05,"type":"pourcentage"}]},
  "Quack": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts sur la durée infligés +7,5% et Dégâts critiques infligés +10%","bonus":[{"stat":"DotDamageAmp","valeur":0.075,"type":"pourcentage"},{"stat":"CritDamage","valeur":0.1,"type":"pourcentage"}]},
  "Warchief": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Soin prodigué +7,5%","bonus":[{"stat":"HealGivenAmp","valeur":0.075,"type":"pourcentage"}]},
  "Pirate": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Chance de coup critique +5%","bonus":[{"stat":"CritChance","valeur":0.05,"type":"pourcentage"}]},
  "Jackal": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Points de vie +10 % et quantité de soins reçus +5 %","bonus":[{"stat":"MaxHitPoints","valeur":0.1,"type":"pourcentage"},{"stat":"HealTakenAmp","valeur":0.05,"type":"pourcentage"}]},
  "Samurai": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Défense +5 %","bonus":[{"stat":"Defense","valeur":0.05,"type":"pourcentage"}]},
  "Pilot": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Esquive +5%","bonus":[{"stat":"Evasion","valeur":0.05,"type":"pourcentage"}]},
  "Enchantress": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Défense +5 % et Charge initiale -1 s","bonus":[{"stat":"Defense","valeur":0.05,"type":"pourcentage"},{"stat":"InitialFocusInSecondsBonus","valeur":1,"type":"plat"}]},
  "Hunter": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Attaque+15","bonus":[{"stat":"Attack","valeur":15,"type":"plat"}]},
  "Maori": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Vitesse d’attaque +4,5 coups/minute","bonus":[{"stat":"AttackSpeed","valeur":0.075,"type":"plat"}]},
  "Countess": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Dégâts de brûlure infligés +7,5 % et Attaque +5 %","bonus":[{"stat":"BurnDamageAmp","valeur":0.075,"type":"pourcentage"},{"stat":"Attack","valeur":0.05,"type":"pourcentage"}]},
  "Reveler": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts de zone infligés +7,5 % et Charge initiale -1 s","bonus":[{"stat":"AoeDamageAmp","valeur":0.075,"type":"pourcentage"},{"stat":"InitialFocusInSecondsBonus","valeur":1,"type":"plat"}]},
  "HornedKing": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"DÉG d'attaque de base subis -7,5 % et Défense +5 %","bonus":[{"stat":"BasicAttackDamageTakenAmp","valeur":-0.075,"type":"pourcentage"},{"stat":"Defense","valeur":0.05,"type":"pourcentage"}]},
  "Jester": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts de zone infligés +7,5 %","bonus":[{"stat":"AoeDamageAmp","valeur":0.075,"type":"pourcentage"}]},
  "Mystic": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Vitesse d’attaque +9 coups/minute","bonus":[{"stat":"AttackSpeed","valeur":0.15,"type":"plat"}]},
  "Bedouin": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Chance de coup critique +2,5%","bonus":[{"stat":"CritChance","valeur":0.025,"type":"pourcentage"}]},
  "Assassin": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Dégâts uniques infligés +7,5 %","bonus":[{"stat":"SingleTargetDamageAmp","valeur":0.075,"type":"pourcentage"}]},
  "Archer": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Dégâts uniques infligés +5 %","bonus":[{"stat":"SingleTargetDamageAmp","valeur":0.05,"type":"pourcentage"}]},
  "Khon": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts sur la durée infligés +5%","bonus":[{"stat":"DotDamageAmp","valeur":0.05,"type":"pourcentage"}]},
  "Flapper": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Charge initiale -0,5 s","bonus":[{"stat":"InitialFocusInSecondsBonus","valeur":0.5,"type":"plat"}]},
  "King": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts d’attaque de base infligés +10% et Vitesse d’ATQ +9 coups/minute","bonus":[{"stat":"BasicAttackDamageAmp","valeur":0.1,"type":"pourcentage"},{"stat":"AttackSpeed","valeur":0.15,"type":"plat"}]},
  "Adventurer": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Ésquive+7,5%","bonus":[{"stat":"Evasion","valeur":0.075,"type":"pourcentage"}]},
  "Magician": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts de zone infligés +5 %","bonus":[{"stat":"AoeDamageAmp","valeur":0.05,"type":"pourcentage"}]},
  "Pharaoh": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Soin prodigué +7,5% et Esquive +7,5%","bonus":[{"stat":"HealGivenAmp","valeur":0.075,"type":"pourcentage"},{"stat":"Evasion","valeur":0.075,"type":"pourcentage"}]},
  "Mangudai": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts critiques infligés +5%","bonus":[{"stat":"CritDamage","valeur":0.05,"type":"pourcentage"}]},
  "Dharma": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Soins prodigués +5 % et Points de vie +5 %","bonus":[{"stat":"HealGivenAmp","valeur":0.05,"type":"pourcentage"},{"stat":"MaxHitPoints","valeur":0.05,"type":"pourcentage"}]},
  "Squire": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Défense +2,5 %","bonus":[{"stat":"Defense","valeur":0.025,"type":"pourcentage"}]},
  "Voyager": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"DÉG uniques infligés +5 % et Vitesse d'attaque +9 coups/minute","bonus":[{"stat":"SingleTargetDamageAmp","valeur":0.05,"type":"pourcentage"},{"stat":"AttackSpeed","valeur":0.15,"type":"plat"}]},
  "Musketeer": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Attaque +5 %","bonus":[{"stat":"Attack","valeur":0.05,"type":"pourcentage"}]},
  "Monk": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Quantité de soins reçus +5 %","bonus":[{"stat":"HealTakenAmp","valeur":0.05,"type":"pourcentage"}]},
  "Druid": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Soin prodigué +5%","bonus":[{"stat":"HealGivenAmp","valeur":0.05,"type":"pourcentage"}]},
  "Noble": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Charge initiale -1 s","bonus":[{"stat":"InitialFocusInSecondsBonus","valeur":1,"type":"plat"}]},
  "Scientist": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Points de vie +5 %","bonus":[{"stat":"MaxHitPoints","valeur":0.05,"type":"pourcentage"}]},
  "Ronin": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"DÉG uniques +7,5 % et Chances de coup critique +5 %","bonus":[{"stat":"SingleTargetDamageAmp","valeur":0.075,"type":"pourcentage"},{"stat":"CritChance","valeur":0.05,"type":"pourcentage"}]},
  "Worker": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Défense +15","bonus":[{"stat":"Defense","valeur":15,"type":"plat"}]},
  "Bard": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Quantité de soins reçus +2,5 %","bonus":[{"stat":"HealTakenAmp","valeur":0.025,"type":"pourcentage"}]},
  "Occultist": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts sur la durée infligés +7,5%","bonus":[{"stat":"DotDamageAmp","valeur":0.075,"type":"pourcentage"}]},
  "Knight": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Attaque +5% et Défense +5%","bonus":[{"stat":"Attack","valeur":0.05,"type":"pourcentage"},{"stat":"Defense","valeur":0.05,"type":"pourcentage"}]},
  "Hussar": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Points de bouclier reçus +7,5%","bonus":[{"stat":"ShieldTakenAmp","valeur":0.075,"type":"pourcentage"}]},
  "Gladiator": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts critiques infligés +10%","bonus":[{"stat":"CritDamage","valeur":0.1,"type":"pourcentage"}]},
  "Centurion": {"pieces":3,"emplacements":["Hat","Neck","Ring"],"effet":"Dégâts d’attaque de base infligés +10%","bonus":[{"stat":"BasicAttackDamageAmp","valeur":0.1,"type":"pourcentage"}]},
  "Warrior": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Attaque +2,5 %","bonus":[{"stat":"Attack","valeur":0.025,"type":"pourcentage"}]},
  "Shaman": {"pieces":2,"emplacements":["Garment","Hand"],"effet":"Points de vie +2,5 %","bonus":[{"stat":"MaxHitPoints","valeur":0.025,"type":"pourcentage"}]}
};
