# Extension Chrome — Export Heroes of History (v2)

Cette extension est en **lecture seule** : elle recopie les données que le jeu a déjà
reçues, et ne clique jamais à ta place. Rien ne quitte ton navigateur tant que tu ne
cliques pas sur « Télécharger ».

## Installation (à refaire après chaque mise à jour)

1. Ouvrir `chrome://extensions` dans Chrome.
2. Activer **Mode développeur** (interrupteur en haut à droite).
3. Si une ancienne version « HoH Export » est déjà présente, cliquer sur **Supprimer**.
4. Cliquer sur **Charger l'extension non empaquetée** et choisir **ce dossier**.

## Utilisation

1. Ouvrir Heroes of History dans Chrome.
2. Faire `Ctrl + F5` (rechargement complet) et **attendre d'être arrivé à l'écran principal**.
3. Ouvrir au moins un héros et son écran d'équipement, pour être sûr que tout est chargé.
4. Cliquer sur l'icône de l'extension, puis sur **Télécharger mon export JSON**.

## Nouveautés de la v2

- Capture aussi le **catalogue du jeu** (stats de base des héros), pas seulement le compte.
- Observe `fetch`, `XMLHttpRequest` **et** les WebSockets.
- Tient un **journal de toutes les adresses appelées** par le jeu, ce qui permet de
  retrouver le catalogue même s'il est téléchargé depuis une adresse inattendue.
- Les blocs de plus de 500 Ko sont surlignés en vert dans la fenêtre de l'extension :
  ce sont les candidats les plus probables.
