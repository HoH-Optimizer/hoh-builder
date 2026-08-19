// Adresse publique du site. À GARDER IDENTIQUE aux "matches" du manifeste :
// c'est là, et nulle part ailleurs, que le pont a le droit de déposer les
// données. Une adresse qui ne correspond plus casse l'extension en silence —
// le bouton ouvre une page morte et rien n'est transmis.
const SITE = 'https://hoh-optimizer.github.io/hoh-builder/';

const etat = document.querySelector('#etat');
const ouvrir = document.querySelector('#ouvrir');
const telecharger = document.querySelector('#telecharger');
const diagnostic = document.querySelector('#diagnostic');
const exportTechnique = document.querySelector('#exportTechnique');
const effacer = document.querySelector('#effacer');

let compte = null;

const enregistrer = (contenu, nom) => {
  const blob = new Blob([JSON.stringify(contenu)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: nom }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const leJour = () => new Date().toISOString().slice(0, 10);

async function rafraichir() {
  const tout = await chrome.storage.local.get(null);
  compte = tout['hoh:compte'] || null;
  diagnostic.checked = Boolean(tout['hoh:diagnostic']);
  exportTechnique.hidden = !diagnostic.checked;

  if (compte) {
    const c = compte.compte;
    etat.className = 'etat pret';
    etat.innerHTML = `Compte prêt : <strong>${c.heros.length}</strong> héros et `
      + `<strong>${c.equipements.length}</strong> équipements.<br>`
      + `Ouvre HOH Builder, tes données s'y afficheront toutes seules.`;
  } else {
    etat.className = 'etat';
    etat.textContent = tout['hoh:erreur']
      ? `Lecture impossible : ${tout['hoh:erreur']}`
      : "Aucune donnée pour l'instant. Ouvre Heroes of History et recharge la page (Ctrl+F5).";
  }
  telecharger.disabled = !compte;
}

ouvrir.onclick = () => chrome.tabs.create({ url: SITE });

// Utile pour partager sa configuration, ou l'ouvrir sur un autre navigateur.
telecharger.onclick = () => enregistrer(compte, `hoh-compte-${leJour()}.json`);

diagnostic.onchange = async () => {
  await chrome.storage.local.set({ 'hoh:diagnostic': diagnostic.checked });
  exportTechnique.hidden = !diagnostic.checked;
  etat.textContent = diagnostic.checked
    ? 'Mode diagnostic activé. Recharge le jeu (Ctrl+F5) pour lancer la collecte complète.'
    : 'Mode diagnostic désactivé.';
};

exportTechnique.onclick = async () => {
  const tout = await chrome.storage.local.get(null);
  const captures = Object.entries(tout)
    .filter(([cle]) => cle.startsWith('hoh:capture:'))
    .map(([, valeur]) => valeur);
  enregistrer(
    { format: 'hoh-full-export-base64', version: 3, captures, journal: tout['hoh:journal'] || [] },
    `hoh-diagnostic-${leJour()}.json`,
  );
};

effacer.onclick = async () => {
  const tout = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(tout).filter((c) => c.startsWith('hoh:')));
  await rafraichir();
  etat.textContent = 'Données effacées. Recharge le jeu pour en créer de nouvelles.';
};

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'compte-pret') rafraichir();
});

rafraichir();
