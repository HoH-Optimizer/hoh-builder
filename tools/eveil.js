'use strict';
// Découpe les cinq écussons d'éveil dans la planche fournie.
//
// Le site les dessinait jusqu'ici en CSS : un hexagone au clip-path, un dégradé
// de bronze et le chiffre romain par-dessus. L'approximation tenait à petite
// taille, mais ce n'était pas l'écusson du jeu. La planche en donne les cinq
// rangs côte à côte, sur un fond violet uni.
//
//   node tools/eveil.js            écrit images/eveil/1.png … 5.png
//   node tools/eveil.js --controle écrit en plus une planche de contrôle
//
// Le fond s'enlève par propagation depuis le bord plutôt que par comparaison à
// une couleur de référence : chaque écusson porte une ombre portée qui fond
// progressivement dans le violet, et qu'aucun seuil fixe ne saurait suivre. La
// propagation, elle, compare chaque pixel à son voisin déjà reconnu comme fond ;
// elle descend donc le dégradé de l'ombre et s'arrête net sur le liseré doré.

const path = require('path');
const fs = require('fs');
const png = require('./png.js');

const RACINE = path.join(__dirname, '..');
const PLANCHE = path.join(RACINE, 'Nouveau dossier', 'logo', 'apercu-rangs-I-a-V-v3.png');
const DESTINATION = path.join(RACINE, 'images', 'eveil');

const RANGS = 5;
// Écart maximal admis entre deux pixels voisins pour les tenir pour un même fond.
// Assez large pour suivre l'ombre, assez étroit pour ne pas franchir le liseré.
const TOLERANCE = 18;
// Hauteur d'écriture : le site affiche l'écusson à 25 px, on garde de quoi rester
// net sur un écran à forte densité.
const HAUTEUR = 96;

const separerFond = (cellule) => {
  const { largeur, hauteur, pixels } = cellule;
  const fond = new Uint8Array(largeur * hauteur);
  const pile = [];
  const couleur = (i) => [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
  const proche = (a, b) => Math.abs(a[0] - b[0]) <= TOLERANCE
    && Math.abs(a[1] - b[1]) <= TOLERANCE && Math.abs(a[2] - b[2]) <= TOLERANCE;

  const semer = (x, y) => {
    const i = y * largeur + x;
    if (fond[i]) return;
    fond[i] = 1;
    pile.push(i);
  };
  for (let x = 0; x < largeur; x++) { semer(x, 0); semer(x, hauteur - 1); }
  for (let y = 0; y < hauteur; y++) { semer(0, y); semer(largeur - 1, y); }

  while (pile.length) {
    const i = pile.pop();
    const x = i % largeur, y = (i - x) / largeur;
    const ici = couleur(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
      const j = ny * largeur + nx;
      if (fond[j]) continue;
      if (!proche(ici, couleur(j))) continue;
      fond[j] = 1;
      pile.push(j);
    }
  }
  return fond;
};

const cadre = (fond, largeur, hauteur) => {
  let x0 = largeur, y0 = hauteur, x1 = -1, y1 = -1;
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      if (fond[y * largeur + x]) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error('cellule entièrement vide');
  return { x: x0, y: y0, largeur: x1 - x0 + 1, hauteur: y1 - y0 + 1 };
};

const planche = png.lire(PLANCHE);
if (planche.largeur % RANGS) {
  throw new Error(`la planche fait ${planche.largeur} px de large, indivisible en ${RANGS}`);
}
const pas = planche.largeur / RANGS;

fs.mkdirSync(DESTINATION, { recursive: true });
const rendus = [];

for (let rang = 1; rang <= RANGS; rang++) {
  const cellule = png.decouper(planche, (rang - 1) * pas, 0, pas, planche.hauteur);
  const fond = separerFond(cellule);
  for (let i = 0; i < fond.length; i++) if (fond[i]) cellule.pixels[i * 4 + 3] = 0;

  const boite = cadre(fond, cellule.largeur, cellule.hauteur);
  const detoure = png.decouper(cellule, boite.x, boite.y, boite.largeur, boite.hauteur);
  // La réduction par moyenne de zone adoucit du même coup le bord, resté franc
  // parce que la propagation ne rend qu'un oui ou un non.
  const largeur = Math.max(1, Math.round(boite.largeur * (HAUTEUR / boite.hauteur)));
  const icone = png.redimensionner(detoure, largeur, HAUTEUR);

  png.ecrire(path.join(DESTINATION, `${rang}.png`), icone);
  rendus.push(icone);
  console.log(`rang ${rang} : ${boite.largeur}×${boite.hauteur} → ${largeur}×${HAUTEUR}`);
}

if (process.argv.includes('--controle')) {
  const marge = 12;
  const large = rendus.reduce((t, i) => t + i.largeur + marge, marge);
  const controle = png.vide(large, HAUTEUR + marge * 2);
  let x = marge;
  for (const icone of rendus) {
    for (let y = 0; y < icone.hauteur; y++) {
      const source = y * icone.largeur * 4;
      const destination = ((y + marge) * large + x) * 4;
      icone.pixels.copy(controle.pixels, destination, source, source + icone.largeur * 4);
    }
    x += icone.largeur + marge;
  }
  png.ecrire(path.join(RACINE, 'controle-eveil.png'), controle);
  console.log('planche de contrôle : controle-eveil.png');
}
