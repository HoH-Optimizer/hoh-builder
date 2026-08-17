// Pont entre l'extension et le site HOH Builder.
// Ce script ne s'exécute que sur les pages de HOH Builder, et n'y fait qu'une chose :
// déposer les données déjà décodées du compte. Elles passent d'un onglet à l'autre
// à l'intérieur du navigateur, sans jamais transiter par le réseau.

const SOURCE = 'hoh-builder-pont';

const deposer = (compte) => {
  // On vise explicitement l'origine de la page : le message ne peut pas fuiter ailleurs.
  window.postMessage({ source: SOURCE, type: 'compte', compte }, window.location.origin);
};

async function pousser() {
  const { 'hoh:compte': compte } = await chrome.storage.local.get('hoh:compte');
  window.postMessage(
    { source: SOURCE, type: 'presence', aDesDonnees: Boolean(compte) },
    window.location.origin,
  );
  if (compte) deposer(compte);
}

pousser();

// Si le joueur relance le jeu dans un autre onglet, le site se met à jour tout seul.
chrome.storage.onChanged.addListener((changements, zone) => {
  if (zone !== 'local' || !changements['hoh:compte']) return;
  const compte = changements['hoh:compte'].newValue;
  if (compte) deposer(compte);
});

// Le site peut redemander les données à tout moment.
window.addEventListener('message', (evenement) => {
  if (evenement.source !== window) return;
  if (evenement.data?.source === 'hoh-builder-site' && evenement.data.type === 'demande') pousser();
});
