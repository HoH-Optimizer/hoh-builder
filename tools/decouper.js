'use strict';
// Découpe les icônes d'équipement dans les captures de l'écran « Ensemble » du jeu.
//
// Le wiki dont proviennent les autres icônes n'héberge pas celles de neuf
// ensembles. Faute de source, on les prend là où elles sont visibles : l'écran
// qui présente les trois pièces d'un ensemble, une par carte.
//
// Le travail se fait en quatre temps :
//   1. retrouver les cartes et le carré d'illustration de chacune, sans rien
//      coder en dur — les captures n'ont ni le même cadrage ni le même zoom ;
//   2. séparer l'objet du fond doré par propagation depuis le bord ;
//   3. rendre au fond les creux que l'objet enferme — l'intérieur d'un anneau ;
//   4. ne garder que les taches principales, ce qui écarte le numéro de niveau,
//      les étoiles et le blason de l'ensemble.
//
//   node tools/decouper.js            écrit les icônes dans images/equipement/
//   node tools/decouper.js --controle écrit en plus une planche de contrôle
//
// La difficulté tient à ceci que l'objet et le fond sont de la même couleur :
// de l'or sur de l'or. Aucun seuil ne les sépare — c'est le trait de contour que
// l'artiste pose autour de chaque objet qui sert de frontière. La propagation
// compare donc chaque pixel à son voisin et non à une référence : elle suit les
// dégradés du fond sans franchir ce trait.
//
// Le découpage reste un pis-aller. Quand une illustration détourée existe, elle
// passe devant : voir DEJA_DETOUREES.

const path = require('path');
const png = require('./png.js');

const RACINE = path.join(__dirname, '..');
const DESTINATION = path.join(RACINE, 'images', 'equipement');

// Chaque capture montre les trois pièces d'un ensemble, de haut en bas.
// `graines` désigne des points de fond que la propagation ne peut pas atteindre
// depuis le bord parce que l'objet les entoure complètement — l'intérieur d'un
// anneau, le creux d'un collier. Coordonnées en fraction du carré.
const CAPTURES = [
  {
    fichier: 'Ensemble_de_roi_cornu.png',
    set: 'HornedKing',
    pieces: [
      { emplacement: 'Hat', graines: [[0.537, 0.673]] },   // on voit le fond au travers du bandeau
      { emplacement: 'Neck' },
      { emplacement: 'Ring', graines: [[0.603, 0.747]] },   // on voit le fond dans l'anneau
    ],
  },
  {
    fichier: 'Ensemble_de_votageur.png',
    set: 'Voyager',
    pieces: [
      { emplacement: 'Hat', graines: [[0.400, 0.790]] },   // le creux sous la joue du casque
      { emplacement: 'Neck' },
      { emplacement: 'Ring', graines: [[0.566, 0.658]] },   // l'intérieur de l'anneau
    ],
  },
  {
    fichier: 'Ensemble_denchanteresse.png',
    set: 'Enchantress',
    pieces: [
      { emplacement: 'Ring' },
      { emplacement: 'Neck' },
      { emplacement: 'Hat' },
    ],
  },
];

// Illustrations déjà détourées, fournies telles quelles : rien à séparer, il n'y
// a plus qu'à rogner le vide autour et à mettre à la taille des autres icônes.
// Un dessin propre en pleine résolution vaut toujours mieux qu'un découpage
// automatique, si soigneux soit-il : quand il y en a un, il passe devant.
const DEJA_DETOUREES = [
  { fichier: 'Nouveau dossier/logo/bague-enchanteresse.png', nom: 'Enchantress_Ring' },
  { fichier: 'Nouveau dossier/logo/amulette-enchanteresse.png', nom: 'Enchantress_Neck' },
];

