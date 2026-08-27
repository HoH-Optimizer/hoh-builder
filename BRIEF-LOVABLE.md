# Brief à coller dans Lovable

> Ce fichier est un texte à copier tel quel dans Lovable. Il décrit le site à
> refaire, sa direction visuelle et ses contraintes. La partie « Ce que tu ne
> dois PAS réécrire » est la plus importante : sans elle, Lovable réinventera
> les calculs et le site donnera des chiffres faux.

---

## Le projet

Construis une application web d'une seule page, en français, qui sert de
**simulateur d'équipement pour le jeu mobile Heroes of History**. Le joueur y
importe un export de son compte au format JSON, puis essaie des combinaisons
d'équipement sur ses héros pour voir ce que chacune donnerait — sans rien
toucher à son vrai compte.

Tout se passe dans le navigateur : **aucun serveur, aucune base de données,
aucun compte utilisateur, aucun appel réseau**. Les données du joueur restent
chez lui, gardées d'une visite à l'autre dans `localStorage`.

## Ce que tu ne dois PAS réécrire

Ces fichiers existent déjà et représentent des semaines de rétro-ingénierie du
jeu. Ils sont fournis avec le projet et doivent être **repris tels quels**, sans
être « améliorés », simplifiés ni régénérés :

| Fichier | Ce qu'il contient |
|---|---|
| `formules.js` | Les formules du jeu : puissance, statistiques dérivées, effets d'ensemble. Retrouvées par mesure, précision moyenne 0,05 %. |
| `decodeur.js` | La lecture de l'export du compte (protobuf sans schéma, champs identifiés à la main). |
| `pantheon-jeu.js` | Les 22 nœuds de panthéon des 6 classes, relevés un par un à l'écran — introuvables dans les données du jeu. |
| `sets-jeu.js`, `capacites-jeu.js`, `heros-jeu.js`, `eveil-jeu.js`, `reliques-jeu.js`, `casernes-jeu.js`, `ages-jeu.js`, `noms-fr.js` | Le catalogue du jeu et ses traductions françaises. |
| `images/` | Toutes les illustrations : héros, équipements, blasons d'ensembles, icônes de statistiques, nœuds de panthéon. |

**Ta mission porte uniquement sur l'interface.** Branche-la sur ces modules,
n'en recalcule aucune valeur toi-même. Si un chiffre te paraît faux, ne le
corrige pas : signale-le.

## Les écrans

Une seule page, trois colonnes sur grand écran, empilées sur petit.

**1. Colonne des héros (gauche, étroite)**
Une grille de vignettes de héros : portrait, niveau, rareté en étoiles. Un champ
de recherche, un tri (attaque, défense, puissance, niveau…) avec inversion du
sens, et trois filtres : *Mes héros* / *Tous* / *Équipés*. Cliquer sélectionne
le héros travaillé.

**2. Colonne centrale — le comparateur**
Le cœur du site. En haut, l'identité du héros et un bouton **« Équiper au
mieux »** qui cherche dans l'inventaire la meilleure combinaison selon un
critère au choix.

En dessous, **deux colonnes qui s'encadrent autour de l'illustration du héros
en pied** :

- à gauche, l'équipement **réel** du compte, figé ;
- à droite, l'équipement **simulé**, modifiable au clic.

Chaque côté montre cinq cases : *armement* (main, vêtement) d'un côté du héros,
*parure* (chapeau, cou, anneau) de l'autre — comme le jeu les dispose.

Règles impératives sur ces cases :

- **toutes les cases ont exactement la même hauteur**, qu'elles portent un objet
  à un attribut ou à cinq, et même quand elles sont vides. C'est ce qui fait que
  les lignes des deux colonnes se font face — sans quoi la comparaison, qui est
  la raison d'être de l'écran, ne se lit plus ;
- une case = une tuile carrée (illustration de l'objet sur un fond qui dit sa
  rareté, niveau en pastille, étoiles au pied, **blason de l'ensemble dans le
  coin**), puis le nom de l'objet sur une seule ligne, puis ses attributs, un par
  ligne, chiffre collé à son libellé ;
- une case vide montre la silhouette de la pièce attendue et un « + » ;
- la teinte de fond de la case suit la rareté de l'objet.

