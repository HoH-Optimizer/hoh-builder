'use strict';
// Découpe le BLASON d'un ensemble dans une capture de l'écran « Ensemble » du jeu.
//
// POURQUOI. Le wiki n'héberge pas l'emblème hexagonal de tous les ensembles.
// Ceux qui manquaient avaient été prélevés à la main, en 42 pixels de côté :
// affichés à 34 puis agrandis, ils ressortaient flous à côté des autres. La
// capture pleine résolution en contient pourtant un bien plus grand, posé dans
// le bandeau de titre, à gauche du nom de l'ensemble.
//
// COMMENT. Le bandeau est crème et le blason brun et doré : on part donc de
// tout ce qui n'est pas crème dans le coin haut gauche. Cela ne suffit pas —
// un liseré court tout autour du bandeau et relie le blason aux lettres du
// titre en une seule tache. On compte alors les pixels colonne par colonne :
// le blason est une masse pleine, le liseré ne fait que deux ou trois pixels
// de haut. La première colonne creuse rencontrée en partant de la gauche
// marque donc le bord droit du blason.
//
//   node tools/blason.js
//
// Les trois captures fournies ne cadrent pas de la même façon et leur crème
// n'est pas exactement le même : rien n'est codé en dur, tout se retrouve.

const path = require('node:path');
const png = require('./png.js');

const RACINE = path.join(__dirname, '..');
const DESTINATION = path.join(RACINE, 'images', 'sets');
const TAILLE = 96;

// Le bandeau occupe le haut de la capture, le blason son bord gauche : on ne
// cherche que là, ce qui écarte les petits blasons répétés sur chaque carte.
const ZONE = { largeur: 0.32, hauteur: 0.135 };

// Au-delà de cette hauteur, une colonne appartient encore au blason ; en deçà,
// on n'a plus que le liseré du bandeau.
const CREUX = 6;

const CAPTURES = [
  { fichier: 'Ensemble_de_roi_cornu.png', set: 'HornedKing' },
  { fichier: 'Ensemble_de_votageur.png', set: 'Voyager' },
  { fichier: 'Ensemble_denchanteresse.png', set: 'Enchantress' },
];

// Ce qui compte comme fond : clair, et sans couleur franche. Le crème du jeu
// est chaud — jusqu'à quatre-vingt-quinze points d'écart entre le rouge et le
// bleu — d'où un seuil bien plus large que pour un gris.
const estFond = (p, i) => {
  const r = p[i * 4], v = p[i * 4 + 1], b = p[i * 4 + 2];
  return Math.min(r, v, b) >= 155 && Math.max(r, v, b) - Math.min(r, v, b) <= 95;
};

// La plus grande tache de non-fond de la zone. Elle contient le blason, et bien
// souvent le liseré du bandeau et les lettres du titre avec lui : `masque` sert
// ensuite à les en séparer.
function plusGrandeTache(image) {
  const { largeur, hauteur, pixels } = image;
  const vu = new Uint8Array(largeur * hauteur);
  let meilleure = null;
  for (let depart = 0; depart < largeur * hauteur; depart++) {
    if (vu[depart] || estFond(pixels, depart)) continue;
    const pile = [depart];
    const membres = [];
    vu[depart] = 1;
    while (pile.length) {
      const i = pile.pop();
      membres.push(i);
      const x = i % largeur, y = (i / largeur) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
        const j = ny * largeur + nx;
        if (vu[j] || estFond(pixels, j)) continue;
        vu[j] = 1;
        pile.push(j);
      }
    }
    if (!meilleure || membres.length > meilleure.length) meilleure = membres;
  }
  return meilleure;
}

// Du bord gauche de la tache jusqu'à la première colonne creuse : le blason.
function boiteDuBlason(membres, largeur, hauteur) {
  const parColonne = new Int32Array(largeur);
  for (const i of membres) parColonne[i % largeur]++;
  let x0 = 0;
  while (x0 < largeur && parColonne[x0] < CREUX) x0++;
  let x1 = x0;
  while (x1 + 1 < largeur && parColonne[x1 + 1] >= CREUX) x1++;
  if (x1 <= x0) return null;

  // Les lignes se comptent ensuite dans cette seule bande de colonnes : le
  // liseré du bandeau, qui la traverse de part en part, en est déjà exclu.
  const parLigne = new Int32Array(hauteur);
  for (const i of membres) {
    const x = i % largeur;
    if (x >= x0 && x <= x1) parLigne[(i / largeur) | 0]++;
  }
  let y0 = 0;
  while (y0 < hauteur && parLigne[y0] < CREUX) y0++;
  let y1 = y0;
  while (y1 + 1 < hauteur && parLigne[y1 + 1] >= CREUX) y1++;
  if (y1 <= y0) return null;
  return { x0, y0, x1, y1 };
}

// Le crème qui reste autour du blason, une fois rogné, devient transparent : on
// part des bords pour ne pas trouer les parties claires du blason lui-même.
function rendreTransparent(image) {
  const { largeur, hauteur, pixels } = image;
  const vu = new Uint8Array(largeur * hauteur);
  const pile = [];
  for (let x = 0; x < largeur; x++) pile.push(x, (hauteur - 1) * largeur + x);
  for (let y = 0; y < hauteur; y++) pile.push(y * largeur, y * largeur + largeur - 1);
  while (pile.length) {
    const i = pile.pop();
    if (vu[i] || !estFond(pixels, i)) continue;
    vu[i] = 1;
    pixels[i * 4 + 3] = 0;
    const x = i % largeur, y = (i / largeur) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
      pile.push(ny * largeur + nx);
    }
  }
  return image;
}

// Le blason est un hexagone plus haut que large : on l'installe dans un carré
// pour que toutes les icônes du site aient les mêmes proportions.
function carrer(image) {
  const cote = Math.max(image.largeur, image.hauteur);
  const carre = png.vide(cote, cote);
  const dx = ((cote - image.largeur) / 2) | 0;
  const dy = ((cote - image.hauteur) / 2) | 0;
  for (let y = 0; y < image.hauteur; y++) {
    for (let x = 0; x < image.largeur; x++) {
      const s = (y * image.largeur + x) * 4;
      const d = ((y + dy) * cote + (x + dx)) * 4;
      image.pixels.copy(carre.pixels, d, s, s + 4);
    }
  }
  return carre;
}

for (const { fichier, set } of CAPTURES) {
  const capture = png.lire(path.join(RACINE, fichier));
  const zone = png.decouper(capture, 0, 0,
    Math.round(ZONE.largeur * capture.largeur),
    Math.round(ZONE.hauteur * capture.hauteur));
  const membres = plusGrandeTache(zone);
  const boite = membres && boiteDuBlason(membres, zone.largeur, zone.hauteur);
  if (!boite) { console.log(`${set} : rien trouvé`); continue; }
  const blason = png.decouper(zone, boite.x0, boite.y0, boite.x1 - boite.x0 + 1, boite.y1 - boite.y0 + 1);
  const icone = png.redimensionner(carrer(rendreTransparent(blason)), TAILLE, TAILLE);
  png.ecrire(path.join(DESTINATION, `${set}.png`), icone);
  console.log(`${set} : ${blason.largeur}×${blason.hauteur} → ${TAILLE}×${TAILLE}`);
}
