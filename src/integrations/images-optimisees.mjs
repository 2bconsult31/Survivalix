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
