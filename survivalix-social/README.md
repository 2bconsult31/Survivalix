# Survivalix Social

Production des Reels Instagram de survivalix.fr. Les images et animations sont générées via Higgsfield (Kling 3.0) à partir de `references/`, validées par Boris, puis montées ici avec `scripts/montage`. Les règles de production (format, zones, typographie, son, contenu) sont dans `CLAUDE.md`.

## Lancer un nouveau Reel

1. Copier le dossier modèle : `cp -r reels/_exemple reels/AAAA-MM-JJ-slug` (ex. `reels/2026-10-20-frigo-ferme`).
2. Remplir `script.md` (accroche, plans, légende, sources) et le faire valider par Boris.
3. Déposer les images validées dans `images/`, puis, le temps de la session de montage, les animations validées dans `clips/`, nommées par numéro de plan : `01.mp4`, `02.mp4`…
4. Monter : `scripts/montage reels/AAAA-MM-JJ-slug/` → la vidéo sort sans musique dans `export/` et est livrée à Boris en téléchargement.
5. Boris ajoute la musique dans CapCut, valide la version finale, puis la programme via Metricool.

Aucun fichier vidéo ni audio n'est enregistré dans le dépôt : `clips/`, `export/`, les fichiers .mp4, .mov, .webm et les fichiers audio sont ignorés par Git. `assets/music/` reste vide.

Prérequis : `ffmpeg` (avec libass) et Python 3 avec Pillow.
