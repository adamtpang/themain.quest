"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Check,
  Clock3,
  LogOut,
  Minimize2,
  Moon,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  TimerReset,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { LifeCommandData, LifeQuest } from "@/lib/life-command-types";
import type { LifeAgentJobStatus } from "@/lib/local-life-agent";
import {
  sfxAttack,
  sfxLevelUp,
  sfxLoadMutePreference,
  sfxQuestComplete,
  sfxSetMuted,
  sfxShrink,
  sfxSkip,
  sfxTimeboxComplete,
} from "@/lib/sfx";
import { cn } from "@/lib/utils";

const timeboxOptions = [2, 5, 10, 25] as const;
const skipReasons = ["Wrong priority", "Blocked", "Not important today", "Missing context", "Energy mismatch"];

type AdaptiveMove = {
  action: string;
  permission: string;
  source: "outbox" | "ai" | "built-in";
};

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}

function mutationHeaders(capability?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(capability ? { "X-Life-Agent-Capability": capability } : {}),
  };
}

function builtInMove(quest: LifeQuest): AdaptiveMove {
  const text = `${quest.title} ${quest.steps[0] ?? ""}`.toLowerCase();
  let action = "Put the first required object or screen directly in front of you.";
  if (/shower/.test(text)) action = "Stand up and walk to the bathroom.";
  else if (/brush/.test(text)) action = "Put the toothbrush in your hand.";
  else if (/shave/.test(text)) action = "Put the razor beside the sink.";
  else if (/food|eat|meal/.test(text)) action = "Put water or the fastest available food in front of you.";
  else if (/invoice|payment|chase/.test(text)) action = "Open the live payment source and stop.";
  else if (/message|call|request|birthday/.test(text)) action = "Open the saved brief for context only.";
  else if (/housing|apartment|lodging/.test(text)) action = "Open the existing housing note and stop.";
  else if (/publish|post|listing/.test(text)) action = "Open the saved draft and stop.";
  else if (/record|music|song|guitar/.test(text)) action = "Open the simplest recorder and stop.";
  else if (/clean|desk|move|zone|cable|electronics/.test(text)) action = "Put one hand on one object involved in the quest.";
  else if (quest.route) action = `Open ${quest.route} and stop.`;
  return {
    action,
    permission: "This setup move is the whole win. You may stop immediately afterward.",
    source: "built-in",
  };
}

function initialMove(quest: LifeQuest): AdaptiveMove {
  return {
    action: quest.steps[0] ?? quest.title,
    permission: "Only this move is in play. The rest stays hidden until needed.",
    source: "outbox",
  };
}

