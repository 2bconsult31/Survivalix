# Survivalix Social — production des Reels

## Rôle
Ce dépôt sert à monter les Reels de survivalix.fr. Les images et animations sont générées via Higgsfield (Kling 3.0) à partir des images de references/, validées par Boris, puis montées ici.

## Format
- Vertical 9:16, 1080 × 1920, 24 ou 30 images/s, MP4 H.264.
- Durée : 12 à 20 secondes, jamais plus. Plans de 1,5 à 3 s, coupes franches, pas de fondus.
- Couper chaque animation avant toute dérive en fin de plan (objets qui changent de forme).

## Zones Instagram
- Les 14 % du haut et les 35 % du bas sont masqués par l'interface des Reels.
- Logo Survivalix : visible de la première à la dernière image, entre 14 et 20 % de la hauteur, en haut à droite.
- Textes : entre 20 et 35 % de la hauteur (environ 390 à 670 px du haut).

## Textes à l'écran
- Accroche dès l'image 0 : le texte le plus grand de la vidéo.
- 2 lignes maximum, phrases courtes, un mot clé en ambre #F5A623, le reste en crème #F5E6C8, contour noir épais.
- Minuscules avec majuscule en début de phrase ; majuscules réservées à 1 ou 2 mots.
- Ponctuation sur la ligne de base, collée au mot.
- Tout texte est ajouté au montage, jamais généré dans l'image.

## Son
- Musique libre de droits avec licence d'usage commercial, crêtes à -1 dB maximum, jamais 0 dB.
- Pas de voix off pour l'instant.
- Aucun filigrane d'une autre application.

## Images
- Style : copier strictement le rendu des images de references/. Interdits : rendu plat, contour lumineux autour des objets, cadre ou bordure, fond flou photographique, texte ou pseudo-texte, logo, arme, visuel officiel de l'État.
- Personnages : jamais de capuche relevée en intérieur ni de posture furtive. Aucune caractéristique pouvant être lue comme un cliché.

## Contenu
- Chaque Reel s'appuie sur un article existant de survivalix.fr.
- Aucun chiffre ni fait sans source institutionnelle. Consigne de sécurité : la plus prudente.
- Formulations inclusives, jamais « pour les gens normaux ».
- Liens : URL simple, jamais d'UTM.

## Circuit
1. Fiche validée par Boris (reels/<dossier>/script.md).
2. Images générées, validées une par une, rangées dans images/.
3. Animations générées, validées, rangées dans clips/.
4. Montage avec scripts/montage, export dans export/, validation du MP4 par Boris.
5. Programmation via Metricool, à la date indiquée par Boris.
