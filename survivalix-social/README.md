# Survivalix Social

Production des Reels Instagram de survivalix.fr. Les images et animations sont générées via Higgsfield (Kling 3.0) à partir de `references/`, validées par Boris, puis montées ici avec `scripts/montage`. Les règles de production (format, zones, typographie, son, contenu) sont dans `CLAUDE.md`.

## Lancer un nouveau Reel

1. Copier le dossier modèle : `cp -r reels/_exemple reels/AAAA-MM-JJ-slug` (ex. `reels/2026-10-20-frigo-ferme`).
2. Remplir `script.md` (accroche, plans, légende, sources) et le faire valider par Boris.
3. Déposer les images validées dans `images/`, puis les animations validées dans `clips/`, nommées par numéro de plan : `01.mp4`, `02.mp4`…
4. Si une musique est prévue, la déposer dans `assets/music/` et indiquer son nom dans la fiche (`- Musique : fichier.mp3`).
5. Monter : `scripts/montage reels/AAAA-MM-JJ-slug/` → la vidéo sort dans `export/`.
6. Faire valider le MP4 par Boris, puis programmer via Metricool.

Prérequis : `ffmpeg` (avec libass) et Python 3 avec Pillow.
