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

**LA FORMULE EST TROUVÉE. Elle est au §15**, telle que le jeu l'écrit dans ses
propres données. Le §14 raconte comment on l'a localisée. Tout ce qui précède
est le chemin — utile pour comprendre, mais dépassé sur le fond.

**Le §26 est le dernier état** : Marie Curie a été lue en entier — trois niveaux
consécutifs, son tableau « Stats de profil » complet, l'écran de sa caserne. Vingt
et un de ses vingt-deux nombres sont exacts, et le résidu de +13 sur sa puissance
est **plus petit que la résolution de l'écran** : l'intervalle compatible avec les
entiers affichés fait 23,7 points de large, et le jeu comme le site tombent dedans.
Ce n'est plus la formule qui manque de précision, c'est la mesure.

**Le §25** : le panthéon est mis hors de cause sur pièce, et
les dix-neuf puissances relevées sont enfin comptées ensemble — **dix-sept héros
sur vingt tiennent dans 0,15 %**, moyenne 0,048 %. Les trois qui restent ont
chacun une cause identifiée, et aucune n'est la formule. Deux pistes ouvertes ce
jour-là (l'escouade moyennée, la vitesse d'attaque boostée) ont été RÉFUTÉES par
ces dix-neuf relevés après avoir paru bonnes sur huit : le §25 dit pourquoi.
Il ne reste qu'UNE question ouverte : l'assiette du pourcentage d'une parure quand
un second ensemble donne aussi des points de vie (Ashoka et Hatchepsout). Une
capture la tranche, elle est nommée au §25.

**Le §16 était l'état précédent** : toutes les statistiques du catalogue portent
enfin un nom, les trois anomalies qui résistaient ont disparu, et l'erreur du
site est tombée à **0,38 % en moyenne** sur les 22 puissances relevées.

**Ancien avertissement, conservé :** Le §14 change
tout : la formule n'est pas à reconstituer, elle est ÉCRITE dans les données du
jeu, et l'on sait maintenant dans quel fichier. Les nœuds de panthéon affichent
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
- ~~**Le biais sur attaque et défense**, et ses deux héros hors norme.~~ Réglé
  le 19/08/2026 au soir, et la cause n'avait rien à voir avec un arrondi : le
  NIVEAU DE RELIQUE était mal lu. Le jeu plafonne ce niveau à 11 et range le
  surplus dans un champ à part ; une ancienne version de l'extension prenait ce
  surplus pour un nombre d'ÉTOILES. Achille était donc lu au niveau 11 au lieu
  de 15, Jules César 11 au lieu de 12, Marie Curie 11 au lieu de 13.

  Une fois les cinq reliques concernées corrigées, **Jules César passe de −7 à
  +1 en défense et Marie Curie de −14 à +3 en attaque** : les deux anomalies
  disparaissent, et les quarante comparaisons du contrôle tiennent toutes dans
  4 points. Il ne reste que le biais ordinaire de 1 à 4 points, qui est
  l'arrondi du jeu — **et le §17 en explique la plus grosse part : le jeu
  TRONQUE chaque apport et additionne des entiers.** Le site fait pareil depuis
  le 20/08/2026. Ce qui subsiste après ça se compte sur une main : 4 points sur
  l'attaque d'Achille, 2 sur sa défense, 1 sur ses PV, 0 sur ses dégâts de base.

  **La leçon, et elle a déjà servi deux fois :** un écart qui sort du lot n'est
  pas du bruit, c'est une donnée d'entrée fausse. Ici comme pour Mian Tansen
  (§4) et pour Marie Curie (§8), la valeur aberrante désignait le bug.

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

### Confirmé une seconde fois, sur une capture TOTALE du trafic

Le 19/08/2026 au soir, Thomas a activé le mode diagnostic de l'extension et joué :
**95 Mo capturés, 85 réponses, un journal de 13 077 adresses appelées.** Tout ce
que le jeu échange, sans exception.

Trois réponses n'avaient jamais été vues :

| Réponse | Taille | Puissances trouvées |
|---|---|---|
| `/game/startup` | 4 367 Ko | aucune |
| `/game/wakeup` — second état complet du compte | 3 539 Ko | aucune |
| `/game/battle/hero/complete-wave` — résultat de combat | 223 Ko | aucune |
| `PlayerPrefs` — les préférences LOCALES du jeu | 133 Ko | aucune |

**ATTENTION AU PIÈGE DES ASSETS.** Les paquets d'illustrations de la capture
semblent, eux, contenir presque toutes les puissances. C'est du bruit : ce sont
des blobs compressés, donc quasi aléatoires. Mesuré : **56 %** des entiers tirés
au sort entre 9 000 et 24 000 s'y trouvent par pur hasard. Les vraies réponses du
jeu, elles, tournent entre 0 et 15 % — et n'en contiennent aucune.

Les structures de classement du `wakeup` (`LeaderboardPush`, `WoAHeroRosterPush`,
`WoAPlayerStatsDTO`) ont été ouvertes une par une : elles portent des trophées
d'événement, jamais de puissance.

### Ce que cela signifie

**Le jeu calcule la puissance chez lui, à l'affichage, à partir des
statistiques.** Elle n'est jamais transmise ni stockée. C'est précisément ce qui
rend tout ce dossier nécessaire : il n'y a pas de raccourci, ni par l'export, ni
par un fichier de quelqu'un d'autre (§11).

Le jeu tourne sous Unity WebGL : la formule vit dans le moteur compilé, un
`.wasm` de plus de 40 Mo que l'extension exclut délibérément. C'est le dernier
endroit où elle se trouve, et le seul qui n'ait pas été fouillé.

**Ne pas reposer la question.** Ni l'export, ni le trafic complet, ni le catalogue,
ni aucune formule publiée (§11). La seule façon d'obtenir une puissance reste de
la lire à l'écran — et les écrans de montée de niveau la donnent avec les quatre
statistiques et leurs gains, ce qui en fait une mesure complète (§13).

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

---

## 14. Le moteur du jeu dit où est la formule — et ce n'est pas dans son code

Fouille du moteur Unity, le 19/08/2026, à la demande de Thomas. Résultat
inattendu et décisif : **la formule n'est pas programmée, elle est décrite dans
les données du jeu.**

### Ce qui a été fouillé

Le jeu télécharge `Build/….data`, 42 Mo, une archive au format `UnityWebData1.0`.
Elle contient vingt fichiers, dont **`Il2CppData/Metadata/global-metadata.dat`,
33,7 Mo** : les métadonnées IL2CPP, c'est-à-dire tous les noms de classes, de
méthodes et de champs C# du jeu, en clair.

Il n'a PAS été nécessaire de descendre dans le `.wasm` de 130 Mo : les noms ont
suffi.

### Ce que les noms révèlent

Le moteur porte un **interpréteur de formules**. Les nœuds de l'arbre :

```
FormulaConstant   FormulaAddition   FormulaMultiplication
FormulaDivision   FormulaPower      FormulaRound       FormulaByRarity
```

Et les feuilles, c'est-à-dire ce qu'une formule peut lire :

```
UnitStatFormulaTerm            la valeur d'une statistique
UnitStatUnboostedFormulaTerm   la même, sans les bonus
UnitLevelFormulaTerm           le niveau
UnitRarityFormulaTerm          la rareté
HeroAbilityLevelFormulaTerm    LE NIVEAU DE CAPACITÉ
PantheonCombatPowerFormulaTerm LA CONTRIBUTION DU PANTHÉON
RelicLevelFormulaTerm          le niveau de relique
RelicRarityFormulaTerm         la rareté de relique
```

Et les points d'entrée :

```
HeroUnitPowerFormulaDefinitionId       ← la formule de puissance d'un héros
SupportUnitPowerFormulaDefinitionId
ExpectedUnitPowerFormulaDefinitionId
FormulaDefinitionCatalog               ← le catalogue qui les contient
CombatPowerCoefficient                 ← un coefficient, dans les données
CalculatePower · CalculatePantheonInclusivePower · GetHeroPower
```

**Tout ce que ce dossier a reconstitué à la main est là, nommé.** La capacité
entre bien (§9). Le panthéon est bien un terme séparé, ce qui explique pourquoi
l'écran de panthéon l'affiche à part (§8). Et `FormulaByRarity` confirme que la
rareté joue, ce que les résidus laissaient soupçonner sans pouvoir le prouver.

Il y a même un `CombatPowerCoefficientOld` : le jeu a changé de formule en
cours de route, et garde l'ancienne. De quoi expliquer qu'une formule
communautaire ait pu être juste puis devenir fausse.

### Où est la formule, exactement

Pas dans le catalogue de Forge of Games : le mot « formula » n'y apparaît **zéro
fois**. Leur `coreData` de 4,4 Mo est un extrait, pas le catalogue complet.

Le vrai catalogue est **`GameDesignResponse.data`**, que le jeu garde dans la
mémoire locale du navigateur (IndexedDB). Le journal de la capture diagnostic le
chiffre à 373 521 670 octets — mais c'est la taille de l'enveloppe JSON. Le
fichier de traduction, lui, pesait 11,5 Mo d'enveloppe pour 954 Ko de données
réelles, soit douze fois moins. **Le game design fait donc environ 29 Mo.**

L'extension l'a vu passer et l'a écarté : son plafond de collecte est à 60 Mo
(`PLAFOND_STOCKAGE` dans `page-hook.js`), et l'enveloppe le dépassait.

