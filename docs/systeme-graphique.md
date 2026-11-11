# Système graphique Survivalix — « manuel de défense civile »

Document de référence interne (non publié). À lire avant toute création de page ou de composant.
Toutes les classes citées sont définies dans `src/styles/global.css`, sauf mention contraire.

L'idée : le site est un **manuel de défense civile des années 50 posé dans l'abri**. Le cadre est noir (l'abri), les pages à lire sont crème (le papier imprimé). On classe avec des **onglets de classeur**, on insiste avec des **tampons encreurs**, on sépare avec des **filets**. Jamais de bordure colorée sur le côté gauche.

---

## 1. Couleurs

| Rôle | Valeur | Variable | Usage |
|---|---|---|---|
| Noir (cadre) | #0d0d0d | `--noir` | fond du site, texte sur l'ambre |
| Ambre | #F5A623 | `--ambre` | titres et liens sur fond noir, onglets, filets, boutons |
| Ambre foncé | #c4811a | `--ambre-fonce` | survol des boutons ambre |
| Kaki | #6B7C45 | `--kaki` | grands éléments, filet des questions de l'utilisateur (Bunker) |
| Kaki texte | #7A8C50 | `--kaki-texte` | petites étiquettes sur fond noir (5,3:1) |
| Crème (charte) | #F5E6C8 | — | texte courant sur fond noir |
| Papier | #FAF1DE | — | fond des zones de lecture (`.lecture-papier`, `.papier`) |
| Encre | #000000 | `--encre` (dans `.lecture-papier`) | texte et titres sur le papier (19,4:1) |
| Rouge brique | #8B2500 | `--rouge` | **uniquement** le tampon sur fond papier |
| Filet | #4a4a4a | `--filet` | contour fin des fiches et encadrés |
| Gris texte | #8A8A8A | `--gris-texte` | textes secondaires sur fond noir |

Règles :
- **L'ambre n'est jamais une couleur de texte sur le papier** (1,8:1). Sur le crème, il sert de filet, de soulignement ou d'onglet.
- **Le rouge brique n'est pas une couleur de titre ni de lien** : il est réservé au tampon sur fond papier (choix de Boris, lot 3).
- Une couleur « de profil » ou décorative (quiz) peut colorer un cadre ou un filet, jamais un texte, sauf si elle atteint 4,5:1.
- Tout texte : contraste d'au moins 4,5:1 (WCAG 2.2 AA), vérifié avec axe-core.

## 2. Typographie

| Usage | Police | Détails |
|---|---|---|
| Titres (h1, h2) | Special Elite | une seule graisse ; sur le papier, épaissie par `-webkit-text-stroke` (0,035em) |
| Intertitres h3, interface, boutons, étiquettes | Oswald 700 | capitales et espacement (letter-spacing) pour les étiquettes |
| Texte courant sur fond noir | Oswald 300 | crème #F5E6C8 |
| Texte courant sur le papier | Oswald 400, 18 px, interlignage 1,75 | noir #000. 500 essayé et refusé (trop épais) |

Polices chargées : Special Elite et Oswald 300, 400, 700. Ne pas ajouter de graisse sans raison (poids de page).

Longueur de ligne sur le papier : colonne de 42rem (environ 85 à 90 caractères ; élargie à la demande de Boris).

## 3. Composants

### Fiche à onglet — `.fiche`
Remplace les bordures latérales. Filet fin tout autour, filet ambre de 3 px en haut, onglet de classeur ambre qui dépasse en haut à gauche.
- `<div class="fiche">` : onglet vide (simple repère).
- `<div class="fiche" data-onglet="01">` : l'onglet porte un court texte (numéro, rubrique, « Q. 01 », « BUNKER IA »). Ce texte est **décoratif** (généré en CSS) : l'information utile doit aussi être dans la page.
- Utilisée sur : cartes de rubrique et dernières fiches (accueil), outils, lexique, /commencer-ici, panneaux des calculateurs, questions du quiz et de l'évaluateur, résultat du quiz, réponses du Bunker.
- Survol d'une fiche cliquable : fond légèrement éclairci (#141414) et titre souligné. Pas de déplacement.

### Intertitres numérotés des articles
Les h3 des articles portent un onglet « 2.1 » (1er h3 de la 2e partie), compté en CSS. Décoratif.

### Tampon — `.tampon`
Courte mention en capitales, Special Elite, cadre de 2 px, légèrement de travers (−2,5°). Ambre sur fond noir, rouge brique sur fond papier (automatique dans `.papier` et `.lecture-papier`). Deux ou trois mots au plus : « À retenir », « Conseil Survivalix ».

### Encadré « À retenir »
- **Sur le papier (articles)** : toute citation markdown (`>`) devient une fiche de consigne (double filet noir) avec le tampon « À retenir ». Ne l'utiliser que pour une consigne ou un conseil à retenir, pas pour une citation.
- **Sur fond noir** : `.encadre-consigne` (double filet ambre) avec un `<span class="tampon">` en premier enfant, posé sur le bord. Utilisé pour les conseils des calculateurs et le conseil du résultat du quiz.

### Zone de lecture — `.lecture-papier` et `.papier`
- `.lecture-papier` : la colonne de texte des 4 gabarits d'article (fond papier, grain léger, encre noire, h2 soulignés d'un filet ambre de 4 px, liens noirs gras soulignés d'ambre).
- `.papier` : même papier pour un bloc isolé hors article (réponses du Bunker).
- Le cadre reste noir : en-tête, image principale, titre de l'article, colonne latérale, pied de page.

### Étiquettes « // TEXTE // »
Gardées à deux endroits seulement : l'en-tête des pages de rubrique (« // SECTION 0X // ») et le quiz (/survivant et son résultat). Ailleurs : supprimées si elles répètent le titre, sinon petite étiquette en capitales sans barres obliques. Les « // » restent permis comme séparateurs (fil d'Ariane, métadonnées).

