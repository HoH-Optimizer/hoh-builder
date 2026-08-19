# Journal de recherche — la formule de puissance

Ce fichier n'a rien à voir avec le site tel qu'il tourne. C'est le carnet de
laboratoire d'une enquête en cours : reconstituer la formule qui donne la
**puissance** d'un héros, ce nombre que le jeu affiche sous son nom et que
HOH Builder ne sait pas encore calculer.

Il est écrit pour être relu de zéro, dans six mois, par quelqu'un qui n'a rien
suivi — moi compris. Chaque chiffre qui s'y trouve a été relevé dans le jeu par
Thomas, jamais estimé.

**Les formules qui SERVENT au site sont dans `formules.js`, pas ici.** Ce qui
suit est ce qui n'a pas encore abouti.

---

## 1. Ce qui est établi, et qui tient

Ces points-là sont vérifiés contre le tableau « Stats de profil » du jeu, qui
donne le détail source par source. Ils sont déjà codés dans `formules.js`.

| Source | Règle | Précision constatée |
|---|---|---|
| Montée en niveau | `base × (1 + parNiveau × (niveau−1) + parAscension × ascensions)` | PV et dégâts de base au point près ; **attaque et défense 1 à 4 points TROP HAUT** |
| Éveil | `valeurNiveau × (1 + Σ%) + Σplat`, appliqué avant tout le reste | exact |
| Caserne | apport plat, identique pour tous les types d'unité | 518 ATQ / 518 DÉF / 4670 PV au palier de Thomas |
| Équipement, % d'objet | assiette = statistique de niveau seule | exact |
| Équipement, % d'ensemble | assiette = niveau **+ caserne + apport des objets**, **pour les PV uniquement** | exact sur deux héros |
| Statistiques qui SONT des % (crit, esquive) | ajoutent des points, ne multiplient pas | exact |

Le nombre d'**ascensions** vient du compte, jamais d'un calcul sur le niveau :
un héros niveau 160 en a quinze, pas seize. Forge of Games se trompe d'une
ascension sur ce point.

### Ce qui manque encore côté statistiques

- **La colonne ÉVEIL d'Hatchepsout.** Sans elle, impossible de lever une
  contradiction : à niveau égal (110), elle donnerait avec **11** ascensions un
  multiplicateur plus faible que William Wallace avec **10**. Impossible. Donc
  une donnée d'entrée est fausse — probablement l'idée que son éveil n'apporte
  rien à l'attaque. **Une capture de son « Stats de profil » suffit.**
- **La caserne d'un héros de CAVALERIE n'a jamais été vérifiée** contre le jeu.
  Infanterie, à distance et siège donnent tous 518 ; on suppose la cavalerie
  identique, sans preuve. C'est l'autre explication possible de la contradiction
  ci-dessus (Hatchepsout est cavalerie).
- **Le panthéon n'est relevé que pour les attaquants individuels.** Marie Curie,
  attaquante de zone, perd ainsi +126 d'attaque, +32 de dégâts de base,
  +10 % de dégâts de zone et +5 % de dégâts d'attaque de base.
- **Le biais de 1 à 4 points sur attaque et défense** est systématique et
  toujours dans le même sens (le site surestime). Il vaut 0,1 à 0,3 %.

---

## 2. La puissance : ce qui est RÉFUTÉ

Le point de départ était le document `heroes_of_history_raisonnement_calculs`,
qui propose :

```
Puissance = round(0,001218 × √(ATQ × DÉF × PV × facteurEsquive
                              × dégâtsDeBase × facteurCrit × facteurCombat))

facteurCombat   = portéeVitesse + capacitéFocus
portéeVitesse   = vitesseATQ × (1 + 0,0168 × (portée − 1,25))
capacitéFocus   = (multiplicateurRareté + (compétence − 1) × 0,025)
                  × (régénérationFocus / régénérationDeBase)

multiplicateurs de rareté : 2★ 0,90 · 3★ 1,35 · 4★ 1,75 · 5★ 2,03
```

**Cette formule ne reproduit la puissance d'aucun héros de Thomas.** Trois
constats, dans l'ordre où ils ont été établis.

### a) Le terme de focus est inerte

Il se normalise par `régénérationDeBase`, or les héros mesurés ont tous une
régénération égale à leur valeur de base : le terme vaut 1 pour tous et
n'explique rien.

### b) La classe n'est pas le bon découpage

