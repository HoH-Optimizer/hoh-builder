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

**Si vous ne lisez que deux sections, lisez le §9 et le §13.** Les nœuds de panthéon affichent
la puissance qu'ils feraient gagner AVANT qu'on les active : c'est la dérivée
partielle de la puissance, statistique par statistique, et c'est gratuit. Cette
seule découverte a réfuté deux conclusions antérieures de ce fichier.

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
- ~~**La caserne d'un héros de CAVALERIE n'a jamais été vérifiée.**~~ Vérifiée le
  19/08/2026 sur Mian Tansen (cavalerie, niveau 60) : avec 518 ATQ et 518 DÉF,
  le site tombe à +1 et +3 du jeu, soit le biais ordinaire. La cavalerie donne
  donc bien la même chose que les trois autres armes.
- ~~**Le panthéon n'est relevé que pour les attaquants individuels.**~~ Trois
  classes sur six sont désormais relevées : attaquants individuels, attaquants
  de zone, soigneurs. Marie Curie retombe au point près sur ses 762 de dégâts
  de base. **Manquent : défenseurs, manipulateurs, soutiens.**
- ~~**Les dégâts de base de 128 héros.**~~ Résolu : ils valent 90, par la règle
  du §5. Ce n'était pas une donnée manquante mais une règle du jeu.
- **Le biais sur attaque et défense**, et il est moins simple qu'on croyait.
  Sur les neuf héros contrôlés le 19/08/2026, il vaut le plus souvent +1 à +4
  points (le site surestime), comme dit depuis le début. Mais **deux héros
  sortent du lot, et dans l'AUTRE sens** : Jules César est 7 points trop bas en
  défense, Marie Curie 14 points trop bas en attaque. Ce n'est donc pas un simple
  arrondi. Les points de vie et les dégâts de base, eux, tombent à un point près
  sur les neuf héros.

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

> **ATTENTION — CETTE CONCLUSION EST FAUSSE. Voir le §8.** La mesure directe,
> nœud de panthéon par nœud de panthéon, donne un exposant de **½** sur les
> dégâts de base, pas ¼. La régression ci-dessous se trompait parce que les
> dégâts de base et la vitesse d'attaque sont liés (§5) et jouent en sens
> inverse. Ce qui suit est conservé parce qu'il explique comment on s'est
> fourvoyé, pas parce qu'il faut le croire.

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
La vitesse d'attaque a été testée : aucune relation propre.

**À relire avec le §5 en main.** On sait maintenant qu'au niveau 1 les dégâts de
base valent 90 divisé par la vitesse d'attaque : ce sont deux écritures de la
même grandeur. Le "trend en dégâts de base" ci-dessus et le "rien en vitesse
d'attaque" portaient donc sur la même chose, mesurée une fois au niveau 1 et une
fois au niveau du héros — et c'est le NIVEAU qui les sépare, puisque les dégâts
montent de 4 % par niveau et la vitesse pas du tout. Ce qui suit reste donc à
chercher, mais en sachant que la vitesse n'est pas une piste indépendante.

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

Pour Hatchepsout, les dégâts sont calculés avec la base **90**. Cette valeur,
d'abord relevée chez Forge of Games, est depuis établie par la règle du §5 :
sa vitesse d'attaque vaut 1, donc ses dégâts de base valent 90.

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

**Pour la suite, il faut quatre ou cinq mesures de plus.** Le terme restant
(§2.d) se cache du côté de la portée, de la vitesse, ou d'autre chose. Bons
candidats : Robin des Bois et Guillaume Tell (à distance, 126 et 99 de dégâts de
base), Miyamoto Musashi et William Wallace (mêlée, 45 et 117).

Et **au moins deux héros de vitesse 1** — donc de dégâts de base 90 —, l'un à
distance et l'autre en mêlée. Eux seuls permettent de faire varier la portée
sans toucher aux dégâts de base, puisque les deux sont liés au niveau 1 (§5).
Tous les héros de Thomas sauf onze sont dans ce cas : le choix est large.

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

### Écrans d'amélioration relevés le 19/08/2026