// Proportions du carré d'illustration, mesurées sur les captures. Elles ne
// changent pas d'une capture à l'autre : seuls le cadrage et le zoom changent,
// et ceux-là sont retrouvés à la lecture.
const HAUTEUR_CARRE = 1.155;   // le carré est un peu plus haut que large
const BAS_UTILE = 0.82;        // repli si la rangée d'étoiles ne se laisse pas voir
const BLASON = { x: 0.25, haut: 0.46, bas: 0.90 };   // le blason de l'ensemble, en bas à gauche
const NIVEAU = { x: 0.79, bas: 0.15 };               // la pastille de niveau, en haut à droite
const PART_LARGEUR_CARRE = 0.71;   // largeur du carré, rapportée à la hauteur de la carte
const PART_MINIMALE = 0.2;     // une tache plus petite que ce cinquième de la principale est du décor

// Écart de couleur admis entre deux pixels voisins du fond. Les dégradés du jeu
// varient de deux ou trois unités d'un pixel à l'autre ; le trait de contour que
// l'artiste pose autour de chaque objet saute de plus de cent. Entre les deux, la
// marge est large — mais il faut rester bas : une seule brèche dans le contour
// suffit à noyer tout l'objet, dont les ors sont ceux du fond.
const TOLERANCE = Number(process.argv.find((a) => a.startsWith('--tolerance='))?.split('=')[1] ?? 9);
const LARGEUR_FINALE = 160;

/* ------------------------------------------------------- repérage des cartes */

const estCreme = (img, x, y) => {
  const o = (y * img.largeur + x) * 4;
  return img.pixels[o + 2] > 170 && img.pixels[o] > 230;   // le fond de page, hors carte
};

const luminance = (img, x, y) => {
  const o = (y * img.largeur + x) * 4;
  return img.pixels[o] + img.pixels[o + 1] + img.pixels[o + 2];
};

// Une ligne qui passe entre deux cartes est presque entièrement crème ; une ligne
// qui traverse une carte ne l'est pas du tout.
const trouverCartes = (img) => {
  const cartes = [];
  let debut = null;
  for (let y = 0; y < img.hauteur; y++) {
    let creme = 0;
    for (let x = 60; x < 1060; x += 4) if (estCreme(img, x, y)) creme++;
    const dansUneCarte = creme / 250 < 0.9;
    if (dansUneCarte && debut === null) debut = y;
    if (!dansUneCarte && debut !== null) {
      if (y - debut > 250) cartes.push({ haut: debut, bas: y });
      debut = null;
    }
  }
  if (debut !== null && img.hauteur - debut > 250) cartes.push({ haut: debut, bas: img.hauteur });
  return cartes;
};

// Le carré d'illustration est cerné d'un cadre sombre. Ses deux montants sont les
// seules colonnes sombres sur presque toute la hauteur de la carte : on les
// retrouve en comptant, colonne par colonne, les pixels sombres de la carte.
const trouverMontants = (img, cartes) => {
  const scores = new Array(500).fill(0);
  let lignes = 0;
  for (const carte of cartes) {
    for (let y = carte.haut + 40; y < carte.bas - 40; y++) {
      lignes++;
      for (let x = 0; x < 500; x++) if (luminance(img, x, y) < 400) scores[x]++;
    }
  }
  // Un montant est une colonne sombre sur plus de la moitié des lignes. Le bord
  // de la carte en est une aussi, et le décor en fournit d'autres : pour trancher,
  // on retient la paire dont l'écartement approche le mieux la largeur attendue.
  // Le carré occupe toujours la même part de la hauteur de la carte, quel que
  // soit le zoom de la capture.
  const sombres = scores.map((n, x) => ({ x, part: n / lignes })).filter((c) => c.part > 0.55);
  const groupes = [];
  for (const { x } of sombres) {
    const dernier = groupes[groupes.length - 1];
    if (dernier && x - dernier[dernier.length - 1] <= 3) dernier.push(x);
    else groupes.push([x]);
  }
  const larges = groupes.filter((g) => g.length >= 3);
  if (larges.length < 2) throw new Error('Montants du cadre introuvables');

  // La paire se choisit sur les milieux : une ombre portée épaissit le montant
  // gauche d'une dizaine de pixels, ce qui déplacerait un bord mais laisse le
  // milieu à peu près en place. Ce sont ensuite les bords extérieurs qui servent
  // de repères, l'ombre étant du côté intérieur.
  const milieu = (g) => (g[0] + g[g.length - 1]) / 2;
  const hauteurs = cartes.map((c) => c.bas - c.haut).sort((a, b) => a - b);
  const attendue = hauteurs[hauteurs.length >> 1] * PART_LARGEUR_CARRE;
  let meilleure = null;
  for (let a = 0; a < larges.length; a++) {
    for (let b = a + 1; b < larges.length; b++) {
      const ecart = Math.abs(milieu(larges[b]) - milieu(larges[a]) - attendue);
      if (!meilleure || ecart < meilleure.ecart) meilleure = { gauche: larges[a], droite: larges[b], ecart };
    }
  }
  if (meilleure.ecart > attendue * 0.15) throw new Error('Montants du cadre introuvables');
  return { gauche: meilleure.gauche[0], droite: meilleure.droite[meilleure.droite.length - 1] };
};

