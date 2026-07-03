"use client";

import { useEffect, useState } from "react";
import {
  bossRemaining,
  crystalsLeft,
  FOCUS_MINUTES,
  matchPhase,
  MatchState,
} from "@/lib/match";

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// Camp-side status card. Every action lives on the board; this just reports
// the match and holds the one door back into it.
export function MatchPanel({
  hasBoss,
  bossTitle,
  match,
  lethal,
  onEnter,
}: {
  hasBoss: boolean;
  bossTitle?: string;
  match: MatchState;
  lethal: boolean;
  onEnter: () => void;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    if (!match.focusEndsAt && !match.breakEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [match.focusEndsAt, match.breakEndsAt]);

  const left = crystalsLeft(match);
  const remaining = bossRemaining(match);
  const nowSafe = now > 0 ? now : Date.now();
  const phase = matchPhase(match, hasBoss, nowSafe);

  const statusLine =
    phase === "focus"
      ? `in a turn · killing: ${match.focusGoal} · ${clock(match.focusEndsAt! - nowSafe)}`
      : phase === "resolve"
        ? "turn over. check in on the board."
        : phase === "break"
          ? `opponent's turn · ${clock(match.breakEndsAt! - nowSafe)}`
          : phase === "out_of_mana"
            ? `0 mana. you dealt ${match.bossHpDone}/${match.bossHpMax}. rematch at dawn.`
            : phase === "no_boss"
              ? "no boss on the field yet."
              : `your turn. ${left} crystals left.`;

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className={`panel bg-paper p-3 ${lethal ? "animate-glow" : ""}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink">⚔ the match · today</span>
          <span className="font-pixel text-[6px] uppercase text-ink/50">{FOCUS_MINUTES} min turns</span>
        </div>

        {/* mana crystals */}
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] uppercase text-visa">mana</span>
          <div className="flex flex-wrap gap-0.5">
            {Array.from({ length: match.crystals }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rotate-45 border-2 border-ink ${i < left ? "bg-visa" : "bg-paper2"}`}
              />
            ))}
          </div>
          <span className="ml-auto text-sm text-ink/70">{left} turns left</span>
        </div>

        {/* boss HP */}
        {hasBoss && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[7px] uppercase text-life">boss hp</span>
              <span className="text-sm text-ink/70">{match.bossHpDone}/{match.bossHpMax} struck</span>
            </div>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: match.bossHpMax }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 flex-1 border-2 border-ink ${i < remaining ? "bg-life" : "bg-paper2"}`}
                />
              ))}
            </div>
            <p className="mt-1 truncate text-sm text-ink/60">{bossTitle}</p>
            {lethal && (
              <p className="mt-1 animate-flash font-pixel text-[9px] uppercase text-life">
                ⚡ lethal. you can close the boss today.
              </p>
            )}
          </div>
        )}

        <p className="mt-2 truncate text-sm text-ink/70">{statusLine}</p>

        <button
          onClick={onEnter}
          className="btn mt-2 w-full bg-life py-3 font-pixel text-[11px] uppercase text-paper"
        >
          ▶ enter the match
        </button>
      </div>
    </section>
  );
}
