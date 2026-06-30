"use client";

import { useEffect, useState } from "react";
import { computeLifeLeft, LifeLeft } from "@/lib/life";
import { ScoreResult } from "@/lib/score";

function scoreMood(s: ScoreResult): { label: string; bg: string } {
  if (!s.keystoneDone) return { label: "shaky", bg: "bg-taxes" };
  if (s.score >= 10) return { label: "legendary", bg: "bg-gold" };
  if (s.isWinning) return { label: "questing", bg: "bg-health" };
  return { label: "warming up", bg: "bg-visa" };
}

export function Header({ score, lethal = false }: { score: ScoreResult; lethal?: boolean }) {
  const [life, setLife] = useState<LifeLeft | null>(null);
  useEffect(() => setLife(computeLifeLeft()), []);

  const mood = scoreMood(score);
  const hpPct = life ? 100 - life.percentElapsed : 100;

  return (
    <header className="sticky top-0 z-30 border-b-4 border-ink bg-paper">
      <div className="mx-auto max-w-md px-3 py-2">
        {/* wordmark row */}
        <div className="mb-2 flex items-center justify-between">
          <h1 className="flex items-center gap-1.5 font-pixel text-[11px] leading-none text-ink">
            <span className="animate-bob text-base">❤️</span>
            the main quest
          </h1>
          <div className="flex items-center gap-1.5">
            {lethal && (
              <span className="tag animate-glow bg-life px-1.5 py-px font-pixel text-[7px] uppercase leading-none text-paper">
                ⚡ lethal
              </span>
            )}
            <span className={`tag ${mood.bg} px-1.5 py-px text-sm uppercase leading-none text-ink`}>
              {mood.label}
            </span>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          {/* LVL today */}
          <div className="panel flex w-24 flex-none flex-col items-center bg-paper px-2 py-1">
            <span className="font-pixel text-[7px] uppercase text-loops">lvl today</span>
            <div className="flex items-baseline gap-0.5">
              <span key={score.score} className="animate-pop font-pixel text-xl text-ink">
                {score.score}
              </span>
              <span className="font-pixel text-[9px] text-loops">/10</span>
            </div>
          </div>

          {/* HP life bar */}
          <div className="panel flex flex-1 flex-col justify-center bg-paper px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[7px] uppercase text-health">hp · life left</span>
              <span className="text-base leading-none text-ink">
                {life ? `${life.daysLeft.toLocaleString()}d` : "..."}
              </span>
            </div>
            <div className="bar mt-1 h-3 w-full overflow-hidden">
              <div
                className="h-full bg-health transition-[width] duration-700"
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <span className="mt-0.5 text-sm leading-none text-loops">
              {life ? `${life.percentElapsed.toFixed(1)}% of the game spent` : "loading the map"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
