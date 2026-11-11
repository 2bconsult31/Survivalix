// Refonte UX, lot 6 : versions WebP allégées des illustrations.
// À chaque `astro build` (et `astro dev`), crée pour chaque image de public/images
// des copies WebP à plusieurs largeurs dans public/images/_opt/ (dossier ignoré par git).
// Les originaux JPG/PNG ne sont pas modifiés : ils restent l'image de secours
// et l'image des partages (Open Graph, données structurées).
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import sharp from 'sharp';

export const LARGEURS = [480, 800, 1200, 1600];
const RACINE = 'public/images';
const SORTIE = 'public/images/_opt';

function lister(dossier) {
  const fichiers = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (chemin.startsWith(SORTIE)) continue;
    if (statSync(chemin).isDirectory()) fichiers.push(...lister(chemin));
    else if (/\.(jpe?g|png)$/i.test(nom)) fichiers.push(chemin);
  }
  return fichiers;
}

export async function genererImages(logger) {
  let crees = 0;
  for (const source of lister(RACINE)) {
    const base = relative(RACINE, source).slice(0, -extname(source).length);
    const { width = 0 } = await sharp(source).metadata();
    const dateSource = statSync(source).mtimeMs;
    // Largeurs standard (jamais d'agrandissement) + la largeur d'origine, pour les grands écrans
    const largeurs = [...new Set([...LARGEURS.filter((l) => l < width), width])];
    for (const largeur of largeurs) {
      const cible = join(SORTIE, `${base}-${largeur}.webp`);
      if (existsSync(cible) && statSync(cible).mtimeMs >= dateSource) continue;
      mkdirSync(dirname(cible), { recursive: true });
      await sharp(source).resize({ width: largeur }).webp({ quality: 78 }).toFile(cible);
      crees++;
    }
  }
  logger?.info(`images WebP : ${crees} créée(s)`);
  await genererRecadragesRecettes(logger);
}

export default function imagesOptimisees() {
  return {
    name: 'survivalix-images-optimisees',
    hooks: {
      'astro:config:setup': async ({ logger }) => {
        // Une panne ici ne doit jamais bloquer la mise en ligne :
        // sans fichiers WebP, ImageOpt affiche simplement les originaux.
        try {
          await genererImages(logger);
        } catch (erreur) {
          logger.warn(`images WebP non générées (originaux utilisés) : ${erreur}`);
        }
      },
    },
  };
}

// Recadrages 16:9, 4:3 et 1:1 de l'image principale des recettes (Cantine),
// recommandés par Google pour les données structurées Recipe. Jamais d'agrandissement :
// la hauteur d'origine borne la taille. Sortie : public/images/_opt/cantine/<nom>-16x9.jpg, etc.
// Point focal horizontal (0 = bord gauche, 1 = bord droit) quand le sujet n'est pas au centre.
// Par défaut 0,5 (centre). Vérifier le rendu des carrés après tout ajout de recette.
const POINT_FOCAL = {
  'pemmican-survie': 0.33,
};

export const RECADRAGES = [
  { suffixe: '16x9', l: 16, h: 9 },
  { suffixe: '4x3', l: 4, h: 3 },
  { suffixe: '1x1', l: 1, h: 1 },
];

async function genererRecadragesRecettes(logger) {
  const dossier = join(RACINE, 'cantine');
  if (!existsSync(dossier)) return;
  let crees = 0;
  for (const nom of readdirSync(dossier)) {
    if (!/\.(jpe?g|png)$/i.test(nom)) continue;
    const source = join(dossier, nom);
    const base = nom.slice(0, -extname(nom).length);
    const { width = 0, height = 0 } = await sharp(source).metadata();
    const dateSource = statSync(source).mtimeMs;
    for (const { suffixe, l, h } of RECADRAGES) {
      const cible = join(SORTIE, 'cantine', `${base}-${suffixe}.jpg`);
      if (existsSync(cible) && statSync(cible).mtimeMs >= dateSource) continue;
      // Plus grand rectangle au bon format qui tient dans l'image d'origine
      let largeur = width;
      let hauteur = Math.round((width * h) / l);
      if (hauteur > height) {
        hauteur = height;
        largeur = Math.round((height * l) / h);
      }
      const focal = POINT_FOCAL[base] ?? 0.5;
      const left = Math.min(Math.max(Math.round(focal * width - largeur / 2), 0), width - largeur);
      const top = Math.round((height - hauteur) / 2);
      mkdirSync(dirname(cible), { recursive: true });
      await sharp(source)
        .extract({ left, top, width: largeur, height: hauteur })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(cible);
      crees++;
    }
  }
  logger?.info(`recadrages des recettes : ${crees} créé(s)`);
}