`/game/gamedesign` ne renvoie, lui, que 131 octets : une référence
(`0SmFuMwufsEe_ade945957a5519f6bb04ec45dc556676`). Le gros du catalogue est
téléchargé une seule fois puis gardé en cache — il n'a donc pas été retéléchargé
pendant la capture.

### Ce qu'il reste à faire

**Extraire ce seul fichier de la mémoire locale du jeu**, puis y chercher le
`FormulaDefinitionCatalog`. Nos outils savent déjà lire ce format : c'est du
protobuf sans schéma, comme tout le reste.

Si la formule y est — et tout indique qu'elle y est —, ce dossier passe d'un
modèle à 3,6 % d'erreur à **la formule exacte du jeu**.

---

## 15. LA FORMULE, telle que le jeu l'écrit

Le §14 disait où chercher. Thomas a extrait le fichier — 25 Mo — et elle y est,
mot pour mot. Fin de la reconstitution.

```
puissance = arrondi(
    0,001218002 × TailleEscouade × RACINE(
        Attaque
      × Défense
      × PointsDeVie
      × 1 / (1 − Esquive)
      × DégâtsDeBase
      × (1 + ChancesDeCrit × (DégâtsCrit − 1))
      × (0,5 + 0,5 / TailleEscouadeAttendue)
      × [ VitesseAttaque × (1 + 0,0168 × (Portée − 1,25))
          + (rareté + (capacité − 1) × 0,024994)
            × (RégénFocus / RégénFocus sans bonus)
            × VitesseAttaque sans bonus ]
      × (1 + raretéRelique × niveauRelique)
    )
)
```

avec :

| | |
|---|---|
| rareté | 2★ 0,90 · 3★ 1,35 · 4★ 1,75 · 5★ 2,03 |
| raretéRelique | 4★ 0,005 · 5★ 0,01, multipliée par le NIVEAU de la relique |
| TailleEscouade, TailleEscouadeAttendue | 1 pour un héros — les deux facteurs valent donc 1 |

Les nombres du jeu sont en virgule fixe sur 16 bits : `0,0167999267578125` et
`0,024993896484375` sont les écritures exactes de 0,0168 et 0,025.

### Il faut le dire : le document communautaire avait RAISON

Le §2 de ce dossier le déclarait « réfuté ». **C'était mon erreur, et elle doit
rester écrite.** Le document donnait :

```
Puissance = round(0,001218 × √(ATQ × DÉF × PV × facteurEsquive
                              × dégâtsDeBase × facteurCrit × facteurCombat))
facteurCombat = vitesseATQ × (1 + 0,0168 × (portée − 1,25))
                + (rareté + (compétence − 1) × 0,025) × (régénFocus / régénBase)
rareté : 2★ 0,90 · 3★ 1,35 · 4★ 1,75 · 5★ 2,03
```

Le coefficient, l'exposant, le terme de portée, le pas de capacité, les quatre
multiplicateurs de rareté : **tout est juste, au chiffre près.**

Ce qui lui manquait, et qui explique qu'on n'ait pas su le reproduire :

1. le facteur de relique `(1 + raretéRelique × niveauRelique)` ;
2. les deux facteurs d'escouade — sans effet sur un héros, mais qui brouillaient
   la lecture ;
3. la multiplication du terme de capacité par la **vitesse d'attaque sans
   bonus**.

Les §2 et §8 avaient conclu que le terme de portée « ne compte pour rien » et que
la charge était « inerte ». Ces deux conclusions venaient de mesures réelles et
restent des faits observés — mais l'explication était fausse : la portée et la
charge SONT dans la formule, simplement à l'intérieur d'un facteur additif où
leur influence est faible. Un ajustement les voyait donc mal.

**La leçon : ne pas déclarer une formule « réfutée » parce qu'on n'arrive pas à
la reproduire. On peut échouer pour ses propres raisons.**

### Ce que donne la formule sur les 22 puissances relevées

Avec les statistiques que le site calcule, et **rien d'ajusté** :

| | écart moyen | pire |
|---|---|---|
| formule seule | 26 % | 46 % |
| formule + une constante | **2,1 %** | 8,9 % |

La formule seule sous-estime toujours, et le manque vaut environ **1 420 points
pour tout héros de bas niveau** — Mérérouka 1 378, Candace 1 422, Ada Blackjack
1 423, Freydís 1 423, Ada Lovelace 1 424, Mansa Moussa 1 422, Guillaume Tell
1 417, Musashi 1 419, Artémise 1 414. Neuf héros à 1 % près les uns des autres.

**Or c'est très exactement la constante mesurée au §13 sur les écrans de montée
de niveau : 1 383 ± 4.** Deux dispositifs indépendants, la même valeur.

### Ce qui reste, et c'est maintenant une seule question

L'arbre de la formule ne contient **aucune constante additive**. Il en faut
pourtant une d'environ 1 400 pour que les chiffres tombent. Trois explications
possibles, dans l'ordre de vraisemblance :

1. **une statistique que je fournis n'est pas celle que le jeu fournit** — les
   plus suspectes sont `RégénFocus sans bonus` et `VitesseAttaque sans bonus`,
   que j'assimile aux valeurs du catalogue ;
2. **la puissance affichée n'est pas seulement `formula.unit_power_hero`** — le
   moteur porte aussi un `SupportUnitPowerFormulaDefinitionId` et un
   `CalculatePantheonInclusivePower` ;
3. le jeu ajoute une base que la formule ne dit pas.

C'est désormais **une seule inconnue bien cernée**, au lieu d'un brouillard. Et
elle vaut 1 400, pas 13 %.

---

## 16. Les statistiques sans nom — et l'erreur qui tombe à 0,4 %

Ce paragraphe part d'une phrase de Thomas, le 20 août 2026 :

> « Tu n'as pas pris en compte que sur la relique Livre des morts il y avait 10 %
> de dégâts de zone dans ton calcul, cela devrait réduire la différence qu'on
> cherche. »

Il avait raison sur le fait, et raison sur la conséquence — mais pas par le
chemin qu'il croyait. Le détour vaut d'être écrit.

### Le catalogue désigne les statistiques par un NUMÉRO

`tools/catalogue.js` traduit ces numéros en noms grâce à une table établie de
proche en proche. Dix-neuf numéros étaient nommés ; les autres ressortaient tels
quels, sous la forme `stat_2`, `stat_18`, `stat_41`. Ces lignes-là étaient
**affichées mais non comptées** : le site les montrait sans savoir quoi en faire.

Le Livre des morts porte `stat_2`. Thomas, lui, lit « 10 % de dégâts de zone »
sur l'écran du jeu, et sa relique est au niveau 10 : le palier 10 de la relique
vaut exactement 0,10. Le numéro 2 est donc les dégâts de zone.

### Deux chemins indépendants nomment TOUS les numéros restants

**Le premier : le game design nomme la statistique de chaque relique en clair.**
Autour de `RelicActivation_BookOfTheDead` on lit `unit_stat.AoeDamageAmp` ;
autour de Mjöllnir `unit_stat.SingleTargetDamageAmp` ; autour de la Torche de
Prométhée `unit_stat.BurnDamageAmp`. Dix-huit reliques, dix-huit noms. Cinq
numéros sont même portés par deux reliques différentes, qui se recoupent.

**Le second : les numéros suivent l'ordre alphabétique des noms.** Les dix-neuf
numéros déjà connus le vérifient sans exception — 4 AssetRadius, 5 Attack,
9 AttackRange, 10 AttackSpeed, 11 BaseDamage… — et les noms lus sur les reliques
tombent exactement là où l'alphabet les attend. Les statistiques ajoutées au jeu
APRÈS coup sont rangées à la suite, au-delà de 54, et sortent donc de l'ordre :
c'est le cas de CritHealChance (56), LightningDamageAmp (58) et
DefenseDebuffGivenAmp (61) — trois numéros que les reliques nomment, et que
l'alphabet ne pouvait pas trouver.

Deux contrôles que ni l'un ni l'autre chemin ne prévoyait, et qui tombent juste :
le numéro **45** vaut 10, 3 ou 4 sur 34 unités — `SplashDamageDivisor`, un
diviseur de dégâts d'éclaboussure ; le numéro **26** vaut 12, 8, 4 ou 1 sur
476 unités — `ExpectedSquadSize`, la taille d'escouade attendue, celle-là même
qui figure dans la formule de puissance du §15.

Un seul numéro reste déduit et non observé : le **25**, qu'aucune relique ne
porte. L'alphabet ne laisse que deux candidats, `DotDamageTakenAmp` et
`Evasion` ; les cinq héros qui le portent en gagnent 0,15 à leur cinquième palier
d'éveil, et « +15 % d'esquive » est un bonus quand « +15 % de dégâts sur la durée
SUBIS » serait une punition. D'où Evasion. Aucun de ces cinq héros n'est dans le
compte de Thomas : la lecture reste à confirmer sur un écran.

### Ce qui manquait vraiment : le crit gagné à l'éveil

Les dégâts de zone n'entrent PAS dans la puissance — le §15 est formel, et la
formule du jeu ne les mentionne pas. La phrase de Thomas n'aurait donc rien dû
changer à la puissance.

Sauf que la table des numéros ne sert pas qu'aux reliques : elle sert aussi aux
**paliers d'éveil**. Et 56 paliers sur 720 portaient un numéro non nommé, dont
`stat_18` et `stat_19` — **les chances de crit et les dégâts critiques**, qui,
eux, sont dans la formule.