// La traverse haute du cadre, elle, se lit carte par carte : c'est la première
// ligne sombre sur toute la largeur du carré. Le haut de la carte, lui, dépend
// d'une ombre portée dont l'épaisseur varie — trop imprécis pour s'y fier.
const trouverHautDuCarre = (img, carte, montants) => {
  const largeur = montants.droite - montants.gauche;
  const groupes = [];
  for (let y = carte.haut; y < carte.haut + Math.round(largeur * 0.3); y++) {
    let sombres = 0;
    for (let x = montants.gauche + 10; x < montants.droite - 10; x++) if (luminance(img, x, y) < 400) sombres++;
    if (sombres / (largeur - 20) <= 0.7) continue;
    const dernier = groupes[groupes.length - 1];
    if (dernier && y - dernier[dernier.length - 1] === 1) dernier.push(y);
    else groupes.push([y]);
  }
  // Le haut de la carte donne lui aussi une ligne sombre, plus fine : c'est la
  // plus épaisse des deux qui est la traverse du cadre.
  if (!groupes.length) throw new Error(`Traverse haute introuvable pour la carte à y=${carte.haut}`);
  const traverse = groupes.reduce((m, g) => (g.length > m.length ? g : m));
  return traverse[traverse.length - 1] + 1;
};

// La rangée d'étoiles ferme le bas du carré. Elle ne tombe pas toujours à la même
// hauteur selon la capture, et elle tient à l'objet dès qu'il descend jusqu'à
// elle : on la repère à sa couleur, un crème pâle que le fond doré n'a jamais.
const trouverHautDesEtoiles = (img, hautCarre, hauteurCarre, montants) => {
  const largeur = montants.droite - montants.gauche;
  // Le blason porte lui aussi un emblème pâle : on regarde à sa droite, là où la
  // rangée d'étoiles est seule de son espèce.
  const depart = montants.gauche + Math.round(largeur * BLASON.x);
  const etendue = montants.droite - 5 - depart;
  for (let y = hautCarre + Math.round(hauteurCarre * 0.6); y < hautCarre + hauteurCarre; y++) {
    if (y >= img.hauteur) break;
    let pales = 0;
    for (let x = depart; x < montants.droite - 5; x++) {
      const o = (y * img.largeur + x) * 4;
      const [r, v, b] = [img.pixels[o], img.pixels[o + 1], img.pixels[o + 2]];
      if (r > 235 && v > 210 && b > 110 && b < 215) pales++;
    }
    if (pales / etendue > 0.25) return y;
  }
  return hautCarre + Math.round(hauteurCarre * BAS_UTILE);
};

/* ------------------------------------------ séparation de l'objet et du fond */

