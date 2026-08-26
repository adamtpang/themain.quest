"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Command,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Orbit,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  TimerReset,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { LifeCommandData, LifeQuest } from "@/lib/life-command-types";
import { cn } from "@/lib/utils";

const chartConfig = {
  score: { label: "Day score", color: "#00641a" },
  quests: { label: "Quests", color: "#2f9ee0" },
} satisfies ChartConfig;

const categoryTone: Record<LifeQuest["category"], string> = {
  Stability: "bg-sky/35 text-[#216083]",
  Body: "bg-grass/25 text-primary",
  Money: "bg-gold/30 text-[#755b00]",
  Love: "bg-blossom/20 text-[#9c315c]",
  Create: "bg-stream/20 text-[#12665e]",
  General: "bg-muted text-muted-foreground",
};

const navItems = [
  { href: "#today", label: "Today", icon: LayoutDashboard },
  { href: "#quests", label: "Quests", icon: ListChecks },
  { href: "#signals", label: "Signals", icon: BarChart3 },
  { href: "#life-map", label: "Life map", icon: Orbit },
];

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function SidebarContent({ data, onClose }: { data: LifeCommandData; onClose?: () => void }) {
  return (
    <div className="sidebar flex h-full flex-col bg-ink text-paper">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-10 w-10 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-paper bg-gold font-pixel text-xs text-ink">MQ</div>
        <div>
          <p className="font-semibold tracking-tight">The Main Quest</p>
          <p className="text-xs text-white/45">Life command center</p>
        </div>
        {onClose && <Button variant="ghost" size="icon" className="ml-auto text-white hover:bg-white/10" onClick={onClose}><X /></Button>}
      </div>
      <nav className="mt-5 grid gap-1 px-3">
        {navItems.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              index === 0 ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mx-4 mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Level {data.level}</span>
          <span>{data.xp} XP</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${data.levelProgress}%` }} />
        </div>
        <p className="mt-3 text-xs leading-5 text-white/45">{data.xpToNext} XP until the next level.</p>
      </div>

      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-3">
          <Avatar className="h-9 w-9 border-0 bg-sky text-ink">
            <AvatarFallback className="bg-sky font-semibold text-ink">AP</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Private player</p>
            <p className="truncate text-xs text-white/40">OAuth protected</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/55 hover:bg-white/10 hover:text-white" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <Card className="card metric quest-card bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label text-sm font-medium text-muted-foreground">{label}</p>
            <p className="value mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="card-desc mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", tone)}><Icon className="h-4 w-4" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LifeCommandCenter({ initialData }: { initialData: LifeCommandData }) {
  const [data, setData] = useState(initialData);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedQuestId, setSelectedQuestId] = useState(initialData.quests.find((q) => !q.completed)?.id ?? initialData.quests[0]?.id);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedQuest = data.quests.find((quest) => quest.id === selectedQuestId) ?? data.quests.find((quest) => !quest.completed) ?? data.quests[0];
  const topOpenQuest = data.quests.find((quest) => !quest.completed);

  useEffect(() => {
    const saved = localStorage.getItem("tmq.command.theme");
    const nextTheme = saved === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  useEffect(() => {
    if (!focusRunning) return;
    const id = window.setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusRunning]);

  const completionRate = useMemo(() => {
    if (!data.quests.length) return 0;
    return Math.round((data.completedToday / data.quests.length) * 100);
  }, [data.completedToday, data.quests.length]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("tmq.command.theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  async function toggleQuest(quest: LifeQuest, completed: boolean) {
    if (savingId) return;
    setSavingId(quest.id);
    setError(null);
    const previous = data;
    const xpDelta = completed ? quest.xp : -quest.xp;
    setData((current) => ({
      ...current,
      quests: current.quests.map((item) => item.id === quest.id ? { ...item, completed } : item),
      xp: Math.max(0, current.xp + xpDelta),
      completedToday: Math.max(0, current.completedToday + (completed ? 1 : -1)),
      todayScore: Math.max(5, Math.min(10, current.todayScore + (completed ? 1 : -1))),
    }));
    if (completed) {
      setFlash(`+${quest.xp} XP`);
      window.setTimeout(() => setFlash(null), 1200);
    }
    try {
      const response = await fetch("/api/life-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "toggleQuest", id: quest.id, completed }),
      });
      if (!response.ok) throw new Error("Progress could not be saved");
      const payload = await response.json();
      setData(payload.data);
    } catch (cause) {
      setData(previous);
      setError(cause instanceof Error ? cause.message : "Progress could not be saved");
    } finally {
      setSavingId(null);
    }
  }

  async function syncVault() {
    setError(null);
    try {
      const response = await fetch("/api/life-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "syncSnapshot" }),
      });
      if (!response.ok) throw new Error("Vault snapshot could not be synced");
      const payload = await response.json();
      setData(payload.data);
      setFlash("Vault synced");
      window.setTimeout(() => setFlash(null), 1200);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Vault snapshot could not be synced");
    }
  }

  function resetTimer() {
    setFocusRunning(false);
    setFocusSeconds(25 * 60);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block"><SidebarContent data={data} /></aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b-[3px] border-border bg-background/88 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-0 p-0"><SidebarContent data={data} /></SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Life Command</p>
              <p className="hidden text-xs text-muted-foreground sm:block">One source of truth from century to next action</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                <span className={cn("h-2 w-2 rounded-full", data.source === "starter" ? "bg-taxes" : "bg-primary")} />
                {data.source === "vault" ? "Live vault" : data.source === "neon" ? "Synced vault" : "Starter data"}
              </div>
              {data.source === "vault" && <Button variant="outline" size="sm" onClick={syncVault}><RefreshCw /> <span className="hidden sm:inline">Sync</span></Button>}
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle color theme">
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {flash && <div className="quest-button fixed right-5 top-20 z-50 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{flash}</div>}
          {error && <div className="mb-5 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}

          <section id="today" className="scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Private player one</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Make today count.</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{data.northStar}</p>
              </div>
              <p className="text-xs text-muted-foreground">Updated {new Date(data.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
            </div>

            <Card className="quest-card relative mt-6 overflow-hidden border-ink bg-ink text-paper dark:border-primary/30 dark:bg-card">
              <div className="world-sun absolute -right-10 -top-12 h-40 w-40 opacity-20" />
              <CardContent className="relative grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-2 border-ink bg-gold text-ink hover:bg-gold">Main quest</Badge>
                    {topOpenQuest && <Badge variant="outline" className="border-paper/20 text-paper/65">Tier {topOpenQuest.tier} · inaction {topOpenQuest.inactionCost}/10</Badge>}
                  </div>
                  <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{topOpenQuest?.title ?? "All current quests are closed"}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/55">
                    {topOpenQuest?.steps[0] ?? "Choose the next meaningful outcome from the life map."}
                  </p>
                  {topOpenQuest?.route && <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-paper/10 bg-paper/[0.06] px-3 py-2 text-xs text-paper/55"><Command className="h-3.5 w-3.5" /> Route to {topOpenQuest.route}</div>}
                </div>
                <div className="flex min-w-[220px] flex-col gap-3 rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/15 bg-paper/[0.05] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-paper/45">Focus strike</span>
                    <Swords className="h-4 w-4 text-gold" />
                  </div>
                  <p className="font-mono text-4xl font-semibold tabular-nums">{formatTimer(focusSeconds)}</p>
                  <div className="flex gap-2">
                    <Button className="quest-button btn-primary flex-1 bg-gold text-ink hover:bg-gold/90" onClick={() => setFocusRunning((running) => !running)} disabled={!topOpenQuest}>
                      {focusRunning ? <><Clock3 /> Pause</> : <><Play /> Start</>}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full border-paper/20 bg-transparent text-paper hover:bg-paper/10 hover:text-paper" onClick={resetTimer}><TimerReset /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="section-cards mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <MetricCard label="Today score" value={`${data.todayScore}/10`} detail={`${data.completedToday} real closes`} icon={Trophy} tone="bg-gold/30 text-[#755b00]" />
              <MetricCard label="Current XP" value={data.xp.toLocaleString()} detail={`Level ${data.level} · ${data.xpToNext} to next`} icon={Zap} tone="bg-blossom/20 text-[#9c315c]" />
              <MetricCard label="High-tier open" value={String(data.quests.filter((quest) => !quest.completed).length)} detail={`${data.laterCount} safely parked`} icon={ListChecks} tone="bg-sky/35 text-[#216083]" />
              <MetricCard label="Life remaining" value={`${data.life.yearsLeft.toFixed(1)}y`} detail={`${data.life.daysLeft.toLocaleString()} days · 100-year map`} icon={Orbit} tone="bg-grass/25 text-primary" />
            </div>
          </section>

          <section id="signals" className="mt-6 scroll-mt-24 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
            <Card className="quest-card bg-card">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <div><CardTitle>Seven-day momentum</CardTitle><CardDescription>Day score and completed quests from real closes.</CardDescription></div>
                <Badge variant="secondary">{completionRate}% today</Badge>
              </CardHeader>
              <CardContent className="pt-3">
                <ChartContainer config={chartConfig} className="h-[260px] w-full aspect-auto">
                  <AreaChart data={data.trend} margin={{ left: 2, right: 8, top: 12 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area type="monotone" dataKey="score" stroke="var(--color-score)" fill="url(#scoreFill)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-score)" }} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="quest-card bg-card">
              <CardHeader><CardTitle>Life balance</CardTitle><CardDescription>Completion by active life domain, not mood estimates.</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {data.pillars.map((pillar) => (
                  <div key={pillar.name}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">{pillar.name}</span><span className="text-xs text-muted-foreground">{pillar.completed} done · {pillar.open} open</span></div>
                    <Progress value={pillar.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="quests" className="mt-6 scroll-mt-24 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <Card className="quest-card bg-card">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div><CardTitle>Quick progress quests</CardTitle><CardDescription>High-tier outcomes first. Motion and parked work stay below the fold.</CardDescription></div>
                <Badge variant="outline">{data.completedToday}/{data.quests.length}</Badge>
              </CardHeader>
              <CardContent className="grid gap-2">
                {data.quests.map((quest, index) => (
                  <div
                    key={quest.id}
                    role="button"
                    tabIndex={0}
                    className={cn("group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors hover:bg-muted/55", selectedQuest?.id === quest.id && "border-primary/40 bg-secondary/55", quest.completed && "opacity-65")}
                    onClick={() => setSelectedQuestId(quest.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedQuestId(quest.id);
                    }}
                  >
                    <Checkbox
                      checked={quest.completed}
                      disabled={savingId === quest.id}
                      onCheckedChange={(checked) => toggleQuest(quest, checked === true)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Mark ${quest.title} complete`}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base">{quest.emoji}</span>
                        <p className={cn("font-medium leading-5", quest.completed && "line-through")}>{quest.title}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", categoryTone[quest.category])}>{quest.category}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">#{index + 1} · Tier {quest.tier} · {quest.xp} XP · inaction {quest.inactionCost}/10</p>
                    </div>
                    {quest.completed ? <Check className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="quest-card bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary"><Brain className="h-3.5 w-3.5" /> Clarity layer</div>
                <CardTitle className="pt-2">{selectedQuest?.title ?? "Choose a quest"}</CardTitle>
                <CardDescription>{selectedQuest?.doneWhen}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {(selectedQuest?.steps ?? []).slice(0, 5).map((step, index) => (
                    <div key={step} className="flex gap-3 text-sm leading-5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">{index + 1}</span><span>{step}</span></div>
                  ))}
                </div>
                {selectedQuest && !selectedQuest.completed && (
                  <Button className="quest-button mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toggleQuest(selectedQuest, true)}>
                    <Sparkles /> Claim {selectedQuest.xp} XP
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>

          <section id="life-map" className="mt-6 scroll-mt-24">
            <Card className="quest-card bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Orbit className="h-3.5 w-3.5" /> Zoom control</div>
                <CardTitle className="pt-2">Century to today</CardTitle>
                <CardDescription>Every short move should inherit meaning from the horizon above it.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid auto-cols-[160px] grid-flow-col gap-3 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-3 md:overflow-visible xl:grid-cols-9">
                  {data.horizons.map((horizon, index) => (
                    <div key={horizon.label} className="relative rounded-[1.1rem_0.9rem_1.2rem_1rem] border-2 bg-background/60 p-3">
                      <div className="mb-4 flex items-start justify-between gap-2"><span className="text-xs font-semibold">{horizon.label}</span><span className="font-mono text-[10px] text-muted-foreground">{Math.round(horizon.progress)}%</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${horizon.progress}%` }} /></div>
                      <p className="mt-3 text-[11px] text-muted-foreground">{horizon.detail}</p>
                      <p className="mt-1 line-clamp-3 text-xs font-medium leading-4">{horizon.focus}</p>
                      {index < data.horizons.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground xl:block" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="mt-8 flex flex-col gap-3 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Private life data is served only after authorization.</div>
            <div className="flex items-center gap-4"><span>{data.source} source</span><span>{data.laterCount} parked quests preserved</span></div>
          </footer>
        </main>
      </div>
    </div>
  );
}