Les trois héros que ce journal traînait comme « anomalies » depuis le début —
Spartacus −7,0 %, Boadicée −4,2 %, Tomoe −3,4 % — sont **exactement les trois
héros éveillés au rang V dont le cinquième palier donne `stat_18`**. Spartacus,
le pire des trois, est aussi le seul à porter en plus `stat_19` à son deuxième
palier. Le site leur retirait donc, sans le savoir, 20 points de chances de crit
et 40 points de dégâts crit.

Ce n'était pas du bruit. C'était, pour la quatrième fois dans ce dossier, une
donnée d'entrée incomplète.

### Le résultat, sur les 22 puissances relevées

| | erreur moyenne | pire |
|---|---|---|
| avant | 1,66 % | 6,97 % (Spartacus) |
| numéros nommés | 1,15 % | 2,99 % |
| **constante réajustée à 1 416** | **0,38 %** | **2,08 %** (Ulysse) |

Les trois anomalies disparaissent : Spartacus +0,07 %, Boadicée +0,12 %, Tomoe
+0,14 %. **Quatorze héros sur vingt-deux tombent sous 0,2 %**, et cinq au point
près. Il ne reste plus d'anomalie isolée, seulement un léger excès sur cinq héros
(Ulysse +2,1 %, Mérérouka +1,3 %, Ada Lovelace +1,1 %, Léonard +1,1 %,
Hatchepsout +1,0 %).

**La constante bouge vers la mesure du §13, pas contre elle.** Elle valait 1 465
quand on l'ajustait sur des statistiques incomplètes — elle compensait alors une
partie de ce qui manquait. Sur des statistiques complètes, elle vaut **1 416**,
là où les écrans de montée de niveau mesuraient 1 383 ± 4 par un dispositif
entièrement différent. Les deux se rapprochent de 82 à 33 points d'écart.

### Un piège trouvé au passage : le modificateur d'ère

Une relique est mise à l'échelle de l'ère du joueur : +50 d'attaque en donne 143
au Haut Moyen Âge (×2,854, arrondi au supérieur). Le site appliquait ce calcul à
**toutes** les lignes de la relique. Tant que les dégâts de zone n'étaient pas
comptés, cela ne se voyait pas ; dès qu'ils l'ont été, Hua Mulan s'est retrouvée
avec `ceil(0,10 × 2,854)` = **1**, soit +100 % de dégâts de zone.

Deux fois faux : la mise à l'échelle ne vaut que pour les statistiques comptées
en points — Thomas lit bien 10 %, et non 29 %, à son ère — et l'arrondi au
supérieur, inoffensif sur des entiers, écrase toute fraction sur 1. Corrigé dans
`apportRelique()` : le tri se fait sur la liste `ABSOLUES` de `formules.js`.

### Ce qu'il reste à vérifier dans le jeu

1. **Spartacus** : le site lui donne maintenant 25 % de chances de crit et
   204,85 % de dégâts crit. À confronter à son écran « Stats de profil ».
2. **Le numéro 25** (esquive) : aucun des cinq héros concernés n'est dans le
   compte. À voir si l'un d'eux passe un jour.
3. **La constante** reste inexpliquée. Elle vaut maintenant 1 416, et les trois
   pistes du §15 restent ouvertes — la plus probable étant qu'une statistique
   d'entrée fournie au calcul ne soit pas tout à fait celle du jeu.

---

## 17. Le jeu ne garde que des entiers

> **À LIRE AVEC LE §18.** La règle des entiers est juste, mais ce paragraphe
> conclut à une TRONCATURE : c'est faux. Le jeu arrondit. La troncature ne
> semblait marcher que parce que les taux de montée étaient trop hauts.

Thomas, le 20 août 2026, en ouvrant le détail d'une statistique :

> « Dans le jeu je n'ai aucun chiffre avec décimale, à part la chance critique.
> Tu comptes l'éveil 327,1, mon jeu ne compte que 327. Le panthéon, tu me donnes
> 217,3 ; moi j'ai 217. »

C'est la règle qui manquait, et le journal la cherchait depuis le début sous le
nom vague d'« arrondi du jeu » (§1). Le jeu **tronque chaque apport** et **fait
la somme des entiers**.

### Le témoin était déjà écrit, deux mois avant qu'on le comprenne

`formules.js` porte cette phrase depuis le premier jour :

> « 17,65 % de sa base (1 454) font 257, plus 49 à plat = 306, et le jeu compte
> bien **305** pour l'équipement. »

305, c'est 49 + 256. Or le calcul exact donne 256,605. Le jeu **tronque**, il
n'arrondit pas : arrondir aurait donné 257, donc 306. On avait relevé l'écart
d'un point sans en tirer la règle.

Deuxième chose que ce témoin impose : **l'assiette d'un pourcentage reste la
valeur exacte**. Les 256,605 se lisent sur 1 453,855, pas sur 1 453. Le jeu garde
donc ses décimales en interne et ne tronque qu'au moment de poser la ligne.

### Ce que ça donne sur Achille

Le jeu ne sépare pas non plus le plat et le pourcentage d'un objet : une seule
ligne « équipement ». Le site fait maintenant pareil.

| Source | Site | Jeu |
|---|---|---|
| Base au niveau 1 | 130 | |
| Montée au niveau 160 | 1 323 | |
| Éveil | 327 | **327** ✓ |
| Caserne | 518 | |
| Relique | 129 | |
| Équipement et ensembles | 305 | **305** ✓ |
| Panthéon | 217 | **217** ✓ |
| **Total attaque** | **2 949** | **2 945** |

| | avant | après | jeu |
|---|---|---|---|
| Attaque | 2 951 | 2 949 | 2 945 |
| Défense | 1 802 | 1 801 | 1 799 |
| Points de vie | 20 855 | 20 854 | 20 853 |
| Dégâts de base | 773 | **773** | **773** ✓ |

Les dégâts de base tombent juste. Les trois autres se rapprochent mais gardent
un excès de 1, 2 et 4 points.

Sur la puissance, l'effet est neutre : 0,39 % d'erreur moyenne contre 0,38 %
avant, et le pire écart descend de 2,08 % à 1,97 %.

### Ce qui reste, et la mesure qui le trancherait

Le résidu ne vient plus des décimales. Il vient d'une des lignes elles-mêmes.

**La DÉFENSE d'Achille est le cas le plus propre du dossier** : pas d'éveil, pas
de panthéon, aucun pourcentage. Cinq nombres, une addition :

```
    108  base
+ 1 099  montée au niveau 160
+   518  caserne
+    43  relique (Gant de Fauconnerie, 15 x 2,854 = 42,81)
+    33  équipement
= 1 801     le jeu en affiche 1 799
```

Deux points, et cinq lignes seulement pour les loger. Trois suspects :

1. **la relique** : 42,81 est arrondi au SUPÉRIEUR (43) par la règle du wiki. Si
   le jeu tronquait, ce serait 42 — et l'attaque perdrait 129 → 128, plus un
   point de panthéon, soit 3 des 4 points manquants ;
2. **la montée en niveau**, que le §1 soupçonne d'être 1 à 4 points trop haute ;
3. **la caserne**, jamais recoupée sur Achille.

**Il suffit que Thomas lise ces cinq nombres sur son écran.** Celui qui diffère
désigne le coupable, sans ambiguïté possible.

---

## 18. Les taux de montée dormaient dans le catalogue

Le §17 demandait à Thomas cinq nombres. Sa réponse a tout débloqué :

> « Je veux bien citer les cinq nombres, mais tu as bon sur les trois derniers,
> et les deux premiers, je ne les ai pas. »

Le jeu n'affiche donc PAS la base ni la montée en niveau : il n'en montre que la
somme. Mais il confirme les trois autres lignes de la défense d'Achille —
caserne 518, relique 43, équipement 33. Par soustraction :

```
    1 799  (le jeu)
  −   518  caserne
  −    43  relique
  −    33  équipement
  = 1 205  base + montée au niveau 160
```

Le site en calculait **1 207,8**. L'écart n'était donc pas un arrondi : **le taux
de montée lui-même était faux.**

### Où le trouver : la rubrique 8, déclarée et jamais lue

`tools/catalogue.js` déclare depuis toujours :

```js
PROGRESSION: 8,  // vitesse de montée des statistiques par niveau
```

…et ne s'en sert nulle part. La rubrique contient six entrées, une par famille
de statistiques, chacune donnant un couple **{ par niveau ; par ascension }**
pour les quatre raretés — identique pour les quatre. Deux couples en sortent :

| | par niveau | par ascension |
|---|---|---|
| attaque et défense | **0,045** | **0,20** |
| points de vie et dégâts de base | 0,04 | 0,06 |

Le site utilisait `{ 0,0465 ; 0,186 }` pour l'attaque et la défense — un
ajustement, honnêtement signalé comme tel dans `formules.js` (« les taux par
ascension ont été mesurés »). Il tombait à 1 à 4 points près. C'est très bien
pour un ajustement, et c'est exactement le « biais ordinaire » que le §1
traînait depuis le premier jour.

### Et le jeu ARRONDIT, il ne tronque pas

Le §17 concluait à une troncature, sur le témoin des 17,65 % d'Achille :
256,605 et le jeu qui compte 305 au lieu de 306.

**C'était un faux ami.** Avec le bon taux, la part en pourcentage ne vaut plus
256,605 mais **255,95** — et 49 + 255,95 s'arrondit en 305. Le même chiffre, par
la bonne route. La troncature n'était qu'une façon de compenser un taux trop
haut.

Troisième fois dans ce dossier qu'un écart d'un point désigne une entrée fausse
plutôt qu'un arrondi. C'est une règle, maintenant.

### Le résultat sur Achille