Sous chaque colonne, la liste des **ensembles** portés : une carte par ensemble,
avec son blason hexagonal en grand, son nom, une jauge de points (un par pièce,
allumés jusqu'à celles que le héros porte) et le bonus écrit en toutes lettres —
acquis pour un ensemble complet, annoncé « encore 1 pièce · … » sinon. Les
ensembles complets passent en premier et se détachent par la couleur d'accent.

Entre les deux colonnes, le héros en pied et sa **puissance estimée**, avec un
petit champ pour recaler le calcul sur la valeur que le jeu affiche.

Puis la **carte de capacité** du héros, et l'**arbre de panthéon** : six paliers,
deux nœuds de chaque côté d'une colonne centrale numérotée, chaque nœud
cliquable. Un nœud pris a ses couleurs pleines et un halo ; un nœud libre est
légèrement rentré, jamais éteint.

**3. Colonne des statistiques (droite)**
Un tableau à quatre colonnes : *statistique · équipement actuel · équipement
simulé · écart*. L'écart est la colonne qu'on vient lire : positif en vert,
négatif en rouge, « = » quand rien ne bouge. Un curseur permet de projeter le
héros à un autre niveau. En dessous, la relique équipée, modifiable elle aussi.

**Fenêtres modales** : le sélecteur d'inventaire (liste filtrable des pièces
disponibles pour un emplacement) et le sélecteur de relique.

## Direction visuelle

Le site actuel est violet foncé avec un accent émeraude — trop coloré, trop
« jeu ». **Je le veux sobre : sombre sans être noir, calme, confortable à
consulter longtemps.**

**Palette (thème sombre, celui par défaut)**

```
fond de page        #14161a   graphite, jamais du noir pur
panneau             #1b1e24
panneau clair       #232830   cartes et lignes posées sur un panneau
bordure             #2f353f
texte               #e3e7ec   pas de blanc pur, il fatigue
texte discret       #99a2ae
accent              #4d9d86   vert-de-gris sourd, un seul, employé avec parcimonie
accent sombre       #2f6b5b
positif             #5fb389
négatif             #cf6b72
```

Un **thème clair** accessible par un bouton, construit sur les mêmes variables :
fond `#f4f5f7`, panneau `#ffffff`, texte `#1d2127`, accent `#2b7f68`.

Toutes les couleurs passent par des variables CSS. Aucune couleur écrite en dur
dans un composant.

**Ce que « sobre » veut dire ici**

- **une seule couleur d'accent**, réservée à ce qui compte : la sélection en
  cours, un ensemble complet, un écart positif. Pas de boutons colorés partout ;
- **pas de dégradés voyants, pas d'ombres portées épaisses, pas de néon.** Le
  relief se fait par un simple filet clair sur l'arête haute des panneaux et une
  bordure d'un ton au-dessus du fond ;
- **les couleurs de rareté restent** (elles viennent du jeu et portent une
  information), mais **très diluées** : la teinte de rareté est versée à 8-12 %
  dans le fond du panneau, pas appliquée pleine ;
- **les illustrations sont les seules taches de couleur vive** de la page. Le
  reste doit leur servir de fond, pas leur faire concurrence.

**Typographie**

- une seule famille sans empattement, lisible en petit corps (Inter, Source Sans
  ou équivalent système) ;
- corps de texte 13-14 px, libellés secondaires 11,5-12 px, titres de section en
  petites capitales espacées, discrets ;
- **tous les chiffres en `font-variant-numeric: tabular-nums`** — c'est un site
  où l'on compare des colonnes de nombres, ils doivent s'aligner.

**Espacement et formes**

- rayons de 10 à 14 px, jamais de coins vifs ni de pastilles complètement rondes
  pour les cartes ;
- de l'air entre les cases : au moins 12 px, c'est l'intervalle qui dit où une
  carte finit ;
- rien ne doit déborder horizontalement : les tableaux et grilles larges
  défilent dans leur propre cadre, jamais la page.

**Mouvement**

Discret : transitions de 120 à 160 ms sur la couleur, la bordure et l'ombre.
Aucune animation d'entrée, aucun élément qui bouge tout seul.

## Accessibilité et confort

- contraste AA au minimum sur tout texte ;
- tout ce qui se clique est atteignable au clavier et montre un anneau de focus
  visible ;
- chaque valeur calculée porte une infobulle qui dit d'où elle vient — c'est un
  outil de calcul, l'utilisateur doit pouvoir vérifier ;
- l'interface est **entièrement en français**, tutoiement, ton posé.

## Comportement attendu

- au premier lancement, un écran d'accueil explique comment récupérer l'export
  de son compte ;
- l'import se fait par un bouton de fichier, ou par glisser-déposer ;
- les données importées sont gardées dans `localStorage` et rechargées seules à
  la visite suivante ;
- un bouton **« Rétablir mon équipement réel »** annule toutes les simulations en
  cours ;
- rien de ce que l'utilisateur importe ne quitte son navigateur. Dis-le-lui.
