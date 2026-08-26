"use client";

import { levelInfoByPillar, PillarProgress } from "@/lib/progress";
import { PILLAR_ORDER, PILLAR_TEXT } from "@/lib/types";
import { unlocksWithStatus } from "@/lib/unlocks";

export function UnlocksPanel({ pillars }: { pillars: PillarProgress }) {
  const levels = levelInfoByPillar(pillars);
  const unlocks = unlocksWithStatus((p) => levels[p].level);

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel bg-paper p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink">🔓 unlocks</span>
          <span className="font-pixel text-[6px] uppercase text-ink/50">
            {unlocks.filter((u) => u.earned).length}/{unlocks.length}
          </span>
        </div>
        <div className="space-y-1.5">
          {PILLAR_ORDER.map((p) => (
            <div key={p} className="space-y-1">
              {unlocks
                .filter((u) => u.pillar === p)
                .map((u) => (
                  <div
                    key={`${u.pillar}-${u.level}`}
                    className={`flex items-start gap-2 rounded border px-2 py-1.5 ${
                      u.earned ? "border-ink/20 bg-paper2" : "border-ink/10 opacity-50"
                    }`}
                  >
                    <span className={`font-pixel text-[8px] ${PILLAR_TEXT[p]}`}>
                      {u.earned ? "✓" : "🔒"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-pixel text-[6px] uppercase ${PILLAR_TEXT[p]}`}>
                          {p} lv{u.level}
                        </span>
                        {u.mechanical ? (
                          <span className="font-pixel text-[5px] uppercase text-ink/40">⚙ enforced</span>
                        ) : (
                          <span className="font-pixel text-[5px] uppercase text-ink/40">self-granted</span>
                        )}
                      </div>
                      <p className="text-sm leading-snug text-ink">{u.title}</p>
                      <p className="text-xs leading-snug text-ink/60">{u.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs leading-snug text-ink/50">
          ⚙ = the app actually enforces it. Everything else is a real-world permission this board
          tracks but cannot lock. You grant it to yourself once you've earned it.
        </p>
      </div>
    </section>
  );
}