| | avant | après | jeu |
|---|---|---|---|
| **Attaque** | 2 951 | **2 945** | **2 945** ✓ |
| **Défense** | 1 802 | **1 799** | **1 799** ✓ |
| Points de vie | 20 855 | 20 855 | 20 853 |
| Dégâts de base | 773 | 773 | 774 |

L'attaque et la défense — les deux statistiques que le journal donnait pour
définitivement approchées — tombent **exactement** sur l'écran du jeu, ligne par
ligne :

```
     130  base au niveau 1
+  1 320  montée au niveau 160
+    326  éveil
+    518  caserne
+    129  relique
+    305  équipement et ensembles      (49 à plat + 17,65 % de 1 450)
+    217  panthéon                     (50 % de la relique + 50 % de l'équipement)
=  2 945
```

Sur la puissance, l'erreur moyenne descend à **0,36 %** et William Wallace tombe
au point près (14 843 pour 14 843).

### Ce qui reste : deux nombres, et une vérification

1. **Points de vie, +2.** La ligne caserne (4 670) n'a jamais été recoupée sur
   Achille, et la ligne équipement se calcule à 491. L'une des deux est à un ou
   deux points près.
2. **Dégâts de base, −1.** Une seule ligne à part la base : l'équipement, que le
   site calcule à 30. S'il affiche 31, tout tombe.
3. **L'éveil de l'attaque.** Le site écrit maintenant **326** ; Thomas avait cité
   327. La somme, elle, tombe juste avec 326 — mais si son écran dit vraiment
   327, alors une autre ligne est un point plus bas, et il faut le savoir.

---

## 19. Neuf écrans, et le site tombe sur le jeu

Thomas a envoyé le 20/08/2026 les captures qui manquaient : le tableau **« Stats
de profil » complet d'Achille**, et neuf **écrans d'amélioration** donnant, pour
chaque héros, ses quatre statistiques ET sa puissance.

### Le tableau d'Achille, colonne par colonne

Le jeu range exactement comme le site : base, caserne, éveil, reliques,
équipement, panthéon, total.

| | Jeu | Site |
|---|---|---|
| Attaque | 518 · 327 · 129 · 305 · 217 → **2 945** | **2 945** ✓ |
| Défense | 518 · — · 43 · 33 · — → **1 799** | **1 799** ✓ |
| Points de vie | 4 670 · — · — · 491 · — → **20 853** | 20 855 |
| Dégâts de base | — · — · — · 31 · — → **774** | 773 |
| Chances de crit | 3,96 % · 5 % → **13,96 %** | **13,96 %** ✓ |
| Vitesse d'attaque | 12 · 21 · 3 → **96 coups/min** | **96** ✓ |
| Esquive · Soins reçus | 5 % · 10 % (panthéon) | ✓ |

La colonne « stats de base » affiche 0 : le jeu ne montre pas la valeur montée en
niveau, il ne montre que les apports. La base implicite se retrouve par
soustraction.

### Les neuf héros

Puissances relevées, et ce que le site en dit après les corrections des §16 à §18 :

**CE TABLEAU EST PÉRIMÉ — voir le §25.** Les §21 à §25 ont déplacé ces chiffres ;
il est conservé tel qu'il a été écrit le 20/08/2026.

| Héros | Niveau | Puissance du jeu | Site | Écart |
|---|---|---|---|---|
| Jeanne d'Arc | 90 | 11 768 | **11 768** | **0** |
| William Wallace | 110 | 14 843 | **14 843** | **0** |
| Achille | 160 | 28 142 | 28 143 | +1 |
| Thomas Alva Edison | 80 | 9 375 | 9 374 | −1 |
| Isabella I | 105 | 14 215 | 14 211 | −4 |
| Ulysse | 102 | 13 763 | 13 758 | −5 |
| Marie Curie | 134 | 21 138 | 21 150 | +12 |
| Lily la Tigresse | 80 | 9 607 | 9 594 | −13 |
| Hatchepsout | 110 | 17 700 | 17 974 | **+274** |

Sur les quatre statistiques principales, huit héros sur neuf tombent **à un point
près ou pile**. Jeanne d'Arc et Edison sont exacts sur les cinq nombres.

**Ulysse n'était pas une anomalie, c'était une mesure périmée.** Sa puissance
relevée valait 13 488 ; elle vaut 13 763 aujourd'hui, et le site disait 13 758.
Les 2 % d'écart du §16 étaient l'écart entre deux dates, pas entre deux calculs.

### Lily la Tigresse tranche l'assiette des ensembles de parure

Le §1 avait établi qu'un ensemble de PARURE qui donne des PV se calcule sur une
assiette large — niveau + caserne + ce que les objets viennent d'apporter. Il
manquait un cas pour savoir si l'ÉVEIL en fait partie : chez Wallace, Isabella et
Jeanne d'Arc, qui portent tous le Chacal (+10 % de PV), l'éveil ne donne aucun
point de vie. Les deux lectures y donnaient le même nombre.

Lily la Tigresse porte le même Chacal **et** un éveil qui donne +38 % de PV.

| | PV |
|---|---|
| assiette sans l'éveil | 16 641 |
| **assiette avec l'éveil** | **16 928** |
| le jeu | **16 927** |

L'éveil est dans l'assiette. Corrigé dans `formules.js`.

### Ce qui reste : Hatchepsout, et elle seule

Elle porte la même structure que Lily — un ensemble de parure (Égyptien royal,
+7,5 % de PV) et un ensemble d'armement (Dharma). À une différence près :
**le Dharma donne AUSSI des PV** (+5 %), là où le Samouraï de Lily donne de la
défense.

Et elle exige la règle inverse :

| | PV | écart |
|---|---|---|
| assiette avec l'éveil (règle de Lily) | 21 115 | +707 |
| assiette sans l'éveil | 20 832 | +424 |
| **assiette ordinaire, sans caserne ni éveil** | **20 409** | **+1** |
| le jeu | 20 408 | |

Ses trois autres statistiques sont exactes, y compris l'attaque — ce qui clôt au
passage la vieille question du §1 sur sa colonne d'éveil : son éveil ne donne
bien aucune attaque.

**Une capture de son tableau « Stats de profil » suffit à trancher** : la ligne
ÉVEIL et la ligne ÉQUIPEMENT des points de vie diront laquelle des trois
assiettes le jeu applique, et pourquoi elle diffère de Lily.

### Où en est la puissance

Sur les **27 héros** dont la puissance est connue : **0,27 % d'erreur moyenne**,
pire écart 1,55 % — et ce pire écart est Hatchepsout, dont on sait maintenant
qu'il vient de ses points de vie, pas de la formule.

Sans elle : **0,22 % de moyenne**, et cinq héros au point près.

---

## 20. Un second compte, et la constante s'effondre

Le 20 août 2026 au soir, quelqu'un d'autre a installé le site. Son William
Wallace n'affichait pas la même puissance que le jeu. C'est le premier test hors
du compte de Thomas, et il tranche une question qu'on ne pouvait pas trancher
seuls.

### Tout ce qui n'est pas la puissance tombe juste

Son compte n'a rien de commun avec celui de Thomas : **ère féodale** (et non Haut
Moyen Âge), **caserne au palier 23** donnant 328/328/3060 (et non 518/518/4670),
un Wallace **niveau 80** avec **huit nœuds de panthéon** activés là où celui de
Thomas n'en a aucun.

| | le site | son écran |
|---|---|---|
| Attaque | **1 020** | **1 020** |
| Défense | **1 262** | **1 262** |
| Points de vie | 14 630 | 14 629 |
| Dégâts de base | 613 | 614 |

Deux exactes, deux à un point. **Toute la chaîne des statistiques généralise** :
la montée en niveau, la caserne, l'éveil, l'équipement, et l'arbre des défenseurs
que le compte de Thomas n'avait jamais exercé — sa colonne panthéon donne +49 en
défense, soit 50 % de ses 58 d'équipement plus 50 % de ses 40 de relique, les
nœuds « Équipement renforcé » et « Rempart de Reliques », au point près.

Sa relique se retrouve même au palier près : +25 attaque, +40 défense, +10 % de
bouclier donné, ce sont les **Figurines de Lewis au niveau 7** mises à l'échelle
de son ère (×1,902). La règle d'arrondi au supérieur et la non-mise à l'échelle
des pourcentages sont donc vraies à deux ères différentes.

### La puissance, elle, est à +10,9 %

> le jeu : **8 093** — le site : **8 974**

Et comme tout le reste tombe juste, l'écart ne peut venir que de la formule.

**La constante qui ferait tomber son Wallace vaut 535.** Chez Thomas, elle vaut
1 416, ajustée sur vingt-sept héros allant du niveau 20 au niveau 160.

**Ce n'est donc pas une constante du jeu. Elle dépend du compte.**

### La piste, et elle était déjà écrite

Le §15 listait trois explications possibles pour ce terme. La troisième était :
« le jeu ajoute une base que la formule ne dit pas ». Et le §14 avait relevé, en
lisant le moteur, un `SupportUnitPowerFormulaDefinitionId` — une formule de
puissance pour les **unités d'escorte**.

Or ce qui distingue les deux comptes, c'est justement la caserne : 518/518/4670
contre 328/328/3060. Si la puissance affichée sous un héros est celle du héros
PLUS celle de son escorte, alors :

- le terme est le même pour tous les héros d'un compte — ce qu'on observe, une
  constante qui tient du niveau 20 au niveau 160 ;
- il change d'un compte à l'autre avec la caserne — ce qu'on observe aussi.

