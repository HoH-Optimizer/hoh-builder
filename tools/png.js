'use strict';
// Lecture et écriture de PNG en Node pur, sans dépendance : zlib suffit.
// Le projet n'installe rien, et l'on n'a besoin que du strict nécessaire —
// images 8 bits par canal, non entrelacées, ce que produisent les captures
// du jeu comme les icônes du wiki.

const fs = require('fs');
const zlib = require('zlib');

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// Table de CRC32, celle que le format PNG impose pour chaque bloc.
const tableCrc = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = -1;
  for (const octet of buf) c = tableCrc[(c ^ octet) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

// Défiltrage : chaque ligne d'un PNG est encodée par rapport à ses voisines,
// selon l'une des cinq méthodes que décrit la spécification.
const defiltrer = (brut, largeur, hauteur, canaux) => {
  const pasLigne = largeur * canaux;
  const sortie = Buffer.alloc(pasLigne * hauteur);
  let source = 0;
  for (let y = 0; y < hauteur; y++) {
    const filtre = brut[source++];
    const debut = y * pasLigne;
    const precedent = debut - pasLigne;
    for (let x = 0; x < pasLigne; x++) {
      const valeur = brut[source++];
      const a = x >= canaux ? sortie[debut + x - canaux] : 0;   // pixel de gauche
      const b = y > 0 ? sortie[precedent + x] : 0;              // pixel du dessus
      const c = y > 0 && x >= canaux ? sortie[precedent + x - canaux] : 0;
      let ajout = 0;
      if (filtre === 1) ajout = a;
      else if (filtre === 2) ajout = b;
      else if (filtre === 3) ajout = (a + b) >> 1;
      else if (filtre === 4) {
        const p = a + b - c;
        const da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
        ajout = da <= db && da <= dc ? a : db <= dc ? b : c;
      } else if (filtre !== 0) throw new Error(`Filtre PNG inconnu : ${filtre}`);
      sortie[debut + x] = (valeur + ajout) & 0xff;
    }
  }
  return sortie;
};

// Lit un PNG et rend toujours du RGBA, quel que soit son type de couleur :
// la suite du traitement n'a ainsi qu'un seul cas à gérer.
const lire = (chemin) => {
  const buf = fs.readFileSync(chemin);
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error(`${chemin} n'est pas un PNG`);

  let position = 8;
  let entete = null;
  let palette = null;
  let transparence = null;
  const morceaux = [];

  while (position < buf.length) {
    const taille = buf.readUInt32BE(position);
    const type = buf.toString('ascii', position + 4, position + 8);
    const contenu = buf.subarray(position + 8, position + 8 + taille);
    if (type === 'IHDR') {
      entete = {
        largeur: contenu.readUInt32BE(0),
        hauteur: contenu.readUInt32BE(4),
        bits: contenu[8],
        couleur: contenu[9],
        entrelacement: contenu[12],
      };
    } else if (type === 'PLTE') palette = Buffer.from(contenu);
    else if (type === 'tRNS') transparence = Buffer.from(contenu);
    else if (type === 'IDAT') morceaux.push(contenu);
    else if (type === 'IEND') break;
    position += 12 + taille;
  }

  if (!entete) throw new Error(`${chemin} : en-tête IHDR introuvable`);
  if (entete.bits !== 8 && entete.bits !== 16) throw new Error(`${chemin} : seuls les PNG 8 et 16 bits sont gérés`);
  if (entete.entrelacement) throw new Error(`${chemin} : les PNG entrelacés ne sont pas gérés`);

  const canauxParType = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  const canaux = canauxParType[entete.couleur];
  if (!canaux) throw new Error(`${chemin} : type de couleur ${entete.couleur} non géré`);
  if (entete.bits === 16 && entete.couleur === 3) throw new Error(`${chemin} : une palette n'existe pas en 16 bits`);

  const { largeur, hauteur } = entete;
  // Le défiltrage travaille sur des octets : en 16 bits, un pixel en occupe deux
  // fois plus, et c'est ce nombre-là qu'il faut lui donner pour qu'il retrouve
  // le pixel de gauche. Le reste de la lecture ne garde ensuite que l'octet de
  // poids fort de chaque échantillon — le site n'affiche pas plus de 256 nuances.
  const octetsParPixel = canaux * (entete.bits === 16 ? 2 : 1);
  let brut = defiltrer(zlib.inflateSync(Buffer.concat(morceaux)), largeur, hauteur, octetsParPixel);
  if (entete.bits === 16) {
    const reduit = Buffer.alloc(largeur * hauteur * canaux);
    for (let i = 0; i < reduit.length; i++) reduit[i] = brut[i * 2];
    brut = reduit;
  }
  const pixels = Buffer.alloc(largeur * hauteur * 4);

  for (let i = 0, j = 0; i < largeur * hauteur; i++, j += 4) {
    const s = i * canaux;
    if (entete.couleur === 6) { brut.copy(pixels, j, s, s + 4); continue; }
    if (entete.couleur === 2) { brut.copy(pixels, j, s, s + 3); pixels[j + 3] = 255; continue; }
    if (entete.couleur === 0) { pixels.fill(brut[s], j, j + 3); pixels[j + 3] = 255; continue; }
    if (entete.couleur === 4) { pixels.fill(brut[s], j, j + 3); pixels[j + 3] = brut[s + 1]; continue; }
    const index = brut[s];                                   // couleur 3 : palette
    pixels[j] = palette[index * 3];
    pixels[j + 1] = palette[index * 3 + 1];
    pixels[j + 2] = palette[index * 3 + 2];
    pixels[j + 3] = transparence && index < transparence.length ? transparence[index] : 255;
  }

  return { largeur, hauteur, pixels };
};

const bloc = (type, contenu) => {
  const taille = Buffer.alloc(4);
  taille.writeUInt32BE(contenu.length);
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), contenu]);
  const controle = Buffer.alloc(4);
  controle.writeUInt32BE(crc32(corps));
  return Buffer.concat([taille, corps, controle]);
};

