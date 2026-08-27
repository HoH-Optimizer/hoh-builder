'use strict';
// Rend leur couleur aux icônes de l'arbre de panthéon.
//
// POURQUOI. Les icônes viennent d'une capture de l'arbre d'un compte réel, et le
// jeu dessine EN BLEU-GRIS tout nœud qui n'est pas encore débloqué. Sur les
// vingt-deux icônes d'une classe, quatre seulement — celles que le héros avait
// prises — sont en couleur ; les dix-huit autres arrivent délavées. À l'écran,
// l'arbre entier paraît éteint et une croix de soin ne se distingue plus d'une
// cible de dégâts.
//
// LA COULEUR N'EST PAS INVENTÉE. Chaque nœud rapporte une statistique, et chaque
// statistique a son icône officielle dans images/stats/ : la croix des soins y
// est verte, la cible des dégâts uniques jaune, le bouclier cyan, les points de
// vie rouges. C'est de là que vient la table TEINTES ci-dessous — teinte
// dominante et saturation moyenne, mesurées sur ces icônes-là.
//
// CE QU'ON REPEINT, ET CE QU'ON LAISSE. Seul le DESSIN prend la couleur, pas la
// pastille : dans le jeu, le disque reste bleu nuit et c'est l'emblème posé
// dessus qui porte la teinte. On ne touche donc qu'aux pixels clairs, et
// d'autant plus qu'ils sont clairs — le cerne sombre du disque ne bouge pas.
//
// Les icônes d'origine sont conservées dans images/pantheon/brut/<Classe>/ :
// c'est de là que l'outil relit, ce qui le rend rejouable sans dégrader.
//
//   node tools/couleur-noeud.js            toutes les classes disponibles
//   node tools/couleur-noeud.js SingleStriker

const fs = require('node:fs');
const path = require('node:path');
const png = require('./png.js');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'images', 'pantheon');
const BRUT = path.join(DOSSIER, 'brut');

global.window = {};
eval(fs.readFileSync(path.join(RACINE, 'pantheon-jeu.js'), 'utf8'));
const PANTHEON = global.window.PANTHEON_JEU;

// Teinte (en degrés) et saturation de l'icône officielle de chaque statistique.
// Relevées sur images/stats/ : histogramme des teintes pondéré par la saturation,
// pic retenu. Deux d'entre elles sont bleues — la défense et la vitesse de
// déplacement — et c'est normal : le jeu les dessine ainsi. Ce qui change pour
// elles, c'est la saturation, qui les sort du gris.
const TEINTES = {
  CritChance: [35, 0.77],
  CritDamage: [35, 0.77],
  BasicAttackDamageAmp: [15, 0.73],
  AttackSpeed: [35, 0.78],
  HealTakenAmp: [95, 0.88],
  ShieldTakenAmp: [195, 0.69],
  MoveSpeed: [215, 0.68],
  Evasion: [35, 0.91],
  InitialFocusInSecondsBonus: [35, 0.92],
  BaseDamage: [15, 0.72],
  SingleTargetDamageAmp: [35, 0.92],
  Attack: [35, 0.81],
  Defense: [205, 0.72],
  MaxHitPoints: [345, 0.91],
};

// Cinq nœuds par classe ne touchent aucune statistique : ce sont des effets de
// combat, et rien ne dit de quelle couleur le jeu les peint. Faute de référence,
// ils prennent l'or, la teinte la plus répandue du jeu. C'est le seul endroit de
// cet outil où la couleur est un choix et non un relevé.
const OR = [35, 0.8];

// En dessous de cette clarté, on est sur le disque et son cerne : on n'y touche
// pas. Au-dessus, on est sur le dessin.
const CLARTE_DESSIN = 0.42;

// Une icône dont le dessin est déjà coloré est un nœud que le compte avait
// débloqué : le jeu l'a rendue en couleur, elle est meilleure que tout ce qu'on
// pourrait peindre. On la laisse.
const SATURATION_DEJA_COLOREE = 0.22;

const versHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = 60 * (((g - b) / d) % 6);
  else if (mx === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  return [h < 0 ? h + 360 : h, s, l];
};

const versRvb = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const table = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]];
  const [r, g, b] = table[Math.floor(h / 60) % 6];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

// La saturation moyenne des pixels clairs : c'est elle qui dit si le dessin a
// gardé ses couleurs ou s'il est arrivé délavé.
function saturationDuDessin(image) {
  const { largeur, hauteur, pixels } = image;
  let somme = 0, n = 0;
  for (let i = 0; i < largeur * hauteur; i++) {
    if (pixels[i * 4 + 3] < 128) continue;
    const [, s, l] = versHsl(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]);
    if (l < CLARTE_DESSIN) continue;
    somme += s; n++;
  }
  return n ? somme / n : 0;
}

function teinter(image, teinte, saturation) {
  const { largeur, hauteur, pixels } = image;
  for (let i = 0; i < largeur * hauteur; i++) {
    if (pixels[i * 4 + 3] < 8) continue;
    const [, s, l] = versHsl(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]);
    if (l < CLARTE_DESSIN) continue;
    // La teinte se pose progressivement : à peine sur le bord du dessin, à
    // pleine force en son cœur. Sans cela, le contour du dessin trancherait net
    // sur le disque, comme un autocollant.
    const force = Math.min(1, (l - CLARTE_DESSIN) / 0.45);
    const [r, g, b] = versRvb(teinte, Math.min(1, s + (saturation - s) * force), l);
    pixels[i * 4] = r; pixels[i * 4 + 1] = g; pixels[i * 4 + 2] = b;
  }
  return image;
}

function traiter(classe) {
  const arrivee = path.join(DOSSIER, classe);
  if (!fs.existsSync(arrivee)) return;
  const origine = path.join(BRUT, classe);
  fs.mkdirSync(origine, { recursive: true });

  const noeuds = PANTHEON[classe]?.noeuds || PANTHEON[classe] || {};
  console.log(`\n${classe}`);

  for (const fichier of fs.readdirSync(arrivee).filter((f) => f.endsWith('.png')).sort()) {
    const brut = path.join(origine, fichier);
    // Premier passage : l'icône telle que la capture l'a donnée est mise de côté.
    if (!fs.existsSync(brut)) fs.copyFileSync(path.join(arrivee, fichier), brut);

    const image = png.lire(brut);
    const dejaColoree = saturationDuDessin(image) >= SATURATION_DEJA_COLOREE;
    if (dejaColoree) {
      fs.copyFileSync(brut, path.join(arrivee, fichier));
      console.log(`  ${fichier.padEnd(20)} déjà en couleur dans le jeu — laissée telle quelle`);
      continue;
    }

    const stat = (noeuds[fichier.replace(/\.png$/, '')]?.effets || []).map((e) => e.stat).find(Boolean);
    const [teinte, saturation] = TEINTES[stat] || OR;
    png.ecrire(path.join(arrivee, fichier), teinter(image, teinte, saturation));
    console.log(`  ${fichier.padEnd(20)} ${(stat || 'effet de combat').padEnd(28)} teinte ${teinte}°${stat ? '' : ' (or par défaut)'}`);
  }
}

const demandee = process.argv[2];
for (const classe of demandee ? [demandee] : Object.keys(PANTHEON)) traiter(classe);
