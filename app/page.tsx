"use client";

import { useEffect, useMemo, useState } from "react";
import { AffirmationBanner } from "@/components/AffirmationBanner";
import { BindingGoal } from "@/components/BindingGoal";
import { CalendarPanel } from "@/components/CalendarPanel";
import { ClimbPanel } from "@/components/ClimbPanel";
import { FinnChat } from "@/components/FinnChat";
import { Header } from "@/components/Header";
import { LensCards } from "@/components/LensCards";
import { MatchPanel } from "@/components/MatchPanel";
import { ProblemsBoard } from "@/components/ProblemsBoard";
import { QuestBoard } from "@/components/QuestBoard";
import { Rungs } from "@/components/Rungs";
import { SchoolsPanel } from "@/components/SchoolsPanel";
import { SelfAuthoring } from "@/components/SelfAuthoring";
import { TheBoard } from "@/components/TheBoard";
import { bindingGoal, canBind, recommendedBinding } from "@/lib/board";
import { freshSchools, SCHOOL_IDS, SCHOOL_META, SCHOOL_OF, schoolLevel, Schools } from "@/lib/schools";
import {
  bossRemaining,
  crystalsLeft,
  DEFAULT_BOSS_HP,
  FOCUS_MINUTES,
  freshMatch,
  isLethal,
  MatchState,
} from "@/lib/match";
import { defaultProblems, Problem } from "@/lib/problems";
import { levelInfo, Progress, rankForLevel, XP_BOSS_BONUS, XP_PER_QUEST } from "@/lib/progress";
import { computeScore } from "@/lib/score";
import { freshStreak, recordWin, refreshStreak, Streak } from "@/lib/streak";
import { todayStr, useLocalStorage } from "@/lib/storage";
import {
  DayState,
  freshRungs,
  KEYSTONE_RUNG,
  PRIORITY_ORDER,
  Quest,
  RungN,
} from "@/lib/types";

const QUESTS_KEY = "tmq.quests";
const DAY_KEY = "tmq.day";
const SCHOOLS_KEY = "tmq.schools";
const PROBLEMS_KEY = "tmq.problems";
const PROGRESS_KEY = "tmq.progress";
const MATCH_KEY = "tmq.match";
const STREAK_KEY = "tmq.streak";

function yesterdayStr(): string {
  return todayStr(new Date(Date.now() - 86400000));
}

function freshDay(): DayState {
  return { date: todayStr(), rungs: freshRungs() };
}

