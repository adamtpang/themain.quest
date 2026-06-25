"use client";

type Lens = {
  key: string;
  label: string;
  emoji: string;
  sub: string;
  summary: string;
  href: string;
  accent: string;
};

// Clean seams: each lens deep-links out for v1; swap href for a native panel later.
const LENSES: Lens[] = [
  {
    key: "who",
    label: "WHO",
    emoji: "👥",
    sub: "people",
    summary: "Who matters, who is owed a message",
    href: "https://pokedex.life",
    accent: "text-life",
  },
  {
    key: "what",
    label: "WHAT",
    emoji: "🎯",
    sub: "goals",
    summary: "Goals and projects in motion",
    href: "https://optimism.fun",
    accent: "text-health",
  },
  {
    key: "where",
    label: "WHERE",
    emoji: "🌍",
    sub: "place",
    summary: "Where you are, where you are headed",
    href: "https://portal.voyage",
    accent: "text-visa",
  },
];

export function LensCards() {
  return (
    <section className="mx-auto max-w-md px-4 pt-4">
      <h2 className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-hud-dim">
        The three lenses
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {LENSES.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-xl border border-hud-line bg-hud-panel p-3 transition active:scale-[0.97]"
          >
            <span className="text-2xl">{l.emoji}</span>
            <span className={`mt-1 text-sm font-black ${l.accent}`}>{l.label}</span>
            <span className="text-[10px] uppercase tracking-wider text-hud-dim">{l.sub}</span>
            <span className="mt-2 text-[10px] leading-tight text-hud-dim">{l.summary}</span>
            <span className="mt-2 text-[10px] font-bold text-hud-dim">open ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
