// Petit serveur local pour tester le site dans un navigateur.
// Usage : node tools/serveur.js   puis ouvrir http://localhost:4173
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RACINE = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };

http.createServer((requete, reponse) => {
  const relatif = decodeURIComponent(new URL(requete.url, 'http://x').pathname);
  const cible = path.join(RACINE, relatif === '/' ? 'index.html' : relatif);
  // On refuse tout ce qui sortirait du dossier du site.
  if (!cible.startsWith(RACINE)) { reponse.writeHead(403).end('Interdit'); return; }
  fs.readFile(cible, (erreur, contenu) => {
    if (erreur) { reponse.writeHead(404).end('Introuvable'); return; }
    // Ce serveur ne sert qu'à VOIR SES MODIFICATIONS. Sans en-tête de cache, le
    // navigateur décide tout seul de garder l'ancien fichier — et on croit que
    // le changement n'a pas pris. On lui interdit donc de garder quoi que ce soit.
    reponse.writeHead(200, {
      'content-type': TYPES[path.extname(cible)] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    reponse.end(contenu);
  });
}).listen(PORT, () => console.log(`Site disponible sur http://localhost:${PORT}`));