Ces cinq-là viennent de l'écran d'amélioration (ou d'ascension), qui donne d'un
coup les quatre statistiques principales ET la puissance. Deux minutes par héros.

| Héros | Niveau | Puissance | ATQ | DÉF | PV | Dég. base |
|---|---|---|---|---|---|---|
| Jules César | 111 | 15 211 | 1 495 | 1 775 | 21 884 | 553 |
| Léonard de Vinci | 110 | 14 815 | 1 716 | 1 555 | 17 592 | 571 |
| Ulysse | 100 | 13 488 | 1 646 | 1 464 | 15 810 | 566 |
| Mian Tansen | 60 | 6 921 | 947 | 1 307 | 12 174 | 368 |
| Miyamoto Musashi | 50 | 4 995 | 1 268 | 843 | 10 070 | 144 |

Ce que ce relevé a servi à établir :

- **les dégâts de base déduits au §5 sont justes.** Quatre de ces cinq héros
  (tous sauf Musashi) n'avaient PAS la statistique au catalogue : le site part
  de 90 et retombe sur le jeu à un point près, deux fois exactement.
- **la caserne de cavalerie vaut bien 518**, par Mian Tansen — c'était le dernier
  type d'unité jamais vérifié.
- **l'assiette d'un bonus d'ensemble dépend de la TAILLE de l'ensemble**, par
  Mian Tansen encore : le détail et les chiffres sont dans `formules.js`.

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

## 5. Les dégâts de base des 128 héros — RÉSOLU

C'était le premier point de la liste ci-dessous, et il est levé. **Les 144 héros
ont maintenant des dégâts de base**, et les 128 qui manquaient ne sont pas
estimés : ils se lisent dans une règle du jeu, confirmée deux fois contre le jeu.

### D'où vient la donnée

[forgeofgames.com](https://forgeofgames.com/) rediffuse le catalogue du jeu tel
quel, sur l'adresse que `tools/catalogue.js` utilisait déjà :

```
GET https://forgeofgames.com/api/hoh/coreData
→ { version, data }   data = protobuf en base64, ~4,4 Mo
```

Un seul appel a été fait, le blob est gardé dans `data/coreData.json` (ignoré par
git), et rien de ce qui concerne des joueurs n'a été touché — les règles posées
pour cette récupération ont été tenues.

### Ce que le catalogue dit vraiment

Surprise : **la donnée n'y est pas**. La statistique 11 (`BaseDamage`) n'est
écrite que pour 16 héros sur 144, exactement les 16 qu'on connaissait déjà. Ce
n'était donc pas un problème de décodage : Forge of Games n'a pas la donnée non
plus, il la **déduit** — et voici comment.

### La règle : 90 dégâts par seconde, pour tout le monde

Sur les 16 héros qui portent la statistique, le produit
`dégâts de base × vitesse d'attaque` vaut **90**, sans une exception :

| Héros | Dégâts | Vitesse | Produit |
|---|---|---|---|
| Ada Lovelace légendaire | 36 | 2,5 | 90 |
| Miyamoto Musashi | 45 | 2 | 90 |
| Cléopâtre | 54 | 1,667 | 90 |
| Tomoe Gozen · Spartacus | 72 | 1,25 | 90 |
| Artémise I de Carie | 81 | 1,111 | 90 |
| Guillaume Tell · Candace | 99 | 0,909 | 90 |
| Boadicée · Freydís | 108 | 0,833 | 90 |
| Wallace · Ashoka | 117 | 0,769 | 90 |
| Robin des Bois | 126 | 0,714 | 90 |

Et le sens de lecture est net : la vitesse stockée est **exactement 90 divisé par
les dégâts** (2 pour 45 ; 1,25 pour 72 ; 0,769230… pour 117). Ce sont les dégâts
que le jeu fixe, un entier rond, et la vitesse qui en découle.

Autrement dit : **au niveau 1, tout héros inflige 90 points de dégâts par
seconde.** Seul le découpage change — un coup lourd et lent, ou plusieurs coups
légers et rapides. Le catalogue n'écrit la statistique que lorsque le héros
s'écarte du coup unique par seconde.

Les **128 héros sans la statistique ont tous une vitesse d'attaque de 1**, sans
exception. Leurs dégâts de base valent donc 90.

### Les deux vérifications contre le jeu

La règle n'est pas seulement cohérente avec elle-même : elle est vraie.

1. **Hatchepsout.** Sa vitesse vaut 1, la règle donne 90 — et c'est le chiffre
   que Forge of Games affiche pour elle, relevé indépendamment avant que la règle
   ne soit trouvée. C'est aussi le 90 déjà utilisé au §3.

2. **Marie Curie, et c'est la preuve décisive.** Ses dégâts de base ne figuraient
   pas au catalogue ; le jeu affiche **762** sur sa fiche. En repassant tout le
   site — niveau 134, ascensions, éveil, caserne, relique, équipement — avec 90
   comme point de départ, on obtient **730**. L'écart est de **32**, soit
   exactement l'apport de panthéon qu'on lui connaît déjà et qui n'est pas encore
   codé (§1 : « Marie Curie perd +32 de dégâts de base »). 730 + 32 = 762,
   au point près.

   Les onze héros dont les dégâts venaient du catalogue tombent tous à zéro
   d'écart dans le même contrôle : la chaîne de calcul est saine, et le seul
   chiffre nouveau se comporte comme les onze anciens.

### Ce qui a changé dans le code

`tools/catalogue.js` applique désormais la règle en générant `heros-jeu.js` :
un héros sans statistique 11 reçoit `90 / vitesse d'attaque`. Les 128 entrées ont
été remplies. Le garde-fou du site qui écrivait « ? » à la place d'un total faux
reste en place, mais ne se déclenche plus.

### La conséquence pour la formule de puissance

Elle est importante et il ne faut pas la manquer : **au niveau 1, les dégâts de
base et la vitesse d'attaque ne sont pas deux variables, mais une seule.**

```
dégâts de base = 90 / vitesse d'attaque
```

Le §2.d disait avoir testé la vitesse d'attaque sans y trouver « aucune relation
propre », tout en établissant que les dégâts de base entrent en racine
quatrième. Les deux constats portaient sur la même grandeur. Ils ne se
contredisent pas pour autant — parce que les dégâts de base MONTENT avec le
niveau (4 % par niveau) alors que la vitesse ne bouge que sous l'effet de
l'équipement : au-delà du niveau 1, les deux se séparent. Mais toute lecture
future doit distinguer **les dégâts de base au niveau 1** (qui ne sont que la
vitesse déguisée) des **dégâts de base courants** (qui portent le niveau).

Le protocole du §3 en hérite : choisir des candidats « pour opposer portée et
vitesse » revient à les choisir pour opposer portée et dégâts de base au niveau 1.
Robin des Bois (126 / 0,714) contre Guillaume Tell (99 / 0,909) opposent bien les
deux ; il faut leur adjoindre deux héros de vitesse 1, donc de dégâts 90, pour
que la portée varie seule.

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

~~Récupérer les 128 dégâts de base manquants~~ — **fait** (§5). Les 144 héros
ont leur valeur ; la formule de puissance peut maintenant se tester sur les 98
héros de Thomas et plus seulement sur 11.

1. **Photographier l'écran d'amélioration AVANT chaque montée de niveau** (§13).
   C'est gratuit et c'est une mesure complète : les quatre statistiques, leurs
   gains, la puissance et son gain. Viser les **ascensions sur les héros de bas
   niveau**, où les statistiques bougent de 8 à 11 % — dix fois plus précis
   qu'une montée d'un niveau sur un gros héros.
   La constante D y est déjà mesurée à 1 383 ± 4 ; ce qui reste à cerner est le
   facteur propre à chaque héros, encore mêlé à la capacité et à la rareté.

   Réglé, ne plus demander : la portée ne compte pour rien (§8), et la vitesse
   d'attaque a été mesurée hors de 1 sur Wallace (§10).
2. **Relever le panthéon des trois classes qui restent** : défenseurs,
   manipulateurs, soutiens. Même manipulation, et elle rapporte double —
   l'arbre pour le site, les gains de puissance pour la formule.
3. **Capturer « Stats de profil » d'Hatchepsout** pour lever la contradiction
   sur les coefficients de progression (§1).
4. **Comprendre les deux écarts d'attaque/défense** hors norme (§1) : Jules César
   −7 en défense, Marie Curie −14 en attaque, là où les sept autres héros
   contrôlés tiennent dans les 4 points.
5. **Les mesures avec/sans équipement** (§3) passent en dernier : le §8 fait
   mieux, plus proprement.

**Le principe qui a tout fait avancer, à ne pas lâcher :** ne rien deviner. Une
valeur inconnue reste inconnue ; une règle non mesurée n'est pas codée. Les deux
seules règles inscrites dans `formules.js` cette semaine l'ont été parce que
deux héros indépendants tombaient au point près, et parce qu'un troisième —
Artémise — servait de témoin contradictoire.

---

## 8. Les nœuds de panthéon : l'expérience décisive

C'est la meilleure source de mesure trouvée jusqu'ici, meilleure encore que le
protocole avec/sans équipement du §3 — et elle est, elle aussi, entièrement
gratuite.

### Le principe

Dans l'arbre de panthéon, **survoler un nœud sans l'activer affiche la puissance
que le héros gagnerait s'il l'activait**. Or un nœud ne change qu'UNE chose, et
on sait exactement laquelle et de combien.

**PIÈGE DE LECTURE, ET IL A MORDU.** Le nombre affiché en haut à droite de cet
écran n'est PAS la puissance du héros : c'est sa puissance **sans le panthéon**.
Le « +N » vert à côté est ce que le panthéon lui apporte — celui déjà activé, plus
le nœud survolé s'il ne l'est pas encore.

Sur Marie Curie, l'écran dit « 19 620 +1 518 » : sa vraie puissance est
**21 138**, et c'est bien ce que porte sa carte (§4). Confondre les deux la faisait
paraître 8 % au-dessus du modèle, alors qu'elle est à 0,8 %.

Cela ne change rien aux mesures qui suivent : Léonard, Hatchepsout et Wallace
n'ont AUCUN nœud activé, donc chez eux le nombre affiché est bien la puissance
entière, et le « +N » au survol est bien le gain du seul nœud survolé. Mais il
faudra y penser au prochain héros qui, lui, aura des nœuds.

C'est donc la dérivée partielle de la puissance par rapport à chaque
statistique, sur un seul et même héros, tout le reste rigoureusement identique.
Là où le protocole du §3 bouge cinq statistiques à la fois, celui-ci n'en bouge
qu'une.

Relevé le 19/08/2026 sur deux héros de niveau 110, de classes et d'armes
différentes : **Léonard de Vinci** (attaquant de zone, siège, puissance 14 815) et **Hatchepsout** (soigneuse, cavalerie, 17 700).

### Ce qui compte, et ce qui ne compte pas

Premier résultat, et il est catégorique. Sur les vingt-deux nœuds de chaque
arbre, **onze ne bougent la puissance d'aucun point**. La liste est nette :

| Ne change RIEN à la puissance | Change la puissance |
|---|---|
| Dégâts de zone +10 % | Attaque |
| Dégâts d'attaque de base +5 % | Défense |
| Soins reçus +10 % | Points de vie |
| Bouclier reçu +10 % | Dégâts de base |
| Vitesse de déplacement +10 % | Chances de coup critique |
| Charge initiale −1 s | Dégâts critiques |
| les huit effets conditionnels de combat | Vitesse d'attaque |
| | Esquive |

**Huit grandeurs, pas une de plus.** Les amplifications d'équipement et de
relique comptent, mais seulement parce qu'elles font monter l'attaque et la
défense.

Deux conséquences immédiates :

- **La charge (le « focus ») n'entre pas dans la puissance.** Le nœud « Esprit
  vif » offre une seconde de charge initiale et ne rapporte rien. Le terme
  `capacitéFocus` du document communautaire était déjà inerte au §2.a ; il est
  maintenant réfuté sur pièce.
- **Ni les dégâts de zone, ni les dégâts d'attaque de base n'entrent.** La
  classe du héros ne peut donc pas agir par ce chemin-là.

### Les mesures brutes

Gain de puissance affiché, nœud par nœud :

| Nœud | Ce qu'il change | Léonard (14 815) | Hatchepsout (17 700) |
|---|---|---|---|
| Précision mortelle | Chances de crit +5 points | +188 | +198 |
| Tranchant létal | Dégâts crit +20 points | +74 | +79 |
| Assaut éclair | Vitesse d'attaque +3 coups/min | +88 | +87 |
| Pas fantôme | Esquive +5 points | **+347** | **+423** |
| Puissance brute | Dégâts de base +5 % | +311 | +358 |
| Équipement affûté | +50 % de l'ATQ d'équipement | +424 | +97 |
| Équipement renforcé | +50 % de la DÉF d'équipement | +144 | +221 |
| Fureur de Reliques | +50 % de l'ATQ de relique | +116 | +134 |
| Rempart de Reliques | +50 % de la DÉF de relique | +80 | +211 |
| Ascension de force | Attaque +1 % | +36 | — |
| Ascension de fer | Défense +1 % | — | +47 |
| Ascension de vitalité | Points de vie +1 % | +47 | +40 |

À noter au passage, pour le jeu et non pour la formule : **l'esquive est le
meilleur nœud des deux arbres**, devant +50 % d'attaque d'équipement.

### Les exposants, mesurés directement

En rapportant chaque gain de puissance à la variation relative qu'il provoque
(`exposant = ln(1 + Δpuissance/puissance) / ln(1 + Δstat/stat)`) :

| Grandeur | Léonard | Hatchepsout |
|---|---|---|
| Attaque | 0,455 | — |
| Défense | — | 0,460 |
| Points de vie | 0,494 | 0,475 |
| Dégâts de base | **0,452** | **0,460** |
| Facteur de crit | 0,523 · 0,513 | — |
| Facteur d'esquive | 0,451 | 0,460 |

Tout se tient entre 0,45 et 0,52, c'est-à-dire **autour de ½** — et le §9 dira
pourquoi ce n'est pas ½ tout rond : une constante s'ajoute à la puissance et
dilue les exposants. Les vrais valent bien ½.

Deux précisions de lecture :

- le **facteur de crit** vaut `1 + chances × (dégâts crit − 1)`. Les deux nœuds
  de crit, qui touchent chacun un facteur différent, donnent le même exposant —
  la forme du facteur est donc juste, et pas seulement son exposant ;
- le **facteur d'esquive** vaut `1 / (1 − esquive)`.

### Ce que cela corrige : l'exposant ¼ du §2.c est FAUX

Le §2.c concluait, par régression sur onze héros, que les dégâts de base
entraient sous une racine **quatrième**. La mesure directe dit **½**, sur deux
héros et sans ambiguïté.

Et l'on sait maintenant pourquoi la régression se trompait. Le §5 a établi qu'au
niveau 1, `dégâts de base = 90 / vitesse d'attaque` : les deux grandeurs sont
liées. Or la vitesse d'attaque entre elle aussi dans la puissance. En comparant
des héros entre eux, on faisait donc varier les dégâts ET la vitesse en sens
inverse, et l'effet de la vitesse rognait l'exposant apparent des dégâts. La
régression mesurait la somme des deux effets, pas celui des dégâts seuls.

**C'est exactement le piège que le §5 annonçait, et il avait déjà mordu.** La
leçon vaut d'être retenue : sur ce jeu, comparer des héros entre eux est
trompeur ; il faut faire bouger une chose à la fois sur un seul héros.

### La vitesse d'attaque : un poids faible, et une piste

La vitesse d'attaque donne un exposant apparent de **0,12** (Léonard) et
**0,10** (Hatchepsout) — bien plus faible que les autres. **Le §9 a levé la
contradiction qui suit** : une fois la constante ajoutée au modèle, l'ajustement
entre héros ne réclame plus 0,42 mais 0,20, et rejoint donc ces mesures-ci. Ce n'est pas anodin :
le document communautaire ne la met pas au même rang que les autres, il la range
dans un facteur de combat **ADDITIF** :

```
facteurCombat = vitesseATQ × (1 + 0,0168 × (portée − 1,25)) + capacitéFocus
```

Un terme additif dilue l'effet, ce qui expliquerait un exposant apparent faible.
Le calcul sur Léonard donne +97 attendus contre +88 mesurés : la structure tient
à peu près, mais `capacitéFocus` est réfuté (voir plus haut) et doit être
remplacé par autre chose.

### Ce qu'il faut faire de cette découverte

C'est le chantier à ouvrir en premier, et il ne coûte rien : **survoler les
nœuds, relever les nombres**. Chaque héros survolé rapporte jusqu'à onze
équations.

Le mieux serait deux ou trois héros de plus, choisis pour **opposer la portée**
à statistiques comparables — puisque c'est le seul terme du facteur de combat
qui n'a pas encore été mis à l'épreuve. Un héros de mêlée (portée 1,25) et un
héros de portée intermédiaire (Mian Tansen 2,5, Ulysse 3,5) suffiraient à
trancher.

---

## 9. La capacité, et la constante cachée

Deux découvertes du soir du 19/08/2026, dont l'une réconcilie tout ce qui
précède.

### L'expérience de Thomas : monter la capacité d'un cran à la fois

La capacité n'entre dans AUCUNE statistique (§4). Monter d'un niveau de capacité
ne change donc rien d'autre que la puissance : c'est une expérience aussi propre
que le survol des nœuds, et elle porte sur la seule grandeur que le panthéon ne
sait pas toucher.

| Héros | Capacité | Gains successifs |
|---|---|---|
| Mérérouka | 1 → 5 | +10 · +11 · +10 · +10 |
| Ada Lovelace | 1 → 5 | +11 · +12 · +11 · +11 |
| Nitocris | 24 → 25 | +10 |
| Ulysse | 29 → 30 | +36 |

**Le pas ne s'emballe pas.** Quatre crans d'affilée sur deux héros, et le gain
reste le même à l'arrondi près. La capacité entre donc **linéairement** :

```
puissance = A + B x capacité
```

où B est propre au héros. Fin de la question posée depuis le début : la capacité
compte bel et bien, et on sait maintenant sous quelle forme.

### Six héros choisis pour démêler ce qui était noué

Le §8 butait sur une contradiction : le survol des nœuds donnait un exposant de
0,12 à la vitesse d'attaque, l'ajustement entre héros en réclamait 0,42. Et le
terme de capacité, ajouté à l'ajustement, l'aggravait au lieu de l'améliorer.

La cause était mesurable. Sur les seize héros dont la puissance était connue :

| | corrélation |
|---|---|
| niveau ↔ capacité | +0,94 |
| niveau ↔ rareté | +0,96 |
| capacité ↔ rareté | +0,97 |

**Ces trois grandeurs étaient la même chose.** Aucun ajustement ne pouvait les
séparer, et en ajouter d'autres héros semblables n'y aurait rien changé.

Six héros du compte ont donc été relevés exprès pour casser ce nœud — choisis
par paires de même niveau et de capacités opposées :

| Héros | ★ | Niveau | Capacité | Puissance | ATQ | DÉF | PV | Dég. base |
|---|---|---|---|---|---|---|---|---|
| Ada Blackjack | 4 | 20 | 25 | 3 306 | 724 | 745 | 7 673 | 164 |
| Mérérouka | 2 | 20 | 5 | 2 979 | 687 | 880 | 7 577 | 164 |
| Nitocris | 4 | 30 | 25 | 4 069 | 852 | 848 | 8 432 | 211 |
| Ada Lovelace | 3 | 30 | 5 | 3 635 | 968 | 800 | 7 976 | 206 |
| Toutânkhamon | 5 | 40 | 18 | 5 086 | 868 | 1 058 | 10 753 | 250 |
| Mansa Moussa | 3 | 40 | 1 | 4 313 | 880 | 858 | 10 998 | 247 |

(Les quatre statistiques tombent toutes à deux points près sur le calcul du
site : la chaîne est saine sur ces héros aussi, du niveau 20 au niveau 40.)

Corrélations sur les 22 héros : niveau ↔ capacité tombe de 0,94 à **0,67**,
niveau ↔ rareté de 0,96 à **0,78**. Le nœud est desserré.

### La constante cachée

Et alors le résidu s'est mis à parler. Trié, il suit le **niveau**, à l'envers :

| | terme exigé |
|---|---|
| Ada Blackjack, niveau 20 | +34 % |
| Nitocris, niveau 30 | +20 % |
| Mérérouka, niveau 20 | +15 % |
| … | … |
| Jules César, niveau 111 | −10 % |
| William Wallace, niveau 110 | −11 % |
| Ulysse, niveau 100 | −17 % |

Les petits héros exigent trop, les gros pas assez. C'est la signature d'une
**constante ajoutée** : quand on la néglige, elle pèse lourd sur une petite
puissance et disparaît dans une grande.

```
puissance = C x racine(ATQ x DÉF x PV x DÉG x fCrit x fEsq) x vitesse^a
            x (1 + k x (capacité − 1))   +   D
```

Ajustée sur les 22 héros : **C = 0,00234 · D = 989 · a = 0,20 · k = 0,0024**.
Le terme de portée s'ajuste à **exactement zéro**, ce qui confirme le §8.

### Pourquoi cette constante est vraie, et pas un artifice d'ajustement

C'est le point important, et il tient à une vérification croisée.

Si chaque statistique entre en exposant ½ ET qu'une constante s'ajoute, alors
faire varier une seule statistique de 1 % ne change pas la puissance de 0,5 %
mais de **(P − D) / 2P** — moins, et d'autant moins que le héros est petit.

Or c'est exactement ce que le §8 avait mesuré, sans le comprendre : les
exposants apparents valaient 0,45 à 0,49 au lieu de ½.

| | prédit par la constante | mesuré au panthéon |
|---|---|---|
| Léonard de Vinci | 0,4666 | 0,4670 |
| Hatchepsout | 0,4721 | 0,4650 |

**0,1 % et −1,5 % d'écart.** La constante vient de l'ajustement sur 22
puissances ; les exposants viennent du survol des nœuds, mesuré séparément et
avant. Les deux tombent ensemble.

Trois choses s'expliquent d'un coup :

1. **Les exposants sont bien ½**, comme le disait le document d'origine. Ils
   paraissaient plus bas parce que la constante les diluait.
2. **La vitesse d'attaque** passe de 0,42 (ancien ajustement) à **0,20**, et
   rejoint le 0,10-0,12 mesuré au panthéon. La contradiction du §8 est levée.
3. **Le résidu qui suivait le niveau** disparaît : ce n'était pas le niveau, mais
   la taille du héros face à une constante.

### Où l'on en est, et ce qui manque

| Modèle | Dispersion |
|---|---|
| Document d'origine, exposant ½ partout | 1,62 |
| + terme de vitesse | 1,26 |
| **+ constante + capacité (ci-dessus)** | **1,21** |

Le pire héros reste à **13 %**. Ce n'est pas utilisable dans le site, et ça ne le
sera pas tant qu'on n'aura pas trouvé ce qui reste. Les plus mal expliqués sont
Spartacus (+12,9 %), Hatchepsout (+12,6 %) et Miyamoto Musashi (+10,7 %) d'un
côté, Freydís (−7,0 %) et William Wallace (−6,9 %) de l'autre.

**Ce qu'il faut mesurer ensuite**, et rien d'autre :

1. **Le survol des nœuds sur un héros de vitesse ≠ 1** — Musashi (2,0), Robin des
   Bois (0,71) ou Wallace (0,77). Chez Léonard et Hatchepsout la vitesse vaut 1,
   donc le terme `vitesse^a` y est inerte : il n'a jamais été mesuré directement
   ailleurs qu'au travers du nœud « Assaut éclair ».
2. **Deux ou trois crans de capacité de plus**, sur un héros de forte puissance.
   Le pas y est grand (36 chez Ulysse), donc lu sans arrondi gênant, et il
   contraint `k` bien mieux que les petits héros.
3. **Un héros à haute esquive ou à haut crit**, s'il en existe : les facteurs
   `fCrit` et `fEsq` ne varient presque pas dans l'échantillon actuel, et sont
   donc mal contraints.

---

## 10. William Wallace : le troisième survol, et l'exposant qui se stabilise

Le §9 réclamait une mesure et une seule : le survol des nœuds sur un héros dont
la **vitesse d'attaque n'est pas 1**. Léonard et Hatchepsout valent tous deux 1,
et le terme `vitesse^a` y était donc muet.

Relevé le 19/08/2026 au soir sur **William Wallace** — défenseur, infanterie,
niveau 110, puissance 14 843, **vitesse d'attaque 0,84**, dégâts de base 117.
Il apporte l'arbre des DÉFENSEURS au passage, quatrième classe sur six.

### Les onze gains

| Nœud | Ce qu'il change | Gain |
|---|---|---|
| Précision mortelle | Chances de crit +5 points | +176 |
| Tranchant létal | Dégâts crit +20 points | +65 |
| Assaut éclair | Vitesse d'attaque +3 coups/min | **+108** |
| Pas fantôme | Esquive +5 points | +349 |
| Puissance brute | Dégâts de base +5 % | +297 |
| Équipement affûté | +50 % de l'ATQ d'équipement | +104 |
| Équipement renforcé | +50 % de la DÉF d'équipement | +329 |
| Fureur de Reliques | +50 % de l'ATQ de relique | +77 |
| Rempart de Reliques | +50 % de la DÉF de relique | +98 |
| Ascension de fer | Défense +1 % | +39 |
| Ascension de vitalité | Points de vie +1 % | +48 |

Les onze autres nœuds ne rapportent rien, exactement comme sur les deux premiers
héros : la liste des huit grandeurs qui comptent (§8) tient sur trois classes.

### Le résultat, et il est net

En corrigeant chaque exposant apparent de la constante du §9
(`exposant vrai = exposant mesuré × P / (P − D)`, avec D = 989) :

| Grandeur | Léonard | Hatchepsout | Wallace |
|---|---|---|---|
| Attaque ou défense | 0,487 | 0,488 | 0,489 |
| Dégâts de base | 0,485 | 0,487 | 0,485 |
| Facteur de crit (par la chance) | 0,485 | 0,489 | 0,486 |
| Facteur de crit (par les dégâts) | 0,485 | 0,486 | 0,483 |
| Facteur d'esquive | 0,484 | 0,488 | 0,485 |
| **Vitesse d'attaque** | **0,130** | **0,106** | **0,135** |
| Points de vie | 0,529 | 0,365 · | 0,535 |

**Six grandeurs sur sept tombent entre 0,483 et 0,489**, sur trois héros de trois
classes, deux armes et deux vitesses différentes. Dix-huit mesures dans une
fourchette de 0,006. Ce n'est plus une tendance, c'est une constante.

Elle n'est pas tout à fait ½, et l'écart est trop régulier pour être du bruit :
il faudrait D ≈ 1 350 au lieu de 989 pour la ramener exactement à ½. Les trois
héros s'accordent sur ce D à 8 % près. **La constante est donc réelle et un peu
sous-estimée par l'ajustement entre héros.**

· Hatchepsout a un éveil de +3 775 PV, ce qui rend son pas de « Ascension de
vitalité » incertain : selon qu'on le prend avant ou après l'éveil, son exposant
de PV vaut 0,365 ou 0,503. Les deux autres héros n'ont pas d'éveil et ne
souffrent pas de cette ambiguïté.

### Ce que Wallace tranche sur la vitesse d'attaque

C'était l'objet de la mesure. À vitesse 0,84, l'exposant vaut **0,135** ; à
vitesse 1,00, il vaut 0,130 (Léonard) et 0,106 (Hatchepsout).

**Il ne dépend donc pas de la vitesse de base.** Un facteur de combat ADDITIF,
comme celui du document d'origine, aurait fait varier cet exposant avec la
vitesse — d'environ 16 % entre Wallace et Léonard, et dans l'autre sens. Ce n'est
pas ce qu'on observe.

À nuancer honnêtement : l'écart entre Léonard et Hatchepsout (0,130 contre
0,106) est de la même taille que l'effet cherché, alors qu'ils ont la MÊME
vitesse. Il y a donc une dispersion d'origine inconnue de cet ordre. Le résultat
penche pour une puissance simple `vitesse^0,12` et contre le facteur additif,
mais ne le démontre pas.

### Ce qui reste, et il faut être franc

Le modèle complet plafonne toujours :

| Modèle | Dispersion | Pire héros |
|---|---|---|
| Document d'origine | 1,62 | — |
| + vitesse | 1,26 | — |
| + constante + capacité (§9) | 1,21 | 13 % |
| + exposant de PV libre | 1,21 | 12 % |

**13 % d'erreur sur le pire héros, et ça ne bouge plus.** Les mal expliqués sont
toujours les mêmes : Spartacus (+12 %), Hatchepsout (+12 %) et Miyamoto Musashi
(+9 %) d'un côté, Robin des Bois, Freydís et Wallace (−7 %) de l'autre. Aucune
grandeur relevée jusqu'ici — classe, arme, rareté, éveil, portée — ne sépare ces
deux groupes.

Et il y a une contradiction ouverte : les points de vie mesurés au survol
demandent un exposant PLUS GRAND que ½ (0,53), là où l'ajustement entre héros en
réclame un plus PETIT (0,405). Les deux méthodes se contredisent sur cette seule
grandeur, alors qu'elles s'accordent sur les six autres.

**C'est là qu'il faut chercher.** La piste la plus économique : survoler les
nœuds d'un héros de BAS niveau — Ada Blackjack ou Nitocris. Chez eux la constante
pèse un tiers de la puissance au lieu d'un quinzième, donc la correction
`P/(P−D)` est trois fois plus forte et se mesure trois fois mieux. Un seul survol
donnerait D avec une précision hors d'atteinte des gros héros.

---

## 11. La formule est-elle publiée quelque part ? — non, et voici où l'on a cherché

Question légitime, posée le 19/08/2026 : plutôt que de tout remesurer, ne
pourrait-on pas trouver la formule déjà écrite par quelqu'un ? **Réponse : non.**
Le tour a été fait, et il est consigné ici pour ne pas être refait.

| Où | Ce qu'on y trouve |
|---|---|
| Support officiel InnoGames | Les mécaniques en prose — le niveau augmente attaque, défense et PV ; la capacité renforce l'effet ; l'avantage de couleur vaut 125 / 100 / 75 %. **Aucune formule.** |
| `heroesofhistory.wiki` | Wiki dédié au jeu. Héros, tier lists, équipement. **Rien sur le calcul de la puissance.** |
| Recherches communautaires | Les résultats renvoient vers d'AUTRES jeux (Hero Wars, Shop Titans), qui ont leurs propres formules, sans rapport. |
| Forge of Games | Le site communautaire le plus avancé. Sa fiche de héros donne les statistiques de base — et **n'affiche aucune puissance**. Son application est du Blazor **WebAssembly** : le code est compilé, donc illisible. Le configurateur d'équipement est derrière un mur publicitaire et demande d'importer un compte. |

Reste le document `heroes_of_history_raisonnement_calculs`, d'où part ce dossier.
C'est la seule formule publiée qu'on connaisse, et elle est **réfutée** : exposant
faux sur les dégâts de base, terme de focus inerte, terme de portée nul (§2, §8).

### Le point important

**On est désormais devant tout ce qui est publié**, et ce n'est pas de l'orgueil :
nos chiffres viennent du JEU, une variable à la fois. Toute formule communautaire
serait la rétro-ingénierie de quelqu'un d'autre — probablement celle-là même —, et
elle n'aurait pas les mesures qui l'ont corrigée : le survol des nœuds de panthéon
(§8), les paliers de capacité (§9), la constante (§9 et §10).

Il n'y a donc rien à aller chercher ailleurs. Ce qui reste s'obtient dans le jeu,
et nulle part autrement.

### Une seule chose reste à vérifier de ce côté

Le configurateur d'équipement de Forge of Games affiche peut-être une puissance —
un relevé ancien de ce dossier le laisse penser (« capacité 1 → 40 : 4 684 →
5 380 »). Il est derrière un mur publicitaire, donc non vérifiable ici.

**Si Thomas y a accès, la question à trancher est simple :** leur puissance
tombe-t-elle EXACTEMENT sur celle du jeu, pour un héros ou deux ? Si oui, leur
formule est juste et vaut la peine d'être obtenue. Si elle est à quelques pour
cent comme la nôtre, c'est un modèle approché de plus et il n'y a rien à y
gagner.

---

## 12. La puissance n'est PAS dans l'export — démonstration

Question posée deux fois, ce qui est sain : puisqu'on exporte tout le compte, la
puissance n'y serait-elle pas, quelque part ? La réponse est non, et voici
pourquoi on peut l'affirmer.

Une première recherche avait déjà conclu ainsi, mais elle cherchait **19 620**
pour Marie Curie — la mauvaise valeur (§8, le piège de lecture). Tout a été
refait avec les bons chiffres.

### Ce qui a été fouillé

Le fichier d'export contient deux blocs : `startup` (3,57 Mo, l'état du compte)
et `gameDesign` (quelques octets). Les deux ont été passés au crible **sur leurs
octets bruts**, sans passer par le décodeur — pour ne rien manquer de ce qu'il
pourrait ignorer.

