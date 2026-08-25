/* =============================================================================
   RÉCUPÉRER LE FICHIER DE GAME DESIGN DU JEU
   -----------------------------------------------------------------------------
   Ce n'est pas un script Node : c'est un texte à COLLER dans la console du
   navigateur, jeu ouvert. Il fouille la mémoire locale du jeu (IndexedDB et
   caches), y reconnaît le fichier de game design à sa signature — il est le seul
   à contenir « formula.unit_power_hero » — et le télécharge tel quel.

   MODE D'EMPLOI
   1. Ouvrir Heroes of History dans le navigateur, attendre que le jeu soit chargé.
   2. Touche F12, onglet « Console ».
   3. Coller tout ce qui suit la ligne de tirets, puis Entrée.
   4. Le fichier tombe dans les Téléchargements sous le nom GameDesignResponse.bin.
   5. Le poser dans data/, puis comparer :
        node tools/formule.js data/GameDesignResponse.bin ~/Downloads/GameDesignResponse.bin
   ========================================================================== */

// -----------------------------------------------------------------------------
(async () => {
  const SIGNATURE = 'formula.unit_power_hero';
  const texteur = new TextDecoder('latin1');

  const enOctets = async (valeur) => {
    if (valeur instanceof ArrayBuffer) return new Uint8Array(valeur);
    if (ArrayBuffer.isView(valeur)) return new Uint8Array(valeur.buffer, valeur.byteOffset, valeur.byteLength);
    if (valeur instanceof Blob) return new Uint8Array(await valeur.arrayBuffer());
    if (typeof valeur === 'string' && valeur.length > 4e6) {
      try { return Uint8Array.from(atob(valeur), (c) => c.charCodeAt(0)); } catch { return null; }
    }
    if (valeur && typeof valeur === 'object') {
      for (const v of Object.values(valeur)) { const o = await enOctets(v); if (o) return o; }
    }
    return null;
  };

  const contientLaSignature = (octets) => octets.length > 1e6 && texteur.decode(octets).includes(SIGNATURE);

  const ouvrir = (nom) => new Promise((ok) => {
    const r = indexedDB.open(nom);
    r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); r.onblocked = () => ok(null);
  });

  const parcourir = (base, magasin) => new Promise((ok) => {
    const trouve = [];
    let curseur;
    try { curseur = base.transaction(magasin, 'readonly').objectStore(magasin).openCursor(); }
    catch { return ok(trouve); }
    curseur.onerror = () => ok(trouve);
    curseur.onsuccess = async (e) => {
      const c = e.target.result;
      if (!c) return ok(trouve);
      const octets = await enOctets(c.value);
      if (octets && contientLaSignature(octets)) trouve.push({ ou: `${base.name}/${magasin}/${c.key}`, octets });
      c.continue();
    };
  });

  const trouvailles = [];
  for (const info of await indexedDB.databases()) {
    if (!info.name) continue;
    const base = await ouvrir(info.name);
    if (!base) continue;
    for (const magasin of [...base.objectStoreNames]) trouvailles.push(...await parcourir(base, magasin));
    base.close();
  }
  if (!trouvailles.length) {
    for (const nom of await caches.keys()) {
      const cache = await caches.open(nom);
      for (const requete of await cache.keys()) {
        const reponse = await cache.match(requete);
        if (!reponse) continue;
        const octets = new Uint8Array(await reponse.arrayBuffer());
        if (contientLaSignature(octets)) trouvailles.push({ ou: `${nom}/${requete.url}`, octets });
      }
    }
  }

  if (!trouvailles.length) {
    console.log('%cRien trouvé.', 'color:red', "Le jeu n'a peut-être pas fini de charger : recharger la page, attendre la carte, et recommencer.");
    return;
  }

  const gagnant = trouvailles.sort((a, b) => b.octets.length - a.octets.length)[0];
  console.log('Trouvé dans', gagnant.ou, '—', gagnant.octets.length.toLocaleString('fr-FR'), 'octets');
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(new Blob([gagnant.octets]));
  lien.download = 'GameDesignResponse.bin';
  lien.click();
})();