// Propagation : un pixel rejoint le fond s'il ressemble à celui d'où l'on vient.
// Les dégradés passent, le contour de l'objet arrête.
const propager = (img, fond, departs) => {
  const { largeur, hauteur, pixels } = img;
  const pile = [];
  const empiler = (x, y) => {
    if (x < 0 || y < 0 || x >= largeur || y >= hauteur) return;
    const i = y * largeur + x;
    if (fond[i]) return;
    fond[i] = 1;
    pile.push(i);
  };
  for (const [x, y] of departs) empiler(x, y);

  while (pile.length) {
    const i = pile.pop();
    const x = i % largeur, y = (i / largeur) | 0;
    const o = i * 4;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
      const j = ny * largeur + nx;
      if (fond[j]) continue;
      const p = j * 4;
      const ecart = Math.max(
        Math.abs(pixels[p] - pixels[o]),
        Math.abs(pixels[p + 1] - pixels[o + 1]),
        Math.abs(pixels[p + 2] - pixels[o + 2]),
      );
      if (ecart <= TOLERANCE) empiler(nx, ny);
    }
  }
  return fond;
};

// Le fond visible depuis le bord du carré : le tour de l'objet.
const marquerFond = (img) => {
  const departs = [];
  for (let x = 0; x < img.largeur; x++) { departs.push([x, 0], [x, img.hauteur - 1]); }
  for (let y = 0; y < img.hauteur; y++) { departs.push([0, y], [img.largeur - 1, y]); }
  return propager(img, new Uint8Array(img.largeur * img.hauteur), departs);
};

const propagerDepuis = (img, fond, x, y) => propager(img, fond, [[x, y]]);

// L'intérieur d'un anneau, le creux d'un collier : du fond que l'objet enferme
// et que la propagation depuis le bord ne peut pas atteindre.
//
// On le reconnaît à ceci qu'il a gardé la couleur du fond. Pour en juger malgré
// le dégradé du jeu, on donne d'abord à chaque pixel la couleur du pixel de fond
// le plus proche, puis on compare. Une poignée de pixels ne prouve rien — un
// reflet de l'objet peut y ressembler — mais une large plage, si : elle sert
// alors d'amorce à une propagation ordinaire, qui s'arrêtera au contour.
// Le seuil ne peut pas être serré : l'objet cache le cœur du halo, si bien que ce
// qu'on voit au travers est plus clair que le fond qui l'entoure. D'où le
// garde-fou : on essaie le remplissage à part, et on ne le retient que s'il ne
// dévore pas l'objet.
const SEUIL_ENFERME = 32;
const PART_ENFERMEE = 0.004;   // sous ce dixième de pour cent du carré, c'est un reflet
const DEBORDEMENT = 0.4;       // au-delà de cette part de l'objet, le remplissage a fui