### Boutons
- Principal : fond ambre, texte noir, capitales Oswald 700 ; survol ambre foncé.
- Secondaire : contour ambre de 2 px, texte ambre ; survol plein ambre.
- Cible d'au moins 24 × 24 px (WCAG 2.2).

## 4. Illustrations
Style : rétro années 50, trait dense, hachures fines, halftone, grain papier, contours noirs, palette ambre, kaki, noir, crème, rouge brique ; objets et décors français modernes ; jamais de texte ni de logo.
- Hero d'article : 1920 × 815 px, bord à bord.
- Rubriques de l'accueil : 1200 × 900 environ (4:3), `public/images/rubriques/<slug>.jpg`.
- Ne jamais générer ni inventer un fichier : fournir un prompt, Boris génère.
- Exception validée par Boris (lot 7) : les visuels graphiques dessinés en code SVG, qui n'imitent pas les illustrations. Style « planche technique » : trait ambre de 1,6 px sur fond noir quadrillé, cotes fléchées, traits d'axe, cartouche en bas à gauche ; détails en crème. Exemple : src/components/PlancheOutil.astro (cartes de /outils).
- Affichage : toujours via `src/components/ImageOpt.astro` (versions WebP générées au build, original en secours), avec un attribut `sizes` adapté à la largeur réelle de l'image. `loading="eager"` et `fetchpriority="high"` seulement pour l'image du haut de page.

## 5. Pièges techniques
- En-tête, menu et pied de page : uniquement dans `src/components/SiteHeader.astro` et `src/components/SiteFooter.astro` (partagés par tous les gabarits).
- **Contenu créé en JavaScript** (Bunker, résultat du quiz, générateur kit 72h, évaluateur) : les styles `<style>` d'Astro sont limités à la page et ne s'appliquent pas aux éléments créés par `innerHTML` ou `createElement`. Utiliser `:global()` sous un conteneur de la page (ex. `.bunker-chat :global(.message)`) ou une classe de global.css.
- **Markdown** : styles dans global.css ou via `:global()` dans `.article-content` (règle du projet).
- `body { overflow-x: clip }` : un bloc bord à bord (100vw) ne crée jamais de défilement horizontal.
- Animations : toujours une variante `prefers-reduced-motion`.
- Avant chaque livraison : `npx astro build` et axe-core (WCAG 2.2 AA) sur les pages touchées, ordinateur et mobile.
