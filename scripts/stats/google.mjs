// Accès en LECTURE SEULE aux API Google (Analytics Data, Search Console) via un compte de service.
// La clé n'est JAMAIS dans le dépôt : elle est lue dans une variable d'environnement de l'environnement
// Claude Code (GOOGLE_SA_KEY_B64 = fichier JSON de la clé encodé en base64), ou dans un fichier
// situé HORS du dépôt (GOOGLE_SA_KEY_FILE). Aucune valeur secrète n'est jamais affichée.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE_DEPOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PORTEES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
].join(' ');

function chargerCle() {
  let texte;
  if (process.env.GOOGLE_SA_KEY_B64) {
    texte = Buffer.from(process.env.GOOGLE_SA_KEY_B64.trim(), 'base64').toString('utf8');
  } else if (process.env.GOOGLE_SA_KEY_FILE) {
    const chemin = resolve(process.env.GOOGLE_SA_KEY_FILE);
    if (chemin === RACINE_DEPOT || chemin.startsWith(RACINE_DEPOT + sep)) {
      throw new Error('Refus : la clé ne doit jamais se trouver dans le dossier du dépôt.');
    }
    texte = readFileSync(chemin, 'utf8');
  } else {
    throw new Error('Clé absente : la variable GOOGLE_SA_KEY_B64 n\'est pas définie dans cet environnement.');
  }
  let cle;
  try { cle = JSON.parse(texte); } catch { throw new Error('Clé illisible : GOOGLE_SA_KEY_B64 doit contenir le fichier JSON encodé en base64.'); }
  if (!cle.client_email || !cle.private_key) throw new Error('Clé incomplète : client_email ou private_key manquant.');
  return cle;
}

const b64url = (x) => Buffer.from(x).toString('base64url');
let jetonEnCache = null;

async function jeton() {
  if (jetonEnCache && jetonEnCache.expire > Date.now() + 60_000) return jetonEnCache.valeur;
  const cle = chargerCle();
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const charge = b64url(JSON.stringify({
    iss: cle.client_email, scope: PORTEES, aud: 'https://oauth2.googleapis.com/token',
    iat: maintenant, exp: maintenant + 3600,
  }));
  const signature = createSign('RSA-SHA256').update(`${entete}.${charge}`).sign(cle.private_key, 'base64url');
  const rep = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${entete}.${charge}.${signature}` }),
  });
  const json = await rep.json().catch(() => ({}));
  if (!rep.ok) throw new Error(`Authentification Google refusée (${rep.status}) : ${json.error_description || json.error || 'sans détail'}`);
  jetonEnCache = { valeur: json.access_token, expire: Date.now() + json.expires_in * 1000 };
  return jetonEnCache.valeur;
}

export async function appelGoogle(url, corps) {
  const rep = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${await jeton()}`, 'content-type': 'application/json' },
    body: JSON.stringify(corps),
  });
  const json = await rep.json().catch(() => ({}));
  if (!rep.ok) {
    const message = json.error?.message || 'sans détail';
    throw new Error(`Appel Google refusé (${rep.status}) sur ${new URL(url).host} : ${message}`);
  }
  return json;
}

export const SITE_GSC = process.env.GSC_SITE || 'https://www.survivalix.fr/';
export const SITE_URL = 'https://www.survivalix.fr';

export function proprieteGA4() {
  const id = (process.env.GA4_PROPERTY_ID || '').trim();
  if (!/^\d+$/.test(id)) throw new Error('GA4_PROPERTY_ID manquant : l\'identifiant numérique de la propriété Analytics (pas le G-…).');
  return id;
}

// Search Console : requête d'analyse de recherche.
export function gsc(corps) {
  return appelGoogle(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_GSC)}/searchAnalytics/query`, corps);
}

// Search Console : inspection d'une URL (état d'indexation).
export function inspecter(url) {
  return appelGoogle('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: SITE_GSC, languageCode: 'fr-FR' });
}

// Analytics Data API : rapport.
export function ga4(corps) {
  return appelGoogle(`https://analyticsdata.googleapis.com/v1beta/properties/${proprieteGA4()}:runReport`, corps);
}
