# HOH Builder

Simulateur d'équipement pour **Heroes of History**. Charge l'inventaire de ton compte,
teste des configurations sur n'importe quel héros, et regarde les statistiques se
recalculer en direct — sans jamais toucher à ton compte.

> Outil communautaire non officiel, sans lien avec InnoGames.

## Tes données restent chez toi

**Rien n'est envoyé nulle part.** Le site est une page statique : ton export est lu
dans ton navigateur et n'en sort jamais. Il n'y a ni serveur, ni compte, ni base de
données. Le dépôt ne contient les données d'aucun joueur.

L'extension fournie est en **lecture seule** : elle recopie ce que le jeu a déjà reçu
et ne clique jamais à ta place. Elle n'automatise rien.

## Utilisation

1. Télécharge [`hoh-exporter-simple.zip`](hoh-exporter-simple.zip), décompresse-le, et
   installe-le comme extension Chrome (mode développeur, « Charger l'extension non
   empaquetée »). Le [détail des étapes](hoh-exporter-simple/README.md) est dans l'archive.
2. Ouvre Heroes of History dans Chrome et fais `Ctrl + F5`.
3. Ouvre le site : tes données y sont déjà.

**Aucun fichier à manipuler.** L'extension décode les données du compte et les transmet
au site d'un onglet à l'autre, à l'intérieur du navigateur. Le site les retient ensuite
pour les visites suivantes.

Le bouton **Charger un autre export** reste disponible pour passer par un fichier —
pratique pour ouvrir la configuration de quelqu'un d'autre, ou travailler sur un
navigateur où l'extension n'est pas installée.

## Ce que fait le simulateur

- Les **144 héros du jeu**, avec filtres (possédés / tous / équipés) et recherche
- Les **5 emplacements** de chaque héros, pré-remplis avec l'équipement réel du compte,
  rangés comme le jeu les range : l'armement d'un côté, la parure de l'autre
- Choix d'objet parmi tout l'inventaire, trié par rareté, avec les attributs détaillés
  et le nom du héros qui le porte déjà
- **Échange automatique** : équiper un objet porté par un autre héros le lui retire
- Les **attributs verrouillés** sont grisés et non comptés, comme dans le jeu
- **La feuille de statistiques complète**, rangée en quatre familles comme l'écran
  « Stats » du jeu, avec les valeurs absolues et non plus seulement l'apport de
  l'équipement.
- Colonne **écart** : ce que chaque modification gagne ou perd par rapport à l'équipement réel
- **Se projeter à un autre niveau**, au niveau près et pas seulement par dizaines :
  ce que la même configuration donnerait au 151, au 163 ou au 200. Menu pour viser
  juste, curseur pour balayer.
- La **puissance estimée** sous le héros, avec l'écart que chaque modification lui fait
  gagner ou perdre. Le total est approché — voir « Limites connues » — mais **l'écart en
  pourcentage, lui, est fiable** : l'erreur du modèle est propre au héros et se simplifie
  quand on compare deux configurations du même héros.
- **L'arbre de panthéon, sous le héros**, dessiné comme dans le jeu — six lignes,
  vingt-deux nœuds. **On y clique pour activer ou éteindre un nœud, et les
  statistiques suivent**, exactement comme quand on change une pièce d'équipement :
  la colonne ÉCART montre alors ce que le nœud vaudrait. Au survol, une bulle dit ce
  qu'il rapporte **à ce héros-là**, en points. Une seule règle est imposée, celle du
  jeu : **deux nœuds par ligne au maximum**. Le reste est libre, et il n'y a que deux
  signaux à lire — la COULEUR dit ce qui est pris, le HALO dit ce que la souris
  désigne. Illustré pour les **attaquants individuels** ; les autres classes
  s'affichent avec l'icône de la statistique touchée.
- Un onglet **Panthéon** à côté des statistiques, qui EXPLIQUE le même arbre en toutes
  lettres : ce que chaque nœud rapporterait — « +32 de dégâts de base », « +126
  d'attaque » — calculé par la même chaîne que le tableau de statistiques, avec le coût
  et la règle d'ouverture des paliers. Le site ne conseille aucun chemin : voir plus
  bas pourquoi.
- Chaque ligne se déplie sur **l'addition complète**, source par source, avec le
  cumul qui monte : base, niveau, éveil, caserne, relique, équipement