Vingt-cinq puissances connues ont été cherchées, sous **six encodages** :
varint, flottant 32 bits, flottant 64 bits, entier fixe 32 bits, écriture en
toutes lettres, et multipliée par 10 ou par 100.

### Pourquoi l'absence est concluante

Le fichier fait trois millions et demi d'octets : un petit nombre s'y trouve par
pur hasard. Mesuré, sur des entiers tirés au sort :

| Plage | Trouvés par hasard |
|---|---|
| 1 000 – 5 000 | 59 % |
| 5 000 – 12 000 | 32 % |
| 12 000 – 25 000 | 12 % |

Une touche sur un petit nombre ne prouve donc rien. **Une absence sur un grand
nombre, elle, est significative** — et les neuf puissances à cinq chiffres sont
TOUTES absentes :

> Marie Curie 21 138 · Wallace 14 843 · Léonard 14 815 · Hatchepsout 17 700 ·
> Jules César 15 211 · Ulysse 13 488 · Ashoka 11 126 · Boadicée 10 417 ·
> Robin des Bois 9 672

Neuf absences quand une sur huit devrait apparaître au hasard. Et les rares
touches sur les petits nombres tombent dans des contextes sans rapport : celle de
Mérérouka (2 979) est coincée entre des lignes de quêtes et un compteur de graines
aléatoires.

