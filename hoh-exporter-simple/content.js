// Observe le jeu, décode les données du compte, et les tient prêtes pour HOH Builder.
// Rien ne quitte ce navigateur : le décodage se fait ici, et le résultat est rangé
// dans le stockage privé de l'extension.

const hook = document.createElement('script');
hook.src = chrome.runtime.getURL('page-hook.js');
hook.onload = () => hook.remove();
(document.head || document.documentElement).append(hook);

// Le mode diagnostic n'est utile qu'au développement du décodeur : il conserve tout
// ce que le jeu échange, ce qui pèse très lourd. Il est désactivé par défaut.
let diagnostic = false;
chrome.storage.local.get('hoh:diagnostic').then(({ 'hoh:diagnostic': actif }) => {
  diagnostic = Boolean(actif);
  window.postMessage({ source: 'hoh-simple-exporter', kind: 'config', diagnostic }, '*');
});

// Seules ces réponses servent à reconstituer le compte : on les garde en mémoire
// le temps de les recouper, les autres partent directement au stockage.
const UTILE = /\/game\/startup$|\/loca\b|gamedesign/i;

const morceauxEnCours = new Map();
const capturesUtiles = new Map();
let journal = [];
let ecritureJournalPrevue = false;

function planifierEcritureJournal() {
  if (ecritureJournalPrevue) return;
  ecritureJournalPrevue = true;
  setTimeout(async () => {
    ecritureJournalPrevue = false;
    const { 'hoh:journal': existant = [] } = await chrome.storage.local.get('hoh:journal');
    const fusion = [...existant, ...journal].slice(-20000);
    journal = [];
    await chrome.storage.local.set({ 'hoh:journal': fusion });
  }, 2000);
}

// Dès qu'on tient l'état du compte, on le décode et on range le résultat compact.
// C'est ce résultat, et lui seul, que reçoit le site : quelques centaines de Ko
// au lieu des dizaines de Mo de données brutes.
async function reconstituerLeCompte() {
  const captures = [...capturesUtiles.values()];
  if (!captures.some((c) => /\/game\/startup$/.test(c.url))) return;
  try {
    const compte = HOH_DECODEUR.extraire({ captures });
    await chrome.storage.local.set({ 'hoh:compte': compte });
    chrome.runtime.sendMessage({ type: 'compte-pret' }).catch(() => {});
  } catch (erreur) {
    console.warn('HOH Builder — décodage impossible :', erreur.message);
    await chrome.storage.local.set({ 'hoh:erreur': erreur.message });
  }
}

window.addEventListener('message', async (evenement) => {
  const d = evenement.data;
  if (evenement.source !== window || d?.source !== 'hoh-simple-exporter') return;

  if (d.kind === 'log') {
    if (!diagnostic) return;
    journal.push({ url: d.url, contentType: d.contentType, bytes: d.bytes, a: Date.now() });
    planifierEcritureJournal();
    return;
  }

  if (d.kind !== 'capture') return;

  const morceaux = morceauxEnCours.get(d.id) || new Array(d.total).fill(null);
  morceaux[d.index] = d.chunk;
  morceauxEnCours.set(d.id, morceaux);
  if (morceaux.some((m) => m === null)) return;
  morceauxEnCours.delete(d.id);

  const capture = {
    url: d.url,
    contentType: d.contentType,
    bytes: d.bytes,
    capturedAt: new Date().toISOString(),
    payload: morceaux.join(''),
  };

  if (UTILE.test(d.url)) {
    capturesUtiles.set(d.url, capture);
    await reconstituerLeCompte();
  }
  if (diagnostic) await chrome.storage.local.set({ [`hoh:capture:${d.url}`]: capture });
});