// Écrit toujours en RGBA. Le filtre est choisi ligne par ligne selon la règle
// habituelle : celle qui laisse la plus petite somme de valeurs absolues.
const ecrire = (chemin, { largeur, hauteur, pixels }) => {
  const pasLigne = largeur * 4;
  const brut = Buffer.alloc((pasLigne + 1) * hauteur);

  for (let y = 0; y < hauteur; y++) {
    const debut = y * pasLigne;
    let meilleur = null;
    for (const filtre of [0, 1, 2, 4]) {
      const ligne = Buffer.alloc(pasLigne);
      let cout = 0;
      for (let x = 0; x < pasLigne; x++) {
        const a = x >= 4 ? pixels[debut + x - 4] : 0;
        const b = y > 0 ? pixels[debut - pasLigne + x] : 0;
        const c = y > 0 && x >= 4 ? pixels[debut - pasLigne + x - 4] : 0;
        let retire = 0;
        if (filtre === 1) retire = a;
        else if (filtre === 2) retire = b;
        else if (filtre === 4) {
          const p = a + b - c;
          const da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
          retire = da <= db && da <= dc ? a : db <= dc ? b : c;
        }
        const valeur = (pixels[debut + x] - retire) & 0xff;
        ligne[x] = valeur;
        cout += valeur < 128 ? valeur : 256 - valeur;
      }
      if (!meilleur || cout < meilleur.cout) meilleur = { filtre, ligne, cout };
    }
    brut[y * (pasLigne + 1)] = meilleur.filtre;
    meilleur.ligne.copy(brut, y * (pasLigne + 1) + 1);
  }

  const entete = Buffer.alloc(13);
  entete.writeUInt32BE(largeur, 0);
  entete.writeUInt32BE(hauteur, 4);
  entete[8] = 8;    // 8 bits par canal
  entete[9] = 6;    // RGBA
  fs.writeFileSync(chemin, Buffer.concat([
    SIGNATURE,
    bloc('IHDR', entete),
    bloc('IDAT', zlib.deflateSync(brut, { level: 9 })),
    bloc('IEND', Buffer.alloc(0)),
  ]));
};

const vide = (largeur, hauteur) => ({ largeur, hauteur, pixels: Buffer.alloc(largeur * hauteur * 4) });

const decouper = (image, x, y, largeur, hauteur) => {
  const sortie = vide(largeur, hauteur);
  for (let ligne = 0; ligne < hauteur; ligne++) {
    const source = ((y + ligne) * image.largeur + x) * 4;
    image.pixels.copy(sortie.pixels, ligne * largeur * 4, source, source + largeur * 4);
  }
  return sortie;
};

// Réduction par moyenne de zone : sur une icône, elle rend un résultat bien plus
// propre qu'un simple échantillonnage, et gère la transparence correctement en
// pondérant les couleurs par l'opacité.
const redimensionner = (image, largeur, hauteur) => {
  const sortie = vide(largeur, hauteur);
  const rx = image.largeur / largeur;
  const ry = image.hauteur / hauteur;
  for (let y = 0; y < hauteur; y++) {
    const y0 = Math.floor(y * ry), y1 = Math.max(y0 + 1, Math.ceil((y + 1) * ry));
    for (let x = 0; x < largeur; x++) {
      const x0 = Math.floor(x * rx), x1 = Math.max(x0 + 1, Math.ceil((x + 1) * rx));
      let r = 0, v = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < Math.min(y1, image.hauteur); sy++) {
        for (let sx = x0; sx < Math.min(x1, image.largeur); sx++) {
          const p = (sy * image.largeur + sx) * 4;
          const alpha = image.pixels[p + 3] / 255;
          r += image.pixels[p] * alpha;
          v += image.pixels[p + 1] * alpha;
          b += image.pixels[p + 2] * alpha;
          a += alpha;
          n++;
        }
      }
      const d = (y * largeur + x) * 4;
      sortie.pixels[d] = a > 0 ? Math.round(r / a) : 0;
      sortie.pixels[d + 1] = a > 0 ? Math.round(v / a) : 0;
      sortie.pixels[d + 2] = a > 0 ? Math.round(b / a) : 0;
      sortie.pixels[d + 3] = Math.round((a / n) * 255);
    }
  }
  return sortie;
};

module.exports = { lire, ecrire, vide, decouper, redimensionner };
