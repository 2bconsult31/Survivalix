// Rapports de statistiques Survivalix (lecture seule) : bilan hebdomadaire et opportunités de mots-clés.
//
//   node scripts/stats/rapport.mjs hebdo
//   node scripts/stats/rapport.mjs opportunites [--min-impressions 5]
//   options : --sans-indexation (bilan hebdo sans l'inspection des URL)
//
// SÉCURITÉ (dépôt public) : ce script ne contient ni clé ni donnée. Les rapports sont écrits dans
// rapports-stats/ (exclu par le .gitignore) et affichés dans la session, jamais commités.
// Configuration lue dans l'environnement : GOOGLE_SA_KEY_B64, GA4_PROPERTY_ID, GSC_SITE (facultatif).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node 22 n'utilise le proxy HTTPS de l'environnement que si NODE_USE_ENV_PROXY=1 au démarrage.
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
  process.exit(r.status ?? 1);
}

const { gsc, ga4, inspecter, SITE_URL } = await import('./google.mjs');

const RACINE = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const args = process.argv.slice(2);
const mode = args[0];
const option = (nom, defaut) => { const i = args.indexOf(nom); return i >= 0 ? Number(args[i + 1]) : defaut; };
const MIN_IMPRESSIONS = option('--min-impressions', 5);

// ---------- Dates ----------
const jour = (decalage) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - decalage); return d.toISOString().slice(0, 10); };
// Search Console publie ses données avec environ 2 à 3 jours de retard : on s'arrête 3 jours avant aujourd'hui.
// Analytics : jusqu'à hier.
const periode = (fin, duree, avant = 0) => ({ startDate: jour(fin + avant + duree - 1), endDate: jour(fin + avant) });
const FIN_GSC = 3, FIN_GA = 1;

// ---------- Mise en forme ----------
const nf = new Intl.NumberFormat('fr-FR');
const n = (x) => nf.format(Math.round(x));
const pct = (x) => `${(x * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
const pos = (x) => (x ? x.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '–');
const varRel = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)} %` : (a ? 'nouveau' : '='));
const varPos = (a, b) => (a && b ? `${a <= b ? '▲' : '▼'} ${Math.abs(a - b).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}` : '–');
const chemin = (url) => { try { return decodeURI(new URL(url).pathname) || '/'; } catch { return url; } };
const cellule = (t) => String(t).replace(/\|/g, '\\|');
const tableau = (entetes, lignes) => lignes.length
  ? [`| ${entetes.join(' | ')} |`, `|${entetes.map(() => '---').join('|')}|`, ...lignes.map((l) => `| ${l.map(cellule).join(' | ')} |`)].join('\n')
  : '_Aucune donnée sur la période._';

// ---------- Articles du site (pour relier requêtes et contenus) ----------
const MOTS_VIDES = new Set('a au aux avec ce ces comment dans de des du en est et faire il la le les leur mon ma mes ne ou par pas pour qu que quel quelle quels quelles qui sa se son sont sur ta te ton tes un une vos votre y d l j s c n m t est-ce combien pourquoi quand quoi faut peut on tu je vous nous'.split(' '));
const racine = (m) => m.replace(/(aux|eaux)$/, 'al').replace(/[sx]$/, '');
const motsCles = (texte) => (texte || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/).filter((m) => m.length > 1 && !MOTS_VIDES.has(m)).map(racine);

