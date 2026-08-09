// Routes a quest to the Aether project whose dedicated Claude Code session
// actually handles that kind of work — messaging lives in beeper.chat, email
// lives in sprite.email, everything else stays in this session. Same
// auto-tag shape as detectParty in parse.ts: a small pattern table, first
// match wins.

export type AetherSession = {
  key: string;
  label: string; // badge text
  folder: string; // folder name under C:\Users\adamp\Aether
};

export const AETHER_SESSIONS: Record<string, AetherSession> = {
  "beeper.chat": { key: "beeper.chat", label: "💬 Beeper", folder: "beeper.chat" },
  "sprite.email": { key: "sprite.email", label: "📧 Sprite", folder: "sprite.email" },
  "moneymeta.fun": { key: "moneymeta.fun", label: "💰 Moneymeta", folder: "moneymeta.fun" },
  "adam.gives": { key: "adam.gives", label: "🎁 Adam.gives", folder: "adam.gives" },
};

const ROUTE_PATTERNS: Array<{ re: RegExp; session: string }> = [
  { re: /\b(text|message|dm|whatsapp|imessage|telegram|beeper|discord)\b/i, session: "beeper.chat" },
  { re: /\b(email|e-?mail|inbox|gmail|sprite)\b/i, session: "sprite.email" },
  // Generic deals-ladder process vocabulary only. Deliberately no specific
  // deal/buyer names (Anton, Regain, Summon, Michael, ...) — those are under
  // Adam's standing "paused, never resurface without my explicit restart"
  // ruling (CLAUDE.md, 2026-08-03); routing on their names would silently
  // pull a stray mention back into active-pipeline territory.
  {
    re: /\b(moneymeta|invoice|stripe|deals?\s+ladder|pipeline|founding offer|warm intro|warm founders?|five-?figure|5-figure|proposal|deposit|scope call|mrr)\b/i,
    session: "moneymeta.fun",
  },
  { re: /\b(adam\.?gives|talk-?to menu)\b/i, session: "adam.gives" },
];

export function detectRoute(text: string): string | undefined {
  for (const { re, session } of ROUTE_PATTERNS) if (re.test(text)) return session;
  return undefined;
}

// The command to paste into a terminal to jump straight into that project's
// own Claude Code session.
export function launchCommand(session: AetherSession): string {
  return `cd "C:\\Users\\adamp\\Aether\\${session.folder}" && claude`;
}
