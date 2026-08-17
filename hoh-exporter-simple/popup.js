const status = document.querySelector('#status');
const liste = document.querySelector('#liste');
const download = document.querySelector('#download');
const clear = document.querySelector('#clear');

const PREFIXE = 'hoh:capture:';
let captures = [];
let journal = [];

const enMo = (o) => (o >= 1024 * 1024 ? `${(o / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(o / 1024)} Ko`);
const nomCourt = (url) => { try { return new URL(url).pathname.split('/').filter(Boolean).slice(-2).join('/') || url; } catch { return url; } };

async function rafraichir() {
  const tout = await chrome.storage.local.get(null);
  journal = tout['hoh:journal'] || [];
  captures = Object.entries(tout)
    .filter(([cle]) => cle.startsWith(PREFIXE))
    .map(([, valeur]) => valeur)
    .sort((a, b) => b.bytes - a.bytes);

  liste.innerHTML = '';
  for (const c of captures) {
    const li = document.createElement('li');
    // On met en évidence les gros blocs : ce sont les candidats au catalogue du jeu.
    if (c.bytes > 500 * 1024) li.className = 'gros';
    const nom = document.createElement('span');
    nom.textContent = nomCourt(c.url);
    nom.title = c.url;
    const taille = document.createElement('span');
    taille.textContent = enMo(c.bytes);
    li.append(nom, taille);
    liste.append(li);
  }

  const aStartup = captures.some((c) => /\/game\/startup$/.test(c.url));
  const images = journal.filter((e) => /\.(png|jpe?g|webp|gif|svg|atlas|ktx2?|basis)(\?|$)/i.test(e.url)).length;
  if (!captures.length) {
    status.textContent = "Rien de capturé pour l'instant. Ouvre le jeu et recharge la page (Ctrl+R).";
  } else {
    status.textContent = `${captures.length} bloc(s) capturé(s), ${journal.length} adresse(s) relevée(s)`
      + (images ? `, dont ${images} image(s).` : '.')
      + (aStartup ? ' Ton compte est bien dedans.' : " Attention : l'état du compte n'a pas encore été vu, recharge le jeu.");
  }
  download.disabled = captures.length === 0;
  clear.disabled = captures.length === 0;
}

download.onclick = () => {
  const parUrl = (motif) => captures.find((c) => motif.test(c.url));
  const fichier = {
    format: 'hoh-full-export-base64',
    version: 3,
    // Clés historiques, conservées pour rester compatible avec la version précédente.
    startup: parUrl(/\/game\/startup$/) || null,
    gameDesign: parUrl(/gamedesign/i) || null,
    captures,
    journal,
  };
  const blob = new Blob([JSON.stringify(fichier, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `heroes-of-history-export-${new Date().toISOString().slice(0, 10)}.json`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

clear.onclick = async () => {
  const tout = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(tout).filter((c) => c.startsWith('hoh:')));
  await rafraichir();
  status.textContent = 'Copie effacée. Recharge le jeu pour créer un nouvel export.';
};

rafraichir();
