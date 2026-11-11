# Refonte UX/UI de Survivalix — suivi par lots

Document interne (non publié sur le site). À lire avant toute modification graphique.
Mis à jour à la fin de chaque lot : statut, numéro de PR, décisions prises.

**Objectif :** supprimer l'« effet site fait par l'IA » en renforçant l'identité rétro « manuel de défense civile des années 50 », sans perdre ce qui fonctionne (logo, palette ambre/kaki/noir, illustrations).

**Skills à utiliser :** impeccable, frontend-design, web-design-guidelines, best-practices.

## Tableau de suivi

| Lot | Sujet | Statut | PR | Fusion |
|---|---|---|---|---|
| 0 | Nettoyage | fait | #60 | automatique |
| 1 | Les tics visuels | fait | #61 | après accord écrit de Boris (donné) |
| 2 | La page d'accueil | fait | #62 | après accord écrit de Boris (donné) |
| 3 | La lecture des articles | fait | #64 | après accord écrit de Boris (donné) |
| 4 | Le système « manuel de défense civile » | en attente de validation | #69 | après accord écrit de Boris |

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

### Lot 1 — Les tics visuels (PR #61, fusionnée après accord écrit de Boris)
- Étape 1 : page /design-lab (noindex, hors sitemap) avec 3 propositions. Boris a choisi **C, onglet et tampon**. Page supprimée ensuite.
- Système « onglet » dans src/styles/global.css : classe .fiche = filet fin #4a4a4a (variable --filet) tout autour, filet ambre de 3 px en haut, onglet ambre qui dépasse en haut à gauche ; data-onglet="01" écrit un numéro dans l'onglet. Appliqué aux cartes de rubrique de l'accueil (01 Manuel, 02 Cantine, IA Bunker, 03 Atelier, 04 Outils, 05 Radar : cartes Outils et Radar interverties pour suivre l'ordre, pastille « IA » remplacée par l'onglet), aux chiffres et ressources de /commencer-ici, aux fiches du lexique, aux encadrés d'article (blockquote).
- Intertitres h3 des articles : onglet numéroté en CSS (« 2.1 » = 1er h3 de la 2e partie), décoratif, absent du texte de la page.
- Encadrés (méta recette et atelier, conseils des calculateurs, étape de /commencer-ici, intro /a-propos, messages et statut du Bunker) : filet fin tout autour et filet de couleur en haut, sans onglet. Quiz : filet du haut au lieu de la gauche.
- Liens de la colonne latérale des articles : soulignés au survol au lieu de la bordure. Menu mobile : fond légèrement éclairci au survol au lieu de la bordure.
- Tampon : réservé à l'encadré « À retenir » du lot 3.
- Étiquettes « // TEXTE // » : gardées seulement en en-tête des pages de rubrique (« // SECTION 0X // ») et dans le quiz (/survivant et son résultat). Supprimées quand elles répétaient le titre (contact, à propos, mentions légales, confidentialité, lexique). Ailleurs, barres obliques retirées (61 étiquettes).
- Contrôle axe-core WCAG 2.2 AA : zéro erreur sur les 20 pages touchées, ordinateur et mobile.