export default function Page() {
  const [quests, setQuests] = useLocalStorage<Quest[]>(QUESTS_KEY, []);
  const [day, setDay, dayHydrated] = useLocalStorage<DayState>(DAY_KEY, freshDay());
  const [schools, setSchools] = useLocalStorage<Schools>(SCHOOLS_KEY, freshSchools());
  const [problems, setProblems] = useLocalStorage<Problem[]>(PROBLEMS_KEY, defaultProblems());
  const [progress, setProgress, progressHydrated] = useLocalStorage<Progress>(PROGRESS_KEY, { xp: 0 });
  const [match, setMatch, matchHydrated] = useLocalStorage<MatchState>(MATCH_KEY, freshMatch(todayStr()));
  const [streak, setStreak, streakHydrated] = useLocalStorage<Streak>(STREAK_KEY, freshStreak());
  const [boardOpen, setBoardOpen] = useState(false);

  // Every day boots at 5/10: reset rungs when the date rolls over.
  useEffect(() => {
    if (!dayHydrated) return;
    const today = todayStr();
    if (day.date !== today) {
      setDay({ date: today, rungs: freshRungs() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayHydrated, day.date]);

  const score = useMemo(() => computeScore(day), [day]);
  const binding = useMemo(() => bindingGoal(quests), [quests]);
  const recommended = useMemo(() => recommendedBinding(quests), [quests]);

  // The match resets daily, and the boss HP tracks whichever goal is crowned.
  useEffect(() => {
    if (!matchHydrated) return;
    const today = todayStr();
    if (match.date !== today) {
      setMatch(freshMatch(today));
      return;
    }
    if (binding && match.bossId !== binding.id) {
      setMatch((m) => ({
        ...m,
        bossId: binding.id,
        bossHpMax: DEFAULT_BOSS_HP,
        bossHpDone: 0,
        focusEndsAt: m.focusQuestId === m.bossId ? null : m.focusEndsAt,
        focusQuestId: m.focusQuestId === m.bossId ? null : m.focusQuestId,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, match.date, binding?.id]);

  // The rope: complete a focus block when its timer runs out (even if we were away).
  useEffect(() => {
    if (!matchHydrated || !match.focusEndsAt) return;
    const check = () => {
      if (Date.now() >= match.focusEndsAt!) completeBlock();
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, match.focusEndsAt]);

  // Lethal landed: the boss HP hit zero, so strike it dead (pays the climb XP + rung 7).
  useEffect(() => {
    if (!matchHydrated) return;
    if (match.bossId && match.bossHpDone >= match.bossHpMax) {
      const boss = quests.find((q) => q.id === match.bossId);
      if (boss && boss.isBinding && !boss.done) toggleDone(match.bossId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, match.bossHpDone, match.bossHpMax, match.bossId, quests]);

  // Win streak: striking the boss (keystone hit) extends the chain. A missed day breaks it.
  useEffect(() => {
    if (!streakHydrated) return;
    setStreak((s) => refreshStreak(s, todayStr(), yesterdayStr()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakHydrated, day.date]);

  useEffect(() => {
    if (!streakHydrated) return;
    if (score.keystoneDone) {
      setStreak((s) => recordWin(s, todayStr(), yesterdayStr()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakHydrated, score.keystoneDone]);

  // Compact live state Finn reasons about.
  const finnContext = useMemo(
    () => ({
      rank: rankForLevel(levelInfo(progress.xp).level).current.name,
      level: levelInfo(progress.xp).level,
      lifetimeXp: progress.xp,
      streak: streak.current,
      bestStreak: streak.best,
      match: {
        crystalsLeft: crystalsLeft(match),
        bossHpRemaining: binding ? bossRemaining(match) : null,
        lethal: isLethal(match, !!binding),
        focusing: !!match.focusEndsAt,
      },
      score: score.score,
      winning: score.isWinning,
      keystoneHit: score.keystoneDone,
      boss: binding ? { title: binding.title, priority: binding.priority } : null,
      recommendedBoss: recommended?.title ?? null,
      rungs: day.rungs.map((r) => ({ n: r.n, label: r.label, done: r.done })),
      openQuests: quests
        .filter((q) => !q.done && q.passesMotionTest)
        .slice(0, 12)
        .map((q) => ({ title: q.title, priority: q.priority, time: q.scheduledTime })),
      traps: quests.filter((q) => !q.passesMotionTest).map((q) => q.title),
      problems: problems.map((p) => ({
        title: p.title,
        importance: p.importance,
        urgency: p.urgency,
        why: p.why,
        beaten: p.beaten,
      })),
      schools: SCHOOL_IDS.map((id) => ({ name: SCHOOL_META[id].name, level: schoolLevel(schools[id]) })),
    }),
    [score, binding, recommended, day, quests, problems, schools, progress, match, streak]
  );

  // ----- quest handlers -----
  // Importing a parsed boss frees the current slot so only the new one is bound.
  function addQuests(parsed: Quest[]) {
    const incomingBinding = parsed.some((q) => q.isBinding);
    setQuests((prev) => {
      const base = incomingBinding ? prev.map((q) => ({ ...q, isBinding: false })) : prev;
      return [...base, ...parsed];
    });
  }

  function toggleDone(id: string) {
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    const done = !q.done;
    const wasBinding = q.isBinding;
    const completingBinding = done && wasBinding;
    // A real close pays lifetime XP exactly once. Motion pays nothing. The boss pays a bonus.
    const award = done && q.passesMotionTest && !q.xpAwarded;
    const xpGain = award ? XP_PER_QUEST + (wasBinding ? XP_BOSS_BONUS : 0) : 0;
    setQuests((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              done,
              isBinding: completingBinding ? false : x.isBinding,
              xpAwarded: award ? true : x.xpAwarded,
            }
          : x
      )
    );
    // Closing the crowned goal hits the keystone rung (Goal hit).
    if (completingBinding) setRung(KEYSTONE_RUNG, true);
    if (xpGain > 0) {
      setProgress((p) => ({ ...p, xp: p.xp + xpGain }));
      const sid = SCHOOL_OF[q.priority]; // the same close levels its school
      setSchools((s) => ({ ...s, [sid]: s[sid] + xpGain }));
    }
  }

  function cyclePriority(id: string) {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const i = PRIORITY_ORDER.indexOf(q.priority);
        const next = PRIORITY_ORDER[(i + 1) % PRIORITY_ORDER.length];
        return { ...q, priority: next };
      })
    );
  }

  function toggleMotion(id: string) {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const passes = !q.passesMotionTest;
        // Motion can never be the #1.
        return { ...q, passesMotionTest: passes, isBinding: passes ? q.isBinding : false };
      })
    );
  }

  // The slot physically cannot hold two goals, and rejects motion.
  function setBinding(id: string) {
    setQuests((prev) => {
      const target = prev.find((q) => q.id === id);
      if (!target || !canBind(target)) return prev;
      return prev.map((q) => ({ ...q, isBinding: q.id === id }));
    });
  }

  function clearBinding() {
    setQuests((prev) => prev.map((q) => ({ ...q, isBinding: false })));
  }

  function completeBinding() {
    if (!binding) return;
    toggleDone(binding.id);
  }

  function deleteQuest(id: string) {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  // ----- rung handlers -----
  function setRung(n: RungN, done: boolean) {
    setDay((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => (r.n === n ? { ...r, done } : r)),
    }));
  }

  function toggleRung(n: RungN) {
    setDay((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => (r.n === n ? { ...r, done: !r.done } : r)),
    }));
  }

  // ----- match handlers -----
  function completeBlock() {
    setMatch((m) => {
      if (!m.focusEndsAt) return m; // already resolved, stay idempotent
      const onBoss = m.focusQuestId != null && m.focusQuestId === m.bossId;
      return {
        ...m,
        spent: m.spent + 1,
        bossHpDone: onBoss ? Math.min(m.bossHpMax, m.bossHpDone + 1) : m.bossHpDone,
        focusEndsAt: null,
        focusQuestId: null,
      };
    });
  }

  function startFocus() {
    if (!binding) return;
    setMatch((m) => {
      if (crystalsLeft(m) <= 0) return m;
      return { ...m, focusEndsAt: Date.now() + FOCUS_MINUTES * 60000, focusQuestId: binding.id };
    });
  }

  function giveUpFocus() {
    setMatch((m) => ({ ...m, focusEndsAt: null, focusQuestId: null }));
  }

  return (
    <main className="min-h-screen pb-24">
      <Header score={score} lethal={isLethal(match, !!binding)} />
      <AffirmationBanner />
      <BindingGoal
        binding={binding}
        recommended={recommended}
        onComplete={completeBinding}
        onPromote={setBinding}
        onClear={clearBinding}
      />
      <MatchPanel
        hasBoss={!!binding}
        bossTitle={binding?.title}
        crystals={match.crystals}
        spent={match.spent}
        bossHpMax={match.bossHpMax}
        bossHpDone={match.bossHpDone}
        lethal={isLethal(match, !!binding)}
        focusEndsAt={match.focusEndsAt}
        onStart={startFocus}
        onGiveUp={giveUpFocus}
      />
      <ClimbPanel xp={progress.xp} ready={progressHydrated} streak={streak.current} bestStreak={streak.best} />
      <Rungs rungs={day.rungs} score={score} onToggle={toggleRung} />
      <QuestBoard
        quests={quests}
        onAdd={addQuests}
        onToggleDone={toggleDone}
        onCyclePriority={cyclePriority}
        onToggleMotion={toggleMotion}
        onSetBinding={setBinding}
        onDelete={deleteQuest}
      />
      <ProblemsBoard problems={problems} onChange={setProblems} />
      <SelfAuthoring />
      <CalendarPanel />
      <LensCards />
      <SchoolsPanel schools={schools} />
      <footer className="mx-auto max-w-md px-3 pt-6 text-center">
        <p className="font-pixel text-[7px] uppercase leading-relaxed text-ink/70">
          the main quest · this dashboard is a Loops-tier build. now go strike the boss.
        </p>
      </footer>
      <FinnChat context={finnContext} />

      {/* Play the turn: the interactive board */}
      <button
        onClick={() => setBoardOpen(true)}
        className="btn fixed bottom-4 left-3 z-40 flex items-center gap-1.5 bg-life px-3 py-2 font-pixel text-[9px] uppercase text-paper"
        aria-label="play the board"
      >
        ▶ play
      </button>
      {boardOpen && (
        <TheBoard
          boss={binding}
          hand={quests.filter((q) => q.passesMotionTest && !q.done && !q.isBinding)}
          match={match}
          lethal={isLethal(match, !!binding)}
          onCloseQuest={toggleDone}
          onStartFocus={startFocus}
          onGiveUpFocus={giveUpFocus}
          onClose={() => setBoardOpen(false)}
        />
      )}
    </main>
  );
}
