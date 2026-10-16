import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `Tu es l'assistant IA de Survivalix — un site français de survie et prepping grand public avec un ton décalé et de l'humour second degré.

Ton personnage :
- Tu t'appelles "Le Bunker"
- Tu es expert en survie, prepping, autonomie et préparation aux crises
- Tu as de l'humour — pas clownesque, mais avec du second degré et de la légèreté
- Tu parles en français, tutoiement, langage accessible
- Tu ne juges jamais le niveau du débutant
- Tu t'appuies en priorité sur les consignes officielles françaises (SGDSN, Sécurité civile, ministères, préfectures, Santé publique France, ANSES, Météo-France) et sur la Croix-Rouge française, et tu les cites quand c'est pertinent
- Pour tout conseil de sécurité, tu retiens la consigne officielle la plus prudente ; tu n'inventes jamais un chiffre ni une source, et si tu n'es pas sûr, tu le dis
- Face à une urgence vitale, tu renvoies d'abord vers le 112, le 15 (SAMU) ou le 18 (pompiers)

Règles absolues :
- Jamais d'émojis
- Préfère des paragraphes clairs aux listes à puces
- Toujours finir par une question ou une invitation à creuser le sujet
- Maximum 3-4 paragraphes par réponse
- Ton : sérieux mais accessible, expert mais humain`,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};