'use strict';
// Découpe la planche d'un arbre de panthéon en icônes, une par nœud.
//
// POURQUOI UN OUTIL POUR ÇA. Le panthéon n'existe dans aucune donnée du jeu :
// ni ses valeurs, ni ses icônes. Thomas fournit une planche par classe — l'arbre
// entier sur une seule image — et ce fichier la débite.
//
// LA GRILLE EST RÉGULIÈRE, et on ne la code pas en dur : on la retrouve en
// mesurant l'image. Les pastilles sont sombres sur un fond clair ; il suffit de
// compter les pixels sombres par ligne et par colonne pour voir apparaître six
// bandes horizontales et quatre bandes verticales. La colonne du milieu, plus
// étroite, porte les cadenas : on l'écarte par sa largeur.
//
// LE PIÈGE DES NUMÉROS, celui que pantheon-jeu.js documente déjà : le numéro
// d'un nœud ne suit PAS sa position à l'écran. Position 1 -> node3, 2 -> node1,
// 3 -> node2, 4 -> node4. La sixième ligne, elle, n'a que deux nœuds et suit
// l'ordre visuel.
//
// Usage : node tools/pantheon.js <planche.png> <Classe>
//   ex.  node tools/pantheon.js "Nouveau dossier/arbre.png" SingleStriker

const fs = require('node:fs');
const path = require('node:path');
const png = require('./png.js');

const RACINE = path.join(__dirname, '..');
const TAILLE = 96;            // ce que la page affiche, en pixels d'écran
const ORDRE_VISUEL = [3, 1, 2, 4];
const ORDRE_DERNIER_PALIER = [1, 2];

// Une pastille est sombre, le fond est clair. 190 sépare les deux sans hésiter :
// le fond de la planche est à 240, les pastilles autour de 60.
const LUMINANCE_FOND = 190;

function bandes(profil, seuil, tailleMinimale) {
  const sortie = [];
  let debut = null;
  profil.forEach((valeur, i) => {
    if (valeur > seuil) { if (debut === null) debut = i; return; }
    if (debut !== null) {
      if (i - debut >= tailleMinimale) sortie.push({ debut, fin: i - 1, centre: Math.round((debut + i - 1) / 2), taille: i - debut });
      debut = null;
    }
  });
  return sortie;
}

function grille(image) {
  const { largeur, hauteur, pixels } = image;
  const sombre = (x, y) => {
    const p = (y * largeur + x) * 4;
    return pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114 < LUMINANCE_FOND;
  };

  const parLigne = new Array(hauteur).fill(0);
  const parColonne = new Array(largeur).fill(0);
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) if (sombre(x, y)) { parLigne[y]++; parColonne[x]++; }
  }

  const lignes = bandes(parLigne, 60, 60);
  const toutes = bandes(parColonne, 60, 60);
  // La colonne des cadenas fait le tiers de la largeur d'une pastille : on la
  // reconnaît à ça, sans avoir à savoir où elle tombe.
  const large = Math.max(...toutes.map((b) => b.taille));
  const colonnes = toutes.filter((b) => b.taille > large * 0.6);

  if (lignes.length !== 6 || colonnes.length !== 4) {
    throw new Error(`grille inattendue : ${lignes.length} lignes et ${colonnes.length} colonnes `
      + '(il en faut 6 et 4). La planche n\'a peut-être pas la mise en page habituelle.');
  }
  return { lignes, colonnes, sombre, diametre: Math.round(large) };
}

function principal() {
  const [planche, classe] = process.argv.slice(2);
  if (!planche || !classe) {
    console.error('Usage : node tools/pantheon.js <planche.png> <Classe>');
    process.exit(1);
  }

  const image = png.lire(planche);
  const { lignes, colonnes, sombre, diametre } = grille(image);
  console.log(`Planche ${image.largeur}x${image.hauteur} — pastilles de ${diametre} px`);
  console.log('  lignes  :', lignes.map((l) => l.centre).join(', '));
  console.log('  colonnes:', colonnes.map((c) => c.centre).join(', '));

  const dossier = path.join(RACINE, 'images', 'pantheon', classe);
  fs.mkdirSync(dossier, { recursive: true });

  const rayon = Math.round(diametre / 2) + 3;   // trois pixels de marge, pour ne pas raboter le liseré
  let ecrites = 0;

  lignes.forEach((ligne, iLigne) => {
    const palier = iLigne + 1;
    // Une pastille est là où c'est sombre : la dernière ligne n'en a que deux, et
    // on n'a pas à savoir lesquelles à l'avance.
    const presentes = colonnes.filter((colonne) => {
      let sombres = 0;
      for (let dy = -40; dy <= 40; dy += 5) for (let dx = -40; dx <= 40; dx += 5) if (sombre(colonne.centre + dx, ligne.centre + dy)) sombres++;
      return sombres > 100;
    });
    const ordre = presentes.length === 4 ? ORDRE_VISUEL : ORDRE_DERNIER_PALIER;

    presentes.forEach((colonne, iColonne) => {
      const numero = ordre[iColonne];
      const x = Math.max(0, colonne.centre - rayon);
      const y = Math.max(0, ligne.centre - rayon);
      const cote = Math.min(rayon * 2, image.largeur - x, image.hauteur - y);
      const icone = png.redimensionner(png.decouper(image, x, y, cote, cote), TAILLE, TAILLE);
      const nom = `layer${palier}_node${numero}.png`;
      png.ecrire(path.join(dossier, nom), icone);
      ecrites++;
      console.log(`  ${nom.padEnd(20)} position ${iColonne + 1} de la ligne ${palier}`);
    });
  });

  console.log(`\n${ecrites} icônes écrites dans images/pantheon/${classe}/`);
}

principal();
