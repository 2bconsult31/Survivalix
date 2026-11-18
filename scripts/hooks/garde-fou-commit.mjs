// Hook Claude Code (PreToolUse sur Bash) : le dépôt est PUBLIC. Avant tout « git commit » ou « git push »,
// bloque si un fichier de statistiques, un fichier de clé ou une clé privée est sur le point d'être envoyé.
// Code de sortie 2 = commande bloquée, avec la raison ; 0 = la commande continue.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

let entree = {};
try { entree = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const commande = entree.tool_input?.command || '';
if (!/\bgit\b[^\n;&|]*\b(commit|push)\b/.test(commande)) process.exit(0);

const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8' }); } catch { return ''; } };

// Fichiers qui peuvent partir : indexés, modifiés ou nouveaux (hors .gitignore), plus les commits pas encore poussés.
const fichiers = new Set([
  ...git('diff', '--cached', '--name-only').split('\n'),
  ...git('ls-files', '--modified', '--others', '--exclude-standard').split('\n'),
  ...git('diff', '--name-only', '@{upstream}..HEAD').split('\n'),
].map((f) => f.trim()).filter(Boolean));

const SENSIBLE = /(^|\/)rapports-stats\/|\.(pem|p12|key)$|service-account.*\.json$|-sa-key.*\.json$|(^|\/)\.env(\.|$)/i;
// Motifs construits par morceaux pour que ce fichier ne se bloque pas lui-même.
const CLE_PRIVEE = new RegExp('-----BEGIN ' + '(RSA |EC )?PRIVATE KEY-----(\\\\n|\\n)?[A-Za-z0-9+/]{20}');
const JSON_CLE = new RegExp('"private_' + 'key_id"\\s*:');

const problemes = [];
for (const f of fichiers) {
  if (SENSIBLE.test(f)) { problemes.push(`${f} : fichier sensible (statistiques, clé ou secret)`); continue; }
  if (!existsSync(f) || statSync(f).isDirectory() || statSync(f).size > 2_000_000) continue;
  const contenu = readFileSync(f, 'utf8');
  if (CLE_PRIVEE.test(contenu) || JSON_CLE.test(contenu)) problemes.push(`${f} : contient une clé privée`);
}

if (problemes.length) {
  process.stderr.write(`Commande bloquée : le dépôt Survivalix est PUBLIC (règle de sécurité du CLAUDE.md).\n- ${problemes.join('\n- ')}\nRetirer ces fichiers du commit (git restore --staged <fichier>) et vérifier le .gitignore.\n`);
  process.exit(2);
}
