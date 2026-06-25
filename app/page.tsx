"use client";

import { useEffect, useMemo } from "react";
import { AffirmationBanner } from "@/components/AffirmationBanner";
import { BindingGoal } from "@/components/BindingGoal";
import { Header } from "@/components/Header";
import { LensCards } from "@/components/LensCards";
import { QuestBoard } from "@/components/QuestBoard";
import { Rungs } from "@/components/Rungs";
import { bindingGoal, canBind, recommendedBinding } from "@/lib/board";
import { computeScore } from "@/lib/score";
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

function freshDay(): DayState {
  return { date: todayStr(), rungs: freshRungs() };
}

export default function Page() {
  const [quests, setQuests] = useLocalStorage<Quest[]>(QUESTS_KEY, []);
  const [day, setDay, dayHydrated] = useLocalStorage<DayState>(DAY_KEY, freshDay());

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

  // ----- quest handlers -----
  function addQuests(parsed: Quest[]) {
    setQuests((prev) => [...prev, ...parsed]);
  }

  function toggleDone(id: string) {
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    const done = !q.done;
    const completingBinding = done && q.isBinding;
    setQuests((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, done, isBinding: completingBinding ? false : x.isBinding }
          : x
      )
    );
    // Closing the crowned goal hits the keystone rung (Goal hit).
    if (completingBinding) setRung(KEYSTONE_RUNG, true);
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

  return (
    <main className="min-h-screen">
      <Header score={score} />
      <AffirmationBanner />
      <BindingGoal
        binding={binding}
        recommended={recommended}
        onComplete={completeBinding}
        onPromote={setBinding}
        onClear={clearBinding}
      />
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
      <LensCards />
      <footer className="mx-auto max-w-md px-4 py-6 text-center text-[10px] leading-relaxed text-hud-dim/70">
        themain.quest · this dashboard is a Loops-tier build. Now go close your #1.
      </footer>
    </main>
  );
}