Les deux valeurs vont dans le bon sens : 1 416 pour la caserne forte, 535 pour la
faible. Le rapport, 2,65, ne se lit pas encore directement dans le rapport des
statistiques de caserne (1,58 en attaque, 1,53 en points de vie) — il manque
la taille d'escouade et les statistiques propres de l'unité.

### Ce qui trancherait

**Trois ou quatre héros de plus sur son compte**, relevés sur l'écran
d'amélioration, et choisis à des niveaux très différents.

- Si 535 tombe juste sur tous, le terme est bien une constante par compte, et il
  reste à la calculer depuis la caserne plutôt qu'à l'ajuster.
- Si l'écart suit le niveau, ce n'est pas un terme additif et il faut tout
  reprendre.

En attendant, le site le dit : l'infobulle sous la puissance et le README portent
désormais l'avertissement. Les 0,27 % valaient pour un compte, pas pour le jeu.

---

## 21. LA CONSTANTE, C'ÉTAIT L'ESCOUADE

Le §20 laissait l'enquête dans son plus mauvais état : la formule marchait sur un
compte et se trompait de 11 % sur un autre, et le terme fautif était celui qu'on
n'avait jamais su expliquer.

Thomas a envoyé la capture d'une **caserne**. Elle porte deux blocs :

```
AMÉLIORATIONS                    [icône d'unité, petit 3]   ATQ 917 · DÉF 1223 · PV 2330
BOOST APPLIQUÉ À TOUS LES HÉROS INFANTERIE                  ATQ 518 · DÉF 518  · PV 4670
```

Le second, on l'utilisait depuis des jours. **Le premier, jamais.**

### Le bâtiment porte son unité, dans les données

Chaque caserne du catalogue contient, à côté de son forfait, l'unité qu'elle
fournit :

```
unit.Unit_HighMiddleAges_Player_Infantrymen
   nombre : 3          ← le petit chiffre sous l'icône
   niveau : 130
   stats  : ATQ 105 · DÉF 140 · PV 333 · dégâts 12 · vitesse 1,25
            taille d'escouade 3 · escouade attendue 12
```

### Une unité ne monte pas comme un héros

Ses statistiques de base montent **par niveau, sans ascensions**, et à un taux
plus élevé. Ces taux dormaient dans la **même rubrique 8** que ceux des héros,
dans un troisième champ qu'on avait laissé de côté : **0,06** pour l'attaque et
la défense, **0,0465** pour les points de vie et les dégâts de base.

| au niveau 130 | calculé | l'écran de Thomas |
|---|---|---|
| ATQ | 917,7 | **917** |
| DÉF | 1 223,6 | **1 223** |
| PV | 2 330,5 | **2 330** |

### Et sa puissance se calcule avec la formule des héros

À deux détails près, tous deux lus dans les données et non supposés :

1. **une unité n'a pas de régénération de focus.** Le terme de rareté et de
   capacité est multiplié par ce rapport : il vaut donc zéro, et le facteur de
   combat se réduit à la vitesse d'attaque ;
2. **sa taille d'escouade ne vaut pas 1**, et elle multiplie tout.

| | puissance de l'escouade | constante qu'il fallait |
|---|---|---|
| caserne d'infanterie, palier 32 (Thomas) | **1 426** | 1 416 |
| caserne d'infanterie, palier 23 (l'autre compte) | **539** | 535 |

Moins de 1 % sur les deux, mesurés à des mois de progression d'écart.

Et le détail qui achève : au palier de Thomas, les cinq armes donnent 1 426,
1 423, 1 426, 1 429, 1 427. **Le jeu équilibre ses unités à puissance égale** —
voilà pourquoi une seule constante tombait juste sur ses vingt-sept héros, toutes
classes confondues, et pourquoi on a pu la prendre pour une constante du jeu.

### Ce que le jeu affiche sous un héros

> **la puissance du héros + celle de son escouade**

C'est tout. Il n'y a jamais eu de constante.

### Le résultat

| | avant | après |
|---|---|---|
| 27 héros du compte de Thomas | 0,27 % | **0,27 %** |
| le Wallace de l'autre compte | **+10,89 %** | **+0,04 %** (8 096 pour 8 093) |

Sur le compte de Thomas rien ne bouge — ses casernes donnaient 1 418, l'ajustement
valait 1 416. Sur un compte qui n'a jamais servi à régler quoi que ce soit, on
passe de 11 % à trois points.

**Plus un seul nombre ajusté ne subsiste dans le calcul de la puissance.** Tout
vient des données du jeu : le coefficient, les exposants, les multiplicateurs de
rareté, les taux de montée, la mise à l'échelle des reliques, et maintenant
l'escouade.

### La leçon, la quatrième et la plus chère

Pendant onze paragraphes, un terme inexpliqué a été traité comme une constante à
ajuster. Il tombait juste sur vingt-sept héros, ce qui l'a rendu crédible. Il a
fallu **un second compte** pour révéler qu'il variait — et la réponse était dans
le catalogue depuis le premier jour, dans un champ du même bâtiment dont on lisait
déjà l'autre moitié.

*Un ajustement qui marche est le meilleur déguisement d'une donnée qu'on n'a pas
lue.*

---

## 22. Le jeu arrondit vers le HAUT — et ne calcule pas là-dessus

Thomas, après le §21 : « on a la formule, on a juste à remplacer par des valeurs
et on doit trouver le résultat, avec la prise en compte du troncage ».

Il avait raison, et il restait deux choses à comprendre.

### L'arrondi n'est pas le même selon la ligne

Le §17 avait conclu « le jeu arrondit au plus proche ». C'était vrai des lignes
qu'on avait sous les yeux, et faux en général. Six lignes lues sur les tableaux
« Stats de profil » — deux comptes, deux héros — le montrent :

| ligne | valeur exacte | le jeu écrit |
|---|---|---|
| Achille, éveil ATQ | 326,28 | **327** |
| Achille, équipement ATQ | 304,95 | 305 |
| Achille, panthéon ATQ | 216,98 | 217 |
| Achille, équipement DÉG | 30,03 | **31** |
| Wallace (autre compte), équipement DÉG | 43,05 | **44** |
| Wallace (autre compte), panthéon DÉG | 27,14 | **28** |

Les quatre lignes en gras tranchent : l'arrondi ordinaire donnerait 326, 30, 43 et
27. **Le jeu plafonne.**

La montée en niveau, elle, se tronque — testé, l'arrondir fait tomber le nombre
de statistiques exactes de 19 à 10 sur 32.

> **montée en niveau : plancher · tout le reste : plafond**

Les dégâts de base passent de **2 justes sur 8** à **7 sur 8**. C'était le point
qui manquait depuis le §18, et il ne venait pas d'une donnée absente mais d'un
sens d'arrondi.

### Mais la puissance ne se calcule pas sur ces entiers

Les plafonner et calculer la puissance dessus la fait dériver : de 15 héros à
moins de 5 points, on tombe à 6. Il a fallu séparer les deux :

> le jeu ÉCRIT des entiers plafonnés, et CALCULE sur les valeurs exactes

Ce qui est cohérent avec sa propre formule (§15), qui ne porte qu'un seul
arrondi, tout en haut. `detail()` rend donc deux totaux : celui qu'on affiche, et
celui qui sert au calcul.

### Où l'on en est

| | avant le §22 | après |
|---|---|---|
| Statistiques exactes (8 héros × 4) | 17/32 | **19/32** |
| Dégâts de base exacts | 2/8 | **7/8** |
| Puissance à moins de 5 points | 13/26 | **15/26** |
| Puissance à moins de 10 points | 20/26 | **21/26** |
| Wallace de l'autre compte | +3 | **+3** |

### Ce qui reste, et c'est peu

- **L'attaque d'Achille** : le jeu implique 1 449 de base+niveau là où l'on
  calcule 1 450,15. Un point et demi, sur la seule ligne qu'aucun écran ne
  montre — il faudra un héros dont l'éveil ne touche pas l'attaque pour la lire
  directement.
- **Les points de vie**, toujours un ou deux points au-dessus.
- **Hatchepsout**, +268, et c'est toujours ses points de vie (§19).
- **Le crit de l'escouade**, ouvert : la table des défauts du catalogue dit qu'il
  compte, Achille dit le contraire, et les vingt-six héros donnent raison à la
  table.

### Deux idées de Thomas, testées dans la foulée

**« La vitesse d'attaque n'est pas en décimal dans le jeu, elle est en entier. »**
Vrai : le jeu écrit « 96 coups/min », jamais 96,24. En faisant entrer la vitesse
ARRONDIE dans la formule, les deux héros dont toutes les entrées sont vérifiées
sur un écran s'améliorent nettement :

| | vitesse exacte | vitesse en coups/min entiers |
|---|---|---|
| Achille | +9 | **−2** |
| Wallace (autre compte) | +3 | **−1** |

Sur les vingt-six héros l'effet est neutre en moyenne — ce qui est attendu, leurs
autres entrées n'étant pas vérifiées. On garde donc l'arrondi, et l'on note que
la vitesse SANS BONUS, elle, doit rester exacte : l'arrondir aussi renvoie ce
même Wallace à −9. Cohérent : celle-là ne s'affiche nulle part.

**« Fais varier la taille d'escouade et la taille attendue. »** Fait, et le
verdict est sans appel — les valeurs du catalogue sont les bonnes, et de très
loin :

| taille · attendue | écart médian |
|---|---|
| **3 · 12 (le catalogue)** | **5** |
| 3 · 3 | 191 |
| 3 · 1 | 504 |
| 1 · 12 | 927 |
| 12 · 12 | 4 265 |