const amorcerFondEnferme = (img, fond) => {
  const { largeur, hauteur, pixels } = img;
  const teinte = new Int32Array(largeur * hauteur).fill(-1);
  let file = [];
  for (let i = 0; i < fond.length; i++) if (fond[i]) { teinte[i] = i; file.push(i); }

  while (file.length) {
    const suivante = [];
    for (const i of file) {
      const x = i % largeur, y = (i / largeur) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
        const j = ny * largeur + nx;
        if (teinte[j] >= 0) continue;
        teinte[j] = teinte[i];
        suivante.push(j);
      }
    }
    file = suivante;
  }

  const candidat = new Uint8Array(largeur * hauteur);
  for (let i = 0; i < candidat.length; i++) {
    if (fond[i] || teinte[i] < 0) continue;
    const a = i * 4, b = teinte[i] * 4;
    const ecart = Math.max(
      Math.abs(pixels[a] - pixels[b]),
      Math.abs(pixels[a + 1] - pixels[b + 1]),
      Math.abs(pixels[a + 2] - pixels[b + 2]),
    );
    // Deux conditions, parce qu'aucune ne suffit seule : la couleur du fond doré,
    // que les ors de l'objet imitent de près, et la ressemblance avec le fond
    // voisin, que le halo caché par l'objet met en défaut à lui seul.
    const jaune = pixels[a] > 232 && pixels[a + 1] > 185 && pixels[a + 2] < 95;
    if (jaune && ecart <= SEUIL_ENFERME) candidat[i] = 1;
  }

  // Les reflets de l'objet qui ressemblent au fond forment des rubans étroits le
  // long des contours ; un creux, lui, est une plage large. Trois érosions
  // effacent les premiers et laissent les seconds — et coupent au passage les
  // ponts par lesquels un creux communiquerait avec un reflet voisin.
  for (let passe = 0; passe < 3; passe++) {
    const avant = Uint8Array.from(candidat);
    for (let y = 0; y < hauteur; y++) {
      for (let x = 0; x < largeur; x++) {
        const i = y * largeur + x;
        if (!avant[i]) continue;
        if (x === 0 || y === 0 || x === largeur - 1 || y === hauteur - 1
          || !avant[i - 1] || !avant[i + 1] || !avant[i - largeur] || !avant[i + largeur]) candidat[i] = 0;
      }
    }
  }

  const minimum = Math.round(largeur * hauteur * PART_ENFERMEE);
  const vues = new Uint8Array(largeur * hauteur);
  const amorces = [];
  for (let depart = 0; depart < candidat.length; depart++) {
    if (!candidat[depart] || vues[depart]) continue;
    const pile = [depart];
    const membres = [];
    vues[depart] = 1;
    while (pile.length) {
      const i = pile.pop();
      membres.push(i);
      const x = i % largeur, y = (i / largeur) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
        const j = ny * largeur + nx;
        if (!candidat[j] || vues[j]) continue;
        vues[j] = 1;
        pile.push(j);
      }
    }
    if (membres.length >= minimum) amorces.push(membres);
  }

  // Chaque plage est essayée à part, sur une copie : si le remplissage emporte
  // une bonne part de l'objet, c'est qu'il a trouvé une brèche dans le contour,
  // et l'on préfère alors garder le fond enfermé plutôt que perdre l'objet.
  let objet = 0;
  for (let i = 0; i < fond.length; i++) if (!fond[i]) objet++;
  for (const plage of amorces) {
    const essai = Uint8Array.from(fond);
    propager(img, essai, plage.map((i) => [i % largeur, (i / largeur) | 0]));
    let gagnes = 0;
    for (let i = 0; i < essai.length; i++) if (essai[i] && !fond[i]) gagnes++;
    if (gagnes <= objet * DEBORDEMENT) fond.set(essai);
  }
  return fond;
};

// Ce qui n'est pas le fond forme plusieurs taches : l'objet, mais aussi le décor
// que la propagation n'a pas pu atteindre. On garde la plus grande et celles qui
// en approchent — un anneau que le blason a coupé en deux doit rester entier —,
// et l'on écarte les miettes.
const tachesPrincipales = (fond, largeur, hauteur) => {
  const vues = new Uint8Array(largeur * hauteur);
  const taches = [];
  for (let depart = 0; depart < fond.length; depart++) {
    if (fond[depart] || vues[depart]) continue;
    const pile = [depart];
    const membres = [];
    vues[depart] = 1;
    while (pile.length) {
      const i = pile.pop();
      membres.push(i);
      const x = i % largeur, y = (i / largeur) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur) continue;
        const j = ny * largeur + nx;
        if (fond[j] || vues[j]) continue;
        vues[j] = 1;
        pile.push(j);
      }
    }
    taches.push(membres);
  }
  const plusGrande = Math.max(...taches.map((t) => t.length));
  const garde = new Uint8Array(largeur * hauteur);
  for (const tache of taches) {
    if (tache.length < plusGrande * PART_MINIMALE) continue;
    for (const i of tache) garde[i] = 1;
  }
  return garde;
};

