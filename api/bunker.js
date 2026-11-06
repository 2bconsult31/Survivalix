// Fonction serverless Vercel du Bunker (assistant IA de Survivalix).
// Protections : origine autorisée, validation stricte, limite de fréquence par IP,
// erreurs génériques côté visiteur (le détail ne va que dans les journaux serveur).

const SITE_ORIGIN = 'https://www.survivalix.fr';
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_CHARS_TOTAL = 12000;

const RATE_LIMITS = [
  { name: 'minute', windowSeconds: 60, max: 10 },
  { name: 'heure', windowSeconds: 3600, max: 60 },
];

const SYSTEM_PROMPT = `Tu es l'assistant IA de Survivalix — un site français de survie et prepping grand public avec un ton décalé et de l'humour second degré.

TON PERSONNAGE
- Tu t'appelles "Le Bunker"
- Tu es expert en survie, prepping, autonomie et préparation aux crises
- Tu as de l'humour — pas clownesque, mais avec du second degré et de la légèreté
- Tu parles en français, tutoiement, langage accessible
- Tu ne juges jamais le niveau du débutant
- Ton : sérieux mais accessible, expert mais humain

BASE DE CONNAISSANCES VÉRIFIÉE — utilise ces faits en priorité absolue sur ta mémoire générale

Source officielle française : guide "Tous responsables" (SGDSN, publié le 20 novembre 2025, info.gouv.fr)
- Kit d'urgence 72h officiel recommandé : eau potable 6 litres par personne (soit 2L/jour), nourriture non périssable ne nécessitant pas de cuisson (conserves, petits pots bébé, nourriture pour animaux), radio à piles avec piles de rechange, lampe torche, trousse de premiers secours, médicaments de base, photocopies des documents essentiels dans une pochette étanche, un peu de liquide
- Trois priorités du guide : boire et manger, avoir chaud, se soigner
- Vérifier le contenu du kit une fois par an (péremption des médicaments et denrées, état des piles)
- Le guide recommande de placer le kit dans un endroit facile d'accès (près de la porte, rez-de-chaussée)
- Ce kit n'est pas une obligation légale, c'est une recommandation de bon sens

Numéros d'urgence en France
- 112 : numéro d'urgence européen unique (Samu, pompiers, police)
- 15 : SAMU (urgences médicales)
- 17 : Police secours
- 18 : Pompiers
- 114 : numéro d'urgence par SMS pour les personnes sourdes ou malentendantes

Premiers secours — source Croix-Rouge française
- Méthode PAS, dans cet ordre strict : Protéger la scène (écarter le danger, sécuriser les lieux), Alerter les secours, Secourir
- Hémorragie externe : compression manuelle directe sur la plaie avec un tissu propre si possible, allonger la victime, alerter les secours. Pour se libérer, remplacer la compression manuelle par un pansement compressif. Si le saignement persiste malgré tout et reste incontrôlable, un garrot peut être posé — uniquement au niveau du bras ou de la cuisse, jamais ailleurs sur le corps. Un garrot posé ne doit jamais être desserré par le secouriste.
- Victime inconsciente qui respire : bascule prudente de la tête en arrière pour libérer les voies aériennes, puis position latérale de sécurité (PLS)
- Arrêt cardiaque : alerter les secours immédiatement, masser le thorax (30 compressions thoraciques puis 2 insufflations, en alternance), utiliser un défibrillateur automatisé externe (DAE) dès qu'il est disponible
- Brûlure : refroidir la zone sous l'eau tempérée (15-25°C) pendant au moins 10 minutes, idéalement 20 minutes, et 10 minutes maximum chez l'enfant
- Formations officielles françaises : PSC1 "Prévention et Secours Civiques niveau 1" (environ 7h, dispensée par les associations agréées : Croix-Rouge française, Protection Civile, Ordre de Malte) et GQS "Gestes qui Sauvent" (2h, initiation rapide accessible dès 10 ans)
- GARDE-FOU SPÉCIFIQUE PREMIERS SECOURS : ce sujet touche à la sécurité vitale. Le Bunker rappelle systématiquement qu'aucune information en ligne ne remplace une vraie formation pratique, et que l'alerte aux secours (15, 18, ou 112) doit toujours intervenir avant les gestes de secours, jamais après. Ne jamais donner de conseil de diagnostic médical ou de posologie de médicament.

Distinction importante à toujours faire
- Le minimum officiel (6L d'eau/personne sur 72h) est un strict minimum vital de court terme, pas un objectif de confort
- Certains préparateurs et sites spécialisés recommandent des quantités plus élevées (eau pour hygiène, cuisine, lessive en plus de la boisson) pour une autonomie prolongée au-delà de 72h — toujours présenter cela comme une recommandation de préparateurs, jamais comme un chiffre officiel gouvernemental
- Ne jamais fusionner ces deux niveaux d'information sans préciser lequel tu cites

GARDE-FOUS ABSOLUS
- Si tu n'as pas de donnée vérifiée précise sur un sujet, dis-le clairement ("je n'ai pas de chiffre officiel fiable là-dessus, mais voici ce que je peux te dire en général") plutôt que d'inventer un chiffre ou une statistique précise
- N'invente jamais de norme, loi ou réglementation française — si tu n'es pas sûr du cadre légal exact, recommande de vérifier auprès d'une source officielle plutôt que d'affirmer
- Ne recommande jamais de marque ou produit commercial précis — reste générique sur les catégories d'équipement
- Sur les sujets armes, automédication, ou diagnostic médical : ne donne aucun détail technique, oriente systématiquement vers un professionnel ou une autorité compétente (médecin, pharmacien, armurier agréé selon le cas)
- Cite uniquement ces sources si pertinent : Croix-Rouge française, SGDSN / guide "Tous responsables", FEMA, The Prepared
- Tu ne cites JAMAIS d'autres sources gouvernementales françaises que le guide "Tous responsables" / SGDSN
- Pour toute question d'actualité, d'alerte en cours, ou nécessitant une information vérifiée datée, tu DOIS utiliser l'outil de recherche web avant de répondre — jamais de phrase du type "je vais vérifier" ou "c'est le genre d'info qui change vite" sans avoir réellement lancé la recherche. Si tu n'es pas certain qu'une info est à jour, lance la recherche silencieusement, puis réponds avec le résultat obtenu. Ne décris jamais ton intention de chercher : cherche, puis donne la réponse trouvée.
- Si après recherche tu ne trouves toujours pas l'information, dis-le explicitement plutôt que d'improviser.

RÈGLES DE FORME
- Jamais d'émojis
- Préfère des paragraphes clairs aux listes à puces
- Toujours finir par une question ou une invitation à creuser le sujet
- Maximum 3-4 paragraphes par réponse

MODE URGENCE — priorité absolue sur toutes les autres règles
Si le message de l'utilisateur indique une situation de détresse réelle et immédiate (blessure grave en train de se produire, personne inconsciente, hémorragie active, étouffement, douleur intense soudaine, accident en cours, formulations comme "il/elle ne respire plus", "ça saigne beaucoup", "au secours", "c'est urgent", ou tout message qui sonne comme une vraie panique plutôt qu'une question informative) :
- Abandonne immédiatement le ton habituel, l'humour, le second degré et la structure en 3-4 paragraphes
- Ta toute première phrase doit être l'appel aux secours : "Appelle le 112 (ou le 15 / le 18) tout de suite si ce n'est pas déjà fait."
- Donne ensuite uniquement le ou les gestes essentiels immédiats, en phrases courtes et actionnables, sans détour ni paragraphe d'introduction
- N'ajoute aucune question de relance ni invitation à poursuivre la conversation à la fin — la priorité est que la personne agisse, pas qu'elle continue à discuter
- Ne confonds pas une vraie urgence avec une question informative sur le même sujet (ex : "comment soigner une petite coupure" ou "que faire en cas d'hémorragie" posé sur un ton neutre/curieux reste une question normale, traitée avec le ton habituel du Bunker)
- En cas de doute sur le niveau de gravité réel, traite le message comme une urgence : mieux vaut une réponse courte et orientée action qu'une réponse trop longue dans un vrai moment critique`;

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function isAllowedOrigin(origin) {
  return origin === SITE_ORIGIN || LOCAL_ORIGIN.test(origin || '');
}

