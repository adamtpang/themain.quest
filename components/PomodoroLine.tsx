"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/lib/types";
import {
  buildQuestLine,
  MAX_POMODOROS,
  MAX_STONES,
  POMODORO_MIN,
  scheduleLine,
  Tier,
} from "@/lib/pomodoro";

const TIER_BG: Record<Tier, string> = {
  P1: "bg-life text-paper",
  P2: "bg-gold text-ink",
  P3: "bg-sky text-ink",
  P4: "bg-paper2 text-ink/60",
};

export function PomodoroLine({ quests }: { quests: Quest[] }) {
  const [startMin, setStartMin] = useState(0);
  const [showParked, setShowParked] = useState(false);

  useEffect(() => {
    const d = new Date();
    setStartMin(Math.ceil((d.getHours() * 60 + d.getMinutes()) / 5) * 5);
  }, []);

  const line = buildQuestLine(quests);
  const times = startMin > 0 ? scheduleLine(line, startMin) : [];

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel bg-paper p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-pixel text-[10px] uppercase text-ink">🍅 the quest line</h2>
          <span className="font-pixel text-[6px] uppercase text-ink/50">main quest first</span>
        </div>

        {line.pomodoros.length === 0 ? (
          <p className="inset px-2 py-2 text-base text-ink/70">
            No quest line yet. Crown a main quest and load your outbox, then the day sorts itself into
            Pomodoros here.
          </p>
        ) : (
          <>
            {/* the main quest, always first, in red */}
            {line.main && (
              <div className="panel mb-2 bg-life p-2 text-paper">
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-[7px] uppercase">🎯 main quest</span>
                  {line.main.oneWayDoor && <span className="text-sm">🚪</span>}
                  <span className="ml-auto font-pixel text-[7px]">+{line.main.xp}</span>
                </div>
                <p className="mt-1 text-base leading-tight">{line.main.quest.title}</p>
              </div>
            )}

            {/* the Pomodoro line with mandatory whitespace between blocks */}
            <ol className="space-y-1">
              {line.pomodoros.map((s, i) => (
                <li key={s.quest.id}>
                  <div className="flex items-center gap-2">
                    <span className={`tag px-1 py-px font-pixel text-[7px] ${TIER_BG[s.tier]}`}>
                      {s.tier}
                    </span>
                    {times[i] && (
                      <span className="font-pixel text-[7px] uppercase text-ink/50">{times[i]}</span>
                    )}
                    <span className="flex-1 truncate text-sm text-ink">
                      {s.oneWayDoor && "🚪 "}
                      {s.quest.title}
                    </span>
                    <span className="font-pixel text-[6px] uppercase text-ink/50">
                      {POMODORO_MIN}m · +{s.xp}
                    </span>
                  </div>
                  {i < line.pomodoros.length - 1 && (
                    <div className="my-0.5 ml-8 border-t border-dashed border-ink/20" />
                  )}
                </li>
              ))}
            </ol>

            {/* the scoreboard: XP, caps, and the one send that wins the day */}
            <div className="mt-2 inset px-2 py-1.5">
              <p className="font-pixel text-[7px] uppercase text-ink">
                xp {line.totalXp} · {line.stones}/{MAX_STONES} stones · {line.pomodoros.length}/
                {MAX_POMODOROS} pomodoros
              </p>
              {line.winMove ? (
                <p className="mt-1 text-sm text-ink/80">
                  🏆 ship 🚪 {line.winMove.quest.title}, and today is a 10/10 no matter what else.
                </p>
              ) : (
                <p className="mt-1 text-sm text-ink/60">
                  No one-way-door send in the line. Add the irreversible move that closes the day.
                </p>
              )}
            </div>

            {/* the sand, parked and reported, never silently dropped */}
            {line.parked.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowParked((v) => !v)}
                  className="font-pixel text-[7px] uppercase text-ink/60 hover:text-ink"
                >
                  🏖 parked {line.parked.length} {showParked ? "▲" : "▼"}
                </button>
                {showParked && (
                  <ul className="mt-1 space-y-0.5">
                    {line.parked.map((p) => (
                      <li key={p.quest.id} className="text-sm text-ink/60">
                        <span className="line-through">{p.quest.title}</span> · {p.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="mt-2 text-sm leading-snug text-ink/50">
              Tiers map to Google colors P1 red, P2 orange, P3 yellow, P4 gray. Enable the calendar
              connector to push these onto your real day.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
