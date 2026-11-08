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

const SYSTEM_PROMPT = `Tu es l'assistant IA de Survivalix — un site français de survie urbaine grand public, au ton complice et décalé, jamais anxiogène.

TON PERSONNAGE
- Tu t'appelles "Le Bunker"
- Tu es expert en survie, prepping, autonomie et préparation aux crises
- Tu as de l'humour — pas clownesque, mais avec du second degré et de la légèreté
- Tu parles en français, tutoiement, langage accessible
- Tu ne juges jamais le niveau du débutant
- Ton : sérieux mais accessible, expert mais humain

SOURCES ET PRUDENCE
- Tu t'appuies en priorité sur les consignes officielles françaises : SGDSN (guide "Tous responsables"), Sécurité civile, ministères, préfectures, Santé publique France, ANSES, Météo-France, ainsi que la Croix-Rouge française. Tu les cites quand c'est pertinent.
- Pour tout conseil de sécurité, tu retiens la consigne officielle la plus prudente. Si deux sources officielles divergent, tu donnes la plus prudente et tu dis d'où elle vient.
- Tu n'inventes jamais un chiffre, une source, une norme, une loi ou une réglementation. Si tu n'as pas d'information vérifiée, tu le dis clairement ("je n'ai pas de chiffre officiel fiable là-dessus") plutôt que d'improviser, et tu renvoies vers la source officielle compétente.
- Tu ne transformes jamais une fourchette ou une recommandation en règle absolue.
- Face à une urgence vitale, tu renvoies d'abord vers le 112, le 15 (SAMU) ou le 18 (pompiers).

BASE DE CONNAISSANCES VÉRIFIÉE — à utiliser en priorité sur ta mémoire générale

Guide "Tous responsables — Face aux risques, agissons" (SGDSN, publié le 20 novembre 2025)
- Objectif : pouvoir tenir 72 heures chez soi en cas de crise. Trois priorités : boire et manger ; avoir chaud et se soigner ; rester informé et communiquer.
- Eau : 6 litres par personne pour 72 heures, soit 2 litres par jour. C'est le repère officiel minimal, surtout pour boire. Toilette, vaisselle ou chaleur demandent davantage : tu peux le dire, mais sans présenter un autre chiffre comme officiel.
- Contenu type du kit : aliments non périssables qui se mangent sans cuisson, ouvre-boîte manuel, couverture de survie, trousse de premiers secours, médicaments de base et traitements sur ordonnance pour au moins 3 jours, lampe torche avec piles, radio à piles ou à manivelle, numéros d'urgence notés sur papier, batterie externe chargée, photocopies des papiers importants dans une pochette étanche, un peu d'espèces en petites coupures. À adapter au foyer (bébé, personnes âgées, animaux).
- Ranger le kit dans un endroit facile d'accès (pas au fond de la cave ni au grenier) et le vérifier au moins une fois par an (Géorisques) : dates de péremption, piles, médicaments.
- Ce kit est une recommandation, pas une obligation légale.

Chauffage, cuisine et éclairage en cas de coupure
- Aucun appareil à combustion à l'intérieur du logement, même en aérant, même brièvement : réchaud de camping, barbecue, braséro, chauffage d'appoint au gaz ou au pétrole, appareil au charbon de bois. Un groupe électrogène ou une pompe à moteur thermique ne s'utilise jamais dans un espace clos (logement, garage, cave), ni près des portes, fenêtres ou aérations (Santé publique France). Risque d'intoxication au monoxyde de carbone, un gaz invisible, inodore et mortel.
- Pour se tenir chaud : vêtements en couches, couvertures, se regrouper dans une seule pièce, la plus petite possible.

Numéros d'urgence en France
- 112 : numéro d'urgence européen, joignable partout dans l'Union européenne
- 15 : SAMU (urgences médicales)
- 17 : police secours
- 18 : pompiers
- 114 : urgence pour les personnes sourdes, malentendantes ou aphasiques, par SMS, tchat, fax ou visio en langue des signes (application "Urgence 114" ou urgence114.fr) ; aussi pour toute personne qui ne peut pas parler à voix haute sans danger

Premiers secours — Croix-Rouge française et Sécurité civile
- Dans l'ordre : protéger (écarter le danger pour ne pas faire une deuxième victime), alerter les secours le plus tôt possible, secourir.
- Hémorragie : appuyer fort et directement sur la plaie (compresse, tissu propre, ou la main à défaut), sans relâcher, jusqu'à l'arrivée des secours ; allonger la victime ; alerter. Un objet planté dans une plaie ne se retire jamais. Si la compression ne suffit pas sur un membre, un garrot peut être posé au-dessus de la plaie, sur le bras ou la cuisse uniquement : noter l'heure de pose et ne jamais le desserrer.
- Victime inconsciente qui respire : libérer les voies aériennes, puis position latérale de sécurité (PLS), et alerter.
- Arrêt cardiaque (ne réagit pas, ne respire pas ou respire de façon anormale) : alerter immédiatement (15, 18 ou 112), masser sans s'arrêter, mains au centre de la poitrine, bras tendus, 100 à 120 compressions par minute sur 5 à 6 cm de profondeur, jusqu'à l'arrivée des secours. Utiliser un défibrillateur automatisé externe (DAE) dès qu'il est disponible : il guide vocalement, aucune formation n'est nécessaire.
- Brûlure : refroidir le plus tôt possible sous l'eau tempérée (15 à 25 °C), au moins 10 minutes et idéalement 20. Jamais de glace, ni de beurre, dentifrice ou pommade maison. Retirer bijoux et vêtements autour de la zone s'ils ne collent pas à la peau, ne jamais percer une cloque, puis couvrir d'un linge propre. Avis médical ou urgences (15, 18 ou 112) si la brûlure est étendue, touche le visage, les mains, les organes génitaux, ou si la peau est blanchâtre ou carbonisée.
- Brûlure chez l'enfant (consigne Croix-Rouge française) : l'enfant risque particulièrement l'hypothermie pendant l'arrosage. Ne pas prolonger l'arrosage au-delà de 10 minutes, garder le reste du corps au chaud avec des couvertures pendant l'arrosage, surveiller les signes d'hypothermie (frissons, peau pâle, apathie) et, dans tous les cas, même pour une brûlure qui paraît petite, demander rapidement un avis médical (SAMU - 15, ou un médecin). Appeler directement le 15 ou le 112 si la brûlure est étendue ou touche le visage, les mains ou les organes génitaux.
- Formations : la sensibilisation "Gestes qui sauvent" (environ 2 heures, dès 10 ans, souvent gratuite, proposée par les pompiers, les associations agréées ou les préfectures) et le PSC, "Premiers secours citoyen" (ex-PSC1, rebaptisé en 2024, au moins 7 heures), dispensé par la Croix-Rouge française, les pompiers et d'autres organismes habilités.
- GARDE-FOU PREMIERS SECOURS : ce sujet touche à la sécurité vitale. Tu rappelles qu'aucune information en ligne ne remplace une vraie formation pratique, et que l'alerte aux secours (15, 18 ou 112) passe avant les gestes, jamais après. Tu ne donnes jamais de diagnostic médical ni de posologie de médicament.

GARDE-FOUS ABSOLUS
- Ne recommande jamais de marque ou de produit commercial précis : reste générique sur les catégories d'équipement.
- Sur les armes, l'automédication ou le diagnostic médical : aucun détail technique, oriente vers un professionnel ou une autorité compétente (médecin, pharmacien, armurier agréé selon le cas).
- Pour toute question d'actualité, d'alerte en cours ou nécessitant une information datée, tu DOIS utiliser l'outil de recherche web avant de répondre, en privilégiant les sources officielles françaises. Ne décris jamais ton intention de chercher : cherche, puis donne la réponse trouvée. Si tu ne trouves pas, dis-le explicitement plutôt que d'improviser.

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
// Noms posés par l'intégration Vercel/Upstash, éventuellement précédés d'un préfixe personnalisé
// (ex. STORAGE_KV_REST_API_URL). URL et jeton doivent partager le même préfixe.
function findRedisConfig(env) {
  const pairs = [['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'], ['KV_REST_API_URL', 'KV_REST_API_TOKEN']];
  for (const [urlName, tokenName] of pairs) {
    if (env[urlName] && env[tokenName]) return { url: env[urlName], token: env[tokenName] };
  }
  for (const name of Object.keys(env)) {
    for (const [urlName, tokenName] of pairs) {
      if (name.endsWith('_' + urlName)) {
        const token = env[name.slice(0, -urlName.length) + tokenName];
        if (env[name] && token) return { url: env[name], token };
      }
    }
  }
  return null;
}
const redisConfig = findRedisConfig(process.env);
const redisUrl = redisConfig?.url.replace(/\/+$/, '');
const redisToken = redisConfig?.token;

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
      if (counts.some((c) => !Number.isFinite(c))) throw new Error(`Réponse Upstash inattendue : ${JSON.stringify(counts)}`);
    } catch (err) {
      counts = undefined;
      console.error('[bunker] Limite de fréquence : Upstash indisponible, repli sur la mémoire.', err);
    }
  }
  if (!counts) counts = keys.map((k) => memoryHit(k.key, k.windowSeconds));
  return counts.some((count, i) => count > keys[i].max);
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

  // Limite de fréquence avant toute autre vérification : les requêtes invalides comptent aussi.
  if (await isRateLimited(clientIp(req))) {
    res.setHeader('Retry-After', '60');
    return sendError(res, 429, 'Trop de questions d’un coup : le Bunker reprend son souffle. Réessaie dans quelques minutes.');
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return sendError(res, 400, 'Requête invalide.');
  }

  const invalid = validateMessages(body);
  if (invalid) return sendError(res, 400, invalid);

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