// Le contour d'un objet détouré garde un liseré du fond doré : on rend
// progressivement transparents les pixels du bord plutôt que de trancher net.
const adoucir = (garde, largeur, hauteur) => {
  const alpha = new Uint8Array(largeur * hauteur);
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      const i = y * largeur + x;
      if (!garde[i]) continue;
      let voisinsDehors = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= largeur || ny >= hauteur || !garde[ny * largeur + nx]) voisinsDehors++;
      }
      alpha[i] = voisinsDehors === 0 ? 255 : Math.max(0, 255 - voisinsDehors * 55);
    }
  }
  return alpha;
};

const cadrerSurLObjet = (img, alpha) => {
  let x0 = img.largeur, y0 = img.hauteur, x1 = -1, y1 = -1;
  for (let y = 0; y < img.hauteur; y++) {
    for (let x = 0; x < img.largeur; x++) {
      if (!alpha[y * img.largeur + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const marge = 2;
  x0 = Math.max(0, x0); y0 = Math.max(0, y0);
  x1 = Math.min(img.largeur - 1, x1 + marge); y1 = Math.min(img.hauteur - 1, y1 + marge);

  const largeur = x1 - x0 + 1, hauteur = y1 - y0 + 1;
  const sortie = png.vide(largeur, hauteur);
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      const source = (y + y0) * img.largeur + (x + x0);
      const d = (y * largeur + x) * 4;
      sortie.pixels[d] = img.pixels[source * 4];
      sortie.pixels[d + 1] = img.pixels[source * 4 + 1];
      sortie.pixels[d + 2] = img.pixels[source * 4 + 2];
      sortie.pixels[d + 3] = alpha[source];
    }
  }
  return sortie;
};

/* ------------------------------------------------------------------- rendu */

const extraire = (capture) => {
  const img = png.lire(path.join(RACINE, capture.fichier));
  const cartes = trouverCartes(img);
  if (cartes.length < 3) throw new Error(`${capture.fichier} : ${cartes.length} carte(s) trouvée(s), 3 attendues`);
  const montants = trouverMontants(img, cartes);

  // Tout se mesure sur la largeur du carré, seule dimension que les montants
  // donnent directement. On retire l'épaisseur du cadre pour ne garder que
  // l'illustration, et l'on s'arrête au-dessus de la rangée d'étoiles.
  const cadre = Math.round((montants.droite - montants.gauche) * 0.022);
  const largeurCarre = montants.droite - montants.gauche - cadre * 2;
  const hauteurCarre = Math.round(largeurCarre * HAUTEUR_CARRE);

  return cartes.slice(0, 3).map((carte, rang) => {
    const piece = capture.pieces[rang];
    const y = trouverHautDuCarre(img, carte, montants);
    const x = montants.gauche + cadre;
    const l = largeurCarre;
    const etoiles = trouverHautDesEtoiles(img, y, hauteurCarre, montants);
    const h = Math.min(etoiles - y, img.hauteur - y);
    const carre = png.decouper(img, x, y, l, h);

    // L'ordre compte : le fond enfermé se reconnaît à sa ressemblance avec le
    // fond voisin, ce qui suppose que le fond voisin en soit vraiment. Masquer
    // le blason d'abord le ferait passer pour du fond brun sombre, et le creux
    // du bijou juste à côté ne ressemblerait plus à rien.
    const fond = marquerFond(carre);
    amorcerFondEnferme(carre, fond);

    // Deux éléments d'interface sont posés par-dessus l'illustration : le blason
    // de l'ensemble en bas à gauche, la pastille de niveau en haut à droite. On
    // les déclare fond à leur tour : sinon ils tiennent à l'objet et le suivent.
    const masquer = (x0, y0, x1, y1) => {
      for (let yy = Math.max(0, y0); yy < Math.min(h, y1); yy++) {
        for (let xx = Math.max(0, x0); xx < Math.min(l, x1); xx++) fond[yy * l + xx] = 1;
      }
    };
    masquer(0, Math.round(hauteurCarre * BLASON.haut), Math.round(l * BLASON.x), Math.round(hauteurCarre * BLASON.bas));
    masquer(Math.round(l * NIVEAU.x), 0, l, Math.round(hauteurCarre * NIVEAU.bas));

    // Reste, s'il en reste, ce qu'aucune règle n'a su voir : on l'amorce à la main.
    for (const [gx, gy] of piece.graines || []) {
      propagerDepuis(carre, fond, Math.round(l * gx), Math.round(hauteurCarre * gy));
    }

    const garde = tachesPrincipales(fond, l, h);
    const alpha = adoucir(garde, l, h);
    return { nom: `${capture.set}_${piece.emplacement}`, image: mettreALaTaille(cadrerSurLObjet(carre, alpha)) };
  });
};

const mettreALaTaille = (objet) => {
  const echelle = LARGEUR_FINALE / Math.max(objet.largeur, objet.hauteur);
  return echelle < 1
    ? png.redimensionner(objet, Math.round(objet.largeur * echelle), Math.round(objet.hauteur * echelle))
    : objet;
};

// Une illustration déjà détourée n'a plus qu'à être rognée sur sa partie opaque
// et ramenée à la taille des autres. Le vide autour d'elle est parfois noir,
// parfois blanc, selon l'outil qui l'a produite : seule l'opacité fait foi, et
// la réduction pondère les couleurs par elle — aucun liseré ne s'invite.
const reprendre = ({ fichier, nom }) => {
  const img = png.lire(path.join(RACINE, fichier));
  const alpha = new Uint8Array(img.largeur * img.hauteur);
  for (let i = 0; i < alpha.length; i++) alpha[i] = img.pixels[i * 4 + 3];
  return { nom, image: mettreALaTaille(cadrerSurLObjet(img, alpha)) };
};

const controle = process.argv.includes('--controle');
const resultats = new Map();
for (const capture of CAPTURES) {
  for (const { nom, image } of extraire(capture)) resultats.set(nom, { nom, image, source: 'capture' });
}
// Après, pour que le dessin fourni l'emporte sur le découpage de la même pièce.
for (const pretes of DEJA_DETOUREES) {
  const { nom, image } = reprendre(pretes);
  resultats.set(nom, { nom, image, source: 'fournie' });
}

for (const { nom, image, source } of resultats.values()) {
  png.ecrire(path.join(DESTINATION, `${nom}.png`), image);
  console.log(`  ${nom}.png  ${image.largeur}×${image.hauteur}  ${source === 'fournie' ? '(illustration fournie)' : ''}`);
}

if (controle) {
  // Une planche unique, sur un fond sombre proche de celui des tuiles du site :
  // c'est là que se voient les bavures qu'un fond clair cacherait.
  const cellule = LARGEUR_FINALE + 20;
  const planche = png.vide(cellule * 3, cellule * 3);
  for (let i = 0; i < planche.largeur * planche.hauteur; i++) {
    planche.pixels[i * 4] = 58; planche.pixels[i * 4 + 1] = 42;
    planche.pixels[i * 4 + 2] = 18; planche.pixels[i * 4 + 3] = 255;
  }
  [...resultats.values()].forEach(({ image }, k) => {
    const dx = (k % 3) * cellule + ((cellule - image.largeur) >> 1);
    const dy = ((k / 3) | 0) * cellule + ((cellule - image.hauteur) >> 1);
    for (let y = 0; y < image.hauteur; y++) {
      for (let x = 0; x < image.largeur; x++) {
        const s = (y * image.largeur + x) * 4;
        const d = ((dy + y) * planche.largeur + dx + x) * 4;
        const a = image.pixels[s + 3] / 255;
        for (let k2 = 0; k2 < 3; k2++) {
          planche.pixels[d + k2] = Math.round(image.pixels[s + k2] * a + planche.pixels[d + k2] * (1 - a));
        }
      }
    }
  });
  const chemin = path.join(RACINE, 'controle-decoupe.png');
  png.ecrire(chemin, planche);
  console.log(`\nPlanche de contrôle : ${chemin}`);
}