export function LifeCommandCenter({
  initialData,
  authMode,
}: {
  initialData: LifeCommandData;
  authMode: "clerk" | "dev-bypass";
}) {
  const [data, setData] = useState(initialData);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const [timeboxMinutes, setTimeboxMinutes] = useState<(typeof timeboxOptions)[number]>(5);
  const [adaptiveMoves, setAdaptiveMoves] = useState<Record<string, AdaptiveMove>>({});
  const [saving, setSaving] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [processStatus, setProcessStatus] = useState<LifeAgentJobStatus | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeQuest = data.quests.find((quest) => !quest.completed && !quest.skipped);
  const move = activeQuest ? adaptiveMoves[activeQuest.id] ?? initialMove(activeQuest) : null;
  const focusLimitSeconds = timeboxMinutes * 60;
  const focusProgress = Math.min(100, (focusSeconds / focusLimitSeconds) * 100);
  const openCount = data.quests.filter((quest) => !quest.completed).length;
  const skippedCount = data.quests.filter((quest) => quest.skipped && !quest.completed).length;
  const processUnavailable = processStatus?.state === "unavailable";
  const processRunning = processStatus?.state === "running";
  const processCapability = processStatus?.capability;
  const loopStage = useMemo(() => {
    if (!activeQuest || flash?.startsWith("+")) return 3;
    if (focusSeconds === 0) return 0;
    if (focusRunning) return 1;
    return 2;
  }, [activeQuest, flash, focusRunning, focusSeconds]);

  const flowState = useMemo(() => {
    if (!activeQuest) return "clear";
    if (move?.source === "ai" || move?.source === "built-in") return "rebalanced";
    if (focusRunning) return "in motion";
    return "ready";
  }, [activeQuest, focusRunning, move?.source]);

  useEffect(() => {
    const saved = localStorage.getItem("tmq.command.theme");
    const nextTheme = saved === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    const savedTimebox = Number(localStorage.getItem("tmq.command.timebox"));
    if (timeboxOptions.some((minutes) => minutes === savedTimebox)) {
      setTimeboxMinutes(savedTimebox as (typeof timeboxOptions)[number]);
    }
    setSoundMuted(sfxLoadMutePreference());
    void fetch("/api/life-agent")
      .then((response) => response.json())
      .then((status: LifeAgentJobStatus) => setProcessStatus(status))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!focusRunning) return;
    const id = window.setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds + 1 >= focusLimitSeconds) {
          setFocusRunning(false);
          sfxTimeboxComplete();
          setFlash("Timebox complete. Choose done, smaller, or another round.");
          window.setTimeout(() => setFlash(null), 2400);
          return focusLimitSeconds;
        }
        return seconds + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusLimitSeconds, focusRunning]);

  useEffect(() => {
    if (processStatus?.state !== "running") return;
    const id = window.setInterval(async () => {
      try {
        const response = await fetch("/api/life-agent", { cache: "no-store" });
        const status = await response.json() as LifeAgentJobStatus;
        setProcessStatus(status);
        if (status.state === "complete") {
          const dataResponse = await fetch("/api/life-state", { cache: "no-store" });
          const payload = await dataResponse.json();
          if (!dataResponse.ok) throw new Error(payload.error ?? "The processed outbox could not be refreshed");
          setData(payload);
          setAdaptiveMoves({});
          setFocusRunning(false);
          setFocusSeconds(0);
          setFlash("Vault processed and synced. Your next quest is ready.");
          window.setTimeout(() => setFlash(null), 2200);
        } else if (status.state === "failed") {
          const dataResponse = await fetch("/api/life-state", { cache: "no-store" });
          if (dataResponse.ok) setData(await dataResponse.json());
          setError(status.message);
        }
      } catch {
        setError("Process status could not be refreshed");
      }
    }, 2500);
    return () => window.clearInterval(id);
  }, [processCapability, processStatus?.state]);

  useEffect(() => {
    setFocusRunning(false);
    setFocusSeconds(0);
  }, [activeQuest?.id]);

  function showFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 1800);
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("tmq.command.theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function chooseTimebox(minutes: (typeof timeboxOptions)[number]) {
    setTimeboxMinutes(minutes);
    localStorage.setItem("tmq.command.timebox", String(minutes));
    setFocusRunning(false);
    setFocusSeconds(0);
  }

  function toggleSound() {
    setSoundMuted((current) => sfxSetMuted(!current));
  }

  function toggleFocus() {
    if (focusRunning) {
      setFocusRunning(false);
      return;
    }
    sfxAttack();
    setFocusRunning(true);
  }

  async function runProcess() {
    if (processRunning || processUnavailable || !processCapability) return;
    setError(null);
    try {
      const response = await fetch("/api/life-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Life-Agent-Capability": processCapability },
        body: JSON.stringify({ action: "process" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Process could not start");
      setProcessStatus({ ...payload, capability: processCapability });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Process could not start");
    }
  }

  async function makeSmaller() {
    if (!activeQuest || shrinking) return;
    setShrinking(true);
    setError(null);
    chooseTimebox(2);
    try {
      const response = await fetch("/api/life-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(processCapability ? { "X-Life-Agent-Capability": processCapability } : {}),
        },
        body: JSON.stringify({ action: "shrink", questId: activeQuest.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "AI could not reduce the quest");
      setAdaptiveMoves((current) => ({
        ...current,
        [activeQuest.id]: { ...payload.move, source: "ai" },
      }));
      setData(payload.data);
      sfxShrink();
      showFlash("Challenge rebalanced");
    } catch (cause) {
      const fallback = builtInMove(activeQuest);
      setAdaptiveMoves((current) => ({ ...current, [activeQuest.id]: fallback }));
      try {
        const fallbackResponse = await fetch("/api/life-state", {
          method: "POST",
          headers: mutationHeaders(processCapability),
          body: JSON.stringify({
            type: "recordAdjustment",
            id: activeQuest.id,
            action: fallback.action,
            source: "built-in",
            timeboxMinutes: 2,
          }),
        });
        const fallbackPayload = await fallbackResponse.json();
        if (!fallbackResponse.ok) throw new Error(fallbackPayload.error ?? "Learning could not be saved");
        setData(fallbackPayload.data);
        sfxShrink();
        setError(`${cause instanceof Error ? cause.message : "AI is unavailable"}. A built-in smaller move was saved.`);
      } catch {
        setError(`${cause instanceof Error ? cause.message : "AI is unavailable"}. A temporary smaller move is ready, but learning was not saved.`);
      }
    } finally {
      setShrinking(false);
    }
  }

  async function skipQuest() {
    if (!activeQuest || !skipReason.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/life-state", {
        method: "POST",
        headers: mutationHeaders(processCapability),
        body: JSON.stringify({ type: "skipQuest", id: activeQuest.id, reason: skipReason }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "The quest could not be skipped");
      setData(payload.data);
      setSkipOpen(false);
      setSkipReason("");
      sfxSkip();
      showFlash("Reason saved. The next quest is up.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The quest could not be skipped");
    } finally {
      setSaving(false);
    }
  }

  async function completeQuest() {
    if (!activeQuest || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/life-state", {
        method: "POST",
        headers: mutationHeaders(processCapability),
        body: JSON.stringify({
          type: "toggleQuest",
          id: activeQuest.id,
          completed: true,
          timeboxMinutes,
          elapsedSeconds: focusSeconds,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Progress could not be saved");
      const nextData = payload.data as LifeCommandData;
      setData(nextData);
      setFocusRunning(false);
      setFocusSeconds(0);
      if (nextData.level > data.level) sfxLevelUp();
      else sfxQuestComplete();
      showFlash(`+${activeQuest.xp} XP. Next quest loaded.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Progress could not be saved");
    } finally {
      setSaving(false);
    }
  }

  function resetMove() {
    if (!activeQuest) return;
    setAdaptiveMoves((current) => {
      const next = { ...current };
      delete next[activeQuest.id];
      return next;
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="world-sun pointer-events-none absolute -right-12 -top-14 h-48 w-48 opacity-80" />
      <div className="world-hill pointer-events-none absolute -bottom-32 -left-40 h-72 w-[42rem] opacity-30" />
      <div className="world-hill pointer-events-none absolute -bottom-44 right-[-12rem] h-80 w-[48rem] opacity-25" />

      <header className="relative z-20 border-b-[3px] border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <div className="flex h-10 w-10 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-ink bg-gold font-pixel text-xs text-ink">MQ</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">The Main Quest</p>
            <p className="truncate text-xs text-muted-foreground">One thing at a time</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button className="quest-button bg-primary text-primary-foreground hover:bg-primary/90" size="sm" onClick={runProcess} disabled={processRunning || processUnavailable || !processStatus} title={processUnavailable ? "Process runs from the local desktop bridge" : undefined}>
              <RefreshCw className={cn(processRunning && "animate-spin")} />
              {processRunning ? "Processing vault" : processUnavailable ? "Desktop vault Process" : "Process vault"}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle color theme">
              {theme === "light" ? <Moon /> : <Sun />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleSound} aria-label={soundMuted ? "Turn sound on" : "Mute sound"} title={soundMuted ? "Turn sound on" : "Mute sound"}>
              {soundMuted ? <VolumeX /> : <Volume2 />}
            </Button>
            {authMode === "clerk" ? (
              <SignOutButton redirectUrl="/">
                <Button variant="ghost" size="icon" aria-label="Sign out"><LogOut /></Button>
              </SignOutButton>
            ) : (
              <Button asChild variant="ghost" size="icon" aria-label="Exit local preview"><Link href="/"><LogOut /></Link></Button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        {flash && <div aria-live="polite" className="quest-button fixed right-4 top-20 z-50 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{flash}</div>}
        {error && (
          <div className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between rounded-2xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
          </div>
        )}
        {data.statusMessage && (
          <div className="mx-auto mb-4 w-full max-w-3xl rounded-2xl border-2 border-gold/40 bg-gold/10 px-4 py-3 text-sm text-foreground">
            {data.statusMessage}
          </div>
        )}

        <div className="mx-auto mb-4 flex w-full max-w-3xl flex-wrap items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="rounded-full border-2 border-ink bg-gold px-3 py-1.5 text-ink">Level {data.level}</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-gold">✦</span>{data.xp} XP</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-primary">●</span>Day {data.todayScore}/10</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-grass">◆</span>{data.completedToday} cleared today</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-primary">●</span>Clear goal</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-sky">●</span>Immediate feedback</span>
          <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1.5 text-gold">●</span>Challenge {flowState}</span>
        </div>

        <div className="mx-auto mb-4 grid w-full max-w-3xl grid-cols-4 overflow-hidden rounded-2xl border-2 bg-card/85 text-center shadow-sm" aria-label="Quest loop">
          {["Enter", "Act", "Prove", "Return"].map((label, index) => (
            <div key={label} className={cn("border-r px-2 py-2.5 last:border-r-0", loopStage === index && "bg-gold text-ink")}>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]">{index + 1}</p>
              <p className="mt-0.5 text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>

        <Card className="quest-card mx-auto w-full max-w-3xl overflow-hidden border-ink bg-ink text-paper dark:border-primary/30 dark:bg-card">
          <CardContent className="p-5 sm:p-8">
            {activeQuest && move ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-2 border-ink bg-gold text-ink hover:bg-gold">Next quest</Badge>
                  <Badge variant="outline" className="border-paper/20 text-paper/65">Tier {activeQuest.tier}</Badge>
                  <Badge variant="outline" className="border-paper/20 text-paper/65">{openCount} open</Badge>
                  {move.source !== "outbox" && <Badge variant="outline" className="border-sky/40 bg-sky/10 text-sky">{move.source === "ai" ? "AI tuned" : "Smaller move"}</Badge>}
                </div>

                <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{activeQuest.emoji} {activeQuest.title}</h1>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border-2 border-paper/10 bg-paper/[0.05] p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Clear goal</p>
                    <p className="mt-2 text-base leading-7 text-paper/75">{activeQuest.doneWhen}</p>
                  </div>
                  <div className="rounded-2xl border-2 border-sky/25 bg-sky/10 p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky">Do this now</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-paper">{move.action}</p>
                    <p className="mt-2 text-base leading-7 text-paper/60">{move.permission}</p>
                  </div>
                </div>

                {activeQuest.route && <p className="mt-4 text-xs text-paper/45">Route: {activeQuest.route}</p>}

                <div className="mt-6 rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/15 bg-paper/[0.05] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/45">Immediate feedback</p>
                      <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">{formatTimer(focusSeconds)}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {timeboxOptions.map((minutes) => (
                        <button key={minutes} type="button" onClick={() => chooseTimebox(minutes)} className={cn("min-h-11 min-w-11 rounded-lg border px-2 py-1.5 font-mono text-xs transition-colors", timeboxMinutes === minutes ? "border-gold bg-gold text-ink" : "border-paper/15 text-paper/50 hover:bg-paper/10")}>{minutes}m</button>
                      ))}
                    </div>
                  </div>
                  <Progress value={focusProgress} className="mt-4 h-2 bg-paper/10" />
                  <div className="mt-4 flex gap-2">
                    <Button className="quest-button flex-1 bg-gold text-ink hover:bg-gold/90" onClick={toggleFocus}>
                      {focusRunning ? <><Clock3 /> Pause</> : <><Play /> Start {timeboxMinutes}m</>}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full border-paper/20 bg-transparent text-paper hover:bg-paper/10 hover:text-paper" onClick={() => { setFocusRunning(false); setFocusSeconds(0); }} aria-label="Reset stopwatch"><TimerReset /></Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="quest-button border-paper/25 bg-transparent text-paper hover:bg-paper/10 hover:text-paper" onClick={makeSmaller} disabled={shrinking}>
                    {shrinking ? <RefreshCw className="animate-spin" /> : <Minimize2 />} {shrinking ? "AI is shrinking it" : "Too hard? Make it smaller"}
                  </Button>
                  <Button variant="outline" className="quest-button border-paper/25 bg-transparent text-paper hover:bg-paper/10 hover:text-paper" onClick={() => setSkipOpen(true)}>
                    <Brain /> Skip and explain why
                  </Button>
                </div>

                {move.source !== "outbox" && (
                  <Button variant="ghost" className="mt-2 w-full text-paper/55 hover:bg-paper/10 hover:text-paper" onClick={resetMove}>
                    <RotateCcw /> Restore the outbox action
                  </Button>
                )}

                <Button className="quest-button mt-4 h-12 w-full bg-grass text-base font-semibold text-ink hover:bg-grass/90" onClick={completeQuest} disabled={saving}>
                  <Sparkles /> Done. Claim {activeQuest.xp} XP
                </Button>
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-paper/15 bg-paper/10"><Check className="h-8 w-8 text-grass" /></div>
                <h1 className="mt-5 text-3xl font-semibold">{openCount === 0 ? "The outbox is clear." : "No quest feels right."}</h1>
                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-paper/60">
                  {openCount === 0 ? "Process again when new vault captures arrive." : `${skippedCount} quest${skippedCount === 1 ? " was" : "s were"} skipped with reasons saved. Process the vault to reconsider the day.`}
                </p>
                <Button className="quest-button mt-6 bg-gold text-ink hover:bg-gold/90" onClick={runProcess} disabled={processRunning || processUnavailable || !processStatus} title={processUnavailable ? "Process runs from the local desktop bridge" : undefined}>
                  <RefreshCw className={cn(processRunning && "animate-spin")} /> {processRunning ? "Processing vault" : processUnavailable ? "Open the local desktop to Process" : "Process the vault"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-2 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {data.source === "vault" ? "Live private outbox" : data.source === "neon" ? "Private synced outbox" : "Starter quests"}</div>
          <div className="flex flex-wrap items-center gap-3">
            <span>Updated {formatUpdatedAt(data.generatedAt)}</span>
            <span>{data.flowLearning.skipsRecorded} skips learned</span>
            <span>{data.flowLearning.adjustmentsRecorded} difficulty adjustments</span>
          </div>
        </div>

        {processStatus && processStatus.state !== "idle" && processStatus.state !== "unavailable" && (
          <div className={cn("mx-auto mt-3 w-full max-w-3xl rounded-2xl border px-4 py-3 text-xs", processStatus.state === "failed" ? "border-destructive/30 bg-destructive/10 text-destructive" : "bg-card/80 text-muted-foreground")}>
            <span className="font-semibold text-foreground">Vault Process: </span>{processStatus.message}
          </div>
        )}
      </main>

      <Sheet open={skipOpen} onOpenChange={setSkipOpen}>
        <SheetContent side="bottom" className="mx-auto rounded-t-[2rem] border-[3px] border-b-0 sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2">
          <SheetHeader>
            <SheetTitle>Why is this not the right next quest?</SheetTitle>
            <SheetDescription>Your answer skips nothing permanently. It teaches the coach and brings up the next preserved quest.</SheetDescription>
          </SheetHeader>
          <div className="mt-5 flex flex-wrap gap-2">
            {skipReasons.map((reason) => (
              <button key={reason} type="button" onClick={() => setSkipReason(reason)} className={cn("rounded-full border-2 px-3 py-2 text-xs font-semibold transition-colors", skipReason === reason ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{reason}</button>
            ))}
          </div>
          <label className="mt-5 block text-sm font-medium" htmlFor="skip-reason">Explain in your own words</label>
          <textarea
            id="skip-reason"
            value={skipReason}
            onChange={(event) => setSkipReason(event.target.value)}
            placeholder="This is blocked because..."
            className="mt-2 min-h-28 w-full resize-none rounded-2xl border-2 bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            maxLength={500}
          />
          <SheetFooter className="mt-5 gap-2">
            <Button variant="outline" onClick={() => setSkipOpen(false)}>Keep this quest</Button>
            <Button onClick={skipQuest} disabled={!skipReason.trim() || saving}>Save reason and show next</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