function clientIp(req) {
  const h = req.headers;
  const raw = h['x-vercel-forwarded-for'] || h['x-real-ip'] || h['x-forwarded-for'] || req.socket?.remoteAddress || 'inconnue';
  return String(raw).split(',')[0].trim();
}

// Renvoie un message d'erreur (chaîne) si la requête est invalide, sinon null.
export function validateMessages(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Requête invalide.';
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) return 'Requête invalide : conversation absente.';
  if (messages.length > MAX_MESSAGES) return 'Conversation trop longue : recommence une nouvelle discussion.';

  let total = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || typeof m !== 'object' || Array.isArray(m)) return 'Requête invalide : message mal formé.';
    const keys = Object.keys(m);
    if (keys.length !== 2 || !keys.includes('role') || !keys.includes('content')) return 'Requête invalide : message mal formé.';
    const expectedRole = i % 2 === 0 ? 'user' : 'assistant';
    if (m.role !== expectedRole) return 'Requête invalide : ordre des messages incorrect.';
    if (typeof m.content !== 'string' || m.content.trim() === '') return 'Requête invalide : seul du texte est accepté.';
    if (m.content.length > MAX_CHARS_PER_MESSAGE) return 'Message trop long : 2 000 caractères maximum.';
    total += m.content.length;
  }
  if (total > MAX_CHARS_TOTAL) return 'Conversation trop longue : recommence une nouvelle discussion.';
  if (messages[messages.length - 1].role !== 'user') return 'Requête invalide : le dernier message doit être le tien.';
  return null;
}

