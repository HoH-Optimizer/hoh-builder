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

**Si vous ne lisez qu'une section, lisez le §8.** Les nœuds de panthéon affichent
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

1. **Survoler les nœuds de panthéon de deux ou trois héros de plus** (§8). C'est
   devenu de loin le meilleur rapport effort/résultat : gratuit, une seule
   statistique bouge à la fois, et chaque héros rapporte onze équations. Les
   choisir pour **opposer la portée** — un héros de mêlée, et Mian Tansen (2,5)
   ou Ulysse (3,5) — puisque c'est le dernier terme jamais mis à l'épreuve.
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

Tout se tient entre 0,45 et 0,52, c'est-à-dire **autour de ½**.

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
**0,10** (Hatchepsout) — bien plus faible que les autres. Ce n'est pas anodin :
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
