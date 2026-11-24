// Tâche planifiée Vercel (vercel.json, « crons ») : une fois par jour, une seule commande envoyée à la base
// Upstash du Bunker, pour qu'elle ne soit pas archivée faute de trafic (offre gratuite). N'appelle jamais l'IA
// et ne renvoie aucune donnée. Réservée à la planification de Vercel : jeton CRON_SECRET s'il est défini,
// sinon l'agent utilisateur « vercel-cron ».
import { findRedisConfig } from './bunker.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.CRON_SECRET;
  const autorise = secret
    ? req.headers.authorization === `Bearer ${secret}`
    : /vercel-cron/i.test(req.headers['user-agent'] || '');
  if (!autorise) return res.status(403).json({ ok: false });

  const config = findRedisConfig(process.env);
  if (!config) {
    console.error('[reveil-upstash] Base Upstash non configurée.');
    return res.status(503).json({ ok: false });
  }
  try {
    // Une seule écriture, qui s'efface d'elle-même au bout de 2 jours.
    const r = await fetch(`${config.url.replace(/\/+$/, '')}/set/bunker:reveil/${Date.now()}/EX/172800`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!r.ok) throw new Error(`Upstash HTTP ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[reveil-upstash] Échec du réveil de la base :', err);
    return res.status(503).json({ ok: false });
  }
}
