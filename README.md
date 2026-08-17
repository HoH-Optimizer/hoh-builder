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

- Les **130 héros du jeu**, avec filtres (possédés / tous / équipés) et recherche
- Les **5 emplacements** de chaque héros, pré-remplis avec l'équipement réel du compte
- Choix d'objet parmi tout l'inventaire, trié par rareté, avec les attributs détaillés
  et le nom du héros qui le porte déjà
- **Échange automatique** : équiper un objet porté par un autre héros le lui retire
- Les **attributs verrouillés** sont grisés et non comptés, comme dans le jeu
- Colonne **écart** : ce que chaque modification gagne ou perd par rapport à l'équipement réel
- Détection des **sets** et du nombre de pièces portées

## Limites connues

Elles viennent toutes du même endroit : le catalogue du jeu (téléchargé séparément de
l'état du compte) n'est pas encore décodé.

| Manque | Conséquence |
|---|---|
| Statistiques de base des héros | Les écarts entre configurations sont exacts, mais pas les totaux absolus. On peut saisir les valeurs à la main par héros, elles sont mémorisées dans le navigateur. |
| Noms affichés | Le site montre les identifiants internes anglais (`SiouxShaman`) au lieu des noms traduits. Un bandeau le signale. |
| Bonus de set | Le nombre de pièces est affiché, pas encore l'effet. |
| Icônes de 7 sets | Images cassées côté wiki : le site affiche l'initiale du set. |

## Pour les curieux : comment ça marche

Le jeu répond en **Protocol Buffers binaire**, sans schéma public : le format ne contient
aucun nom de champ, seulement des numéros. Les correspondances ont été reconstituées en
observant les données, et sont documentées dans [`decodeur.js`](decodeur.js).

Les **formules de calcul** sont isolées dans [`formules.js`](formules.js), court et commenté :
c'est le seul fichier à modifier si les valeurs affichées ne collent pas au jeu.

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

**Après toute modification de l'extension ou du décodeur**, régénérer l'archive proposée
au téléchargement sur la page d'accueil :

```bash
node tools/extension.js
```

Ce script recopie `decodeur.js` dans l'extension (elle décode elle-même, et ne peut pas
lire un fichier hors de son dossier) puis reconstruit `hoh-exporter-simple.zip`.

## Illustrations

Elles proviennent du wiki communautaire [heroesofhistory.wiki](https://heroesofhistory.wiki),
dont les adresses reprennent exactement les identifiants internes du jeu. Merci à ses
contributeurs. Les dessins appartiennent à InnoGames.

## Licence

Le code est sous licence MIT (voir [LICENSE](LICENSE)). Cette licence ne couvre **pas**
les illustrations ni les noms et données du jeu, qui restent la propriété d'InnoGames.
