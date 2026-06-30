"use client";

import { useEffect, useState } from "react";
import { FOCUS_MINUTES } from "@/lib/match";

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function MatchPanel({
  hasBoss,
  bossTitle,
  crystals,
  spent,
  bossHpMax,
  bossHpDone,
  lethal,
  focusEndsAt,
  onStart,
  onGiveUp,
}: {
  hasBoss: boolean;
  bossTitle?: string;
  crystals: number;
  spent: number;
  bossHpMax: number;
  bossHpDone: number;
  lethal: boolean;
  focusEndsAt: number | null;
  onStart: () => void;
  onGiveUp: () => void;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    if (!focusEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [focusEndsAt]);

  const left = Math.max(0, crystals - spent);
  const focusing = !!focusEndsAt;
  const remainingMs = focusEndsAt ? focusEndsAt - now : 0;

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
            {Array.from({ length: crystals }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rotate-45 border-2 border-ink ${i < left ? "bg-visa" : "bg-paper2"}`}
              />
            ))}
          </div>
          <span className="ml-auto text-sm text-ink/70">{left} blocks left</span>
        </div>

        {/* boss HP */}
        {hasBoss ? (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[7px] uppercase text-life">boss hp</span>
              <span className="text-sm text-ink/70">{bossHpDone}/{bossHpMax} struck</span>
            </div>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: bossHpMax }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 flex-1 border-2 border-ink ${i < bossHpMax - bossHpDone ? "bg-life" : "bg-paper2"}`}
                />
              ))}
            </div>
            <p className="mt-1 truncate text-sm text-ink/60">{bossTitle}</p>

            {lethal && !focusing && (
              <p className="mt-2 animate-flash font-pixel text-[9px] uppercase text-life">
                ⚡ lethal. you can close the boss today.
              </p>
            )}

            {/* the rope */}
            {focusing ? (
              <div className="mt-2">
                <div className="bar h-6 w-full overflow-hidden">
                  <div
                    className="flex h-full items-center justify-center bg-health font-pixel text-[10px] text-ink transition-[width] duration-300"
                    style={{ width: `${Math.min(100, Math.max(6, (remainingMs / (FOCUS_MINUTES * 60000)) * 100))}%` }}
                  >
                    {clock(remainingMs)}
                  </div>
                </div>
                <button
                  onClick={onGiveUp}
                  className="mt-2 w-full font-pixel text-[7px] uppercase text-ink/50 hover:text-life"
                >
                  give up the turn (no credit)
                </button>
              </div>
            ) : (
              <button
                onClick={onStart}
                disabled={left <= 0}
                className="btn mt-2 w-full bg-life py-2 font-pixel text-[10px] uppercase text-paper disabled:opacity-50"
              >
                {left <= 0 ? "out of mana today" : "⚔ attack boss · start focus"}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-3 inset px-2 py-2 text-base text-ink/70">
            Crown a boss to start the match. Then spend mana to chip its HP.
          </p>
        )}
      </div>
    </section>
  );
}