const articles = [];
for (const rubrique of ['manuel', 'radar', 'cantine', 'atelier']) {
  const dossier = join(RACINE, 'src/content', rubrique);
  for (const fichier of readdirSync(dossier).filter((f) => f.endsWith('.md'))) {
    const texte = readFileSync(join(dossier, fichier), 'utf8');
    const fm = texte.split('\n---\n')[0];
    const champ = (nom) => (fm.match(new RegExp(`^${nom}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1] || '';
    const titres = [...texte.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]).join(' ');
    articles.push({
      url: `/${rubrique}/${fichier.replace(/\.md$/, '')}`,
      titre: champ('title'),
      mots: new Set(motsCles(`${champ('title')} ${champ('seo_title')} ${champ('description')} ${champ('tags')} ${titres}`)),
    });
  }
}
// Les mots rares sur le site (« monoxyde ») pèsent plus que les mots fréquents (« conseil », « urgence »).
const frequence = {};
for (const a of articles) for (const m of a.mots) frequence[m] = (frequence[m] || 0) + 1;
const poids = (m) => Math.log(1 + articles.length / (frequence[m] || 1));
const recouvrement = (requete, article) => {
  const m = [...new Set(motsCles(requete))];
  const total = m.reduce((s, x) => s + poids(x), 0);
  return total ? m.filter((x) => article.mots.has(x)).reduce((s, x) => s + poids(x), 0) / total : 0;
};
const meilleurArticle = (requete) => articles.reduce((best, a) => {
  const s = recouvrement(requete, a);
  return s > best.score ? { article: a, score: s } : best;
}, { article: null, score: 0 });
const estQuestion = (q) => /^(comment|pourquoi|quel|quelle|quels|quelles|combien|quand|que|qu|est[- ]ce|peut[- ]on|faut[- ]il|ou)\b|\?$/.test(q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));

// ---------- Search Console ----------
async function totauxGSC(p) {
  const r = await gsc({ ...p, dataState: 'final' });
  return r.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}
async function lignesGSC(p, dimensions, rowLimit = 25000) {
  const r = await gsc({ ...p, dimensions, rowLimit, dataState: 'final' });
  return (r.rows || []).map((l) => ({ ...l, cles: l.keys }));
}

// ---------- Analytics ----------
const CANAUX = {
  'Organic Search': 'Moteurs de recherche', 'Paid Search': 'Moteurs de recherche (payant)',
  'Organic Social': 'Réseaux sociaux', 'Paid Social': 'Réseaux sociaux (payant)',
  Direct: 'Accès direct', Referral: 'Autres sites', 'Organic Video': 'Vidéo', Email: 'E-mail', Unassigned: 'Non attribué',
};
async function totauxGA(cur, prev) {
  const r = await ga4({ dateRanges: [cur, prev], metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }] });
  const val = (i) => { const l = (r.rows || []).find((x) => x.dimensionValues?.[0]?.value === `date_range_${i}`) || (r.rows || [])[i]; return (l?.metricValues || []).map((m) => Number(m.value)); };
  return [val(0), val(1)].map((v) => ({ visiteurs: v[0] || 0, sessions: v[1] || 0, vues: v[2] || 0 }));
}
async function sourcesGA(cur, prev) {
  const r = await ga4({ dateRanges: [cur, prev], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }] });
  const t = {};
  for (const l of r.rows || []) {
    const canal = CANAUX[l.dimensionValues[0].value] || 'Autres';
    const plage = l.dimensionValues[1]?.value === 'date_range_1' ? 1 : 0;
    t[canal] ??= [0, 0];
    t[canal][plage] += Number(l.metricValues[0].value);
  }
  return Object.entries(t).sort((a, b) => b[1][0] - a[1][0]);
}
async function sourceGoogle(cur) {
  const r = await ga4({ dateRanges: [cur], dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'sessions' }],
    dimensionFilter: { filter: { fieldName: 'sessionSource', stringFilter: { value: 'google', matchType: 'EXACT' } } } });
  return Number(r.rows?.[0]?.metricValues?.[0]?.value || 0);
}
async function pagesGA(cur) {
  const r = await ga4({ dateRanges: [cur], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 10 });
  return (r.rows || []).map((l) => [l.dimensionValues[0].value, Number(l.metricValues[0].value), Number(l.metricValues[1].value)]);
}

// ---------- Indexation (URL Inspection API, URL par URL) ----------
async function urlsDuSitemap() {
  const index = await (await fetch(`${SITE_URL}/sitemap-index.xml`)).text();
  const urls = [];
  for (const s of [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])) {
    const xml = await (await fetch(s)).text();
    urls.push(...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
  }
  return urls;
}
async function indexation() {
  const urls = await urlsDuSitemap();
  const resultats = [];
  for (const url of urls) {
    try {
      const r = await inspecter(url);
      const s = r.inspectionResult?.indexStatusResult || {};
      resultats.push({ url, indexee: s.verdict === 'PASS', etat: s.coverageState || s.verdict || 'inconnu', dernierPassage: s.lastCrawlTime?.slice(0, 10) || '–' });
    } catch (e) {
      resultats.push({ url, indexee: false, etat: `erreur : ${e.message}`, dernierPassage: '–' });
    }
  }
  return resultats;
}

// ---------- Bilan hebdomadaire ----------
async function bilanHebdo() {
  const sortie = [];
  const p7 = periode(FIN_GSC, 7), p7b = periode(FIN_GSC, 7, 7), p28 = periode(FIN_GSC, 28), p28b = periode(FIN_GSC, 28, 28);
  sortie.push(`# Bilan hebdomadaire Survivalix\n\n_Produit le ${jour(0)}. Search Console : du ${p7.startDate} au ${p7.endDate} (données arrêtées 3 jours avant aujourd'hui, délai de publication de Google). Analytics : jusqu'à hier._`);

  // Search Console : totaux
  const [t7, t7b, t28, t28b] = await Promise.all([p7, p7b, p28, p28b].map(totauxGSC));
  const ligneT = (lib, a, b, f, v) => [lib, f(a), f(b), v(a, b)];
  sortie.push('## Google Search Console\n\n### 7 derniers jours comparés aux 7 précédents\n\n' + tableau(['Indicateur', '7 jours', '7 jours avant', 'Évolution'], [
    ligneT('Clics', t7.clicks, t7b.clicks, n, varRel), ligneT('Impressions', t7.impressions, t7b.impressions, n, varRel),
    ligneT('Taux de clic', t7.ctr, t7b.ctr, pct, varRel), ligneT('Position moyenne', t7.position, t7b.position, pos, varPos),
  ]));
  sortie.push('### 28 derniers jours comparés aux 28 précédents\n\n' + tableau(['Indicateur', '28 jours', '28 jours avant', 'Évolution'], [
    ligneT('Clics', t28.clicks, t28b.clicks, n, varRel), ligneT('Impressions', t28.impressions, t28b.impressions, n, varRel),
    ligneT('Taux de clic', t28.ctr, t28b.ctr, pct, varRel), ligneT('Position moyenne', t28.position, t28b.position, pos, varPos),
  ]));

  // Top pages et requêtes (7 jours), avec la période précédente pour repérer les baisses
  const [pages7, pages7b, req7] = await Promise.all([lignesGSC(p7, ['page'], 1000), lignesGSC(p7b, ['page'], 1000), lignesGSC(p7, ['query'], 1000)]);
  const tri = (a, b) => b.clicks - a.clicks || b.impressions - a.impressions;
  const avant = Object.fromEntries(pages7b.map((l) => [l.cles[0], l]));
  sortie.push('### Les 10 premières pages (7 jours)\n\n' + tableau(['Page', 'Clics', 'Clics 7 j avant', 'Impressions', 'Taux de clic', 'Position'],
    [...pages7].sort(tri).slice(0, 10).map((l) => [chemin(l.cles[0]), n(l.clicks), n(avant[l.cles[0]]?.clicks || 0), n(l.impressions), pct(l.ctr), pos(l.position)])));
  sortie.push('### Les 10 premières requêtes (7 jours)\n\n' + tableau(['Requête', 'Clics', 'Impressions', 'Taux de clic', 'Position'],
    [...req7].sort(tri).slice(0, 10).map((l) => [l.cles[0], n(l.clicks), n(l.impressions), pct(l.ctr), pos(l.position)])));

  // Indexation
  let nonIndexees = [];
  if (args.includes('--sans-indexation')) {
    sortie.push('### Indexation\n\n_Inspection non lancée (--sans-indexation)._');
  } else {
    const idx = await indexation();
    nonIndexees = idx.filter((r) => !r.indexee);
    sortie.push(`### Indexation (pages du sitemap inspectées une à une)\n\n${tableau(['Pages du sitemap', 'Indexées', 'Non indexées'], [[n(idx.length), n(idx.length - nonIndexees.length), n(nonIndexees.length)]])}\n\n`
      + (nonIndexees.length ? tableau(['Page non indexée', 'État donné par Google', 'Dernier passage de Google'], nonIndexees.map((r) => [chemin(r.url), r.etat, r.dernierPassage])) : '_Toutes les pages du sitemap sont indexées._')
      + '\n\n_L\'API ne donne pas le total du rapport « Pages » de Search Console (pages hors sitemap, doublons, redirections) : ce chiffre-là se relève à la main dans Search Console, menu Indexation, puis Pages._');
  }

  // Analytics
  const g7 = periode(FIN_GA, 7), g7b = periode(FIN_GA, 7, 7), g28 = periode(FIN_GA, 28), g28b = periode(FIN_GA, 28, 28);
  const [[a7, a7b], [a28, a28b], src, google7, top] = await Promise.all([totauxGA(g7, g7b), totauxGA(g28, g28b), sourcesGA(g7, g7b), sourceGoogle(g7), pagesGA(g7)]);
  const lignesGA = (a, b) => [['Visiteurs', a.visiteurs, b.visiteurs], ['Sessions', a.sessions, b.sessions], ['Pages vues', a.vues, b.vues]].map(([l, x, y]) => [l, n(x), n(y), varRel(x, y)]);
  sortie.push(`## Google Analytics 4\n\n_Du ${g7.startDate} au ${g7.endDate}._\n\n### 7 derniers jours comparés aux 7 précédents\n\n` + tableau(['Indicateur', '7 jours', '7 jours avant', 'Évolution'], lignesGA(a7, a7b)));
  sortie.push('### 28 derniers jours comparés aux 28 précédents\n\n' + tableau(['Indicateur', '28 jours', '28 jours avant', 'Évolution'], lignesGA(a28, a28b)));
  sortie.push('### Sources de trafic (sessions, 7 jours)\n\n' + tableau(['Source', '7 jours', '7 jours avant', 'Évolution'], src.map(([c, [x, y]]) => [c, n(x), n(y), varRel(x, y)]))
    + `\n\n_Dont Google (source « google ») : ${n(google7)} sessions._`);
  sortie.push('### Les 10 pages les plus vues (7 jours)\n\n' + tableau(['Page', 'Pages vues', 'Visiteurs'], top.map(([p, v, u]) => [p, n(v), n(u)])));

  // 3 actions prioritaires (calculées à partir des données)
  const actions = [];
  if (nonIndexees.length) actions.push(`Demander l'indexation des ${nonIndexees.length} page(s) non indexée(s) dans Search Console, en commençant par ${chemin(nonIndexees[0].url)}.`);
  const baisses = pages7b.map((l) => ({ page: l.cles[0], avant: l.clicks, apres: pages7.find((x) => x.cles[0] === l.cles[0])?.clicks || 0 }))
    .filter((x) => x.avant - x.apres >= 3).sort((a, b) => (b.avant - b.apres) - (a.avant - a.apres));
  if (baisses.length) actions.push(`Vérifier ${chemin(baisses[0].page)} : ${n(baisses[0].avant)} clics la semaine précédente, ${n(baisses[0].apres)} cette semaine.`);
  const proche = [...req7].filter((l) => l.position > 7 && l.position <= 15).sort((a, b) => b.impressions - a.impressions)[0];
  if (proche) actions.push(`Renforcer la page qui se classe sur « ${proche.cles[0]} » (position ${pos(proche.position)}, ${n(proche.impressions)} impressions) pour la faire entrer dans le top 7.`);
  const faible = [...req7].filter((l) => l.impressions >= 20 && l.position <= 10).sort((a, b) => a.ctr - b.ctr)[0];
  if (faible && actions.length < 3) actions.push(`Retravailler le titre et la description de la page qui sort sur « ${faible.cles[0]} » : ${pct(faible.ctr)} de clics pour une position ${pos(faible.position)}.`);
  while (actions.length < 3) actions.push('Publier un nouvel article Radar sur un sujet d\'actualité de la semaine (priorité éditoriale du site).');
  sortie.push('## 3 actions prioritaires\n\n' + actions.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n'));
  return sortie.join('\n\n');
}

// ---------- Rapport mensuel d'opportunités ----------
async function opportunites() {
  const p = periode(FIN_GSC, 28);
  const [parRequetePage, parRequete] = await Promise.all([lignesGSC(p, ['query', 'page']), lignesGSC(p, ['query'])]);
  const sortie = [`# Opportunités de mots-clés Survivalix\n\n_Produit le ${jour(0)}. Search Console, du ${p.startDate} au ${p.endDate} (28 jours). Seuil : ${MIN_IMPRESSIONS} impressions minimum._`];

  // Page principale de chaque requête (celle qui a le plus d'impressions)
  const pagePrincipale = {};
  for (const l of parRequetePage) {
    const [q, page] = l.cles;
    if (!pagePrincipale[q] || l.impressions > pagePrincipale[q].impressions) pagePrincipale[q] = { page, impressions: l.impressions, position: l.position };
  }

  const recommandation = (q, page) => {
    const art = articles.find((a) => a.url === chemin(page));
    const meilleur = meilleurArticle(q);
    if (art && recouvrement(q, art) >= 0.5) return estQuestion(q) ? 'Ajouter une question fréquente à cet article' : 'Renforcer l\'article existant (section dédiée, mots de la requête dans un intertitre)';
    if (art && estQuestion(q)) return 'Ajouter une question fréquente à cet article';
    if (!art && meilleur.score >= 0.5) return `Renforcer ${meilleur.article.url} et y faire un lien depuis ${chemin(page)}`;
    return 'Créer un nouvel article';
  };

  // 1. Requêtes entre la 8e et la 40e position
  const opp = parRequete
    .filter((l) => l.position >= 8 && l.position <= 40 && l.impressions >= MIN_IMPRESSIONS)
    .map((l) => ({ ...l, q: l.cles[0], potentiel: l.impressions * (l.position - 1) }))
    .sort((a, b) => b.potentiel - a.potentiel);
  sortie.push('## 1. Requêtes entre la 8e et la 40e position\n\n_Potentiel = impressions × places à gagner pour atteindre la 1re position (position − 1)._\n\n'
    + tableau(['Requête', 'Page qui se classe', 'Position', 'Impressions', 'Potentiel', 'Recommandation'],
      opp.slice(0, 30).map((l) => { const pp = pagePrincipale[l.q]?.page || ''; return [l.q, chemin(pp), pos(l.position), n(l.impressions), n(l.potentiel), recommandation(l.q, pp)]; }))
    + (opp.length > 30 ? `\n\n_${opp.length - 30} autre(s) requête(s) au-delà des 30 premières._` : ''));

  // 2. Beaucoup d'impressions, taux de clic faible (comparé à la moyenne du site pour la même tranche de position)
  const tranche = (x) => (x <= 3 ? '1 à 3' : x <= 7 ? '4 à 7' : x <= 10 ? '8 à 10' : '11 à 20');
  const moy = {};
  for (const l of parRequete.filter((x) => x.position <= 20)) { const t = tranche(l.position); moy[t] ??= [0, 0]; moy[t][0] += l.clicks; moy[t][1] += l.impressions; }
  const seuilImpr = Math.max(20, MIN_IMPRESSIONS);
  const faibles = parRequete
    .filter((l) => l.position <= 20 && l.impressions >= seuilImpr)
    .map((l) => { const [c, i] = moy[tranche(l.position)]; return { ...l, q: l.cles[0], moyTranche: i ? c / i : 0 }; })
    .filter((l) => l.ctr < l.moyTranche / 2)
    .sort((a, b) => b.impressions - a.impressions);
  sortie.push(`## 2. Beaucoup d'impressions, peu de clics (titre ou description à retravailler)\n\n_Requêtes du top 20 avec au moins ${seuilImpr} impressions et un taux de clic inférieur à la moitié de la moyenne du site pour la même tranche de position._\n\n`
    + tableau(['Requête', 'Page', 'Position', 'Impressions', 'Taux de clic', 'Moyenne du site (même tranche)'],
      faibles.slice(0, 20).map((l) => [l.q, chemin(pagePrincipale[l.q]?.page || ''), pos(l.position), n(l.impressions), pct(l.ctr), pct(l.moyTranche)])));

  // 3. Requêtes sans article correspondant
  const orphelines = parRequete
    .filter((l) => l.impressions >= MIN_IMPRESSIONS)
    .map((l) => ({ ...l, q: l.cles[0], m: meilleurArticle(l.cles[0]) }))
    .filter((l) => l.m.score < 0.34)
    .sort((a, b) => b.impressions - a.impressions);
  sortie.push('## 3. Requêtes qui ne correspondent à aucun article\n\n_Moins d\'un tiers des mots de la requête (pondérés selon leur rareté sur le site) se retrouvent dans le titre, la description, les mots-clés ou les intertitres de l\'article le plus proche._\n\n'
    + tableau(['Requête', 'Impressions', 'Position', 'Page qui sort aujourd\'hui', 'Article le plus proche'],
      orphelines.slice(0, 25).map((l) => [l.q, n(l.impressions), pos(l.position), chemin(pagePrincipale[l.q]?.page || ''), l.m.article?.url || '–'])));

  // 3 actions prioritaires
  const actions = [];
  if (opp[0]) actions.push(`« ${opp[0].q} » (position ${pos(opp[0].position)}, ${n(opp[0].impressions)} impressions) : ${recommandation(opp[0].q, pagePrincipale[opp[0].q]?.page || '').toLowerCase()}.`);
  if (faibles[0]) actions.push(`Réécrire le seo_title et la description de ${chemin(pagePrincipale[faibles[0].q]?.page || '')} (requête « ${faibles[0].q} », ${pct(faibles[0].ctr)} de clics).`);
  if (orphelines[0]) actions.push(`Étudier un nouvel article sur « ${orphelines[0].q} » (${n(orphelines[0].impressions)} impressions sans article dédié).`);
  for (const l of opp.slice(1)) { if (actions.length >= 3) break; actions.push(`« ${l.q} » (position ${pos(l.position)}) : ${recommandation(l.q, pagePrincipale[l.q]?.page || '').toLowerCase()}.`); }
  if (!actions.length) actions.push('Pas encore assez de données : relancer le rapport le mois prochain.');
  sortie.push('## 3 actions prioritaires\n\n' + actions.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n'));
  return sortie.join('\n\n');
}

// ---------- Lancement ----------
if (!['hebdo', 'opportunites'].includes(mode)) {
  console.error('Usage : node scripts/stats/rapport.mjs hebdo | opportunites [--min-impressions 5] [--sans-indexation]');
  process.exit(2);
}
try {
  const texte = mode === 'hebdo' ? await bilanHebdo() : await opportunites();
  const dossier = join(RACINE, 'rapports-stats');
  mkdirSync(dossier, { recursive: true });
  const fichier = join(dossier, `${mode}-${jour(0)}.md`);
  writeFileSync(fichier, texte + '\n');
  console.log(texte);
  console.error(`\nRapport enregistré (hors dépôt, dossier ignoré par git) : ${fichier}`);
} catch (e) {
  console.error(`Échec : ${e.message}`);
  process.exit(1);
}
