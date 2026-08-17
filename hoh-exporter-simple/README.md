# Extension Chrome — HOH Builder

Cette extension est en **lecture seule** : elle recopie les données que le jeu a déjà
reçues et ne clique jamais à ta place. Elle n'automatise rien.

Rien ne part sur Internet. Le décodage se fait dans ton navigateur, et les données
sont transmises à HOH Builder d'un onglet à l'autre, sans jamais passer par un serveur.

## Installation

1. Ouvrir `chrome://extensions` dans Chrome (ou Edge, ou Brave).
2. Activer **Mode développeur** (interrupteur en haut à droite).
3. Si une ancienne version est déjà présente, cliquer sur **Supprimer**.
4. Cliquer sur **Charger l'extension non empaquetée** et choisir **ce dossier**.

## Utilisation

1. Ouvrir Heroes of History et faire `Ctrl + F5`.
2. Attendre l'écran principal.
3. Ouvrir HOH Builder : les données y sont déjà.

Le bouton **Ouvrir HOH Builder** de l'extension y mène directement.

## Ce que fait l'extension

Elle intercepte la réponse `/game/startup` du jeu — celle qui décrit ton compte —,
la **décode sur place**, et n'en garde que le résultat utile : quelques centaines de Ko
au lieu des dizaines de Mo de données brutes.

Le fichier `decodeur.js` est une copie de celui du site, recopiée automatiquement par
`node tools/extension.js` : une extension ne peut pas lire un fichier hors de son dossier.

## Mode diagnostic

Dans les options avancées de l'extension, il conserve **tout** ce que le jeu échange :
moteur du jeu, mémoire du navigateur, journal complet des adresses appelées. Il sert
uniquement à décoder les données que le simulateur ne sait pas encore lire
(statistiques de base des héros, traductions, bonus de set).

Il ralentit le jeu et produit des fichiers très lourds : le laisser désactivé en usage normal.
