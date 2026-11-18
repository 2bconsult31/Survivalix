// Hook Claude Code (PostToolUse sur Edit / Write) : contrôle les règles mesurables du CLAUDE.md
// sur l'article qui vient d'être modifié dans src/content/<rubrique>/.
// Code de sortie 2 = Claude reçoit la liste des écarts et doit les corriger ; 0 = rien à signaler.
// Sans dépendance : node scripts/hooks/verifier-article.mjs < entrée JSON du hook.
import { readFileSync, existsSync } from 'node:fs';

let entree = {};
try { entree = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const chemin = entree.tool_input?.file_path || '';
const m = chemin.replace(/\\/g, '/').match(/src\/content\/(manuel|radar|cantine|atelier)\/[^/]+\.md$/);
if (!m || !existsSync(chemin)) process.exit(0);
const rubrique = m[1];

const texte = readFileSync(chemin, 'utf8');
const fin = texte.indexOf('\n---', 4);
const frontmatter = fin > 0 ? texte.slice(0, fin) : '';
const champ = (nom) => (frontmatter.match(new RegExp(`^${nom}:\\s*"(.*)"\\s*$`, 'm')) || [])[1];

const ecarts = [];

// Balises de citation brutes (interdites dans tout fichier)
if (/<cite[\s>]/i.test(texte) || /index="/.test(texte)) ecarts.push('balise de citation brute (<cite ...> ou index="...") à retirer');

// Tirets cadratins : 2 au maximum par article
const tirets = (texte.match(/—/g) || []).length;
if (tirets > 2) ecarts.push(`${tirets} tirets cadratins (2 au maximum) : remplacer par une virgule, des parenthèses, deux-points ou un point`);

// Frontmatter
const seo = champ('seo_title');
const desc = champ('description');
if (!seo) ecarts.push('seo_title absent');
else if ([...seo].length > 60) ecarts.push(`seo_title de ${[...seo].length} caractères (60 au maximum)`);
if (!desc) ecarts.push('description absente');
else if ([...desc].length < 140 || [...desc].length > 160) ecarts.push(`description de ${[...desc].length} caractères (140 à 160)`);
if (!/^updated:\s*\S+/m.test(frontmatter)) ecarts.push('champ updated absent');

// Cantine : « recette » dans le seo_title et la description
if (rubrique === 'cantine') {
  if (seo && !/recette/i.test(seo)) ecarts.push('Cantine : le seo_title doit contenir « recette »');
  if (desc && !/recette/i.test(desc)) ecarts.push('Cantine : la description doit contenir « recette »');
}

// Liens Amazon : au moins un, tous au format affilié
const amazon = texte.match(/https?:\/\/(?:www\.)?amazon\.fr[^\s)"'>\]]*/g) || [];
if (amazon.length === 0) ecarts.push('aucun lien Amazon affilié (format https://www.amazon.fr/s?k=<recherche>&tag=survivalix31-21)');
for (const lien of amazon) {
  if (!/^https:\/\/www\.amazon\.fr\/s\?k=[^&\s]+&tag=survivalix31-21$/.test(lien)) ecarts.push(`lien Amazon au mauvais format : ${lien}`);
}

// Liens partagés : jamais de paramètres UTM
if (/[?&]utm_[a-z]+=/i.test(texte)) ecarts.push('paramètre UTM dans un lien (interdit)');

// Pas de grossièretés
const grossier = texte.match(/\b(bullshit|merde\w*|putain|connard\w*|chier|foutre|enfoir\w*|salaud\w*)\b/gi);
if (grossier) ecarts.push(`grossièreté à remplacer : ${[...new Set(grossier.map((g) => g.toLowerCase()))].join(', ')}`);

if (ecarts.length) {
  process.stderr.write(`Règles du CLAUDE.md non respectées dans ${chemin.split(/[\\/]/).slice(-2).join('/')} :\n- ${ecarts.join('\n- ')}\n`);
  process.exit(2);
}
