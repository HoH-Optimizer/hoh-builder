/* =============================================================================
   DÉCODEUR DE L'EXPORT HEROES OF HISTORY
   -----------------------------------------------------------------------------
   Le jeu répond en Protocol Buffers binaire, sans fournir de schéma. Le format
   ne contient donc AUCUN nom de champ, seulement des numéros. Les correspondances
   ci-dessous (f2 = emplacement, f6 = héros porteur...) ont été établies en
   observant les données ; elles sont documentées au fil du fichier.

   Ce fichier fonctionne à la fois dans le navigateur et en ligne de commande,
   pour qu'il n'existe qu'une seule version de cette logique à maintenir.
   ========================================================================== */
(function (global) {
  const texteur = new TextDecoder('utf-8');

  function lireVarint(octets, position) {
    let resultat = 0n, decalage = 0n, octet;
    do {
      if (position >= octets.length) throw new Error('varint hors limites');
      octet = octets[position++];
      resultat |= BigInt(octet & 0x7f) << decalage;
      decalage += 7n;
      if (decalage > 70n) throw new Error('varint trop long');
    } while (octet & 0x80);
    return [resultat, position];
  }

  // Les identifiants du jeu ("hero.Achilles", "equipment_slot_type.Ring") sont des
  // chaînes propres. On ne lit un bloc comme du texte que s'il y ressemble vraiment,
  // sinon on tente de l'ouvrir comme un sous-message.
  const ressembleAUnIdentifiant = (s) => /^[A-Za-z0-9_.\-\/: ]+$/.test(s) && /[A-Za-z]/.test(s);

  // Tente de lire un bloc d'octets comme un message protobuf complet et cohérent.
  function tenterMessage(octets) {
    if (octets.length === 0) return null;
    const vue = new DataView(octets.buffer, octets.byteOffset, octets.byteLength);
    const champs = [];
    let position = 0;
    try {
      while (position < octets.length) {
        const [etiquette, suite] = lireVarint(octets, position);
        position = suite;
        const numero = Number(etiquette >> 3n), nature = Number(etiquette & 7n);
        if (numero === 0) return null;
        if (nature === 0) {
          const [v, n] = lireVarint(octets, position);
          position = n;
          champs.push({ numero, nature, valeur: v });
        } else if (nature === 1) {
          if (position + 8 > octets.length) return null;
          champs.push({ numero, nature, valeur: vue.getFloat64(position, true) });
          position += 8;
        } else if (nature === 5) {
          if (position + 4 > octets.length) return null;
          champs.push({ numero, nature, valeur: vue.getFloat32(position, true) });
          position += 4;
        } else if (nature === 2) {
          const [longueur, n] = lireVarint(octets, position);
          position = n;
          const taille = Number(longueur);
          if (position + taille > octets.length) return null;
          champs.push({ numero, nature, valeur: octets.subarray(position, position + taille) });
          position += taille;
        } else return null; // groupes obsolètes : on refuse
      }
    } catch { return null; }
    return champs;
  }

  function interpreter(octets, profondeur) {
    const texte = texteur.decode(octets);
    if (ressembleAUnIdentifiant(texte)) return texte;
    if (profondeur > 0) {
      const sous = tenterMessage(octets);
      if (sous) return construire(sous, profondeur - 1);
    }
    if (!texte.includes('�')) return texte;
    return { $octets: octets.length };
  }

  function construire(champs, profondeur) {
    const objet = {};
    for (const c of champs) {
      let valeur;
      if (c.nature === 2) valeur = interpreter(c.valeur, profondeur);
      else if (c.nature === 0) valeur = c.valeur <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(c.valeur) : c.valeur.toString();
      else valeur = c.valeur;
      const cle = `f${c.numero}`;
      if (cle in objet) {
        if (!Array.isArray(objet[cle])) objet[cle] = [objet[cle]];
        objet[cle].push(valeur);
      } else objet[cle] = valeur;
    }
    // Un message "Any" porte son propre nom de type : c'est notre seule source de noms.
    if (typeof objet.f1 === 'string' && objet.f1.startsWith('type.googleapis.com/')) {
      return { $type: objet.f1.replace('type.googleapis.com/', ''), $valeur: objet.f2 };
    }
    return objet;
  }

  function decoder(octets, profondeur = 30) {
    const champs = tenterMessage(octets);
    if (!champs) throw new Error("Ce bloc n'est pas un message protobuf valide.");
    return construire(champs, profondeur);
  }

  function base64VersOctets(base64) {
    const binaire = atob(base64);
    const octets = new Uint8Array(binaire.length);
    for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
    return octets;
  }

  /* ------------------------------------------------------------------------ */

  const sansPrefixe = (s, prefixe) => (typeof s === 'string' ? s.replace(prefixe, '') : undefined);

  // PIÈGE DU FORMAT : en Protocol Buffers, une liste d'un seul élément s'écrit
  // exactement comme une valeur simple. Sans le schéma, impossible de les distinguer,
  // et le décodeur ne produit un tableau qu'à partir de deux occurrences.
  // Tout champ censé être une liste doit donc passer par ici.
  const tableau = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

  // Un attribut d'équipement : quelle statistique il touche, et de combien.
  // Les attributs dont le nom finit par "Bonus" (et les critiques) sont des pourcentages.
  // Un attribut sans détail est verrouillé : le jeu en connaît le type, pas encore la valeur.
  function lireAttribut(a) {
    if (!a) return undefined;
    const attribut = sansPrefixe(a.f1, 'stat_attribute.');
    const detail = a.f2;
    return {
      attribut,
      stat: sansPrefixe(detail?.f3, 'unit_stat.'),
      valeur: detail?.f4,
      type: /Bonus$/.test(attribut || '') || attribut === 'CritChance' || attribut === 'CritDamage' ? 'pourcentage' : 'plat',
      debloqueAuNiveau: a.f3,
      verrouille: detail ? undefined : true,
    };
  }

  // Aplatit { a: { b: "x" } } en { "a.b": "x" } pour pouvoir chercher par clé complète.
  function aplatir(objet, prefixe = '', sortie = {}) {
    for (const [cle, valeur] of Object.entries(objet || {})) {
      const chemin = prefixe ? `${prefixe}.${cle}` : cle;
      if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) aplatir(valeur, chemin, sortie);
      else if (typeof valeur === 'string') sortie[chemin] = valeur;
    }
    return sortie;
  }

  // Les vrais noms affichés en jeu (en français) ne sont pas dans /game/startup :
  // ils viennent d'un fichier de traduction téléchargé séparément.
  // Tant qu'on n'a pas observé ce fichier, on ne connaît pas son format exact.
  // Cette lecture est donc une TENTATIVE : elle réussit si les clés ressemblent
  // aux identifiants du jeu, et ne casse rien si ce n'est pas le cas.
  function lireTraductions(brut) {
    const candidats = (brut.captures || []).filter((c) => /locali[sz]|translation|i18n|lang|strings/i.test(c.url));
    for (const capture of candidats) {
      try {
        const plat = aplatir(JSON.parse(texteur.decode(base64VersOctets(capture.payload))));
        const heros = {}, sets = {}, objets = {};
        for (const [cle, valeur] of Object.entries(plat)) {
          const h = cle.match(/hero[._]([A-Za-z0-9]+?)(?:[._](?:name|title|display))?$/i);
          if (h && !heros[h[1]]) heros[h[1]] = valeur;
          const s = cle.match(/equipment[._]set[._]([A-Za-z0-9]+?)(?:[._](?:name|title))?$/i);
          if (s && !sets[s[1]]) sets[s[1]] = valeur;
          const o = cle.match(/equipment[._]([A-Za-z0-9]+?)(?:[._](?:name|title))$/i);
          if (o && !objets[o[1]]) objets[o[1]] = valeur;
        }
        if (Object.keys(heros).length >= 10) return { heros, sets, objets, source: capture.url };
      } catch { /* ce n'était pas un fichier de traduction lisible */ }
    }
    return undefined;
  }

  function extraire(brut) {
    // v2 de l'extension : une seule capture sous la clé "startup".
    // v3 : plusieurs captures, on retrouve l'état du compte par son adresse.
    const bloc = brut.startup || (brut.captures || []).find((c) => /\/game\/startup$/.test(c.url));
    if (!bloc) throw new Error("Cet export ne contient pas l'état du compte (/game/startup).");
    const startup = decoder(base64VersOctets(bloc.payload));
    const blocs = tableau(startup.f8?.f2);
    const parType = (type) => blocs.filter((b) => b.$type === type).map((b) => b.$valeur);

    const [joueur] = parType('PlayerDTO');
    const heros = parType('HeroPush').flatMap((p) => tableau(p.f1));
    const equipements = parType('EquipmentPush').flatMap((p) => tableau(p.f1));

    // Le jeu compose ses statistiques à partir de plusieurs sources. L'export en
    // contient deux de plus que l'équipement : les nœuds de panthéon débloqués et
    // les reliques portées. Leurs valeurs, elles, appartiennent au catalogue du jeu
    // et restent inconnues — on relève donc ce qui est là, sans le chiffrer.
    const noeudsParHero = {};
    for (const entree of parType('HeroPantheonStatePush').flatMap((p) => tableau(p.f1))) {
      const id = sansPrefixe(entree.f1, 'hero.');
      if (id) noeudsParHero[id] = tableau(entree.f2).map((n) => sansPrefixe(n.f1, 'pantheon_node.'));
    }

    const reliques = parType('RelicPush').flatMap((p) => tableau(p.f1)).map((r) => ({
      id: r.f1,
      relique: sansPrefixe(r.f2, 'relic.'),
      niveau: r.f3 ?? 0,
      etoiles: r.f4 ?? 0,
      porteParHero: sansPrefixe(r.f5, 'hero.') ?? null,
    }));

    // Le catalogue du jeu se déduit de tous les identifiants présents dans l'export.
    const familles = {};
    (function collecte(n) {
      if (Array.isArray(n)) return n.forEach(collecte);
      if (typeof n === 'string') {
        const m = n.match(/^([a-z][a-z0-9_]*)\./);
        if (m) (familles[m[1]] || (familles[m[1]] = new Set())).add(n.slice(m[1].length + 1));
        return;
      }
      if (n && typeof n === 'object') Object.values(n).forEach(collecte);
    })(startup);
    const liste = (k) => [...(familles[k] || [])].sort();

    return {
      genereLe: new Date().toISOString(),
      captureLe: bloc.capturedAt,
      // Absent tant que le fichier de traduction n'a pas été capturé : le site
      // se rabat alors sur les identifiants internes du jeu.
      libelles: lireTraductions(brut),
      catalogue: {
        heros: liste('hero'),
        sets: liste('equipment_set'),
        emplacements: liste('equipment_slot_type'),
        raretes: liste('equipment_rarity'),
        stats: liste('unit_stat'),
        attributs: liste('stat_attribute'),
      },
      compte: {
        joueur: { id: joueur?.f1, nom: joueur?.f2 },
        // Correspondances vérifiées en comparant l'export à l'écran du jeu :
        //   f2  = niveau actuel
        //   f3  = nombre d'ascensions — le niveau maximum vaut (ascensions + 1) x 10
        //   f5  = niveau de compétence
        //   f7  = niveau d'éveil — le jeu l'affiche en chiffres romains sur la vignette
        //   f10 = variante « montée en étoiles » (ex. AshokaTheGreatLegendary),
        //         qui remplace alors la rareté de base du héros
        heros: heros.map((h) => ({
          id: sansPrefixe(h.f1, 'hero.'),
          niveau: h.f2,
          ascensions: h.f3 ?? 0,
          niveauMax: ((h.f3 ?? 0) + 1) * 10,
          competence: h.f5 ?? 0,
          eveil: h.f7 ?? 0,
          montee: sansPrefixe(h.f10, 'hero_star_up.') ?? null,
          pantheon: noeudsParHero[sansPrefixe(h.f1, 'hero.')] || [],
        })),
        reliques,
        // f6 = héros porteur ; absent lorsque l'objet est en réserve.
        equipements: equipements.map((e) => ({
          id: e.f1,
          emplacement: sansPrefixe(e.f2, 'equipment_slot_type.'),
          set: sansPrefixe(e.f3, 'equipment_set.'),
          rarete: Number(sansPrefixe(e.f4, 'equipment_rarity.')),
          niveau: e.f5,
          porteParHero: sansPrefixe(e.f6, 'hero.') ?? null,
          principal: lireAttribut(e.f8),
          secondaires: tableau(e.f9).map(lireAttribut),
        })),
      },
    };
  }

  const api = { decoder, extraire, base64VersOctets, tenterMessage };
  global.HOH_DECODEUR = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