Enfin, le mot lui-même n'apparaît nulle part comme champ : les trois occurrences
de « power » sont un texte promotionnel et deux noms de guilde (« Frauenpower »,
« Orange Power »), et les neuf de « rating » sont le milieu de
« RegeneratingTraitDataDTO ».

### Ce que cela signifie

**Le jeu calcule la puissance chez lui, à l'affichage, à partir des
statistiques.** Elle n'est jamais transmise ni stockée. C'est précisément ce qui
rend tout ce dossier nécessaire : il n'y a pas de raccourci, ni par l'export, ni
par un fichier de quelqu'un d'autre (§11).

**Ne pas reposer la question.** La seule façon d'obtenir une puissance reste de
la lire à l'écran.

---

## 13. L'écran d'amélioration mesure la constante — et il l'a toujours fait

Découverte du 19/08/2026 au soir, et elle est un peu vexante : **la mesure la
plus précise de la constante D était dans les captures depuis le matin**, sans
qu'on la voie.

### Ce que l'écran d'amélioration donne vraiment

Il affiche, ensemble, les quatre statistiques principales, **le gain de chacune**,
la puissance, **et le gain de puissance** :

```
Jules César    15 211  +127
  ATQ 1 495  +5      DÉF 1 775  +6
  PV 21 884  +110    DÉG   553  +3
```

