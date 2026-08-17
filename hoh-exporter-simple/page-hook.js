// S'exécute dans le contexte de la page pour observer les réponses réseau du jeu.
// LECTURE SEULE : on ne modifie ni n'envoie jamais rien au jeu, on ne fait que recopier
// ce que le jeu a déjà reçu, puis on le transmet à l'extension.
(() => {
  const SOURCE = 'hoh-simple-exporter';

  // Ce qu'on veut à coup sûr : l'état du compte, le catalogue du jeu,
  // et les traductions (d'où viennent les vrais noms des héros et des équipements).
  // "loca" est le nom court employé par le jeu pour ses traductions : /game/loca/compressed.
  const PRIORITAIRE = /\/game\/startup$|gamedesign|game[-_]design|\/loca\b|locali[sz]|translation|i18n|strings/i;
  // Le moteur Unity du jeu pèse plus de 40 Mo et ne contient rien qui nous serve :
  // le capturer ne faisait que rendre l'export ingérable.
  const EXCLU = /^blob:|innogamescdn\.com\/Build\/|\.(data|wasm|unityweb|symbols\.json)(\?|$)/i;
  // Ce qu'on ne veut jamais recopier : images, sons, polices, feuilles de style.
  // Leurs adresses restent malgré tout consignées dans le journal.
  const MEDIA = /\.(png|jpe?g|webp|gif|svg|ico|mp3|ogg|wav|mp4|webm|woff2?|ttf|otf|css)(\?|$)/i;
  const MEDIA_TYPE = /^(image|audio|video|font)\/|text\/css/i;
  // Le catalogue est volumineux : tout gros bloc de données non-média est un candidat.
  const TAILLE_CANDIDATE = 200 * 1024;
  // Les traductions sont souvent bien plus légères : on est plus permissif pour le texte.
  const TAILLE_CANDIDATE_TEXTE = 20 * 1024;
  const TEXTE_TYPE = /application\/json|^text\/(?!css)/i;
  const TAILLE_MAX = 80 * 1024 * 1024;

  const dejaVu = new Set();
  const dejaJournalise = new Set();
  let compteurWs = 0;

  const enBase64 = (buffer) => {
    const octets = new Uint8Array(buffer);
    let binaire = '';
    for (let i = 0; i < octets.length; i += 8192) binaire += String.fromCharCode(...octets.subarray(i, i + 8192));
    return btoa(binaire);
  };

  // Les payloads peuvent peser des dizaines de Mo : on les envoie en morceaux.
  const envoyer = (buffer, url, contentType) => {
    try {
      if (buffer.byteLength > TAILLE_MAX) return;
      const base64 = enBase64(buffer);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const TAILLE_MORCEAU = 4 * 1024 * 1024;
      const total = Math.max(1, Math.ceil(base64.length / TAILLE_MORCEAU));
      for (let i = 0; i < total; i++) {
        window.postMessage({
          source: SOURCE, kind: 'capture', id, index: i, total,
          url: String(url), contentType: contentType || '', bytes: buffer.byteLength,
          chunk: base64.slice(i * TAILLE_MORCEAU, (i + 1) * TAILLE_MORCEAU),
        }, '*');
      }
    } catch { /* on n'interrompt jamais le jeu pour une erreur de capture */ }
  };

  // Une adresse n'est consignée qu'une fois : le jeu en rappelle certaines en boucle.
  const journal = (url, contentType, bytes) => {
    const cle = String(url);
    if (dejaJournalise.has(cle)) return;
    dejaJournalise.add(cle);
    window.postMessage({ source: SOURCE, kind: 'log', url: cle, contentType: contentType || '', bytes }, '*');
  };

  const aCapturer = (url, contentType, bytes) => {
    if (dejaVu.has(url)) return false;
    if (EXCLU.test(url)) return false;
    if (PRIORITAIRE.test(url)) return true;
    if (MEDIA.test(url) || MEDIA_TYPE.test(contentType || '')) return false;
    if (TEXTE_TYPE.test(contentType || '')) return bytes >= TAILLE_CANDIDATE_TEXTE;
    return bytes >= TAILLE_CANDIDATE;
  };

  const traiter = (buffer, url, contentType) => {
    journal(url, contentType, buffer.byteLength);
    if (!aCapturer(url, contentType, buffer.byteLength)) return;
    dejaVu.add(url);
    envoyer(buffer, url, contentType);
  };

  const fetchOriginal = window.fetch;
  window.fetch = async function (...args) {
    const reponse = await fetchOriginal.apply(this, args);
    try {
      const contentType = reponse.headers.get('content-type') || '';
      reponse.clone().arrayBuffer().then((b) => traiter(b, reponse.url, contentType)).catch(() => {});
    } catch { /* ignoré */ }
    return reponse;
  };

  const openOriginal = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (methode, url, ...reste) {
    this.addEventListener('load', () => {
      try {
        if (!this.response) return;
        const contentType = this.getResponseHeader('content-type') || '';
        const absolue = new URL(url, location.href).href;
        if (this.response instanceof ArrayBuffer) traiter(this.response, absolue, contentType);
        else new Blob([this.response]).arrayBuffer().then((b) => traiter(b, absolue, contentType)).catch(() => {});
      } catch { /* ignoré */ }
    });
    return openOriginal.call(this, methode, url, ...reste);
  };

  // Le jeu échange aussi par WebSocket. On ne garde que les gros messages entrants,
  // qui sont les seuls susceptibles de contenir du catalogue ou un état complet.
  const WebSocketOriginal = window.WebSocket;
  window.WebSocket = function (url, ...reste) {
    const socket = new WebSocketOriginal(url, ...reste);
    socket.addEventListener('message', (evenement) => {
      try {
        const donnees = evenement.data;
        if (!(donnees instanceof ArrayBuffer) && !(donnees instanceof Blob)) return;
        if (compteurWs >= 25) return;
        const suite = (buffer) => {
          if (buffer.byteLength < TAILLE_CANDIDATE) return;
          compteurWs++;
          envoyer(buffer, `websocket#${compteurWs} (${url})`, 'application/octet-stream');
        };
        if (donnees instanceof ArrayBuffer) suite(donnees);
        else donnees.arrayBuffer().then(suite).catch(() => {});
      } catch { /* ignoré */ }
    });
    return socket;
  };
  window.WebSocket.prototype = WebSocketOriginal.prototype;
  Object.assign(window.WebSocket, WebSocketOriginal);

  // Les illustrations ne passent pas forcément par fetch ou XHR : une balise <img>
  // ou une feuille de style les charge directement. Le navigateur, lui, garde la trace
  // de TOUT ce qu'il a téléchargé — on relève cette liste régulièrement.
  // On ne recopie pas les images, seulement leurs adresses : elles sont publiques,
  // et il suffira de les connaître pour les afficher.
  const relever = () => {
    try {
      for (const entree of performance.getEntriesByType('resource')) {
        journal(entree.name, entree.initiatorType || '', entree.encodedBodySize || entree.transferSize || 0);
      }
      // Le navigateur limite son tampon : on le vide pour ne rien manquer ensuite.
      if (performance.clearResourceTimings) performance.clearResourceTimings();
    } catch { /* ignoré */ }
  };
  relever();
  setInterval(relever, 4000);

  /* --------------------------------------------------------------------------
     Lecture du stockage local du jeu.

     Le serveur ne renvoie que l'empreinte du catalogue ("tu l'as déjà"), jamais
     son contenu : le jeu le garde donc dans le navigateur d'une session à l'autre.
     C'est là qu'on va le chercher — en lecture seule, sans rien modifier.
     -------------------------------------------------------------------------- */

  const SEUIL_STOCKAGE = 20 * 1024;
  const PLAFOND_STOCKAGE = 60 * 1024 * 1024; // pour ne pas refaire un export ingérable
  let totalStockage = 0;

  const enOctets = async (valeur) => {
    if (valeur instanceof ArrayBuffer) return valeur;
    if (ArrayBuffer.isView(valeur)) return valeur.buffer.slice(valeur.byteOffset, valeur.byteOffset + valeur.byteLength);
    if (valeur instanceof Blob) return valeur.arrayBuffer();
    const texte = typeof valeur === 'string' ? valeur : JSON.stringify(valeur);
    return new TextEncoder().encode(texte).buffer;
  };

  const traiterValeurStockee = async (cle, valeur) => {
    if (dejaVu.has(cle) || valeur == null) return;
    let buffer;
    try { buffer = await enOctets(valeur); } catch { return; }
    journal(cle, 'stockage', buffer.byteLength);
    if (buffer.byteLength < SEUIL_STOCKAGE) return;
    if (totalStockage + buffer.byteLength > PLAFOND_STOCKAGE) return;
    dejaVu.add(cle);
    totalStockage += buffer.byteLength;
    envoyer(buffer, cle, 'stockage');
  };

  const ouvrirBase = (nom) => new Promise((resoudre) => {
    let requete;
    try { requete = indexedDB.open(nom); } catch { return resoudre(null); }
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => resoudre(null);
    requete.onblocked = () => resoudre(null);
  });

  const parcourirMagasin = (base, magasin) => new Promise((resoudre) => {
    let curseur;
    try { curseur = base.transaction(magasin, 'readonly').objectStore(magasin).openCursor(); }
    catch { return resoudre(); }
    curseur.onerror = () => resoudre();
    curseur.onsuccess = async (evenement) => {
      const c = evenement.target.result;
      if (!c) return resoudre();
      await traiterValeurStockee(`indexeddb://${base.name}/${magasin}/${String(c.key).slice(0, 120)}`, c.value);
      c.continue();
    };
  });

  const inspecterStockage = async () => {
    try {
      for (const info of await indexedDB.databases()) {
        if (!info.name) continue;
        const base = await ouvrirBase(info.name);
        if (!base) continue;
        for (const magasin of [...base.objectStoreNames]) await parcourirMagasin(base, magasin);
        base.close();
      }
    } catch { /* ignoré */ }

    try {
      for (const nom of await caches.keys()) {
        const cache = await caches.open(nom);
        for (const requete of await cache.keys()) {
          if (EXCLU.test(requete.url)) continue;
          const reponse = await cache.match(requete);
          if (reponse) await traiterValeurStockee(`cache://${nom}/${requete.url}`, await reponse.blob());
        }
      }
    } catch { /* ignoré */ }
  };

  // Le jeu doit avoir eu le temps d'ouvrir sa base avant qu'on la lise.
  setTimeout(inspecterStockage, 8000);
  setTimeout(inspecterStockage, 30000);
})();