### Lot 2 — La page d'accueil (PR #62, fusionnée après accord écrit de Boris)
- Ouverture : illustration du sac d'évacuation (validée) bord à bord, titre et deux boutons posés dessus sur un fondu noir (ordinateur) ou en dessous (mobile). Étiquette « TRANSMISSION EN COURS » supprimée.
- Le choix de l'illustration : les 4 illustrations validées sont déjà toutes sur la page (sac en ouverture, épisodes méditerranéens à la une du Radar, inondation et panne de chauffage dans les dernières fiches). Aucune n'est donc réutilisée pour les rubriques, pour éviter les doublons.
- « À la une du Radar » : le dernier article Radar (date de publication), grande carte image + titre + description + date. Automatique.
- « Dernières fiches » : les 6 articles les plus récents par date de publication, toutes rubriques, sans répéter l'article à la une. Onglet = rubrique, image, titre, date (« Mis à jour le » si la mise à jour est postérieure à la publication, sinon « Publié le »). Automatique.
- « C'est quoi ce site ? » : devient un intertitre ; liste à coches allégée (petits tirets, deux colonnes).
- « Tu débarques ici ? » : les cartes numérotées 01/02/03 deviennent une liste simple à trois colonnes, sans cadre ni numéro.
- Étiquettes au-dessus des titres supprimées (protocole de démarrage, secteurs d'activité, identification du citoyen).
- Rubriques : la carte affiche public/images/rubriques/<slug>.jpg dès que le fichier existe (1200 × 900), sinon garde son pictogramme. 6 illustrations demandées à Boris ; 5 livrées et en place (manuel, cantine, bunker, atelier, outils, 1200 × 896). Radar : illustration livrée ensuite et ajoutée (public/images/rubriques/radar.jpg) ; les 6 cartes sont illustrées.
- body { overflow-x: clip } dans global.css, pour que les blocs bord à bord ne créent jamais de défilement horizontal.

### Lot 3 — La lecture des articles (PR #64, fusionnée après accord écrit de Boris)
- Activation : classe .lecture-papier sur .article-content dans les 4 gabarits (Article, ArticleRadar, ArticleCantine, ArticleAtelier), après validation du test sur /manuel/sac-evacuation par Boris. Styles dans global.css (section « ZONE DE LECTURE PAGE IMPRIMÉE »).
- Fond #FAF1DE (variante plus claire du crème #F5E6C8) avec grain très léger ; texte encre #1a1a1a (15,5:1) ; intertitres en noir #0d0d0d (17,3:1), h2 soulignés d'un filet ambre de 4 px, h3 avec l'onglet numéroté ambre du lot 1 ; liens en noir gras soulignés d'ambre (3 px). Premier essai en rouge brique refusé par Boris (hors charte) : le rouge brique est réservé au tampon « À retenir ». L'ambre n'est jamais une couleur de texte sur le crème (1,8:1), seulement un filet, un soulignement ou un onglet.
- Typographie : Oswald 400 (au lieu de 300), 18 px (chapeau 20 px), interlignage 1,75, colonne de 30rem ≈ 68 à 75 caractères par ligne (Oswald est étroite), h2 plus grands avec filet noir de 2 px.
- Encadré « À retenir » : double filet noir façon fiche de consigne, tampon « À retenir » rouge brique légèrement de travers. Style appliqué aux citations markdown (>). Dans sac-evacuation.md, le paragraphe « Un conseil pratique » passe en citation (texte inchangé, mise en forme seulement).
- Cadre noir inchangé : en-tête, image principale, titre, colonne latérale, articles liés, pied de page.
- Contrôle axe-core WCAG 2.2 AA : zéro erreur (ordinateur et mobile).
- Généralisé aux 4 gabarits : axe-core zéro erreur sur les 32 articles (ordinateur et mobile), aucun débordement horizontal, tableaux contenus dans la largeur sur mobile.
- Retouche après mise en ligne (demande de Boris : « noir pas assez foncé ») : encre passée de #1a1a1a à #000 (19,4:1) pour le texte, les intertitres h2 et les liens ; corps du texte en Oswald 500 au lieu de 400 (graisse 500 ajoutée au chargement des polices des 4 gabarits d'article).
- Seconde retouche : Oswald 500 jugée trop épaisse (fatigue la lecture), retour à Oswald 400 en gardant le noir #000. Graisse 500 retirée du chargement des polices.
- Titres en gras (demande de Boris) : h2, h3 et h4 de la zone crème épaissis par un fin contour de la même couleur (-webkit-text-stroke 0,035em pour les h2, 0,025em pour les h3 et h4), car Special Elite n'a qu'une graisse et Oswald est déjà en 700. Texte courant inchangé.
- Colonne de texte élargie (demande de Boris : trop étroite, trop de défilement) : 30rem → 42rem (≈ 85 à 90 caractères par ligne sur ordinateur), marges intérieures de la feuille ramenées de 3rem à 2,5rem. Sac d'évacuation sur ordinateur : page de 10 064 px à 8 473 px de haut. Mobile inchangé.

### Lot 4 — Le système « manuel de défense civile » (PR #69)
- Document de référence : docs/systeme-graphique.md (couleurs et contrastes, typographie, fiche à onglet, tampon, encadrés, zone papier, étiquettes, boutons, illustrations, pièges techniques).
- Nouvelles classes globales : .tampon, .encadre-consigne (version fond noir de l'encadré « À retenir »), .papier (feuille crème hors article).
- Outils : cartes de /outils en fiches à onglet numéroté 01 à 04 (gros numéros pâles supprimés) ; panneaux des calculateurs, du générateur et de l'évaluateur en fiches ; conseils des calculateurs en encadré de consigne avec tampon « À retenir » ; questions de l'évaluateur avec onglet « Q. 01 » ; « // Rien à signaler » sans barres.
- Bunker : réponses présentées comme une feuille imprimée (fond papier, encre noire, onglet « BUNKER IA ») ; questions de l'utilisateur en fiche sombre à filet kaki. Corrige un défaut existant : les styles des messages ne s'appliquaient pas (messages créés en JavaScript).
- Quiz : onglet « Q. 01 » à la place du gros numéro pâle ; résultat : cartes en fiches, conseil en encadré de consigne avec tampon « Conseil Survivalix ». Corrige deux défauts existants : la page de résultat n'était presque pas stylée (éléments créés en JavaScript) et le nom de 7 profils sur 10 n'avait pas assez de contraste (la couleur du profil colore désormais le cadre du badge et le filet sous le nom, le texte est en ambre et crème).
- Générateur kit 72h : corrige un défaut existant, les cases à cocher n'étaient pas mises en page (éléments créés en JavaScript).
- Contrôle axe-core WCAG 2.2 AA : zéro erreur sur les 8 pages touchées, ordinateur et mobile (et générateur avec cases cochées).