C'est une expérience contrôlée complète. Si les quatre statistiques entrent en
racine et qu'une constante s'ajoute, alors pour une petite variation :

```
   Δpuissance / (puissance − D)  =  ½ × (ΔATQ/ATQ + ΔDÉF/DÉF + ΔPV/PV + ΔDÉG/DÉG)

   d'où     D  =  puissance  −  2 × Δpuissance / somme des variations
```

**Chaque montée de niveau donne donc D, à elle seule.** Onze écrans avaient été
relevés.

### Les onze mesures

L'incertitude vaut environ `1 / somme des variations` : un héros dont les
statistiques bougent beaucoup se lit précisément, un héros qui monte d'un seul
niveau ne se lit pas du tout. D'où la pondération.

| Héros | Variation | D mesuré | ± |
|---|---|---|---|
| Ada Blackjack | 10,66 % | 1 468 | 9 |
| Mérérouka | 9,56 % | 1 472 | 10 |
| Toutânkhamon | 8,56 % | 1 464 | 12 |
| Nitocris | 8,37 % | 1 296 | 12 |
| Ada Lovelace | 8,11 % | 1 340 | 12 |
| Mansa Moussa | 7,45 % | 1 359 | 13 |
| Miyamoto Musashi | 7,00 % | 1 511 | 14 |
| Mian Tansen | 6,01 % | 860 | 17 |
| Léonard de Vinci | 4,88 % | 1 506 | 20 |
| Ulysse | 1,91 % | 1 043 | 52 |
| Jules César | 1,72 % | 423 | 58 |

