# Refonte UX/UI de Survivalix — suivi par lots

Document interne (non publié sur le site). À lire avant toute modification graphique.
Mis à jour à la fin de chaque lot : statut, numéro de PR, décisions prises.

**Objectif :** supprimer l'« effet site fait par l'IA » en renforçant l'identité rétro « manuel de défense civile des années 50 », sans perdre ce qui fonctionne (logo, palette ambre/kaki/noir, illustrations).

**Skills à utiliser :** impeccable, frontend-design, web-design-guidelines, best-practices.

## Tableau de suivi

| Lot | Sujet | Statut | PR | Fusion |
|---|---|---|---|---|
| 0 | Nettoyage | fait | #60 | automatique |
| 1 | Les tics visuels | à faire | — | après accord écrit de Boris |
| 2 | La page d'accueil | à faire | — | après accord écrit de Boris |
| 3 | La lecture des articles | à faire | — | après accord écrit de Boris |
| 4 | Le système « manuel de défense civile » | à faire (sur feu vert) | — | à définir |

Statuts possibles : à faire / en cours / en attente de validation / fait.

## Règles de la refonte

1. Un lot = une session = une PR, périmètre fermé. À la fin du lot, s'arrêter et faire le point à Boris. Ne jamais commencer le lot suivant sans son feu vert. Quand Boris écrit « Lot suivant », reprendre le premier lot non terminé.
2. Lots graphiques (1, 2, 3) : exception à la fusion automatique. Ouvrir la PR, donner le lien de l'aperçu Vercel et des captures (ordinateur et mobile), et fusionner seulement après l'accord écrit de Boris. Le lot 0 suit la règle normale (fusion automatique).
3. Illustrations : n'en générer jamais. Réutiliser d'abord les illustrations validées déjà sur le site, uniquement celles au nouveau standard (épisodes méditerranéens, panne de chauffage, inondation, sac d'évacuation : vérifier leur rendu). Si une illustration spécifique manque, s'arrêter et donner à Boris : son rôle, son format exact (dimensions), son nom de fichier et son chemin, et un prompt de génération en anglais dans le style du site (trait dense, hachures, halftone, grain papier, palette ambre #F5A623, kaki #6B7C45, noir #0d0d0d, crème #F5E6C8, rouge brique, bord à bord, aucun texte). Boris la génère et l'envoie.
4. Accessibilité : chaque lot garde zéro erreur de contraste et de taille de cible (axe-core, WCAG 2.2 AA) sur les pages touchées. Respect de prefers-reduced-motion.
5. Ne changer ni le logo, ni la palette, ni les contenus, ni les adresses des pages. Aucune régression SEO (titres, balises, liens internes, données structurées).

## Les lots

### Lot 0 — Nettoyage (fusion automatique)
- Supprimer src/components/Welcome.astro et toute autre ressource de démonstration Astro inutilisée (vérifier qu'aucun fichier ne les importe).
- Bandeau défilant : remplacer « NIVEAU D'ALERTE : MODÉRÉ » par un slogan qui ne se fait pas passer pour un niveau d'alerte officiel (ex. « RESTEZ PRÊTS, PAS PARANOS »). Animation arrêtée si prefers-reduced-motion : le texte reste lisible, immobile.

### Lot 1 — Les tics visuels (validation sur page de démonstration)
- Constat : 34 bordures colorées sur le côté gauche (cartes, sous-titres h3, encadrés, sidebar) et des étiquettes « // TEXTE // » sur presque chaque section.
- Créer d'abord une page de démonstration /design-lab (noindex, exclue du sitemap, aucun lien depuis le site) montrant côte à côte 3 propositions pour remplacer les bordures latérales, inspirées des documents imprimés des années 50 : coin de fiche cartonnée, perforations de classeur ou ligne de découpe en pointillés, onglet ou tampon. Chacune sur une carte de rubrique, un intertitre d'article et un encadré.
- Proposer la règle d'usage des étiquettes « // TEXTE // » : 1 ou 2 emplacements maximum sur le site, là où elles ont un sens.
- S'arrêter : Boris choisit. Ensuite seulement, appliquer le choix à tout le site, supprimer /design-lab, et soumettre l'aperçu.

### Lot 2 — La page d'accueil (validation sur aperçu Vercel)
- Ouverture : une grande illustration (réutiliser une illustration validée, ou en demander une selon la règle 3), avec le titre et les deux boutons existants.
- Rubriques : remplacer les icônes génériques par une illustration par rubrique (image d'un article de la rubrique, ou en demander une).
- Ajouter un bloc « Dernières fiches » automatique (les 6 articles les plus récents, toutes rubriques : image, rubrique, titre, date de publication ou de mise à jour) et mettre en avant le dernier article Radar.
- Appliquer la règle des étiquettes du lot 1 ; alléger la liste à coches et les cartes numérotées 01/02/03.

### Lot 3 — La lecture des articles (test sur un seul article, validation sur aperçu)
- Tester sur manuel/sac-evacuation uniquement : zone de lecture sur fond crème papier (#F5E6C8 ou une variante plus claire), texte noir d'encre, comme une page de manuel imprimé posée dans l'abri. Le cadre du site (en-tête, navigation, pied de page, image principale) reste noir.
- Contraste sur fond crème : l'ambre #F5A623 n'y est pas lisible pour du texte. Pour les liens et intertitres de la zone crème, proposer une couleur foncée de la palette (rouge brique foncé, kaki foncé ou noir) atteignant au moins 4,5:1.
- Typographie : corps de texte plus confortable (taille, interlignage, longueur de ligne autour de 65-75 caractères), intertitres plus affirmés, encadré « À retenir » façon fiche de consigne officielle.
- S'arrêter : Boris valide sur l'aperçu. S'il valide, généraliser le fond crème aux 4 gabarits d'article dans le même lot.

### Lot 4 — Le système « manuel de défense civile » (plus tard, sur feu vert)
- Formaliser le système graphique (fiches, onglets, tampons, couleurs, typographie) dans un document de référence, puis l'étendre aux pages outils, au Bunker et au quiz.

## Journal des décisions

### Lot 0 — Nettoyage (PR #60, fusionnée)
- Supprimés : src/components/Welcome.astro, src/assets/astro.svg, src/assets/background.svg (uniquement importés par Welcome.astro), .codesandbox/Dockerfile (modèle de démarrage, Node 24 alors que le projet est en Node 22).
- README.md : le texte du modèle « Astro Starter Kit » est remplacé par une présentation courte du projet.
- Conservés : public/favicon.ico et public/favicon.svg (icônes propres à Survivalix, pas celles d'Astro), .vscode/ (configuration d'éditeur).
- Bandeau défilant : regroupé dans un composant unique src/components/Ticker.astro (il était copié à l'identique dans les 5 gabarits). « ⚠ NIVEAU D'ALERTE : MODÉRÉ » remplacé par « RESTEZ PRÊTS, PAS PARANOS », sans le pictogramme d'alerte. Les trois autres messages sont inchangés.
- Le second passage du texte (nécessaire à la boucle) est masqué aux lecteurs d'écran, qui ne lisent plus les messages deux fois.
- prefers-reduced-motion : animation coupée, second passage masqué, messages centrés et repliés sur plusieurs lignes si l'écran est étroit.