La question est close : l'escouade compte trois unités, et son facteur
d'escouade attendue se lit sur douze.

### L'état au terme de la soirée

| | |
|---|---|
| Puissance à moins de 5 points | **16 héros sur 26** |
| Puissance à moins de 10 points | 20 sur 26 |
| Écart médian | **5 points** |
| Artémise · Guillaume Tell | **exacts au point** |
| Wallace de l'autre compte | **−1** |

---

## 23. Il y a DEUX formules, et elles sont jumelles

Thomas, après le §22 : « RégénFocus / RégénFocus_base, tu les trouves dans le
fichier aussi, ou c'est toi qui les sors ? »

La question méritait mieux qu'une réponse de mémoire. On est donc allé lire.

### Tout est dans le fichier, terme par terme

Le bloc de formule, à l'octet 13 908 308, cite douze statistiques — exactement
les douze qu'on utilise :

```
Attack · Defense · MaxHitPoints · Evasion · BaseDamage · CritChance
CritDamage · ExpectedSquadSize · AttackSpeed · AttackRange · FocusRegen · SquadSize
```

Et ses types de nœuds répondent à eux seuls à la question posée :

```
FormulaRoundDTO                        l'arrondi, unique, tout en haut
FormulaPowerDTO                        l'exposant
FormulaDivisionDTO                     1,218÷1000, 1/(1−Esquive), RégénFocus÷RégénFocus_base
HeroUnitStatFormulaTermDTO             « la statistique du héros »
HeroUnitStatUnboostedFormulaTermDTO    « la statistique SANS BONUS »
HeroUnitRarityFormulaTermDTO           la rareté
HeroAbilityLevelFormulaTermDTO         la capacité
RelicRarityFormulaTermDTO              la rareté de la relique
RelicLevelFormulaTermDTO               son niveau
```

`HeroUnitStatUnboostedFormulaTermDTO` est la réponse : le moteur a un type de
nœud dédié pour « cette statistique, mais sans ses bonus ». Les termes en
« _base » ne sont pas une invention du document communautaire.

Et `FormulaRoundDTO` confirme par la lecture ce que le §22 avait établi par la
mesure : **un seul arrondi, tout en haut**.

### Deux constantes n'étaient pas les bonnes

| | on avait | le fichier |
|---|---|---|
| coefficient | 0,001218002 | **1,218 ÷ 1000** |
| pas de capacité | 0,024994 | **0,025** |

Le coefficient est écrit en deux nombres reliés par un nœud de division, ce qui
explique qu'on ne le trouvait pas d'un bloc. Les deux valeurs venaient du
document communautaire ; l'écart est infime — deux points sur Achille — mais
autant citer la source exactement. Corrigé.

Au passage, la phrase du §15 sur la « virgule fixe sur 16 bits » est fausse : le
fichier porte des flottants 64 bits ronds. Elle venait du même document.

### Et la formule de l'escouade était juste à côté

```
formula.unit_power_hero        octet 13 908 308
formula.expected_unit_power    octet 13 912 310
```

Quatre mille octets plus loin, un second corps de formule — **jumeau du premier**.
Mêmes types de nœuds, mêmes constantes dans le même ordre, mêmes statistiques,
CritChance et CritDamage comprises.

**Cela tranche la question laissée ouverte au §22 :** oui, le crit compte pour
l'escouade. Achille disait le contraire, les vingt-six autres héros disaient
l'inverse, et le fichier donne raison aux vingt-six.

Ce qui s'annule, en revanche, c'est le terme de rareté et de capacité : la
formule le multiplie par (RégénFocus ÷ RégénFocus sans bonus), et une unité de
caserne n'a pas de régénération de focus — sa fiche ne porte que dix
statistiques, et celle-là n'y est pas.

### Ce que le dossier vaut maintenant

Plus rien, dans le calcul de la puissance, ne vient d'une déduction ou d'un
ajustement. Chaque terme, chaque constante, chaque « sans bonus » a son nœud dans
le fichier. La seule chose encore établie par la mesure plutôt que par la lecture
est le fait que les deux puissances **s'additionnent** — et c'est confirmé sur
deux comptes à moins de 1 %.

---

## 24. Le diagnostic, fait une fois : deux statistiques sur quatre

Thomas : « tu le fais une fois, tu détermines si les valeurs de la formule au
moment de l'affichage et les nôtres sont les bonnes ; si ce n'est pas le cas, tu
cherches celles qui diffèrent, et on les cherche dans le fichier. »

C'est la bonne méthode, et elle n'a pas besoin d'aller lire dans le jeu : le
tableau « Stats de profil » AFFICHE toutes les entrées de la formule. Huit héros,
deux comptes, et voici l'écart entre notre valeur EXACTE, avant tout arrondi, et
celle du jeu.

| | Attaque | Défense | Points de vie | Dégâts de base |
|---|---|---|---|---|
| Wallace | +0,19 | −0,01 | +0,92 | −0,37 |
| Achille | +0,36 | −0,26 | +1,71 | −0,57 |
| Ulysse | −0,70 | +0,14 | +0,60 | −0,62 |
| Marie Curie | +0,30 | +0,59 | +1,00 | −0,31 |
| Isabella | −0,27 | −0,20 | +1,38 | −0,89 |
| Lily | −0,59 | −0,12 | +0,91 | −0,66 |
| Edison | −0,57 | −0,19 | 0,00 | −0,19 |
| Jeanne d'Arc | +0,26 | −0,23 | +0,32 | −0,37 |

**Attaque et défense se trompent dans les deux sens** : c'est du bruit d'arrondi,
et nos valeurs sont justes.

**Les points de vie sont toujours trop hauts. Les dégâts de base toujours trop
bas.** Deux biais, deux signes constants — donc deux vraies questions.

### Les dégâts de base : pas un biais, une écriture

Notre exact tombe toujours dans l'intervalle qui précède l'entier du jeu, et les
parties fractionnaires (0,11 · 0,34 · 0,38 · 0,43 · 0,63 · 0,63 · 0,69 · 0,81)
couvrent tout l'intervalle. C'est ce qu'on attend d'un PLAFOND, pas d'un manque —
si une contribution nous échappait, elles se serreraient sous 0,5.

Le cas qui tranche est Isabella : 599,11 chez nous, **600** dans le jeu. Un
arrondi ordinaire donnerait 599.

Total plafonné pour cette statistique : **8 justes sur 8**.

### Les points de vie : biais réel, trois coupables éliminés

**La caserne est juste** — Edison le prouve : tous ses termes sont des entiers,
7 656 + 4 670 + 0, et le total tombe EXACTEMENT sur les 12 326 du jeu.

**L'équipement est juste** — le tableau d'Achille écrit +491, on calcule 490,71.

**Donc le déficit est dans la statistique de niveau :**

| | on calcule | il faudrait |
|---|---|---|
| Edison | 7 656 | **7 656** |
| Jeanne d'Arc | 10 080 | 10 079,7 |
| Isabella | 12 038,4 | 12 037,0 |
| Marie Curie | 13 490 | 13 489 |
| Achille | 15 694 | 15 692,3 |

Marie Curie est le cas le plus net : tous ses termes sont entiers — 13 490 +
4 670 + 70 = 18 230 — et le jeu écrit 18 229. Il manque exactement 1, sans une
décimale pour l'expliquer.

**LA PISTE, ET POURQUOI ON NE LA PREND PAS.** En ajustant les deux taux sur ces
cinq héros, on trouve 0,0399 par niveau et 0,0608 par ascension au lieu de 0,04
et 0,06 — et ça colle aux cinq à moins de 0,001. Mais le catalogue écrit 0,04 et
0,06, et toute cette soirée a montré que le fichier a raison contre l'ajustement.
Un point de vie sur vingt mille ne vaut pas qu'on recommence à régler.

### L'état

| | ce matin | ce soir |
|---|---|---|
| Statistiques exactes (8 héros × 4) | 17/32 | **22/32** |
| dont dégâts de base | 2/8 | **8/8** |
| dont défense | 6/8 | **7/8** |
| Jeanne d'Arc | — | **exacte sur les quatre** |
| Puissance, autre compte | +11 % | **8 092 pour 8 093** |

Restent : les points de vie à +1, et l'attaque à −1 sur trois héros.

---

## 25. Le panthéon est hors de cause, et l'escouade n'a qu'une valeur

Trois questions de Thomas, le 21 août 2026, et elles s'enchaînent : *« essaie la
formule sur Marie Curie »*, *« et en jouant sur les arrondis ? »*, *« et le
panthéon, qui est du contenu récent, aurait-il pu changer la formule ? »*

### Marie Curie, terme par terme

| | |
|---|---|
| esquive `1/(1−0,05)` | 1,05263 |
| crit `1 + 0,05 × (1,727−1)` | 1,03635 |
| relique `1 + 0,005 × 13` | 1,065 |
| combat `62/60 × (1+0,0168×4,75)` | 1,11579 |
| combat `+ (2,03 + 39×0,025) × 1 × 1` | 3,00500 |
| produit sous la racine | 2,6226 × 10¹⁴ |
| `× 1,218/1000` | **19 724,9** — le héros |
| escouade | **1 425,8** |
| **total** | **21 151** pour **21 138** dans le jeu |

### Les arrondis ne portent pas ces treize points

