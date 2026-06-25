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
    <section className="mx-auto max-w-md px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-hud-dim">
          The five rungs
        </h2>
        <span className="text-[10px] font-bold text-hud-dim">
          floor 5 · {score.completed}/5 climbed
        </span>
      </div>

      <div className="space-y-2">
        {rungs.map((r) => {
          const isKeystone = r.n === KEYSTONE_RUNG;
          return (
            <button
              key={r.n}
              onClick={() => onToggle(r.n)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                r.done
                  ? isKeystone
                    ? "border-hud-gold/70 bg-hud-gold/15"
                    : "border-health/50 bg-health/10"
                  : isKeystone
                  ? "border-hud-gold/40 bg-hud-panel"
                  : "border-hud-line bg-hud-panel"
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-md border text-sm transition ${
                  r.done
                    ? "border-transparent bg-health text-black"
                    : "border-hud-line bg-hud-bg text-transparent"
                } ${r.done ? "animate-pop" : ""}`}
                aria-hidden
              >
                ✓
              </span>
              <span className="flex-none text-xl">{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${r.done ? "text-white" : "text-hud-dim"}`}>
                    {r.label}
                  </span>
                  {isKeystone && (
                    <span className="rounded bg-hud-gold/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-hud-gold">
                      keystone
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] text-hud-dim">{r.blurb}</span>
              </span>
              <span className={`flex-none text-xs font-black tabular-nums ${r.done ? "text-health" : "text-hud-line"}`}>
                {r.n}
              </span>
            </button>
          );
        })}
      </div>

      {!score.keystoneDone && (
        <p className="mt-2 rounded-lg border border-taxes/30 bg-taxes/10 px-3 py-2 text-[11px] leading-relaxed text-taxes">
          Goal not hit. The day caps at a wobble (7) no matter what else you check. Close your #1 to
          climb past it.
        </p>
      )}
    </section>
  );
}
