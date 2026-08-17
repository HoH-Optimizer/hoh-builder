// Injecte l'observateur dans la page, puis récupère ce qu'il trouve et le range
// dans le stockage local de l'extension. Rien ne quitte ton navigateur.
const hook = document.createElement('script');
hook.src = chrome.runtime.getURL('page-hook.js');
hook.onload = () => hook.remove();
(document.head || document.documentElement).append(hook);

const enCours = new Map(); // captures reçues en plusieurs morceaux
let journal = [];
let ecritureJournalPrevue = false;

// Le journal sert à retrouver l'adresse du catalogue si mes filtres l'ont manqué.
// On l'écrit par paquets pour ne pas solliciter le stockage à chaque requête du jeu.
function planifierEcritureJournal() {
  if (ecritureJournalPrevue) return;
  ecritureJournalPrevue = true;
  setTimeout(async () => {
    ecritureJournalPrevue = false;
    const { 'hoh:journal': existant = [] } = await chrome.storage.local.get('hoh:journal');
    // Le relevé des ressources ramène beaucoup d'adresses (dont toutes les images) :
    // on garde large, c'est du texte et ça pèse peu.
    const fusion = [...existant, ...journal].slice(-20000);
    journal = [];
    await chrome.storage.local.set({ 'hoh:journal': fusion });
  }, 2000);
}

window.addEventListener('message', async (evenement) => {
  const d = evenement.data;
  if (evenement.source !== window || d?.source !== 'hoh-simple-exporter') return;

  if (d.kind === 'log') {
    journal.push({ url: d.url, contentType: d.contentType, bytes: d.bytes, a: Date.now() });
    planifierEcritureJournal();
    return;
  }

  if (d.kind !== 'capture') return;

  const morceaux = enCours.get(d.id) || new Array(d.total).fill(null);
  morceaux[d.index] = d.chunk;
  enCours.set(d.id, morceaux);
  if (morceaux.some((m) => m === null)) return;

  enCours.delete(d.id);
  await chrome.storage.local.set({
    [`hoh:capture:${d.url}`]: {
      url: d.url,
      contentType: d.contentType,
      bytes: d.bytes,
      capturedAt: new Date().toISOString(),
      payload: morceaux.join(''),
    },
  });
});
