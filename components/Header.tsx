"use client";

import { useEffect, useState } from "react";
import { computeLifeLeft, LifeLeft } from "@/lib/life";
import { ScoreResult } from "@/lib/score";

function scoreMood(s: ScoreResult): { label: string; color: string } {
  if (!s.keystoneDone) return { label: "WOBBLE", color: "text-taxes" };
  if (s.score >= 10) return { label: "PERFECT", color: "text-hud-gold" };
  if (s.isWinning) return { label: "WINNING", color: "text-health" };
  return { label: "CLIMBING", color: "text-visa" };
}

export function Header({ score }: { score: ScoreResult }) {
  const [life, setLife] = useState<LifeLeft | null>(null);

  useEffect(() => {
    setLife(computeLifeLeft());
  }, []);

  const mood = scoreMood(score);

  return (
    <header className="sticky top-0 z-30 border-b border-hud-line bg-hud-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-between gap-3 px-4 py-3">
        {/* Day score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-hud-dim">
            Today
          </span>
          <div className="flex items-baseline gap-1">
            <span
              key={score.score}
              className="animate-pop text-3xl font-black leading-none tabular-nums"
            >
              {score.score}
            </span>
            <span className="text-sm font-bold text-hud-dim">/10</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${mood.color}`}>
            {mood.label}
          </span>
        </div>

        {/* Life-left clock */}
        <div className="flex min-w-0 flex-1 flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-hud-dim">
            Life left
          </span>
          {life ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black leading-none tabular-nums text-life">
                  {life.daysLeft.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-hud-dim">days</span>
              </div>
              <span className="text-[10px] text-hud-dim">
                {life.percentElapsed.toFixed(1)}% spent · {life.daysLived.toLocaleString()} lived
              </span>
            </>
          ) : (
            <span className="text-2xl font-black leading-none text-hud-dim">...</span>
          )}
        </div>
      </div>

      {/* Life progress bar */}
      <div className="h-1 w-full bg-hud-line">
        <div
          className="h-full bg-gradient-to-r from-life via-leverage to-visa transition-[width] duration-700"
          style={{ width: `${life ? life.percentElapsed : 0}%` }}
        />
      </div>
    </header>
  );
}