- **Les héros immortalisés sont montrés tels que tu les as.** Sept héros existent
  en deux versions — celle qu'on obtient et celle qu'on immortalise, qui monte d'un
  cran d'étoiles, part de statistiques plus hautes et change d'illustration. Le site
  lit la version de ton compte et n'affiche qu'elle : ton Hatchepsout cinq étoiles a
  son portrait à cinq étoiles, et la version à quatre étoiles n'apparaît nulle part
  dans ta liste. L'inverse est vrai aussi.
- Tout est en français : héros, objets, ensembles et statistiques portent le nom
  que le jeu leur donne
- **Deux thèmes**, améthyste sombre et améthyste clair, au bouton du bandeau. Le
  choix reste dans ce navigateur d'une visite à l'autre.

## D'où vient chaque chiffre

Le jeu empile six sources pour arriver au nombre qu'il affiche. Le site les reprend
toutes, sauf une :

| Source | État |
|---|---|
| Statistique de base du héros | du catalogue du jeu |
| Montée en niveau et ascensions | du catalogue du jeu (rubrique 8) |
| Escouade qui accompagne le héros | du catalogue du jeu (l'unité de chaque caserne) |
| Paliers d'éveil | du catalogue du jeu |
| Caserne de son arme | du catalogue, le palier venant du compte |
| Relique portée | du catalogue, mise à l'échelle de l'ère du joueur |
| Équipement et bonus d'ensemble | du compte et du catalogue |
| Panthéon | relevé à l'écran nœud par nœud (`pantheon-jeu.js`) — attaquants individuels seulement |

Sur un héros de référence vérifié colonne par colonne contre l'écran « Stats de
profil » du jeu, **les sept sources donnent les mêmes nombres que le jeu** —
panthéon compris, à 217,3 contre 217. Dégâts uniques, vitesse d'attaque, chances
de crit, dégâts crit, esquive, soins reçus et durées de charge sont identiques.
L'attaque, la défense et les points de vie restent à 0,2 % près.

Le panthéon réserve une surprise : deux de ses nœuds ne donnent rien par eux-mêmes,
ils **amplifient une autre source** — « les gains d'ATQ provenant de l'Équipement
augmentent de 50 % ». Sur le héros de référence, ces deux nœuds valent à eux seuls
la totalité des 217 points que le jeu porte au crédit du panthéon.

Deux règles ont été tirées de cette comparaison, et elles comptent :

- **le nombre d'ascensions vient du compte**, pas d'un calcul sur le niveau. Un
  héros niveau 160 en a quinze, pas seize ;
- **un bonus en pourcentage porte sur la statistique de base** du héros, celle
  qu'il tient de son niveau — pas sur tout ce qu'il a accumulé. « +17,65 %
  d'attaque » sur une base de 1 454 fait 257, pas 441.

## Limites connues

| Manque | Conséquence |
|---|---|
| ~~La puissance est **estimée**~~ | **Réglé le 20/08/2026.** La formule est celle du jeu, et **plus aucun nombre n’y est ajusté** — coefficients, taux de montée, arrondis, tout est lu dans ses données. Le terme qu’on ne savait pas expliquer était la **puissance de l’escouade** que la caserne donne au héros. Sur un second compte, jamais utilisé pour régler quoi que ce soit : **8 092 pour 8 093**. **Dix-huit héros sur dix-huit tiennent dans 0,15 %**, erreur moyenne **0,046 %**, et sept héros mesurés sans relique tombent à **0,022 %**. Il ne reste plus une seule anomalie. Les §20 à §28 du journal racontent tout. |
| Aucun conseil sur le panthéon | L'onglet montre ce que chaque nœud rapporte, il ne recommande pas de chemin. Optimiser la puissance affichée donnerait de mauvais conseils : « Ruine généralisée » (+10 % de dégâts de zone) ne rapporte **aucune** puissance alors que c'est sans doute l'un des meilleurs nœuds au combat, tandis que l'esquive, qui en rapporte le plus, ne sert que si l'on encaisse. L'arbitrage reste au joueur. |
| ~~Panthéon de quatre classes sur six~~ | **Réglé le 22/08/2026.** Les **six** arbres sont relevés. Les six partagent le même squelette : vingt positions sur vingt-deux portent le même nœud, et seules deux varient — l'effet de combat de la classe, et Ascension de force ou de fer. Restent cinq nœuds à NOMMER chez les soutiens et les manipulateurs : ce sont des effets de combat, ils ne touchent aucune statistique et ne changent aucune puissance. |
| Ère du joueur | Elle n'est écrite nulle part dans l'export : on la déduit du bâtiment le plus avancé de la capitale, et un menu permet de la corriger. Elle commande la valeur des reliques. |
| ~~Attaque et défense à ±1~~ | **Réglé le 20/08/2026.** Les taux de montée en niveau étaient ajustés faute de mieux ; ils sont désormais lus dans le catalogue du jeu, et le jeu arrondit chaque apport avant de les additionner. L'attaque et la défense d'Achille tombent EXACTEMENT sur son écran, ligne par ligne. Restent 2 points sur ses points de vie et 1 sur ses dégâts de base. |
| ~~8 % des paliers d'éveil~~ | **Résolu le 20/08/2026.** Les 56 paliers qui portaient un numéro de statistique non identifié sont désormais nommés et comptés — dont les chances de crit et les dégâts crit, qui manquaient à trois héros et faussaient leur puissance. |
| Icônes de 7 pièces d'équipement | Le wiki ne les héberge pas et aucune capture ne les montre. Le site affiche à la place l'icône de l'ensemble. Il manque Warden (chapeau, cou, anneau), Berserker et Countess (main, vêtement). |

Deux réglages restent à la main du joueur, parce que l'export ne les donne pas de
façon sûre et qu'ils commandent directement les chiffres : le **niveau de la relique**
et l'**ère**. Ils sont sous la relique, et mémorisés dans le navigateur.

## Pour les curieux : comment ça marche

Le jeu répond en **Protocol Buffers binaire**, sans schéma public : le format ne contient
aucun nom de champ, seulement des numéros. Les correspondances ont été reconstituées en
observant les données, et sont documentées dans [`decodeur.js`](decodeur.js).

Les **formules de calcul** sont isolées dans [`formules.js`](formules.js), court et commenté :
c'est le seul fichier à modifier si les valeurs affichées ne collent pas au jeu.

### Deux sources, deux natures de données

L'export du compte ne dit que ce qui appartient au **joueur** : quels héros, quels objets,
à quel niveau. Tout ce qui appartient au **jeu** — statistiques de base, progression par
niveau, noms traduits, effets d'ensemble, paliers d'éveil — vit dans un catalogue que le
client télécharge à part et que l'export ne capture pas.

La **liste des héros** vient du catalogue, et non de l'export. La distinction n'est pas
théorique : l'export ne mentionne que les héros que le joueur a déjà croisés, et il en
manquait quatorze — dont Thomas Jefferson, que le filtre « Tous » ne montrait pas.

Le site communautaire [Forge of Games](https://forgeofgames.com) rediffuse ce catalogue
tel quel. [`tools/catalogue.js`](tools/catalogue.js) le récupère, le décode avec notre
propre décodeur, et en tire sept fichiers livrés avec le site : `heros-jeu.js`,
`sets-jeu.js`, `eveil-jeu.js`, `casernes-jeu.js`, `reliques-jeu.js`, `ages-jeu.js`
et `noms-fr.js`. Un huitième, [`pantheon-jeu.js`](pantheon-jeu.js), ne vient pas
de là : le panthéon n'existe dans aucune donnée, il a été relevé à l'écran.

### La montée en niveau

Le catalogue ne donne les statistiques d'un héros qu'au niveau 1, et la façon dont elles
montent n'y figure sous aucune forme de table. C'est une formule, reconstituée en
comparant le calculateur de Forge of Games à ses propres constantes :

```
valeur = base × (1 + parNiveau × (niveau − 1) + parAscension × floor(niveau / 10))
```

Les deux taux « par niveau » se lisent tels quels dans le catalogue (4 % pour les points
de vie, 4,65 % pour l'attaque et la défense). Les taux « par ascension » ont été mesurés :
6 % pour les points de vie, 18,6 % pour l'attaque et la défense. Le détail et la
vérification sont dans [`formules.js`](formules.js).

### Les dégâts de base : 90 par seconde, pour tout le monde

Le catalogue n'écrit les dégâts de base que pour 16 héros sur 144. Ce n'est pas un trou
dans les données, c'est une règle du jeu : sur ces 16, le produit **dégâts de base ×
vitesse d'attaque vaut 90**, sans une exception, et la vitesse stockée est exactement
90 divisé par les dégâts.

Au niveau 1, tout héros inflige donc **90 points de dégâts par seconde** — seul le
découpage change, un coup lourd et lent ou plusieurs coups légers et rapides. Le
catalogue ne note la statistique que lorsque le héros s'écarte du coup unique par
seconde ; les 128 autres ont tous une vitesse d'attaque de 1, et donc 90 de dégâts de base.

Vérifié contre le jeu sur Marie Curie, dont le catalogue ne disait rien : avec 90 au
départ, le site retombe exactement sur les 775 dégâts de base que son écran affiche,
panthéon compris.

### Ce qui entre dans la puissance, et ce qui n'y entre pas

Le panthéon a servi de banc d'essai : survoler un nœud sans l'activer affiche la puissance
qu'il ferait gagner, et un nœud ne change qu'une chose à la fois. Onze équations par héros,
gratuitement. Deux arbres complets ont été relevés ainsi, nœud par nœud.

**Huit grandeurs seulement font bouger la puissance** : attaque, défense, points de vie,
dégâts de base, chances de coup critique, dégâts critiques, vitesse d'attaque, esquive.

**Ne comptent pour rien** : les dégâts de zone, les dégâts d'attaque de base, les soins et
boucliers reçus, la vitesse de déplacement, la charge, la portée d'attaque, et tous les
effets conditionnels de combat. Un nœud qui donne « +10 % de dégâts de zone » rapporte
exactement **zéro** point de puissance.

Chacune des huit entre **en racine** — dix-huit relevés entre 0,483 et 0,489 — et la
capacité entre **linéairement**. Le terme qui s'ajoute enfin au tout, et qu'on a longtemps
pris pour une constante, est la **puissance de l'escouade** que la caserne donne au héros :
le jeu additionne les deux sous son nom. C'est lui qui expliquait pourquoi les exposants
mesurés ne tombaient pas sur ½ tout rond.

### Les bonus d'ensemble : deux assiettes, selon la taille de l'ensemble

Un objet qui donne « +17,65 % d'attaque » majore la statistique que le héros tient de
son **niveau**, pas tout ce qu'il a accumulé. Un bonus d'**ensemble** suit la même règle
— sauf s'il vient d'un ensemble de **parure** (3 pièces), qui prend une assiette plus
large : le niveau, **plus la caserne**, plus ce que les pourcentages ont déjà apporté.

| Ensemble | Pièces | Assiette |
|---|---|---|
| Armement (main, vêtement) | 2 | niveau seul, comme un objet |
| Parure (chapeau, cou, anneau) | 3 | niveau + caserne + apport des pourcentages |

**Et seul le bonus PRINCIPAL de la parure prend l'assiette large.** Le catalogue ne porte
que deux parures qui donnent des points de vie, et elles ne se comportent pas pareil : le
Chacal annonce les PV **en premier** et prend l'assiette large ; l'Égyptien royal les
annonce **en second** et retombe sur l'assiette ordinaire. Ce qui décide n'est donc pas le
nom de l'ensemble mais le rang du bonus dans sa fiche. Onze mesures sur trois comptes le
disent, dont deux Hatchepsout et un Louis Pasteur qui n'a aucun éveil pour brouiller la
lecture.

Mesuré sur quatre héros, au point près : Tomoe Gozen et William Wallace tiennent leurs
10 % de points de vie du Chacal, une parure — assiette large. Mian Tansen tient ses 5 %
du Dharma, un armement — assiette ordinaire, et l'assiette large lui donnait 240 points
de vie de trop. Marie Curie confirme du côté de l'attaque avec le Mousquetaire.

### Les reliques changent de valeur avec l'ère

Le catalogue donne pour chaque palier de relique une valeur **de référence**, que le jeu
met ensuite à l'échelle de l'ère du joueur avant de l'arrondir au supérieur :

```
valeur = ceil(référence × modificateur de l'ère)
```

Le modificateur va de 1 à l'Âge de pierre à 3,0635 à l'Ère gothique précoce. Un Gant de
Fauconnerie niveau 15 vaut ainsi +45 attaque de référence, mais **+129 au Haut Moyen Âge**.
Les quinze paliers ont été vérifiés un par un contre le tableau du wiki, aux deux bouts de
l'échelle.

Deuxième piège, sur le **niveau** : le compte range le niveau d'une relique dans un champ
qui **plafonne à 11**, et met les niveaux suivants dans un second champ. Une relique lue
« 11 + 4 » est au niveau 15, pas au niveau 11.

### Outils en ligne de commande (facultatifs)

Ils demandent [Node.js](https://nodejs.org). Le site fonctionne sans eux.

```bash
node tools/serveur.js
```

Sert le site sur `http://localhost:4173`. Sinon, un simple double-clic sur `index.html` suffit.

```bash
node tools/extraire.js data/export-brut.json data/compte.json
```

Convertit un export brut en fichier lisible, et génère un `donnees.js` local qui
précharge les données au lieu de devoir les charger à chaque ouverture.
Ce fichier n'est jamais publié.

```bash
node tools/images.js
```

Récupère les illustrations manquantes. Ne retélécharge jamais ce qui est déjà là.

```bash
node tools/detourer.js "Nouveau dossier/icone.png" images/sets/Jackal.png 96
```

Détoure une icône posée sur un fond clair et la range à la taille du site. Les images
fournies sont des PNG « à fond transparent » vus dans un éditeur, mais le damier de
transparence y est PEINT : le fichier est entièrement opaque. L'outil part des BORDS
et avance de proche en proche — tout ce qui est clair, gris et relié au bord est du
fond. Passer par les bords plutôt que par la couleur seule protège les parties claires
de l'icône elle-même.

```bash
node tools/decouper.js --controle
```

Reconstitue les icônes d'équipement que le wiki n'héberge pas, à partir des captures
de l'écran « Ensemble » du jeu. Le fond doré du jeu et les objets, dorés eux aussi,
n'ont pas de couleur qui les sépare : c'est le trait de contour dessiné autour de
chaque objet qui sert de frontière. `--controle` écrit en plus `controle-decoupe.png`,
une planche des neuf icônes sur fond sombre — le seul moyen de voir les bavures.

Une illustration déjà détourée vaut mieux que n'importe quel découpage : le tableau
`DEJA_DETOUREES`, en tête du fichier, permet d'en fournir une, qui prend alors la
place de la découpe.

```bash
node tools/catalogue.js
```

Régénère les sept fichiers de catalogue depuis le jeu : `heros-jeu.js` (144 héros —
nom français, rareté, type, couleur, classe, statistiques de base), `sets-jeu.js`
(48 ensembles et leurs effets), `eveil-jeu.js` (paliers d'éveil), `casernes-jeu.js`
(183 paliers de caserne), `reliques-jeu.js` (39 reliques), `ages-jeu.js` (le
multiplicateur de chaque ère) et `noms-fr.js` (noms des héros, des ensembles et des
objets). À relancer à chaque mise à jour du jeu.

**Après toute modification de l'extension ou du décodeur**, régénérer l'archive proposée
au téléchargement sur la page d'accueil :

```bash
node tools/extension.js
```

Ce script recopie `decodeur.js` dans l'extension (elle décode elle-même, et ne peut pas
lire un fichier hors de son dossier) puis reconstruit `hoh-exporter-simple.zip`.

## Sources communautaires

Les **illustrations** proviennent du wiki [heroesofhistory.wiki](https://heroesofhistory.wiki),
dont les adresses reprennent exactement les identifiants internes du jeu. Le **catalogue du
jeu** et son **fichier de traduction** proviennent de [forgeofgames.com](https://forgeofgames.com),
qui les rediffuse tels que le jeu les publie. Merci à leurs contributeurs.
Les dessins, les noms et les données du jeu appartiennent à InnoGames.

| Dossier | Contenu |
|---|---|
| `images/heros/` | 136 portraits sur 144 — les cinq variantes légendaires reprennent celui du héros qu'elles doublent, et le wiki n'a encore ni Marie Laveau, ni Ivar the Boneless, ni Cécile Fatiman |
| `images/sets/` | **45 icônes de set sur 45** |
| `images/equipement/` | 119 icônes sur les 126 combinaisons set + emplacement |
| `images/stats/` | 26 icônes de statistiques (attaque, défense, points de vie…) |
| `images/reliques/` | **32 illustrations de relique** |
| `images/classes/`, `images/types/`, `images/couleurs/` | icônes de classe, d'unité et de couleur |

Sept sets (Enchantress, Voyager, Dharma, Jackal, RoyalEgyptian, Ronin, HornedKing) ont
des icônes d'ensemble **cassées sur le wiki lui-même**, et neuf n'y ont aucune icône
d'équipement. Ce qui manque a été repris du jeu et enregistré en `.png`, d'où
l'enchaînement de replis du site : icône d'emplacement en `.webp`, puis en `.png`, puis
icône de set en `.webp`, puis en `.png`, puis l'initiale du set.

## Licence

Le code est sous licence MIT (voir [LICENSE](LICENSE)). Cette licence ne couvre **pas**
les illustrations ni les noms et données du jeu, qui restent la propriété d'InnoGames.
