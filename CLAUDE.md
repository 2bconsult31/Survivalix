# Survivalix — règles du projet

## Le projet
- survivalix.fr : site de survie urbaine en français, pour le grand public (25-45 ans, citadins). Ton complice et décalé, jamais anxiogène. Formulations inclusives : jamais « pour les gens normaux », dire « pour tout le monde ».
- Stack : Astro + Content Collections, Vercel (déploiement automatique depuis main), Google Analytics 4 (G-PPFYTX79ND), AdSense (ca-pub-3877882826995901), Search Console sur https://www.survivalix.fr.
- Rubriques : manuel, radar, cantine, atelier (src/content/<rubrique>/<slug>.md), plus outils, bunker (IA), survivant (quiz).
- Le SEO est le canal principal de croissance. Le Radar (angles de niche, actualité) est la priorité éditoriale.

## Règles techniques
- Adresse officielle du site : https://www.survivalix.fr (avec www), toujours. Jamais d'URL codée en dur dans un layout : utiliser Astro.site.
- Refonte UX en cours : lire docs/refonte-ux.md avant toute modification graphique. Quand Boris écrit « Lot suivant », reprendre le premier lot non terminé.
- Le Bunker IA en ligne est api/bunker.js (fonction Vercel à la racine). Toute règle éditoriale s'applique aussi à son SYSTEM_PROMPT.
- Toutes les balises SEO des articles (canonical, Open Graph, Twitter, JSON-LD, Consent Mode, AdSense, GA) sont dans src/components/ArticleSEO.astro, utilisé par les 4 layouts d'article. Toute correction SEO se fait à cet endroit unique.
- Consent Mode v2 : consentement refusé par défaut avant tout script Google ; le bandeau CMP de Google met à jour le consentement.
- Tout nouveau champ de frontmatter doit être déclaré à 3 endroits : content.config.ts, le fichier [slug].astro et le layout.
- Styles du contenu markdown : utiliser :global() dans .article-content. Grilles contenant du markdown : minmax(0, 1fr) au lieu de 1fr.
- Avant toute pull request : lancer npx astro build et vérifier qu'il n'y a aucune erreur.
- Chaque modification va jusqu'à la mise en ligne, systématiquement, sans attendre Boris :
  1. travailler sur une branche et ouvrir une pull request (pour garder une trace et pouvoir annuler) ;
  2. lancer npx astro build : s'il échoue, corriger ; si l'échec persiste, ne pas fusionner et prévenir Boris avec l'erreur ;
  3. fusionner soi-même la PR dans main ;
  4. vérifier sur https://www.survivalix.fr que les modifications sont bien en ligne ;
  5. confirmer à Boris avec les liens des pages modifiées.

## Règles éditoriales
- La sécurité passe avant tout : un conseil contredit par une source officielle est corrigé immédiatement, quel que soit l'article.
- Pour un conseil de sécurité, appliquer la consigne officielle la plus prudente ; si les sources officielles divergent, retenir la plus prudente et la citer.
- Les contradictions factuelles sans enjeu de sécurité (dates, chiffres d'actualité, noms d'organismes, réglementation) sont corrigées directement d'après la source officielle la plus récente, puis listées dans le point fait à Boris. Seuls les conseils de sécurité contradictoires restent soumis à la règle de la consigne officielle la plus prudente.
- Un chiffre sans source institutionnelle vérifiable est retiré. Un même chiffre doit être identique sur tout le site.
- Chaque chiffre ou fait doit être vérifié par une recherche web, avec au moins une source institutionnelle (SGDSN, Croix-Rouge, ANSES, ministères, préfectures, Météo-France).
- Ne jamais inventer un chiffre, une anecdote ou un lien de cause à effet. Ne jamais transformer une fourchette ou une recommandation en règle absolue.
- Rédiger avec ses propres mots : ne jamais recopier ou paraphraser de près le texte d'une source.
- Interdit dans tout fichier : les balises de citation brutes (<cite ...>, index="..."). Vérifier avant chaque livraison.
- Structure propre à chaque article. Liens internes vers des pages existantes. Un lien Amazon affilié pertinent par article, au format https://www.amazon.fr/s?k=<recherche>&tag=survivalix31-21.
- Cantine : le seo_title et la description contiennent le mot « recette ».
- Toute nouvelle recette de la Cantine doit renseigner les champs de recette (temps, portions, ingrédients, étapes). Aucune note ni aucun avis inventés. Les extraits enrichis FAQ n'existent plus dans Google depuis mai 2026 : le balisage FAQ est conservé mais n'est plus une priorité.
- Style (anti « écriture IA ») :
  1. Tirets cadratins (—) : 2 maximum par article. Remplacer les autres par une virgule, des parenthèses, deux-points ou un point, selon le sens.
  2. Supprimer les constructions « ce n'est pas X, c'est Y » et « pas de X, pas de Y » quand elles servent d'effet : dire directement la chose.
  3. Éviter les introductions et les conclusions génériques. L'article commence par une situation concrète ou une information utile, et se termine sur une action, pas sur une morale.
  4. Varier la longueur des phrases et la structure des paragraphes d'un article à l'autre. Pas de formules répétées entre articles (même accroche, même transition, même chute).
- Frontmatter : seo_title de 60 caractères maximum, description de 140 à 160 caractères.
- À chaque modification de fond d'un article, mettre à jour le champ updated.
- Liens partagés (réseaux sociaux) : URL simple, jamais de paramètres UTM.

## Statistiques Google (lecture seule)
- RÈGLE DE SÉCURITÉ ABSOLUE : le dépôt est PUBLIC. Aucune clé, aucun identifiant secret et aucune donnée de statistiques (rapports, exports, résultats) n'est jamais enregistré dans le dépôt, ni affiché en clair dans la conversation. Vérifier le .gitignore (git status, git check-ignore) avant tout commit.
- Accès : compte de service Google en lecture seule (Lecteur dans GA4, Restreint dans Search Console). Sa clé est dans la variable d'environnement GOOGLE_SA_KEY_B64 de l'environnement Claude Code « Survivalix » (fichier JSON encodé en base64), avec GA4_PROPERTY_ID (identifiant numérique de la propriété). Jamais de clé dans un fichier du dépôt.
- « Bilan hebdo » : lancer node scripts/stats/rapport.mjs hebdo (7 jours contre 7, 28 jours contre 28, top pages et requêtes, indexation, Analytics), puis livrer le rapport dans la session avec 3 actions prioritaires.
- « Opportunités du mois » : lancer node scripts/stats/rapport.mjs opportunites (requêtes en position 8 à 40, taux de clic faibles, requêtes sans article), puis livrer le rapport dans la session avec 3 actions prioritaires.
- Les rapports sont écrits dans rapports-stats/ (exclu par le .gitignore) : ne jamais les commiter.

## Images
- Style : illustration rétro années 50, trait dense, hachures fines, ombrage travaillé, halos lumineux chauds, grain papier, halftone, contours noirs, palette ambre #F5A623, kaki #6B7C45, noir #0d0d0d, crème #F5E6C8, rouge brique. Objets et décors modernes français.
- Image hero : 1920 × 815 px, bord à bord, sans cadre, sans texte ni logo.
- Les images sont générées en dehors du repo : fournir un prompt, ne jamais inventer de fichier image.

## Après chaque nouvel article
- Rappeler à Boris de demander l'indexation dans Search Console (Inspection de l'URL, puis Demander l'indexation).
