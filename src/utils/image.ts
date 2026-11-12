import { existsSync } from 'node:fs';

// Renvoie le chemin de l'image s'il existe bien dans public/, sinon undefined.
// Permet de publier un article avant de recevoir son image : le visuel de secours s'affiche
// et les balises de partage retombent sur l'image par défaut, sans image cassée.
export function imageDispo(src?: string | null): string | undefined {
  if (!src) return undefined;
  return existsSync(`public${src}`) ? src : undefined;
}