Pour les effacer, il faudrait retrancher 2,93 d'attaque, ou 2,23 de défense, ou
23,4 de points de vie, ou 0,98 de dégâts de base. Les résidus réellement mesurés
au §24 valent +0,30 · +0,59 · +1,00 · −0,31 — **dix fois trop petits**. Calculer
sur exactement les entiers que le jeu affiche donne 21 149 : deux points gagnés
sur treize.

Sept variantes d'arrondi ont été essayées sur les neuf héros relevés (arrondi
final retiré, vitesse exacte, vitesse au plancher, statistiques au plafond, au
plancher, arrondies, escouade non tronquée). Aucune ne descend sous ±6, et
toutes déplacent l'erreur d'un héros à l'autre sans la réduire.

### Le panthéon : réfuté sur pièce, par trois chemins

1. **L'écran de Curie sépare lui-même les deux parts** : « 19 620 +1 518 ». On
   calcule 19 630 sans panthéon (+10) et +1 520 d'apport (+2, soit 0,13 %).
   **Dix des treize points sont là AVANT qu'un seul nœud n'entre.**
2. **Six des neuf héros relevés n'ont aucun nœud activé** et dérivent quand même
   — Wallace +18,6 sans panthéon. Et Achille, le plus chargé (9 nœuds, 2 128
   points de puissance), est le plus juste : −1,8. La corrélation va à l'envers.
3. **Le catalogue ne contient que deux formules de puissance** :
   `formula.unit_power_hero` et `formula.expected_unit_power`. Le balayage de
   tous les identifiants contenant « power » dans les 25 Mo n'en donne pas de
   troisième. Le `CalculatePantheonInclusivePower` du moteur (§15) n'est pas une
   formule : c'est l'interrupteur qui décide si l'écran AFFICHE le panthéon
   dedans ou à côté — exactement ce que montre l'écran de Curie.

Les vingt-deux survols relevés au §8 le confirment nœud par nœud : les onze
nœuds qui ne rapportent rien dans le jeu ne rapportent rien chez nous non plus,
et les onze autres se répondent à 1 ou 2 % près.

### Le balayage de 256 formules, et pourquoi il ne compte pas

Huit interrupteurs structurels combinés (vitesse sans bonus arrondie, vitesse
exacte, esquive en `1+e`, relique en puissance, escouade sans crit, escouade non
tronquée, capacité comptée au niveau plein, rareté hors du terme de vitesse),
ajustés sur les huit héros de Thomas.

| | pire écart | RMS |
|---|---|---|
| formule actuelle | 18,6 | 8,63 |
| vitesse sans bonus arrondie | 12,7 | 5,75 |
| meilleure des 256 | 6,5 | **4,11** |

Et le test qui les tue, sur un héros **gardé hors de l'ajustement** — le Wallace
du compte témoin, puissance relevée 8 093 :

| | écart |
|---|---|
| **formule actuelle** | **−0,7** |
| vitesse sans bonus arrondie | −8,7 |
| meilleure des 256 | −3,6 |

Les deux « améliorations » dégradent le seul héros qu'elles n'ont pas servi à
régler. Deux des cinq interrupteurs gagnants contredisent d'ailleurs le fichier
du jeu directement : il porte un `FormulaDivisionDTO` pour `1/(1−Esquive)` et une
multiplication pour la relique.

**Garder un héros hors de l'ajustement est le seul garde-fou qui ait tenu.**

### La piste de l'escouade : essayée, réfutée, retirée

La formule du héros étant lue dans le fichier, on retranche sa part de la
puissance relevée : il reste l'escouade qu'il FAUDRAIT. Sur huit héros :

| héros | arme · taille | on calcule | il faudrait |
|---|---|---|---|
| Jeanne d'Arc | inf. lourde · 2 | 1 424,1 | 1 420,0 |
| Edison | siège · 1 | 1 425,8 | 1 420,3 |
| Isabella | inf. lourde · 2 | 1 424,1 | 1 420,3 |
| Lily | cavalerie · 2 | 1 422,9 | 1 421,1 |
| Achille | infanterie · 3 | 1 417,6 | 1 419,4 |

Cinq héros, trois armes, trois tailles d'escouade, un seul nombre à 1,1 point
près. Et le §21 avait établi que le jeu équilibre ses unités à puissance égale :
nos quatre valeurs par arme (1 417,4 à 1 425,8) devaient donc être notre bruit.
On a remplacé la valeur de l'arme par la moyenne des unités de MÊME NIVEAU du
compte — le niveau et non le compte entier, les casernes du compte témoin
n'étant pas montées ensemble.

Sur ces huit héros, cinq passaient sous 2,1 points.

**PUIS ON A COMPTÉ LES RELEVÉS DISPONIBLES : IL Y EN AVAIT DIX-NEUF, PAS HUIT.**

| | erreur moyenne | pire |
|---|---|---|
| escouade par arme (avant) | **0,048 %** | **0,147 %** |
| moyenne des unités de même niveau | 0,051 % | 0,152 % |

*(seize héros, les trois anomalies connues mises à part)*

Cinq héros s'améliorent, cinq empirent, et les cinq qui empirent sont exactement
ceux qui n'avaient pas servi à régler : Artémise 0,009 → 0,081 %, Guillaume Tell
0,010 → 0,104 %, Robin des Bois 0,046 → 0,089 %, Tomoe 0,060 → 0,109 %, Ulysse
0,035 → 0,065 %.

**Le changement a été RETIRÉ.** `formules.js` et `app.js` sont revenus à
l'escouade par arme.

*La leçon, la cinquième, et je l'ai apprise en la refaisant : le journal
contenait dix-neuf relevés, j'en ai pris huit, et j'ai retrouvé exactement le
piège que le §21 décrit. Compter les mesures disponibles AVANT de régler quoi que
ce soit.*

### Et la piste « vitesse d'attaque boostée » tombe avec elle

Sur les huit héros, les quatre dont la vitesse n'était pas boostée étaient les
plus justes. Sur les dix-neuf, ce n'est plus vrai : Robin des Bois n'est pas
boosté et dérive de 0,046 %, Guillaume Tell l'est et tombe à 0,010 %. Les deux
groupes ont la même erreur moyenne — 0,042 % contre 0,052 %. **Ce n'était qu'un
effet d'échantillon.**

### CE QUE VAUT LE CALCUL, HÉROS PAR HÉROS

Dix-neuf puissances relevées, encore valables (même niveau qu'au relevé), plus le
héros du compte témoin :

| héros | niveau | jeu | site | écart | erreur |
|---|---|---|---|---|---|
| Achille | 160 | 28 142 | 28 140 | −2 | **0,006 %** |
| Artémise I | 60 | 5 780 | 5 781 | +1 | **0,009 %** |
| Wallace (compte témoin) | 80 | 8 093 | 8 092 | −1 | **0,009 %** |
| Guillaume Tell | 40 | 4 401 | 4 401 | 0 | **0,010 %** |
| Reine Boadicée | 90 | 10 417 | 10 415 | −2 | **0,018 %** |
| Lily la Tigresse | 80 | 9 607 | 9 609 | +2 | **0,019 %** |
| Isabella I | 105 | 14 215 | 14 219 | +4 | **0,026 %** |
| Jeanne d'Arc | 90 | 11 768 | 11 772 | +4 | **0,034 %** |
| Jules César | 111 | 15 211 | 15 216 | +5 | **0,034 %** |
| Ulysse | 102 | 13 763 | 13 768 | +5 | **0,035 %** |
| Robin des Bois | 80 | 9 672 | 9 677 | +5 | **0,046 %** |
| Edison | 80 | 9 375 | 9 380 | +6 | **0,059 %** |
| Marie Curie | 134 | 21 138 | 21 151 | +13 | **0,060 %** |
| Tomoe Gozen | 70 | 8 083 | 8 088 | +5 | **0,060 %** |
| Spartacus | 60 | 7 275 | 7 270 | −6 | **0,076 %** |
| William Wallace | 110 | 14 843 | 14 862 | +19 | **0,125 %** |
| Miyamoto Musashi | 50 | 4 995 | 4 988 | −7 | **0,147 %** |
| — | | | | | |
| Ashoka le Grand | 81 | 11 126 | 11 184 | +58 | 0,52 % |
| Léonard de Vinci | 110 | 14 815 | 14 956 | +141 | 0,95 % |
| Hatchepsout | 110 | 17 700 | 17 987 | +287 | 1,62 % |

**Dix-sept héros sur vingt tiennent dans 0,15 %**, moyenne **0,048 %** — soit un
demi-point de puissance pour mille. Les trois autres ont chacun une cause
identifiée, et aucune n'est la formule :

- **Ashoka et Hatchepsout portent la même configuration** : un ensemble de parure
  ET un ensemble d'armement qui donnent tous deux des points de vie (Chacal +
  Dharma). C'est le cas ouvert du §19. Ils sont **deux sur deux** — la règle
  d'assiette des PV est en cause, pas la puissance. Un troisième héros du compte
  est dans ce cas : **Qin Shi Huang**.
- **Léonard de Vinci n'était PAS une anomalie : son relevé était périmé.** Sa
  relique était au **niveau 7** quand la mesure a été prise, et elle est au 8 dans
  l'export du soir. Au niveau 7, ses quatre statistiques tombent au point près et
  sa puissance à +10 :

  | relique | attaque | défense | puissance |
  |---|---|---|---|
  | niveau 7 | 1 715,7 | 1 555,8 | 14 825 (**+10**) |
  | niveau 8 (export) | 1 727,7 | 1 560,8 | 14 956 (+141) |
  | **le jeu, le 19/08** | **1 716** | **1 555** | **14 815** |

  Vérifié que ce n'est pas un défaut de lecture général : baisser TOUTES les
  reliques d'un niveau fait passer l'erreur moyenne de 13 à 67 points.

  **LES RELEVÉS ROUILLENT.** Une puissance mesurée cesse d'être vraie dès que le
  héros gagne un niveau de relique, une pièce d'équipement ou un nœud. Avant de
  conclure à une anomalie, vérifier que la mesure est contemporaine de l'export.

