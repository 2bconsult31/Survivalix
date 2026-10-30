// Extrait la section « Questions fréquentes » d'un article markdown, pour le balisage
// FAQPage (JSON-LD) d'ArticleSEO. Format attendu dans l'article :
//   ## Questions fréquentes
//   ### La question ?
//   La réponse, en un ou plusieurs paragraphes.
// La section s'arrête au titre ## suivant ou à la ligne « *Sources ».

export interface FaqEntry {
  question: string;
  answer: string;
}

function toPlainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // liens : on garde le texte
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractFaq(body: string | undefined): FaqEntry[] {
  if (!body) return [];
  const start = body.search(/^## Questions fréquentes\s*$/m);
  if (start === -1) return [];
  const rest = body.slice(start).split('\n').slice(1);
  const entries: FaqEntry[] = [];
  let current: { question: string; lines: string[] } | null = null;
  for (const line of rest) {
    if (/^## /.test(line) || /^\*Sources/.test(line)) break;
    const q = line.match(/^### (.+)$/);
    if (q) {
      if (current) entries.push({ question: toPlainText(current.question), answer: toPlainText(current.lines.join(' ')) });
      current = { question: q[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) entries.push({ question: toPlainText(current.question), answer: toPlainText(current.lines.join(' ')) });
  return entries.filter((e) => e.question && e.answer);
}
