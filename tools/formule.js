/* =============================================================================
   EMPREINTE DE LA FORMULE DE PUISSANCE
   -----------------------------------------------------------------------------
   La formule de puissance n'est pas écrite dans le code du jeu : elle est décrite
   dans SES DONNÉES, sous la forme d'un arbre de calcul rangé dans le fichier de
   game design (voir §14, §15 et §23 de RECHERCHE-PUISSANCE.md).

   Quand le jeu se met à jour, la seule façon honnête de savoir si la formule a
   changé est de relire ce fichier et de comparer. Cet outil en tire une EMPREINTE
   lisible — les noms des nœuds dans l'ordre, les statistiques citées, les
   constantes — que l'on peut poser côte à côte avec celle d'une autre version.

   Usage : node tools/formule.js [chemin/vers/GameDesignResponse.bin]
           node tools/formule.js ancien.bin nouveau.bin     (comparaison)
           node tools/formule.js --pantheon [fichier]        (poids des nœuds)
           node tools/formule.js --heros    [fichier]        (stats de base)
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const RACINE = path.join(__dirname, '..');
const DEFAUT = path.join(RACINE, 'data', 'GameDesignResponse.bin');

// Les deux formules se suivent dans le fichier ; on lit de l'une à la fin de
// l'autre. La fenêtre de secours vaut 8 Ko : les deux corps en font ~4 000.
const DEBUT = 'formula.unit_power_hero';
const SUITE = 'formula.expected_unit_power';
const FENETRE = 8192;

function chercher(octets, texte, depuis = 0) {
  return octets.indexOf(Buffer.from(texte, 'latin1'), depuis);
}

// Le nom « formula.unit_power_hero » apparaît plusieurs fois : d'abord là où
// d'autres rubriques y RENVOIENT, et seulement à la fin là où la formule est
// ÉCRITE. Le corps est le seul à être suivi de près par son nœud d'arrondi.
function chercherLeCorps(octets, texte) {
  const marqueur = Buffer.from('FormulaRoundDTO', 'latin1');
  let i = 0;
  while ((i = chercher(octets, texte, i)) >= 0) {
    const arrondi = octets.indexOf(marqueur, i);
    if (arrondi >= 0 && arrondi - i < 200) return i;
    i += 1;
  }
  return -1;
}

// Toutes les suites de caractères imprimables d'au moins quatre signes.
function chaines(bloc) {
  const trouvees = [];
  let courante = '';
  for (const o of bloc) {
    if (o >= 0x20 && o < 0x7f) courante += String.fromCharCode(o);
    else { if (courante.length >= 4) trouvees.push(courante); courante = ''; }
  }
  if (courante.length >= 4) trouvees.push(courante);
  return trouvees;
}

// Les constantes de la formule sont des flottants 64 bits (§23). On ne retient
// que celles qui ressemblent à un nombre de game design : ni infime, ni énorme.
function constantes(bloc) {
  const vues = [];
  for (let i = 0; i + 8 <= bloc.length; i++) {
    const v = bloc.readDoubleLE(i);
    if (!Number.isFinite(v) || v === 0) continue;
    const a = Math.abs(v);
    if (a < 1e-4 || a > 1e6) continue;
    // On saute les octets consommés pour ne pas relire le même nombre décalé.
    vues.push({ octet: i, valeur: v });
    i += 7;
  }
  return vues;
}

function empreinte(chemin) {
  const octets = fs.readFileSync(chemin);
  const debut = chercherLeCorps(octets, DEBUT);
  if (debut < 0) throw new Error(`« ${DEBUT} » introuvable dans ${chemin}`);
  const suite = chercherLeCorps(octets, SUITE);
  const fin = suite > debut ? Math.min(octets.length, suite + FENETRE) : Math.min(octets.length, debut + 2 * FENETRE);
  const bloc = octets.subarray(debut, fin);

  const mots = chaines(bloc);
  return {
    chemin,
    taille: octets.length,
    octetFormule: debut,
    octetJumelle: suite,
    noeuds: mots.filter((m) => /FormulaTermDTO$|FormulaDTO$|^Formula/.test(m)),
    stats: mots.filter((m) => /^(Attack|Defense|MaxHitPoints|Evasion|BaseDamage|Crit|Expected|Squad|Focus|Range|Speed)/.test(m)),
    identifiants: mots.filter((m) => /^[a-z_]+\.[A-Za-z_]+$/.test(m)),
    constantes: constantes(bloc).map((c) => c.valeur),
  };
}

function ecrire(e) {
  console.log(`\n=== ${e.chemin}`);
  console.log(`    ${e.taille.toLocaleString('fr-FR')} octets · formule à l'octet ${e.octetFormule.toLocaleString('fr-FR')} · jumelle à ${e.octetJumelle.toLocaleString('fr-FR')}`);
  console.log(`\n  Identifiants  (${e.identifiants.length})`);
  for (const m of e.identifiants) console.log(`    ${m}`);
  console.log(`\n  Nœuds  (${e.noeuds.length})`);
  for (const m of [...new Set(e.noeuds)]) console.log(`    ${m}  ×${e.noeuds.filter((x) => x === m).length}`);
  console.log(`\n  Statistiques citées  (${e.stats.length})`);
  for (const m of e.stats) console.log(`    ${m}`);
  console.log(`\n  Constantes  (${e.constantes.length})`);
  console.log('    ' + e.constantes.map((v) => String(v)).join(' · '));
}

function comparer(a, b) {
  const lignes = [];
  const liste = (x) => JSON.stringify(x);
  for (const cle of ['noeuds', 'stats', 'constantes']) {
    if (liste(a[cle]) === liste(b[cle])) lignes.push(`  ${cle} : IDENTIQUE`);
    else {
      lignes.push(`  ${cle} : DIFFÉRENT`);
      lignes.push(`    avant : ${liste(a[cle])}`);
      lignes.push(`    après : ${liste(b[cle])}`);
    }
  }
  console.log('\n=== COMPARAISON\n' + lignes.join('\n'));
}


/* ------------------------------------------- les poids de puissance du panthéon

   Depuis le 25/08/2026 chaque nœud de panthéon porte, dans le fichier de game
   design, un flottant qui dit ce qu’il vaut dans la formule de puissance. Ils
   s’additionnent sur les nœuds débloqués et donnent le facteur « 1 + panthéon ».
   Les nœuds qui n’en portent pas ne valent rien : ce sont ceux dont l’effet
   nourrit déjà une statistique de la formule.                                */

function poidsPantheon(chemin) {
  const octets = fs.readFileSync(chemin);
  const marqueur = Buffer.from('type.googleapis.com/PantheonNodeDefinitionDTO', 'latin1');
  const debuts = [];
  let i = 0;
  while ((i = octets.indexOf(marqueur, i)) >= 0) { debuts.push(i); i += 1; }

  const table = {};
  for (let k = 0; k < debuts.length; k++) {
    const bloc = octets.subarray(debuts[k], k + 1 < debuts.length ? debuts[k + 1] : debuts[k] + 2000);
    const nom = (bloc.toString('latin1').match(/pantheon_node.[A-Za-z0-9_]+/) || [])[0];
    if (!nom) continue;
    // Le poids est un double rangé sous l’étiquette 0x21 (champ 4, 64 bits).
    let poids = null;
    for (let j = 0; j + 9 <= bloc.length; j++) {
      if (bloc[j] !== 0x21) continue;
      const v = bloc.readDoubleLE(j + 1);
      if (Number.isFinite(v) && v > 0 && v < 10) { poids = v; break; }
    }
    table[nom.replace('pantheon_node.', '')] = poids;
  }
  return table;
}

function ecrirePantheon(chemin) {
  const table = poidsPantheon(chemin);
  const classes = [...new Set(Object.keys(table).map((n) => n.split('_').slice(2).join('_')))];
  console.log(`
=== poids de puissance des nœuds de panthéon — ${chemin}`);
  for (const classe of classes) {
    console.log(`
  ${classe}`);
    for (const nom of Object.keys(table).filter((n) => n.endsWith('_' + classe)).sort()) {
      console.log(`    ${nom.replace('_' + classe, '').padEnd(14)} ${table[nom] ?? '—'}`);
    }
  }
}


/* ------------------------------- les statistiques de base, contrôlées à la source

   Le site tient ses statistiques de base de Forge of Games, qui rediffuse le
   catalogue du jeu. Le fichier de game design les porte AUSSI, dans ses blocs
   `HeroUnitDefinitionDTO` — une seconde source, indépendante de la première.
   Les confronter répond en une commande à la question qui revient à chaque mise
   à jour : « est-ce que les statistiques des héros ont bougé ? »              */

function statsDuBloc(bloc) {
  const texte = bloc.toString('latin1');
  const sortie = {};
  const motif = /unit_stat\.([A-Za-z]+)/g;
  let trouve;
  while ((trouve = motif.exec(texte))) {
    const apres = trouve.index + trouve[0].length;
    // Le nom est suivi de son étiquette et de son nombre, en 64 ou en 32 bits.
    for (let j = apres; j < Math.min(apres + 6, bloc.length - 8); j++) {
      const etiquette = bloc[j];
      if ([0x09, 0x11, 0x19, 0x21].includes(etiquette)) { sortie[trouve[1]] = bloc.readDoubleLE(j + 1); break; }
      if ([0x15, 0x1d, 0x25].includes(etiquette)) { sortie[trouve[1]] = bloc.readFloatLE(j + 1); break; }
    }
  }
  return sortie;
}

function herosDuJeu(chemin) {
  const octets = fs.readFileSync(chemin);
  const marqueur = Buffer.from('type.googleapis.com/HeroUnitDefinitionDTO', 'latin1');
  const debuts = [];
  let i = 0;
  while ((i = octets.indexOf(marqueur, i)) >= 0) { debuts.push(i); i += 1; }
  const table = new Map();
  for (let k = 0; k < debuts.length; k++) {
    const bloc = octets.subarray(debuts[k], k + 1 < debuts.length ? debuts[k + 1] : debuts[k] + 4000);
    const nom = (bloc.toString('latin1').match(/unit\.Unit_[A-Za-z0-9_]+/) || [])[0];
    if (nom && !table.has(nom)) table.set(nom, statsDuBloc(bloc));
  }
  return table;
}

const CONTROLEES = ['Attack', 'Defense', 'MaxHitPoints', 'BaseDamage', 'AttackSpeed', 'AttackRange', 'FocusRegen', 'SquadSize'];

function ecrireHeros(chemin) {
  global.window = global;
  require(path.join(RACINE, 'heros-jeu.js'));
  const jeu = herosDuJeu(chemin);
  const site = global.HEROS_JEU;
  const absents = [];
  const ecarts = [];
  let identiques = 0;
  for (const [id, fiche] of Object.entries(site)) {
    const leur = jeu.get('unit.Unit_' + id);
    if (!leur) { absents.push(id); continue; }
    const faux = CONTROLEES.filter((k) => leur[k] !== undefined && fiche.base[k] !== undefined
      && Math.abs(leur[k] - fiche.base[k]) > 1e-6);
    if (faux.length) ecarts.push('  ' + id + ' : ' + faux.map((k) => k + ' ' + fiche.base[k] + ' au lieu de ' + leur[k]).join(' · '));
    else identiques++;
  }
  console.log('\n=== statistiques de base — ' + chemin);
  console.log('  ' + Object.keys(site).length + ' héros dans le catalogue du site');
  console.log('  ' + identiques + ' retrouvés dans le fichier du jeu et IDENTIQUES');
  console.log('  ' + absents.length + ' absents du fichier' + (absents.length ? ' : ' + absents.join(', ') : ''));
  console.log('  ' + ecarts.length + ' écart(s)');
  for (const ligne of ecarts) console.log(ligne);
}

const args = process.argv.slice(2);
if (args[0] === '--heros') {
  ecrireHeros(args[1] || DEFAUT);
} else if (args[0] === '--pantheon') {
  ecrirePantheon(args[1] || DEFAUT);
} else if (args.length >= 2) {
  const a = empreinte(args[0]), b = empreinte(args[1]);
  ecrire(a); ecrire(b); comparer(a, b);
} else {
  ecrire(empreinte(args[0] || DEFAUT));
}