### Ce qui reste, et c'est UNE question

Ashoka et Hatchepsout portent la même configuration : **Dharma (2 pièces, +5 % de
PV) plus une parure de 3 pièces qui donne aussi des PV**. Le pourcentage de la
parure se calcule sur une assiette, et les trois lectures possibles ne donnent
pas la même chose :

| assiette de la parure | Ashoka | Hatchepsout |
|---|---|---|
| **A** — niveau + éveil + caserne + objets *(règle actuelle, celle de Lily)* | 16 914 | 21 115 |
| **B** — sans l'éveil | **16 704** | 20 832 |
| **C** — ordinaire, niveau seul | 16 138 | **20 409** |
| ce qu'il faudrait pour que la puissance tombe | **16 713** | **20 390** |

**Ils ne réclament pas la même règle.** Ashoka veut B, Hatchepsout veut C — et
pour elle ce n'est pas déduit d'une puissance mais LU sur son écran : le jeu
affiche 20 408, l'assiette C donne 20 409,5.

**LA CAPTURE QUI TRANCHE : le tableau « Stats de profil » d'ASHOKA LE GRAND, ligne
des points de vie.**

- si elle dit **≈ 16 704** → les deux héros suivent des règles différentes, et il
  faudra chercher ce qui les sépare (parure du Chacal +10 % chez Ashoka, Égyptien
  royal +7,5 % chez Hatchepsout) ;
- si elle dit **≈ 16 138** → l'assiette C vaut pour les deux, la règle est unique,
  et c'est le relevé de PUISSANCE d'Ashoka qui est périmé — comme Léonard.

Résolue, cette question fait passer Ashoka de 0,52 % à ~0,03 % et Hatchepsout de
1,62 % à ~0,02 % : **tout le compte tomberait alors sous 0,15 %, sans exception.**

### Arrondir en décimales : essayé, sans effet

Question de Thomas : « et si tu arrondis toutes les valeurs en décimal ? »
Testé sur les dix-neuf relevés, à toutes les précisions, dans les trois sens.

| variante | erreur moyenne | pire |
|---|---|---|
| 4 grandes stats → 1 décimale · plancher | 0,0440 % | 0,147 % |
| 4 grandes stats → 1 décimale · arrondi | 0,0470 % | 0,147 % |
| **exact (retenu)** | **0,0478 %** | **0,147 %** |
| 4 grandes stats → **entiers** · arrondi | 0,0606 % | 0,176 % |
| 4 grandes stats → entiers · plafond | 0,1034 % | 0,174 % |
| petites stats → 2 décimales · plafond | 0,1474 % | 0,417 % |

**Le pire écart ne bouge pas** — 0,147 %, Musashi, identique qu'on arrondisse ou
non. Un arrondi manquant déplacerait les extrêmes ; celui-ci ne touche que la
troisième décimale de la moyenne.

**Arrondir aux entiers est nettement pire**, ce qui reconfirme le §22 — *le jeu
ÉCRIT des entiers et CALCULE sur les valeurs exactes* — cette fois sur dix-neuf
héros au lieu de huit.

Et le « gain » du plancher à une décimale est un mirage : il améliore 15 héros sur
19 parce que **nos écarts sont majoritairement positifs (+3,1 points en moyenne)**
et que tronquer pousse tout le monde vers le bas. N'importe quel rabot ferait
pareil ; multiplier par 0,99994 donnerait le même résultat. Ce n'est pas un
arrondi qu'on découvre, c'est un biais qu'on masque.

**Ce biais de +3,1 points est en revanche un vrai signal**, et le §24 l'a déjà
cerné : en ajustant les taux de montée on trouve 0,0399 par niveau au lieu de
0,04, et ça colle à cinq héros — mais le catalogue écrit 0,04. Ça vaut 0,03 % :
noté, laissé tranquille.

---

## 26. Marie Curie, lue en entier — et la limite de l'instrument

Thomas a envoyé le 21/08/2026 au soir trois captures qui, ensemble, ferment le
dossier sur cette héroïne : son écran d'amélioration à **trois niveaux
consécutifs**, son tableau **« Stats de profil » complet**, et l'écran de sa
**caserne de siège**.

### Les trois niveaux — les taux de montée sont justes

| niveau | ATQ | DÉF | PV | DÉG base | puissance |
|---|---|---|---|---|---|
| 135 | 2286 / **2285** | 1737 / **1736** | 18306 / **18305** | 766 / **766** | 21 309 / **21 297** |
| 136 | 2293 / **2293** | 1742 / **1742** | 18382 / **18381** | 771 / **771** | 21 468 / **21 456** |
| 137 | 2300 / **2300** | 1747 / **1747** | 18458 / **18457** | 775 / **775** | 21 628 / **21 615** |

*(site / jeu)*

Nos incréments de puissance : **+158,6 · +159,1 · +159,8**. Ceux du jeu : **+159 ·
+159 · +159**. La progression est suivie au dixième de point — les taux de montée
du catalogue sont bons, et l'écart ne grandit pas avec le héros.

### Le tableau complet — vingt-deux nombres, vingt-et-un exacts

| ligne | le jeu (niveau 137) | le site |
|---|---|---|
| Attaque | 518 · 87 · 112 · 311 · 127 → **2 300** | identique |
| Défense | 518 · — · 38 · 64 · — → **1 747** | identique |
| Points de vie | 4 670 · — · — · 70 · — → **18 457** | 18 45**8** |
| Dégâts de base | — · — · — · 93 · 33 → **775** | identique |
| Dégâts crit | 0 % · +2,7 % objet · +20 % panthéon → **172,7 %** | **172,7 %** |
| Chances de crit · Esquive | 5 % · 5 % (panthéon) | identiques |
| Portée · Vitesse d'attaque | 6 · **62 coups/min** (+2 d'équipement) | identiques |
| Charge normale 8 s | ⇒ régén. focus **12,5** | **12,5** |

**Toutes les entrées de la formule sont désormais lues à l'écran, et toutes sont
justes.** Cela enterre au passage la piste des dégâts crit ouverte le soir même :
le jeu affiche bien 172,7 %, notre valeur était la bonne, et le « 1,7007 magique »
qui aurait fait tomber la puissance pile était une coïncidence — la troisième de
la journée.

### La caserne de siège innocente l'escouade

| | le jeu | le site |
|---|---|---|
| unité (catapulte), ATQ | **1 459** | 1 459 |
| DÉF | **699** | 699 |
| PV | **6 178** | 6 17**9** |
| taille d'escouade | **1** | 1 |

**J'avais conclu une heure plus tôt que l'escouade était surestimée de 0,9 % — par
élimination. C'était faux, et l'écran le dit.** L'unité est calculée juste, comme
celle d'infanterie du §21.

### La limite de l'instrument

Reste +13 sur sa puissance. Or le jeu n'affiche que des ENTIERS, et il les
PLAFONNE (§22) : chaque statistique n'est donc connue qu'à un point près. En
propageant ces quatre incertitudes dans la formule :

| | |
|---|---|
| puissance compatible avec l'écran | **[21 606,4 ; 21 630,2]** |
| largeur de l'intervalle | **23,7 points** |
| ce que dit le jeu | 21 615 |
| ce que dit le site | 21 628 |

**Les deux nombres tiennent dans le même intervalle.** Aucune capture d'écran ne
peut départager notre modèle du jeu sur ce héros : l'écart résiduel est plus petit
que la résolution de l'instrument.

C'est la vraie raison pour laquelle les résidus de 0,05 % ne tombent pas, et
pourquoi tout ce qui a été tenté aujourd'hui pour les faire tomber a échoué au
contrôle. **Ce n'est pas la formule qui manque de précision, c'est la mesure.**

### Ce qui reste vrai, et qu'on refuse encore

Nos valeurs sont un cheveu TROP HAUTES, et ça se voit directement : les points de
vie sont à +1 chez Marie Curie aux quatre niveaux relevés, **et à +1 aussi sur
l'unité de sa caserne**. Cinq fois sur cinq. Notre attaque exacte (2 300,07) et
nos PV (18 458) sortent même de l'intervalle que l'écran autorise.

Les taux ajustés du §24 (0,0399 par niveau, 0,0608 par ascension pour les PV et
les dégâts) suppriment ce biais — le décalage moyen passe de **+3,13 à −0,81** et
l'erreur moyenne de 5,19 à 4,19 points. Mais ils font passer Achille de −1,8 à
−13, et le catalogue écrit 0,04 et 0,06.

**Refusé, pour la même raison qu'au §24 et qu'au §25 : le catalogue a raison contre
l'ajustement, et un contrôle qui casse un héros pour en réparer trois n'est pas une
découverte.**

### L'état, au 21 août 2026 au soir

| | |
|---|---|
| 17 héros sur 19 | ≤ 0,15 %, moyenne 0,048 % |
| Marie Curie | **entièrement lue** : 21 nombres sur 22 exacts, résidu sous la résolution de l'écran |
| Léonard de Vinci | relevé périmé d'un niveau de relique — résolu |
| Ashoka · Hatchepsout | **la seule question ouverte** (assiette des PV à deux ensembles) |
