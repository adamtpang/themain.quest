"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { computeLifeLeft } from "@/lib/life";
import { mentorFor } from "@/lib/mentors";
import { freshPillarProgress, overallLevelFromPillars, PillarProgress, rankForLevel } from "@/lib/progress";
import { freshStreak, recordWin, refreshStreak, Streak } from "@/lib/streak";
import { todayStr, useLocalStorage } from "@/lib/storage";

// The whole game, one screen: your life clock, today's ONE send, and your real
// calendar. The calendar IS the to-do list (Corcos). The app keeps score.

type SendDay = {
  date: string;
  text: string;
  sent: boolean;
  asks: number; // total asks sent today, the number that matters
};

const SEND_KEY = "tmq.send";
const PROGRESS_KEY = "tmq.progress";
const STREAK_KEY = "tmq.streak";

const XP_SEND = 100;
const XP_ASK = 25;

function freshSend(): SendDay {
  return { date: todayStr(), text: "", sent: false, asks: 0 };
}

function yesterdayStr(): string {
  return todayStr(new Date(Date.now() - 86400000));
}

export default function Home() {
  const [day, setDay, dayHydrated] = useLocalStorage<SendDay>(SEND_KEY, freshSend());
  const [progress, setProgress, progressHydrated] = useLocalStorage<PillarProgress>(
    PROGRESS_KEY,
    freshPillarProgress()
  );
  const [streak, setStreak, streakHydrated] = useLocalStorage<Streak>(STREAK_KEY, freshStreak());

  // A new date means a new match. Yesterday's send does not carry.
  useEffect(() => {
    if (!dayHydrated) return;
    if (day.date !== todayStr()) setDay(freshSend());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayHydrated, day.date]);

  useEffect(() => {
    if (!streakHydrated) return;
    setStreak((s) => refreshStreak(s, todayStr(), yesterdayStr()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakHydrated, day.date]);

  const life = useMemo(() => computeLifeLeft(), []);
  const mentor = useMemo(() => mentorFor(new Date()), []);
  const overallLvl = overallLevelFromPillars(progress);
  const rank = rankForLevel(overallLvl).current.name;

  // The one-send mechanic is a deal-closing ask by its own copy ("the ask
  // that wins today"), so it always feeds Wealth directly — it has no Quest
  // object, so there is no .pillar tag to route by. Health and Wisdom XP
  // come from closing quests on /board instead.
  function markSent() {
    if (!day.text.trim() || day.sent) return;
    setDay((d) => ({ ...d, sent: true, asks: d.asks + 1 }));
    setProgress((p) => ({ ...p, Wealth: p.Wealth + XP_SEND }));
    setStreak((s) => recordWin(s, todayStr(), yesterdayStr()));
  }

  function logAsk() {
    setDay((d) => ({ ...d, asks: d.asks + 1 }));
    setProgress((p) => ({ ...p, Wealth: p.Wealth + XP_ASK }));
  }

  return (
    <main className="min-h-screen pb-10">
      {/* life clock: days are XP, this is the HP bar */}
      <header className="sticky top-0 z-40 border-b-4 border-ink bg-ink px-3 py-2">
        <div className="mx-auto max-w-md">
          <div className="flex items-baseline justify-between">
            <h1 className="font-pixel text-[10px] uppercase text-paper">❤️ the main quest</h1>
            <span className="font-pixel text-[8px] uppercase text-gold">
              lvl {progressHydrated ? overallLvl : "-"} · {progressHydrated ? rank : "..."}
              {streak.current > 0 ? ` · 🔥${streak.current}` : ""}
            </span>
          </div>
          <div className="mt-1.5 h-3 w-full border-2 border-paper/60 bg-ink">
            <div
              className="h-full bg-gradient-to-r from-life via-gold to-sky"
              style={{ width: `${life.percentElapsed.toFixed(1)}%` }}
            />
          </div>
          <p className="mt-1 font-pixel text-[7px] uppercase text-paper/70">
            {life.daysLeft.toLocaleString()} days left · {life.percentElapsed.toFixed(1)}% of the game spent
          </p>
        </div>
      </header>

      {/* what this is, in plain words, for humans and bots skimming the top */}
      <section className="mx-auto max-w-md px-3 pt-3">
        <div className="panel bg-paper2 p-3">
          <p className="text-sm leading-snug text-ink/80">
            The Main Quest turns your one real-life goal into a boss fight. Days
            become XP, habits become daily quests, and a life-left clock keeps
            time honest, all on one mobile screen. Built for people who want to
            run their own life like a game.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-snug text-ink/70">
            <li>One binding goal, tracked as the boss you&apos;re closing</li>
            <li>Today&apos;s day-score across five daily rungs</li>
            <li>A Motion Test on every quest, so busywork can&apos;t fake progress</li>
            <li>A life-left clock in the header, so time stays real</li>
            <li>Everything lives in your browser&apos;s local storage, nothing to sign up for</li>
          </ul>
        </div>
      </section>

      {/* the ONE send: the day is won or lost right here */}
      <section className="mx-auto max-w-md px-3 pt-3">
        {day.sent ? (
          <div className="panel bg-health p-3">
            <p className="font-pixel text-[8px] uppercase text-ink/70">🥇 sent. the day is won.</p>
            <p className="mt-1 text-lg leading-tight text-ink">{day.text}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-pixel text-[8px] uppercase text-ink/70">asks today: {day.asks}</span>
              <button
                onClick={logAsk}
                className="btn bg-paper px-2 py-1 font-pixel text-[8px] uppercase text-ink"
              >
                + another ask · {XP_ASK}xp
              </button>
            </div>
          </div>
        ) : (
          <div className="panel bg-paper p-3">
            <p className="font-pixel text-[8px] uppercase text-life">🥇 today&apos;s one irreversible send</p>
            <input
              value={day.text}
              onChange={(e) => setDay((d) => ({ ...d, text: e.target.value }))}
              placeholder="the ask that wins today. name it."
              className="inset mt-2 w-full bg-paper2 px-2 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button
              onClick={markSent}
              disabled={!day.text.trim()}
              className="btn mt-2 w-full bg-life py-3 font-pixel text-[10px] uppercase text-paper disabled:opacity-40"
            >
              ⚔ it is sent · +{XP_SEND}xp
            </button>
            <p className="mt-2 text-sm leading-snug text-ink/60">
              0 asks = 5. 1 ask sent = 8. 1 ask and a yes = 10. Send first, everything else after.
            </p>
          </div>
        )}
      </section>

      {/* today's mentor, one line of the greatest lives */}
      <section className="mx-auto max-w-md px-3 pt-3">
        <div className="panel bg-gold p-2.5">
          <p className="font-pixel text-[7px] uppercase text-ink/60">🏛 {mentor.name}</p>
          <p className="mt-1 text-base leading-snug text-ink">{mentor.move}</p>
        </div>
      </section>

      <footer className="mx-auto max-w-md px-3 pt-4 text-center">
        <Link
          href="/board"
          className="font-pixel text-[8px] uppercase text-ink/60 underline hover:text-ink"
        >
          ▶ the full game (board, match, schools, authoring)
        </Link>
        <p className="mt-2 text-xs text-ink/50">
          Built by Adam Pang, part of the adam.inc line of focused tools.
        </p>
      </footer>
    </main>
  );
}
