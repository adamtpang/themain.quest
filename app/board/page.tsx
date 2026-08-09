"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AffirmationBanner } from "@/components/AffirmationBanner";
import { BindingGoal } from "@/components/BindingGoal";
import { FirstRunBanner } from "@/components/FirstRunBanner";
import { ClimbPanel } from "@/components/ClimbPanel";
import { UnlocksPanel } from "@/components/UnlocksPanel";
import { FinnChat } from "@/components/FinnChat";
import { Header } from "@/components/Header";
import { LensCards } from "@/components/LensCards";
import { LuckPanel } from "@/components/LuckPanel";
import { MatchPanel } from "@/components/MatchPanel";
import { MentorPanel } from "@/components/MentorPanel";
import { PomodoroLine } from "@/components/PomodoroLine";
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
  BREAK_MINUTES,
  crystalsLeft,
  DEFAULT_BOSS_HP,
  DEFAULT_CRYSTALS,
  FlowRating,
  FOCUS_MINUTES,
  freshMatch,
  isLethal,
  matchPhase,
  MatchState,
  SHIP_XP,
} from "@/lib/match";
import { defaultProblems, Problem } from "@/lib/problems";
import {
  freshPillarProgress,
  levelForXp,
  overallLevelFromPillars,
  PillarProgress,
  rankForLevel,
  XP_BOSS_BONUS,
  XP_PER_QUEST,
} from "@/lib/progress";
import { freshLadder, LadderRecord, recordResult } from "@/lib/ladder";
import { synergyBonus } from "@/lib/party";
import { bonusCrystals } from "@/lib/unlocks";
import { freshSeasonState, recordSeasonResult, SeasonState } from "@/lib/season";
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
const LADDER_KEY = "tmq.ladder";
const SEASON_KEY = "tmq.season";
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
  const [progress, setProgress, progressHydrated] = useLocalStorage<PillarProgress>(
    PROGRESS_KEY,
    freshPillarProgress()
  );
  const [match, setMatch, matchHydrated] = useLocalStorage<MatchState>(
    MATCH_KEY,
    freshMatch(todayStr(), DEFAULT_CRYSTALS + bonusCrystals(levelForXp(progress.Health)))
  );
  const [streak, setStreak, streakHydrated] = useLocalStorage<Streak>(STREAK_KEY, freshStreak());
  const [ladder, setLadder] = useLocalStorage<LadderRecord>(LADDER_KEY, freshLadder());
  const [season, setSeason] = useLocalStorage<SeasonState>(SEASON_KEY, freshSeasonState(todayStr()));
  // The app opens INTO the match, Hearthstone-style. The x leads back to camp.
  const [boardOpen, setBoardOpen] = useState(false);
  const resolveGuard = useRef(false);

  // Every day boots at 5/10: reset rungs when the date rolls over. The
  // instant before that reset is the only moment a day's final score is
  // known, so that is where the ladder judges it — W if it hit the winning
  // score (3+ rungs), L otherwise. A day judges itself exactly once.
  useEffect(() => {
    if (!dayHydrated) return;
    const today = todayStr();
    if (day.date !== today) {
      const finalScore = computeScore(day);
      setLadder((l) => recordResult(l, day.date, finalScore.isWinning));
      setSeason((s) => recordSeasonResult(s, day.date, finalScore.isWinning));
      setDay({ date: today, rungs: freshRungs() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayHydrated, day.date]);

  const score = useMemo(() => computeScore(day), [day]);
  const binding = useMemo(() => bindingGoal(quests), [quests]);
  const recommended = useMemo(() => recommendedBinding(quests), [quests]);
  // Everything below is an OUTCOME of playing, not an entry point. Until
  // there's at least one quest, showing all of it at once is exactly the
  // "I don't get how to use this" complaint — so it stays hidden behind the
  // one clear first action (FirstRunBanner -> load the outbox).
  const hasQuests = quests.length > 0;

  // One-time shape upgrade: older saves lack the pomodoro fields and carry the
  // 50-minute economy. One old block = two pomodoro pips, clamped so a half-dead
  // boss cannot auto-kill on first paint.
  useEffect(() => {
    if (!matchHydrated) return;
    if ((match as Partial<MatchState>).awaitingResolve === undefined) {
      setMatch((m) => ({
        ...freshMatch(m.date),
        ...m,
        crystals: DEFAULT_CRYSTALS,
        spent: Math.min(m.spent * 2, DEFAULT_CRYSTALS),
        bossHpMax: DEFAULT_BOSS_HP,
        bossHpDone: Math.min(m.bossHpDone * 2, DEFAULT_BOSS_HP),
        focusEndsAt: null, // an in-flight legacy block is forfeited, not half-imported
        focusQuestId: null,
        focusGoal: null,
        awaitingResolve: false,
        breakEndsAt: null,
        lastRating: null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated]);

  // The match resets daily, and the boss HP tracks whichever goal is crowned.
  // Waits on progressHydrated too: bonusCrystals(levelForXp(progress.Health)) must read
  // the real hydrated value, not the pre-hydration default, or the day's
  // crystal count locks in wrong for the rest of the day.
  useEffect(() => {
    if (!matchHydrated || !progressHydrated) return;
    const today = todayStr();
    if (match.date !== today) {
      setMatch(freshMatch(today, DEFAULT_CRYSTALS + bonusCrystals(levelForXp(progress.Health))));
      return;
    }
    if (binding && match.bossId !== binding.id) {
      // Swapping the crown mid-turn is a concede: the live turn burns its
      // crystal, and no pending check-in survives against the new boss.
      setMatch((m) => {
        const turnLive = m.focusEndsAt !== null || m.awaitingResolve;
        return {
          ...m,
          bossId: binding.id,
          bossHpMax: DEFAULT_BOSS_HP,
          bossHpDone: 0,
          spent: turnLive ? m.spent + 1 : m.spent,
          focusEndsAt: null,
          focusQuestId: null,
          focusGoal: null,
          awaitingResolve: false,
          breakEndsAt: null,
        };
      });
    } else if (!binding && (match.focusEndsAt || match.awaitingResolve)) {
      // Clearing the crown mid-turn is a concede too. No invisible timers
      // ticking behind the empty field. (A normal kill resolves the turn
      // before unbinding, so it never lands here.)
      setMatch((m) => {
        if (!m.focusEndsAt && !m.awaitingResolve) return m;
        return {
          ...m,
          spent: m.spent + 1,
          focusEndsAt: null,
          focusQuestId: null,
          focusGoal: null,
          awaitingResolve: false,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, progressHydrated, match.date, binding?.id, match.focusEndsAt, match.awaitingResolve]);

  // The rope: when the turn timer runs out (even if we were away), the turn ends
  // and waits for the check-in. Damage lands on the resolve tap, never silently.
  useEffect(() => {
    if (!matchHydrated || !match.focusEndsAt) return;
    const check = () => {
      if (Date.now() >= match.focusEndsAt!) {
        setMatch((m) => (m.focusEndsAt ? { ...m, focusEndsAt: null, awaitingResolve: true } : m));
      }
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, match.focusEndsAt]);

  // A finished break clears itself, so intervals stop and the phase is honest
  // even if nobody taps anything.
  useEffect(() => {
    if (!matchHydrated || !match.breakEndsAt) return;
    const check = () => {
      setMatch((m) => (m.breakEndsAt && Date.now() >= m.breakEndsAt ? { ...m, breakEndsAt: null } : m));
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchHydrated, match.breakEndsAt]);

  // Midnight is real even in a tab left open: a slow tick rolls the day over,
  // so a session crossing 12am gets its fresh rungs and fresh match.
  useEffect(() => {
    if (!dayHydrated || !matchHydrated || !progressHydrated) return;
    const id = setInterval(() => {
      const today = todayStr();
      setDay((d) => (d.date !== today ? { date: today, rungs: freshRungs() } : d));
      setMatch((m) =>
        m.date !== today ? freshMatch(today, DEFAULT_CRYSTALS + bonusCrystals(levelForXp(progress.Health))) : m
      );
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayHydrated, matchHydrated, progressHydrated]);

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
      rank: rankForLevel(overallLevelFromPillars(progress)).current.name,
      level: overallLevelFromPillars(progress),
      lifetimeXp: progress.Health + progress.Wealth + progress.Wisdom,
      streak: streak.current,
      bestStreak: streak.best,
      ladder: { wins: ladder.wins, losses: ladder.losses },
      season: {
        number: season.current.number,
        wins: season.current.wins,
        losses: season.current.losses,
      },
      match: {
        phase: matchPhase(match, !!binding, Date.now()),
        crystalsLeft: crystalsLeft(match),
        bossHpRemaining: binding ? bossRemaining(match) : null,
        lethal: isLethal(match, !!binding),
        turnGoal: match.focusGoal,
        lastRating: match.lastRating,
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
    [score, binding, recommended, day, quests, problems, schools, progress, match, streak, ladder, season]
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
    const baseGain = award ? XP_PER_QUEST + (wasBinding ? XP_BOSS_BONUS : 0) : 0;
    // Party synergy: a real close done WITH a named person earns bonus XP on
    // top, Overwatch-style team comp over solo play (lib/party.ts).
    const xpGain = baseGain > 0 && q.party ? baseGain + synergyBonus(baseGain) : baseGain;
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
      // Life/Visa/Loops priorities carry no pillar (untracked infra, per
      // LIFE_GAME.md) — their closes still level a school below, but they do
      // not feed the Health/Wealth/Wisdom gate.
      if (q.pillar) {
        const pillar = q.pillar;
        setProgress((p) => ({ ...p, [pillar]: p[pillar] + xpGain }));
      }
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
  // The check-in ends the turn: spend the crystal, land the damage, log the
  // flow rating, start the opponent's turn. Guarded so a double-tap cannot
  // spend twice or pay ship XP twice.
  useEffect(() => {
    if (match.awaitingResolve || match.focusEndsAt) resolveGuard.current = false;
  }, [match.awaitingResolve, match.focusEndsAt]);

  // A turn is resolvable once its rope has run out, even in the sub-second
  // window before the tick flips awaitingResolve.
  function turnEnded(m: MatchState): boolean {
    return m.awaitingResolve || (m.focusEndsAt !== null && Date.now() >= m.focusEndsAt);
  }

  function resolveBlock(shipped: boolean, rating: FlowRating) {
    if (!turnEnded(match) || resolveGuard.current) return;
    resolveGuard.current = true;
    setMatch((m) => {
      if (!turnEnded(m)) return m;
      const onBoss = m.focusQuestId != null && m.focusQuestId === m.bossId;
      const newDone = onBoss ? Math.min(m.bossHpMax, m.bossHpDone + 1) : m.bossHpDone;
      const newSpent = m.spent + 1;
      const bossAlive = newDone < m.bossHpMax;
      const manaLeft = m.crystals - newSpent > 0;
      return {
        ...m,
        spent: newSpent,
        bossHpDone: newDone,
        focusEndsAt: null,
        awaitingResolve: false,
        focusGoal: null,
        focusQuestId: null,
        lastRating: rating,
        breakEndsAt: bossAlive && manaLeft ? Date.now() + BREAK_MINUTES * 60000 : null,
      };
    });
    if (shipped && binding?.pillar) {
      const pillar = binding.pillar;
      const shipGain = binding.party ? SHIP_XP + synergyBonus(SHIP_XP) : SHIP_XP;
      setProgress((p) => ({ ...p, [pillar]: p[pillar] + shipGain }));
    }
  }

  function startFocus(goal: string) {
    if (!binding) return;
    const g = goal.trim();
    if (!g) return; // the clear-goals gate: no turn without a named kill
    setMatch((m) => {
      if (crystalsLeft(m) <= 0 || m.focusEndsAt || m.awaitingResolve) return m;
      return {
        ...m,
        focusGoal: g,
        focusQuestId: binding.id,
        focusEndsAt: Date.now() + FOCUS_MINUTES * 60000,
        breakEndsAt: null,
      };
    });
  }

  // Conceding burns the crystal. That is what makes lethal losable, and real.
  // An expired rope belongs to the check-in, so a give-up tap racing the timer
  // at zero is a no-op, never a theft of the completed turn.
  function giveUpFocus() {
    setMatch((m) => {
      if (!m.focusEndsAt || Date.now() >= m.focusEndsAt) return m;
      return {
        ...m,
        spent: m.spent + 1,
        focusEndsAt: null,
        focusGoal: null,
        focusQuestId: null,
      };
    });
  }

  function skipBreak() {
    setMatch((m) => ({ ...m, breakEndsAt: null }));
  }

  return (
    <main className="min-h-screen pb-24">
      <Header score={score} lethal={isLethal(match, !!binding)} />
      <AffirmationBanner />
      {!hasQuests && <FirstRunBanner />}
      <BindingGoal
        binding={binding}
        recommended={recommended}
        onComplete={completeBinding}
        onPromote={setBinding}
        onClear={clearBinding}
      />
      {hasQuests && (
        <>
          <MatchPanel
            hasBoss={!!binding}
            bossTitle={binding?.title}
            match={match}
            lethal={isLethal(match, !!binding)}
            onEnter={() => setBoardOpen(true)}
          />
          <PomodoroLine quests={quests} />
          <LuckPanel />
          <MentorPanel />
          <ClimbPanel
            pillars={progress}
            ready={progressHydrated}
            streak={streak.current}
            bestStreak={streak.best}
            ladder={ladder}
            season={season}
          />
          <UnlocksPanel pillars={progress} />
        </>
      )}
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
      {hasQuests && (
        <>
          <SelfAuthoring />
          <LensCards />
          <SchoolsPanel schools={schools} />
        </>
      )}
      <footer className="mx-auto max-w-md px-3 pt-6 text-center">
        <p className="font-pixel text-[7px] uppercase leading-relaxed text-ink/70">
          the main quest · this dashboard is a Loops-tier build. now go strike the boss.
        </p>
        <p className="mt-2 font-pixel text-[7px] uppercase leading-relaxed text-ink/70">
          <a href="https://adampang.com" className="underline">built by Adam Pangelinan</a>
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
      {matchHydrated && boardOpen && (
        <TheBoard
          boss={binding}
          recommended={recommended}
          hand={quests.filter((q) => q.passesMotionTest && !q.done && !q.isBinding)}
          match={match}
          lethal={isLethal(match, !!binding)}
          onCrown={setBinding}
          onCloseQuest={toggleDone}
          onStartFocus={startFocus}
          onGiveUpFocus={giveUpFocus}
          onResolve={resolveBlock}
          onSkipBreak={skipBreak}
          onClose={() => setBoardOpen(false)}
        />
      )}
    </main>
  );
}
