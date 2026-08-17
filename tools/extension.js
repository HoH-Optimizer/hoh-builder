// Prépare l'archive de l'extension proposée au téléchargement sur le site.
//
//   1. recopie decodeur.js dans l'extension (elle décode elle-même les données,
//      et une extension ne peut pas lire un fichier hors de son dossier) ;
//   2. construit hoh-exporter-simple.zip.
//
// À relancer après toute modification de l'extension ou du décodeur.
// Usage : node tools/extension.js

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER = 'hoh-exporter-simple';
const ARCHIVE = path.join(RACINE, `${DOSSIER}.zip`);

// Le décodeur vit à la racine (le site s'en sert aussi) : l'extension en garde une copie.
fs.copyFileSync(path.join(RACINE, 'decodeur.js'), path.join(RACINE, DOSSIER, 'decodeur.js'));

/* --- Écriture d'une archive ZIP, sans dépendance externe --------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (octets) => {
  let c = -1;
  for (const octet of octets) c = CRC_TABLE[(c ^ octet) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

// Date/heure au format MS-DOS attendu par le format ZIP.
const dateDos = (d) => ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xffff;
const jourDos = (d) => (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;

function construireZip(entrees) {
  const morceaux = [];
  const index = [];
  let position = 0;
  const maintenant = new Date();

  for (const { nom, contenu } of entrees) {
    const nomOctets = Buffer.from(nom, 'utf8');
    const compresse = zlib.deflateRawSync(contenu, { level: 9 });
    const somme = crc32(contenu);

    const entete = Buffer.alloc(30);
    entete.writeUInt32LE(0x04034b50, 0);      // signature d'entrée locale
    entete.writeUInt16LE(20, 4);              // version minimale
    entete.writeUInt16LE(0x0800, 6);          // noms de fichiers en UTF-8
    entete.writeUInt16LE(8, 8);               // méthode : deflate
    entete.writeUInt16LE(dateDos(maintenant), 10);
    entete.writeUInt16LE(jourDos(maintenant), 12);
    entete.writeUInt32LE(somme, 14);
    entete.writeUInt32LE(compresse.length, 18);
    entete.writeUInt32LE(contenu.length, 22);
    entete.writeUInt16LE(nomOctets.length, 26);

    morceaux.push(entete, nomOctets, compresse);
    index.push({ nom: nomOctets, somme, compresse: compresse.length, brut: contenu.length, decalage: position });
    position += entete.length + nomOctets.length + compresse.length;
  }

  const central = [];
  for (const e of index) {
    const entete = Buffer.alloc(46);
    entete.writeUInt32LE(0x02014b50, 0);      // signature d'entrée centrale
    entete.writeUInt16LE(20, 4);
    entete.writeUInt16LE(20, 6);
    entete.writeUInt16LE(0x0800, 8);
    entete.writeUInt16LE(8, 10);
    entete.writeUInt16LE(dateDos(maintenant), 12);
    entete.writeUInt16LE(jourDos(maintenant), 14);
    entete.writeUInt32LE(e.somme, 16);
    entete.writeUInt32LE(e.compresse, 20);
    entete.writeUInt32LE(e.brut, 24);
    entete.writeUInt16LE(e.nom.length, 28);
    entete.writeUInt32LE(e.decalage, 42);
    central.push(entete, e.nom);
  }

  const centralOctets = Buffer.concat(central);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);           // fin du répertoire central
  fin.writeUInt16LE(index.length, 8);
  fin.writeUInt16LE(index.length, 10);
  fin.writeUInt32LE(centralOctets.length, 12);
  fin.writeUInt32LE(position, 16);

  return Buffer.concat([...morceaux, centralOctets, fin]);
}

const fichiers = fs.readdirSync(path.join(RACINE, DOSSIER)).sort();
const entrees = fichiers.map((nom) => ({
  nom: `${DOSSIER}/${nom}`,
  contenu: fs.readFileSync(path.join(RACINE, DOSSIER, nom)),
}));

fs.writeFileSync(ARCHIVE, construireZip(entrees));

console.log(`Archive écrite : ${DOSSIER}.zip`);
console.log(`  ${entrees.length} fichiers · ${(fs.statSync(ARCHIVE).size / 1024).toFixed(1)} Ko`);
fichiers.forEach((f) => console.log(`   - ${f}`));