Hypothèse de Thomas, testée : au sein d'un même groupe `frappeur individuel ·
à distance`, le terme exigé varie encore de 40 % (Robin des Bois 3,24 ·
Reine Boadicée 3,46 · Guillaume Tell 4,64). La classe seule ne suffit pas.

Le regroupement apparent qu'on croyait voir (le tank nettement sous les
attaquants de zone) était une coïncidence : le tank se trouvait avoir les plus
gros dégâts de base.

### c) Le vrai défaut : l'exposant des dégâts de base

En triant les onze héros mesurés par dégâts de base, le terme résiduel décroît
de façon monotone, **toutes classes confondues** :

| Héros | Dégâts de base | Terme exigé |
|---|---|---|
| Miyamoto Musashi | 144 | 8,43 |
| Candace de Nubie | 180 | 6,44 |
| Freydís Eiríksdóttir | 197 | 5,95 |
| Spartacus | 268 | 6,54 |
| Guillaume Tell | 271 | 4,64 |
| Tomoe Gozen | 305 | 5,73 |
| Artémise I de Carie | 305 | 4,00 |
| Reine Boadicée | 568 | 3,46 |
| Robin des Bois | 607 | 3,24 |
| Ashoka le Grand | 616 | 3,47 |
| William Wallace | 779 | 3,15 |

Régression en logarithmes : **exposant −0,56, corrélation −0,93**.

Traduction : les dégâts de base doivent entrer sous une racine **quatrième**,
pas sous la racine carrée.

```
document :  puissance ∝ √(ATQ × DÉF × PV × dégâts)
mesuré   :  puissance ∝ √(ATQ × DÉF × PV) × dégâts^¼
```

Cette seule correction fait tomber la dispersion du terme résiduel **de ×2,7 à
×1,4**. Le reste est là où la classe et la compétence doivent se loger.

### d) Le modèle retenu, et ce qui reste

Trois expériences avec/sans équipement (§3) permettent d'ajuster les exposants
exactement. Mais **cet ajustement ne généralise pas** : appliqué aux onze héros
dont on a la puissance absolue, il fait moins bien que la correction simple.
Surajustement caractéristique — trois équations, trois inconnues, aucun degré de
liberté.

Dispersion du terme résiduel sur les onze héros, du pire au meilleur :

| Modèle | Dispersion |
|---|---|
| Document, exposant ½ partout | ×1,62 |
| **√(ATQ × DÉF × PV) × dégâts^¼** | **×1,18** |
| Ajusté sur les trois rapports (0,782 / 0,271 / 0,327) | ×1,37 |

**Le modèle à retenir est donc le plus simple**, et il est déjà bon :

```
puissance ∝ √(ATQ × DÉF × PV) × dégâtsDeBase^¼ × (terme restant)
```

Le terme restant vaut de 0,0119 à 0,0140 selon le héros — 18 % d'amplitude — et
il montre une tendance nette à la **portée d'attaque**, pas à la classe :

| Portée | Héros | Terme |
|---|---|---|
| 6 (à distance) | Artémise · Guillaume Tell · Robin des Bois · Ashoka · Boadicée | 0,0119 → 0,0129 |
| 1,25 (mêlée) | Freydís · Candace · Wallace · Tomoe · Musashi · Spartacus | 0,0127 → 0,0140 |

Les deux groupes se chevauchent, donc la portée seule ne suffit pas non plus.
La vitesse d'attaque a été testée : aucune relation propre. **C'est là qu'il faut
chercher ensuite**, avec quatre ou cinq mesures avec/sans équipement de plus,
choisies pour opposer portée et vitesse.

---

## 3. Le bon protocole de mesure — trouvé par Thomas

C'est la découverte méthodologique de l'enquête, et il faut s'en servir pour la
suite.

Dans le jeu, **l'écran ÉQUIPEMENT affiche la puissance du héros sans son
équipement, et le bonus que l'équipement lui apporte**. On obtient donc deux
puissances du **même héros**.

Tout ce qu'on ne sait pas modéliser — classe, rareté, niveau de compétence,
focus, éveil — est **identique dans les deux états et disparaît dans le
rapport**. C'est une expérience contrôlée gratuite, sans rien changer dans le
jeu et sans dépenser la moindre ressource.

### Les trois mesures obtenues

| Héros | Sans équipement | Bonus | Avec | Rapport |
|---|---|---|---|---|
| William Wallace | 12 476 | +2 367 | 14 843 | 1,18972 |
| Tomoe Gozen | 7 387 | +696 | 8 083 | 1,09422 |
| Hatchepsout | 15 427 | +2 273 | 17 700 | 1,14734 |

Les totaux de Wallace et Tomoe retombent exactement sur les puissances lues sur
leur carte : les relevés sont cohérents entre eux.

Rapports des statistiques entre les deux états, tels que le site les calcule :

| | ATQ | DÉF | PV | Dégâts |
|---|---|---|---|---|
| Wallace | ×1,03203 | ×1,11015 | ×1,12254 | ×1,11660 |
| Tomoe | ×1,05615 | ×1,01087 | ×1,11641 | ×1,02800 |
| Hatchepsout | ×1,02452 | ×1,05775 | ×1,14549 | ×1,12260 |

Pour Hatchepsout, les dégâts sont calculés avec la base **90** relevée chez
Forge of Games (§5), son catalogue local ne la connaissant pas.

### Détail de la première mesure : Hatchepsout

```
puissance sans équipement : 15 427
bonus de l'équipement     : +2 273
puissance avec équipement : 17 700      rapport = 1,1473
```

Rapports des statistiques entre les deux états :

| | Rapport |
|---|---|
| Attaque | ×1,0245 |
| Défense | ×1,0578 |
| Points de vie | ×1,1455 |
| Vitesse, portée, crit | inchangés |

La formule du document prédit `√(1,0245 × 1,0578 × 1,1455)` = **1,1141**,
le jeu donne **1,1473**.

Et surtout : **le rapport des PV seuls (1,1455) est à 0,16 % du rapport de
puissance**. Sur ce héros, presque toute la puissance gagnée s'explique par les
points de vie — alors que la formule leur donne le même poids qu'à l'attaque et
à la défense. Les exposants ne sont donc pas tous ½.

Ce qui a été refait sur Tomoe et Wallace, dont les statistiques sont vérifiées
au point près contre le jeu — d'où les trois rapports du tableau ci-dessus.

**Pour la suite, il faut quatre ou cinq mesures de plus**, choisies pour opposer
la portée et la vitesse d'attaque : c'est là que se cache le terme restant
(§2.d). Bons candidats parmi les héros aux dégâts de base connus : Robin des
Bois et Guillaume Tell (à distance, vitesses très différentes), Miyamoto Musashi
et William Wallace (mêlée, du simple au double en vitesse).

---

## 4. Les mesures brutes

À ne pas perdre : chaque ligne a coûté une manipulation dans le jeu.

### Puissances relevées sur la carte du héros

| Héros | Classe · Type | ★ | Niveau | Compétence | Puissance |
|---|---|---|---|---|---|
| Tomoe Gozen | zone · infanterie | 4 | 70 | 25 | 8 083 |
| William Wallace | défenseur · infanterie | 5 | 110 | 37 | 14 843 |
| Artémise I de Carie | zone · à distance | 3 | 60 | 9 | 5 780 |
| Marie Curie | zone · siège | 5 | 134 | 40 | 21 138 |
| Robin des Bois | frappeur · à distance | 5 | 80 | 33 | 9 672 |
| Reine Boadicée | frappeur · à distance | 4 | 90 | 25 | 10 417 |
| Guillaume Tell | frappeur · à distance | 3 | 40 | 15 | 4 401 |
| Spartacus | frappeur · infanterie | 4 | 60 | 19 | 7 275 |
| Miyamoto Musashi | frappeur · infanterie | 3 | 50 | 13 | 4 995 |
| Candace de Nubie | frappeur · infanterie | 2 | 20 | 3 | 3 219 |
| Freydís Eiríksdóttir | frappeur · infanterie | 2 | 20 | 3 | 3 244 |
| Ashoka le Grand | soigneur · cavalerie | 3 | 81 | 32 | 11 126 |
| Hatchepsout | soigneur · cavalerie | 5 | 110 | 40 | 15 427 sans équipement, +2 273 |

### Statistiques relevées dans « Stats de profil »

Colonnes du jeu : STATS DE BASE · CASERNE · ÉVEIL · RELIQUES · ÉQUIPEMENT ·
PANTHÉON · AU TOTAL. **Il n'y a pas de colonne « compétence » : le niveau de
compétence ne joue AUCUN rôle dans les statistiques.** Il ne joue que sur la
puissance et sur ce que la capacité inflige.

| Héros | ATQ | DÉF | PV | Dég. base | dont équipement |
|---|---|---|---|---|---|
| Tomoe Gozen | 1 614 | 1 021 | 12 113 | 305 | ATQ 86 · DÉF 11 · PV 1 263 |
| William Wallace | 1 367 | 1 756 | 19 291 | 779 | ATQ 43 · DÉF 175 · PV 2 106 |
| Artémise I de Carie | 1 313 | 942 | 10 944 | 305 | ATQ 70 · DÉF 33 · PV 185 |
| Marie Curie | 2 278 | 1 731 | 18 229 | 762 | ATQ 308 · DÉF 64 · PV 70 |
| Hatchepsout | 1 555 | — | — | — | ATQ 38, relique 52 |

Détails utiles :
- Tomoe : crit 25 % (dont +20 % d'éveil), dégâts crit 155,4 %, 76 coups/min,
  charge 3,6 s / 12 s
- Wallace : crit 5 %, dégâts crit 154,1 %, 51 coups/min, charge 7,8 s / 12 s
- Artémise : crit 5 %, dégâts crit 150 %, 73 coups/min, charge 4,8 s / 12 s,
  portée 6, éveil +190 ATQ et +600 PV
- Marie Curie : 62 coups/min, charge 2 s / 8 s, portée 6, panthéon +126 ATQ

---

## 5. La source à exploiter : Forge of Games

[forgeofgames.com](https://forgeofgames.com/) publie une base de données de
héros qui **utilise exactement nos identifiants** (`HatshepsutLegendary`,
`MiyamotoMusashi`…).

### Calibration établie

Leurs fiches affichent la base **augmentée d'une caserne d'Âge de pierre** :

```
leur valeur = notre base + 40 (ATQ) + 40 (DÉF) + 400 (PV)
dégâts de base : AUCUN écart, leur valeur EST la nôtre
```

Vérifié sur Miyamoto Musashi (45 = 45), Achille et Hatchepsout légendaire.

### Le point d'entrée

```
GET https://forgeofgames.com/api/hoh/coreData
→ { version, data }   data = protobuf en base64, ~4,4 Mo
```

C'est l'appel que leur propre application fait au chargement. Le blob contient
bien les identifiants de héros (`TomoeGozen`, `HatshepsutLegendary`…) ; les
noms de champs, eux, sont absents — c'est du protobuf sans schéma, **la même
famille que l'export du jeu que `decodeur.js` sait déjà lire**.

**Pierre de Rosette pour le décodage** : les 16 héros dont nous connaissons
déjà les dégâts de base (Musashi 45, Tomoe 72, Wallace 117, Artémise 81,
Guillaume Tell 99, Robin des Bois 126, Boadicée 108, Freydís 108,
Candace 99, Spartacus 72…). Chercher le champ qui porte ces valeurs près de ces
identifiants donne la correspondance pour les 128 autres.

**Règles que Thomas a posées pour cette récupération** : un seul appel, rien qui
concerne des joueurs (ni profils, ni combats, ni classements), résultat gardé en
local, crédit ajouté au README à côté des autres sources communautaires.

---

## 6. La double version des héros

Certains héros existent en deux exemplaires, l'ordinaire et l'évolué —
`Hatshepsut` / `HatshepsutLegendary`. L'évolué monte plus haut en niveau, sa
compétence va jusqu'à 40, et **ses statistiques de base sont différentes**
(Hatchepsout : 102 d'attaque en 4★, 117 en 5★).

Parfois le nom change aussi : *Naya of the Cave Clan* ★★ devient
*Naya Wildwalker* ★★★★.

**Le site gère déjà ce cas correctement pour les héros possédés** : l'export du
compte porte les statistiques de la version réellement détenue. La double entrée
ne se voit que dans la liste, pour les héros qu'on ne possède pas.

Concernés au catalogue : `WilliamTell`, `Hatshepsut`, `AdaLovelace`,
`KingMinos`, `MiyamotoMusashi`, `TribalHealer`, `AshokaTheGreat`.

---

## 7. Prochaines étapes, par ordre d'utilité

1. **Récupérer les 128 dégâts de base manquants** depuis Forge of Games
   (§5). Débloque la colonne « ? » du tableau, et la formule de puissance qui ne
   pouvait être testée que sur 11 des 98 héros de Thomas.
2. **Quatre ou cinq mesures avec/sans équipement de plus** (§3), choisies pour
   opposer portée et vitesse, afin d'attaquer le terme restant (§2.d).
3. **Capturer « Stats de profil » d'Hatchepsout** pour lever la contradiction
   sur les coefficients de progression (§1).
4. **Relever le panthéon des attaquants de zone**, puis des autres classes.

**Le principe qui a tout fait avancer, à ne pas lâcher :** ne rien deviner. Une
valeur inconnue reste inconnue ; une règle non mesurée n'est pas codée. Les deux
seules règles inscrites dans `formules.js` cette semaine l'ont été parce que
deux héros indépendants tombaient au point près, et parce qu'un troisième —
Artémise — servait de témoin contradictoire.
