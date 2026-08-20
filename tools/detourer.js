'use strict';
// Détoure une icône posée sur un fond clair, et la range à la taille du site.
//
// POURQUOI. Les images que Thomas fournit sont des PNG « à fond transparent »
// vus dans un éditeur — mais le damier de transparence y est PEINT : le fichier
// est entièrement opaque, damier compris. Le poser tel quel sur le site donnerait
// une icône sur fond gris à carreaux.
//
// COMMENT. Le fond est clair et gris (les trois canaux presque égaux), l'icône ne
// l'est pas. On part des BORDS et on avance de proche en proche : tout ce qui est
// clair-et-gris et relié au bord est du fond. Passer par les bords plutôt que par
// la couleur seule protège les parties claires de l'icône elle-même — un liseré
// blanc au milieu d'un blason n'est pas relié au bord, il reste.
//
// Ensuite on rogne au plus près de ce qui reste, on garde le carré, et on réduit.
//
// Usage : node tools/detourer.js <source.png> <destination.png> [taille]
//   ex.  node tools/detourer.js "Nouveau dossier/chacal.png" images/sets/Jackal.png 96

const path = require('node:path');
const png = require('./png.js');

const TAILLE_PAR_DEFAUT = 96;

// Ce qui compte comme fond : clair, et sans couleur franche.
const CLARTE = 218;
const ECART_CANAUX = 14;

function detourer(image) {
  const { largeur, hauteur, pixels } = image;
  const fond = new Uint8Array(largeur * hauteur);
  const clair = (i) => {
    const r = pixels[i * 4], v = pixels[i * 4 + 1], b = pixels[i * 4 + 2];
    return Math.min(r, v, b) >= CLARTE && Math.max(r, v, b) - Math.min(r, v, b) <= ECART_CANAUX;
  };

  // Remplissage par diffusion depuis les bords. Une pile explicite plutôt qu'une
  // récursion : sur une image d'un million de pixels, la seconde déborde.
  const pile = [];
  for (let x = 0; x < largeur; x++) { pile.push(x); pile.push((hauteur - 1) * largeur + x); }
  for (let y = 0; y < hauteur; y++) { pile.push(y * largeur); pile.push(y * largeur + largeur - 1); }

  while (pile.length) {
    const i = pile.pop();
    if (fond[i] || !clair(i)) continue;
    fond[i] = 1;
    const x = i % largeur, y = (i - x) / largeur;
    if (x > 0) pile.push(i - 1);
    if (x < largeur - 1) pile.push(i + 1);
    if (y > 0) pile.push(i - largeur);
    if (y < hauteur - 1) pile.push(i + largeur);
  }

  let hautX = largeur, hautY = hauteur, basX = -1, basY = -1;
  for (let i = 0; i < fond.length; i++) {
    if (fond[i]) { pixels[i * 4 + 3] = 0; continue; }
    const x = i % largeur, y = (i - x) / largeur;
    if (x < hautX) hautX = x;
    if (y < hautY) hautY = y;
    if (x > basX) basX = x;
    if (y > basY) basY = y;
  }
  if (basX < 0) throw new Error('image entièrement effacée : le fond n\'était pas ce qu\'on croyait');
  return { hautX, hautY, largeurUtile: basX - hautX + 1, hauteurUtile: basY - hautY + 1 };
}

function principal() {
  const [source, destination, tailleTexte] = process.argv.slice(2);
  if (!source || !destination) {
    console.error('Usage : node tools/detourer.js <source.png> <destination.png> [taille]');
    process.exit(1);
  }
  const taille = Number(tailleTexte) || TAILLE_PAR_DEFAUT;

  const image = png.lire(source);
  const { hautX, hautY, largeurUtile, hauteurUtile } = detourer(image);

  // On garde le carré : une icône ronde ou hexagonale rentrée dans un rectangle
  // se déformerait à l'affichage, où la case est carrée.
  const cote = Math.max(largeurUtile, hauteurUtile);
  const x = Math.max(0, Math.round(hautX - (cote - largeurUtile) / 2));
  const y = Math.max(0, Math.round(hautY - (cote - hauteurUtile) / 2));
  const carre = png.decouper(image, x, y, Math.min(cote, image.largeur - x), Math.min(cote, image.hauteur - y));

  png.ecrire(destination, png.redimensionner(carre, taille, taille));
  console.log(`${path.basename(source)} ${image.largeur}x${image.hauteur}`
    + ` → contenu ${largeurUtile}x${hauteurUtile} en (${hautX},${hautY})`
    + ` → ${path.basename(destination)} ${taille}x${taille}`);
}

principal();
