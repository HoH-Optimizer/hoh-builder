// Transforme l'export brut de l'extension en fichiers exploitables par le site.
// La logique de décodage vit dans site/decodeur.js, partagée avec le navigateur.
//
// Usage : node tools/extraire.js [export-brut.json] [sortie.json]

const fs = require('fs');
const path = require('path');
const { extraire } = require('../decodeur.js');

const [, , entree = 'data/export-brut.json', sortie = 'data/compte.json'] = process.argv;

const resultat = extraire(JSON.parse(fs.readFileSync(entree, 'utf8')));

fs.mkdirSync(path.dirname(sortie), { recursive: true });
fs.writeFileSync(sortie, JSON.stringify(resultat, null, 2));

// Le site doit pouvoir s'ouvrir par simple double-clic. Or Chrome interdit à une page
// ouverte en local de lire un fichier .json voisin ; un fichier .js, lui, passe sans souci.
// Ce fichier contient des données de compte : il n'est jamais publié (voir .gitignore).
fs.writeFileSync('donnees.js', `window.DONNEES = ${JSON.stringify(resultat)};\n`);

const c = resultat.compte;
console.log(`Écrit ${sortie} et donnees.js`);
console.log(`  Joueur      : ${c.joueur.nom}`);
console.log(`  Héros       : ${c.heros.length} possédés / ${resultat.catalogue.heros.length} dans le jeu`);
console.log(`  Équipements : ${c.equipements.length} (${c.equipements.filter((e) => e.porteParHero).length} portés)`);
console.log(`  Sets        : ${resultat.catalogue.sets.length}`);
