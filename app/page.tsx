import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  LockKeyhole,
  Orbit,
  Play,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const questRows = [
  { icon: "🏠", label: "Close the current stability loop", xp: "100 XP", tone: "bg-sky/45" },
  { icon: "💚", label: "Protect energy and move the body", xp: "80 XP", tone: "bg-grass/25" },
  { icon: "❤️", label: "Make one relationship stronger", xp: "80 XP", tone: "bg-blossom/20" },
];

const metrics = [
  { label: "Today", value: "8/10", icon: Trophy },
  { label: "Current XP", value: "1,240", icon: Zap },
  { label: "Open quests", value: "4", icon: Check },
  { label: "Life left", value: "76.9y", icon: Orbit },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-brand-bg">
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-[45%_55%_48%_52%] border-[3px] border-ink bg-gold font-pixel text-[9px] text-ink shadow-pix-sm">MQ</div>
          <div>
            <p className="text-sm font-bold tracking-tight">The Main Quest</p>
            <p className="text-[11px] text-muted-foreground">Your life, made playable</p>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden rounded-full sm:inline-flex"><Link href="/board">Public game</Link></Button>
          <Button asChild className="quest-button bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/life"><LockKeyhole /> Open command center</Link>
          </Button>
        </div>
      </nav>

      <section className="relative isolate mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[42rem] rounded-b-[48%] bg-sky/55 dark:bg-sky/10" />
        <div className="world-sun pointer-events-none absolute right-[7%] top-16 -z-10 hidden h-36 w-36 rotate-3 sm:block" />
        <div className="world-cloud pointer-events-none absolute left-[7%] top-32 -z-10 hidden h-12 w-40 -rotate-2 sm:block" />
        <div className="world-hill pointer-events-none absolute -bottom-24 -left-[24%] -z-10 h-64 w-[75%] rotate-2 opacity-75" />
        <div className="world-hill pointer-events-none absolute -bottom-32 -right-[28%] -z-10 h-72 w-[80%] -rotate-2 bg-grass-dark opacity-55" />

        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="rotate-[-1deg] rounded-full border-[3px] border-ink bg-card px-3 py-1 text-foreground shadow-pix-sm">
            <Sparkles className="mr-1 h-3 w-3 text-primary" /> Private AI life world
          </Badge>
          <h1 className="mt-8 text-balance text-5xl font-semibold leading-[0.93] tracking-[-0.065em] sm:text-7xl lg:text-[5.75rem]">
            See your whole life.<br />Play the next move.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            A century-scale command center that turns private context into one clear quest, visible progress, and quick wins that compound into the life you actually want.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="quest-button h-12 bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Link href="/life">Enter your world <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="quest-button h-12 bg-card px-6 text-foreground hover:bg-secondary">
              <Link href="/board"><Play /> Try the public game</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border-2 border-border bg-card/80 px-3 py-1.5"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-primary" />Single-user OAuth</span>
            <span className="rounded-full border-2 border-border bg-card/80 px-3 py-1.5"><CircleDot className="mr-1.5 inline h-3.5 w-3.5 text-stream" />Vault-backed context</span>
            <span className="rounded-full border-2 border-border bg-card/80 px-3 py-1.5"><Zap className="mr-1.5 inline h-3.5 w-3.5 text-taxes" />Real-action XP</span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="quest-card overflow-hidden border-ink bg-card">
            <div className="grid min-h-[620px] lg:grid-cols-[220px_1fr]">
              <aside className="hidden bg-ink p-5 text-paper lg:flex lg:flex-col">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-paper bg-gold font-pixel text-[8px] text-ink">MQ</div><span className="text-sm font-semibold">Life Command</span></div>
                <div className="mt-10 grid gap-2 text-sm">
                  {["Today", "Quests", "Signals", "Life map"].map((item, index) => <div key={item} className={`rounded-2xl px-3 py-2.5 ${index === 0 ? "bg-paper/15 text-paper" : "text-paper/45"}`}>{item}</div>)}
                </div>
                <div className="mt-auto rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/20 p-4"><div className="flex justify-between font-mono text-[11px] text-paper/55"><span>Level 7</span><span>1,240 XP</span></div><div className="mt-3 h-2 rounded-full bg-paper/10"><div className="h-full w-2/3 rounded-full bg-gold" /></div></div>
              </aside>

              <div className="world-grid p-4 sm:p-7">
                <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Private player one</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Make today count.</h2></div><Badge className="rounded-full bg-grass/25 text-primary hover:bg-grass/25">● Live vault</Badge></div>

                <Card className="quest-card relative mt-5 overflow-hidden border-ink bg-ink text-paper">
                  <CardContent className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div><Badge className="rounded-full border-2 border-ink bg-gold text-ink hover:bg-gold">Main quest</Badge><h3 className="mt-4 max-w-xl text-xl font-semibold">Close the one loop that makes everything else easier.</h3><p className="mt-2 text-sm text-paper/55">One clear outcome. Immediate feedback. A visible finish line.</p></div>
                    <div className="rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/20 bg-paper/5 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">Focus strike</p><p className="mt-2 font-mono text-3xl font-bold">25:00</p><Button size="sm" className="quest-button mt-3 w-full bg-gold text-ink hover:bg-gold/90"><Swords /> Start</Button></div>
                  </CardContent>
                </Card>

                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {metrics.map((metric) => <div key={metric.label} className="quest-card bg-card p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-muted-foreground">{metric.label}</p><metric.icon className="h-4 w-4 text-primary" /></div><p className="mt-2 font-mono text-xl font-bold">{metric.value}</p></div>)}
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="quest-card bg-card p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Seven-day momentum</p><p className="text-[11px] text-muted-foreground">Action, not activity</p></div><BarChart3 className="h-4 w-4 text-primary" /></div><div className="mt-6 flex h-28 items-end gap-2">{[38,52,44,69,61,76,88].map((height,index) => <div key={index} className="flex-1 rounded-t-md bg-primary/10" style={{height:`${height}%`}}><div className="h-2 rounded-full bg-primary" /></div>)}</div></div>
                  <div className="quest-card bg-card p-4"><p className="text-sm font-semibold">Quick quests</p><div className="mt-3 grid gap-2">{questRows.map((quest) => <div key={quest.label} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-background/70 p-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${quest.tone}`}>{quest.icon}</span><p className="min-w-0 flex-1 truncate text-xs font-medium">{quest.label}</p><span className="font-mono text-[10px] text-muted-foreground">{quest.xp}</span></div>)}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-[4px] border-ink bg-card/75 py-20">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-3">
          {[
            { icon: Orbit, title: "Zoom without losing meaning", copy: "See the century, decade, year, month, week, and today as one connected trail of intent." },
            { icon: Swords, title: "Turn clarity into action", copy: "The highest-cost open loop becomes a playable quest with a finish line, steps, and a focus strike." },
            { icon: Trophy, title: "Reward proof, not motion", copy: "XP moves only when something changes in the world. Planning alone earns nothing." },
          ].map((feature, index) => (
            <div key={feature.title} className={`quest-card bg-card p-6 ${index === 1 ? "lg:-translate-y-3" : ""}`}>
              <div className="flex h-12 w-12 -rotate-2 items-center justify-center rounded-[45%_55%] border-[3px] border-ink bg-secondary text-ink shadow-pix-sm"><feature.icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.2rem_1.6rem_2.4rem_1.8rem] border-[4px] border-ink bg-ink px-6 py-16 text-center text-paper shadow-pix-lg sm:px-12">
          <div className="world-sun absolute -right-8 -top-10 h-28 w-28 opacity-30" />
          <Clock3 className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">A great life is built one honest day at a time.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-paper/60">Keep the vision huge, the next move small, and the feedback immediate.</p>
          <Button asChild size="lg" className="quest-button mt-8 h-12 bg-gold px-6 text-ink hover:bg-gold/90"><Link href="/life">Open the command center <ChevronRight /></Link></Button>
        </div>
      </section>

      <footer className="border-t-[3px] border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>The Main Quest · built for one life</span><div className="flex gap-5"><Link href="/board" className="hover:text-foreground">Public game</Link><Link href="/signin" className="hover:text-foreground">Private sign in</Link></div></div>
      </footer>
    </main>
  );
}
