"use client";

type Lens = {
  key: string;
  label: string;
  emoji: string;
  sub: string;
  summary: string;
  href: string;
  bg: string;
};

// The life stack, as portals. Swap href for a native panel later.
const LENSES: Lens[] = [
  {
    key: "who",
    label: "PARTY",
    emoji: "🧑‍🤝‍🧑",
    sub: "who",
    summary: "People who matter",
    href: "https://pokedex.life",
    bg: "bg-bubblegum",
  },
  {
    key: "what",
    label: "QUESTS",
    emoji: "🎯",
    sub: "what",
    summary: "Goals in motion",
    href: "https://optimism.fun",
    bg: "bg-health",
  },
  {
    key: "where",
    label: "MAP",
    emoji: "🗺️",
    sub: "where",
    summary: "Where you roam",
    href: "https://portal.voyage",
    bg: "bg-visa",
  },
];

export function LensCards() {
  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <h2 className="mb-2 font-pixel text-[10px] uppercase text-ink">🌀 the three portals</h2>
      <div className="grid grid-cols-3 gap-2">
        {LENSES.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn flex flex-col items-start p-2 ${l.bg}`}
          >
            <span className="animate-bob text-2xl">{l.emoji}</span>
            <span className="mt-1 font-pixel text-[9px] uppercase text-ink">{l.label}</span>
            <span className="text-sm uppercase leading-none text-ink/70">{l.sub}</span>
            <span className="mt-1 text-sm leading-tight text-ink/80">{l.summary}</span>
            <span className="mt-1 font-pixel text-[6px] uppercase text-ink">enter →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
