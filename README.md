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
- Les **5 emplacements** de chaque héros, pré-remplis avec l'équipement réel du compte
- Choix d'objet parmi tout l'inventaire, trié par rareté, avec les attributs détaillés
  et le nom du héros qui le porte déjà
- **Échange automatique** : équiper un objet porté par un autre héros le lui retire
- Les **attributs verrouillés** sont grisés et non comptés, comme dans le jeu
- Colonne **écart** : ce que chaque modification gagne ou perd par rapport à l'équipement réel
- **Totaux absolus** : les statistiques de base du héros sont montées à son niveau réel
  et son niveau d'éveil, puis l'équipement s'y ajoute
- **Bonus d'ensemble** chiffrés dès qu'un set est complet
- Tout est en français : héros, objets, ensembles et statistiques portent le nom
  que le jeu leur donne

## Limites connues

| Manque | Conséquence |
|---|---|
| Panthéon | Les nœuds débloqués sont listés, leurs valeurs restent inconnues : elles ne sont ni dans l'export, ni dans le catalogue téléchargé. |
| Reliques | Idem : la relique portée et son niveau sont connus, pas son effet chiffré. |
| Caserne | Elle ajoute un montant fixe à tous les héros (+40 attaque, +40 défense, +400 points de vie au premier palier, davantage ensuite). Son niveau n'apparaît nulle part dans l'export : ce bonus n'est donc pas compté. |
| Attaque et défense à ±1 | Les points de vie tombent au point près ; l'attaque et la défense peuvent différer d'une unité du chiffre affiché en jeu, qui arrondit à un endroit qu'on ne voit pas. Sans effet sur les écarts entre configurations. |
| 8 % des paliers d'éveil | 56 paliers sur 720 portent sur quatre statistiques que le catalogue désigne par un numéro qu'on n'a pas encore su nommer. Ils sont signalés à l'écran, mais non comptés. |
| Icônes de 7 sets | Images cassées côté wiki : le site affiche l'initiale du set. |

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

Le site communautaire [Forge of Games](https://forgeofgames.com) rediffuse ce catalogue
tel quel. [`tools/catalogue.js`](tools/catalogue.js) le récupère, le décode avec notre
propre décodeur, et en tire quatre fichiers livrés avec le site : `heros-jeu.js`,
`sets-jeu.js`, `eveil-jeu.js` et `noms-fr.js`.

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
node tools/catalogue.js
```

Régénère les quatre fichiers de catalogue depuis le jeu : `heros-jeu.js` (144 héros —
nom français, rareté, type, couleur, classe, statistiques de base), `sets-jeu.js`
(48 ensembles et leurs effets), `eveil-jeu.js` (paliers d'éveil) et `noms-fr.js`
(noms des héros, des ensembles et des objets). À relancer à chaque mise à jour du jeu.

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
| `images/heros/` | **130 portraits sur 130** |
| `images/sets/` | **37 icônes de set sur 37** |
| `images/equipement/` | 44 icônes sur les 62 combinaisons set + emplacement |
| `images/stats/` | 26 icônes de statistiques (attaque, défense, points de vie…) |
| `images/classes/`, `images/types/`, `images/couleurs/` | icônes de classe, d'unité et de couleur |

Sept sets (Enchantress, Voyager, Dharma, Jackal, RoyalEgyptian, Ronin, HornedKing) ont
des images **cassées sur le wiki lui-même**. Leurs icônes ont été découpées dans des
captures du jeu et enregistrées en `.png`, d'où l'enchaînement de replis du site : icône
d'emplacement, puis icône de set en `.webp`, puis en `.png`, puis l'initiale du set.

## Licence

Le code est sous licence MIT (voir [LICENSE](LICENSE)). Cette licence ne couvre **pas**
les illustrations ni les noms et données du jeu, qui restent la propriété d'InnoGames.
