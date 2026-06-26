"use client";

import { KEYSTONE_RUNG, Rung, RungN } from "@/lib/types";
import { ScoreResult } from "@/lib/score";

export function Rungs({
  rungs,
  score,
  onToggle,
}: {
  rungs: Rung[];
  score: ScoreResult;
  onToggle: (n: RungN) => void;
}) {
  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-end justify-between">
        <h2 className="font-pixel text-[10px] uppercase text-ink">⛰ daily quests</h2>
        <span className="text-base text-ink/70">floor 5 · {score.completed}/5 climbed</span>
      </div>

      <div className="space-y-2">
        {rungs.map((r) => {
          const isKeystone = r.n === KEYSTONE_RUNG;
          return (
            <button
              key={r.n}
              onClick={() => onToggle(r.n)}
              className={`btn flex w-full items-center gap-2 p-2 text-left ${
                r.done ? (isKeystone ? "bg-gold" : "bg-health/40") : isKeystone ? "bg-gold/30" : "bg-paper"
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center border-2 border-ink text-base leading-none ${
                  r.done ? "bg-health text-ink animate-pop" : "bg-paper2 text-transparent"
                }`}
                aria-hidden
              >
                ✓
              </span>
              <span className="flex-none text-xl">{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg leading-none text-ink">{r.label}</span>
                  {isKeystone && (
                    <span className="tag bg-life px-1 py-px font-pixel text-[6px] uppercase text-paper">
                      boss
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm leading-tight text-ink/60">{r.blurb}</span>
              </span>
              <span className={`flex-none font-pixel text-[9px] ${r.done ? "text-health" : "text-ink/30"}`}>
                {r.n}
              </span>
            </button>
          );
        })}
      </div>

      {!score.keystoneDone && (
        <p className="panel mt-2 bg-taxes/40 px-2 py-1.5 text-base leading-snug text-ink">
          Boss not down. The day caps at a wobble (7) until you strike it. Everything else is just
          XP on the side.
        </p>
      )}
    </section>
  );
}