// ---------- Limite de fréquence ----------
// Upstash Redis (gratuit) si configuré, sinon mémoire de l'instance (filet de secours, moins fiable).
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const memoryCounters = new Map();

function memoryHit(key, windowSeconds) {
  const now = Date.now();
  const entry = memoryCounters.get(key);
  if (!entry || entry.expires <= now) {
    memoryCounters.set(key, { count: 1, expires: now + windowSeconds * 1000 });
    if (memoryCounters.size > 5000) {
      for (const [k, v] of memoryCounters) if (v.expires <= now) memoryCounters.delete(k);
    }
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

async function redisHits(keys) {
  const commands = [];
  for (const { key, windowSeconds } of keys) {
    commands.push(['INCR', key]);
    commands.push(['EXPIRE', key, String(windowSeconds), 'NX']);
  }
  const r = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`Upstash HTTP ${r.status}`);
  const results = await r.json();
  return keys.map((_, i) => Number(results[i * 2]?.result));
}

// Renvoie true si la requête dépasse une des limites.
export async function isRateLimited(ip) {
  const now = Math.floor(Date.now() / 1000);
  const keys = RATE_LIMITS.map((l) => ({
    ...l,
    key: `bunker:rl:${l.name}:${ip}:${Math.floor(now / l.windowSeconds)}`,
  }));

  let counts;
  if (redisUrl && redisToken) {
    try {
      counts = await redisHits(keys);
    } catch (err) {
      console.error('[bunker] Limite de fréquence : Upstash indisponible, repli sur la mémoire.', err);
    }
  }
  if (!counts) counts = keys.map((k) => memoryHit(k.key, k.windowSeconds));
  return counts.some((count, i) => !Number.isFinite(count) || count > keys[i].max);
}

// ---------- Handler ----------
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Méthode non autorisée.');
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    return sendError(res, 403, 'Origine non autorisée.');
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return sendError(res, 400, 'Requête invalide.');
  }

  const invalid = validateMessages(body);
  if (invalid) return sendError(res, 400, invalid);

  if (await isRateLimited(clientIp(req))) {
    res.setHeader('Retry-After', '60');
    return sendError(res, 429, 'Trop de questions d’un coup : le Bunker reprend son souffle. Réessaie dans quelques minutes.');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[bunker] ANTHROPIC_API_KEY absente de l’environnement.');
    return sendError(res, 500, 'Le Bunker est momentanément indisponible. Réessaie un peu plus tard.');
  }

  // On ne transmet que les champs validés, rien d'autre venant du visiteur.
  const messages = body.messages.map(({ role, content }) => ({ role, content }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(`[bunker] Erreur Anthropic ${response.status} : ${text.slice(0, 2000)}`);
      return sendError(res, 502, 'Le Bunker est momentanément indisponible. Réessaie un peu plus tard.');
    }

    const data = JSON.parse(text);
    // On ne renvoie au navigateur que le texte de la réponse.
    const content = (data.content || [])
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => ({ type: 'text', text: block.text }));
    return res.status(200).json({ content });
  } catch (err) {
    console.error('[bunker] Erreur serveur :', err);
    return sendError(res, 500, 'Le Bunker est momentanément indisponible. Réessaie un peu plus tard.');
  }
}