Les deux derniers ne montent que d'un niveau : leur gain de puissance est arrondi
à l'entier, et l'arrondi seul déplace D de plusieurs centaines. **Ils ne comptent
pas.** Les huit premiers, eux, s'accordent entre 1 296 et 1 511.

> **D = 1 383**, moyenne pondérée par la précision.

### Pourquoi c'est solide

Le §10 avait déduit D ≈ **1 350** d'un chemin totalement différent : les exposants
mesurés au survol des nœuds de panthéon valaient 0,485 au lieu de ½, et il fallait
cette constante-là pour expliquer l'écart.

Deux méthodes indépendantes, deux dispositifs de mesure sans rapport, **1 350 et
1 383**. La constante n'est plus une hypothèse d'ajustement : elle est mesurée.

Au passage, cela tranche contre le **1 018** que donnait l'ajustement sur les 22
puissances. L'ajustement se trompait, et on sait maintenant de combien.

### Ce que cela ne résout pas, et qu'il faut dire

Imposer D = 1 383 au modèle **n'améliore pas** l'accord entre héros — il l'empire
même un peu (11,8 % contre 9,7 % au pire). Et forcer en plus l'exposant de vitesse
à sa valeur mesurée (0,13 au lieu de 0,43) donne 14,8 %.

Ce n'est pas une contradiction, c'est un diagnostic : **les mesures locales sont
justes, et il manque au modèle un facteur propre à chaque héros.** Les dérivées
sont bonnes, la constante d'intégration ne l'est pas.

En retirant D = 1 383, le facteur qui reste s'étale de ×1,57 et suit :

| | corrélation |
|---|---|
| capacité | +0,62 |
| rareté | +0,61 |
| niveau | +0,58 |

Ces trois-là restent enchevêtrées, et la classe du héros n'explique rien
(±6 % d'une classe à l'autre, sur des effectifs de 2 à 8).

### La bonne façon de mesurer, désormais

**Chaque montée de niveau ou ascension est une mesure**, à condition de
photographier l'écran AVANT de valider. Et toutes ne se valent pas :

- une **ascension sur un héros de bas niveau** fait bouger les statistiques de
  8 à 11 % : c'est de loin la plus précise (Ada Blackjack, ± 9) ;
- une montée d'**un seul niveau sur un gros héros** ne vaut rien : ± 58.

Autrement dit, si Thomas fait monter des héros, **qu'il vise les petits, et par
ascension**.
