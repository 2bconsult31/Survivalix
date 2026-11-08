# Survivalix

Code source de [survivalix.fr](https://www.survivalix.fr), le site de survie urbaine pour tout le monde.

- Site statique Astro (Content Collections), déployé automatiquement par Vercel depuis `main`.
- Articles : `src/content/<rubrique>/<slug>.md` (manuel, radar, cantine, atelier).
- Bunker IA : fonction Vercel `api/bunker.js`.
- Règles du projet : [CLAUDE.md](CLAUDE.md). Refonte graphique en cours : [docs/refonte-ux.md](docs/refonte-ux.md).

## Commandes

| Commande | Action |
| :-- | :-- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Serveur local sur `localhost:4321` |
| `npx astro build` | Construit le site dans `dist/` (à lancer avant toute PR) |
| `npm run preview` | Prévisualise le build |
