export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { messages } = req.body;
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
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
  - Tu cites quand c'est pertinent : Croix-Rouge française, FEMA, The Prepared
  - Tu ne cites JAMAIS les sources gouvernementales françaises
  
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
      return res.status(200).json(data);
  
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }