"use client";

import { useEffect, useRef, useState } from "react";
import { levelInfo, RANKS, rankForLevel } from "@/lib/progress";

export function ClimbPanel({ xp, ready }: { xp: number; ready: boolean }) {
  const info = levelInfo(xp);
  const { current, next, levelsToNext } = rankForLevel(info.level);

  // Juice: flash +XP on a real close, and a banner on rank up.
  const prevXp = useRef<number | null>(null);
  const prevRank = useRef<string | null>(null);
  const [gain, setGain] = useState(0);
  const [rankUp, setRankUp] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (prevXp.current === null) {
      prevXp.current = xp;
      prevRank.current = current.name;
      return;
    }
    const delta = xp - prevXp.current;
    prevXp.current = xp;
    if (delta > 0) {
      setGain(delta);
      const t = setTimeout(() => setGain(0), 1600);
      if (prevRank.current && prevRank.current !== current.name) {
        setRankUp(current.name);
        const r = setTimeout(() => setRankUp(null), 2800);
        prevRank.current = current.name;
        return () => {
          clearTimeout(t);
          clearTimeout(r);
        };
      }
      prevRank.current = current.name;
      return () => clearTimeout(t);
    }
  }, [xp, ready, current.name]);

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel relative overflow-hidden bg-paper p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink">🏆 the climb</span>
          <span className="font-pixel text-[6px] uppercase text-ink/50">lifetime · never resets</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span key={current.name} className="animate-pop block font-pixel text-base text-gold drop-shadow-[2px_2px_0_#241b40]">
              {current.name}
            </span>
            <span className="text-sm text-ink/70">rank</span>
          </div>
          <div className="text-right">
            <span key={info.level} className="animate-pop block font-pixel text-base text-ink">
              lvl {info.level}
            </span>
            <span className="text-sm text-ink/70">{xp.toLocaleString()} xp</span>
          </div>
        </div>

        <div className="bar mt-2 h-3 w-full overflow-hidden">
          <div
            className="h-full bg-gold transition-[width] duration-500"
            style={{ width: `${info.pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-ink/60">
            {info.intoLevel} / {info.neededForNext} to lvl {info.level + 1}
          </span>
          {gain > 0 && (
            <span className="animate-flash font-pixel text-[9px] text-health">+{gain} xp</span>
          )}
        </div>

        {/* the ladder to Elon */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {RANKS.map((r) => {
            const reached = info.level >= r.minLevel;
            const isCurrent = r.name === current.name;
            const isChampion = r.name === "CHAMPION";
            return (
              <span
                key={r.name}
                className={`tag px-1.5 py-px text-[9px] uppercase leading-none ${
                  isCurrent
                    ? "bg-gold text-ink"
                    : reached
                    ? "bg-health/40 text-ink"
                    : "bg-paper2 text-ink/50"
                }`}
              >
                {isChampion ? "👑 elon" : r.name}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-snug text-ink/70">
          {next
            ? `${levelsToNext} ${levelsToNext === 1 ? "level" : "levels"} to ${
                next.name === "CHAMPION" ? "dethrone Elon" : next.name
              }. Real closes only, motion earns nothing.`
            : "You dethroned Elon. You are the champion. Keep closing."}
        </p>

        {rankUp && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/85">
            <span className="animate-pop text-center font-pixel text-sm uppercase text-gold">
              rank up
              <br />
              {rankUp === "CHAMPION" ? "👑 you beat elon" : rankUp}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
