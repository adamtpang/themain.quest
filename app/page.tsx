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
  { icon: "🏠", label: "Close the current stability loop", xp: "100 XP", tone: "bg-[#e7f4ff]" },
  { icon: "💚", label: "Protect energy and move the body", xp: "80 XP", tone: "bg-[#e6f6df]" },
  { icon: "❤️", label: "Make one relationship stronger", xp: "80 XP", tone: "bg-[#ffe5ef]" },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <nav className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#241b40] font-pixel text-[9px] text-[#ffcf4a]">MQ</div>
          <div>
            <p className="text-sm font-semibold tracking-tight">The Main Quest</p>
            <p className="text-[11px] text-muted-foreground">Life, made playable</p>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/board">Public demo</Link></Button>
          <Button asChild className="rounded-xl bg-[#241b40] text-white hover:bg-[#322650]">
            <Link href="/life"><LockKeyhole /> Open private command center</Link>
          </Button>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-24">
        <div className="absolute left-1/2 top-24 -z-10 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#7cc9ff]/20 blur-3xl" />
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="rounded-full border-[#241b40]/10 bg-white/70 px-3 py-1 text-[#241b40]">
            <Sparkles className="mr-1 h-3 w-3 text-[#a06bff]" /> Private AI life operating system
          </Badge>
          <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#241b40] sm:text-7xl lg:text-[5.5rem]">
            See your whole life.<br />Play the next move.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            A century-scale command center that turns your private context into one clear quest, visible progress, and quick wins that compound into the life you actually want.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-xl bg-[#241b40] px-6 text-white shadow-lg shadow-[#241b40]/15 hover:bg-[#322650]">
              <Link href="/life">Enter your command center <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl bg-white/60 px-6">
              <Link href="/board"><Play /> Try the public game</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#3f9e2a]" /> Single-user OAuth</span>
            <span className="flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5 text-[#a06bff]" /> Vault-backed context</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#f6a623]" /> Real-action XP</span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-b from-[#7cc9ff]/15 to-transparent blur-2xl" />
          <div className="overflow-hidden rounded-[2rem] border bg-white/90 shadow-2xl shadow-[#241b40]/10 backdrop-blur">
            <div className="grid min-h-[620px] lg:grid-cols-[220px_1fr]">
              <aside className="hidden bg-[#18152b] p-5 text-white lg:flex lg:flex-col">
                <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffcf4a] font-pixel text-[8px] text-[#241b40]">MQ</div><span className="text-sm font-semibold">Life Command</span></div>
                <div className="mt-10 grid gap-2 text-sm">
                  {["Today", "Quests", "Signals", "Life map"].map((item, index) => <div key={item} className={`rounded-xl px-3 py-2.5 ${index === 0 ? "bg-white/10" : "text-white/45"}`}>{item}</div>)}
                </div>
                <div className="mt-auto rounded-2xl border border-white/10 p-4"><div className="flex justify-between text-[11px] text-white/45"><span>Level 7</span><span>1,240 XP</span></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-[#ffcf4a]" /></div></div>
              </aside>

              <div className="p-4 sm:p-7">
                <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Private player one</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#241b40]">Make today count.</h2></div><Badge className="bg-[#e6f6df] text-[#2c6f28] hover:bg-[#e6f6df]">● Live vault</Badge></div>

                <Card className="relative mt-5 overflow-hidden border-0 bg-[#241b40] text-white shadow-lg">
                  <CardContent className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div><Badge className="bg-[#ffcf4a] text-[#241b40] hover:bg-[#ffcf4a]">Main quest</Badge><h3 className="mt-4 max-w-xl text-xl font-semibold">Close the one loop that makes everything else easier.</h3><p className="mt-2 text-sm text-white/50">One clear outcome. Immediate feedback. A visible finish line.</p></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Focus strike</p><p className="mt-2 font-mono text-3xl font-semibold">25:00</p><Button size="sm" className="mt-3 w-full bg-[#ffcf4a] text-[#241b40] hover:bg-[#ffe07c]"><Swords /> Start</Button></div>
                  </CardContent>
                </Card>

                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {[{ label: "Today", value: "8/10", icon: Trophy }, { label: "Current XP", value: "1,240", icon: Zap }, { label: "Open quests", value: "4", icon: Check }, { label: "Life left", value: "76.9y", icon: Orbit }].map((metric) => <div key={metric.label} className="rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-muted-foreground">{metric.label}</p><metric.icon className="h-3.5 w-3.5 text-[#7c6cf4]" /></div><p className="mt-2 text-xl font-semibold text-[#241b40]">{metric.value}</p></div>)}
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Seven-day momentum</p><p className="text-[11px] text-muted-foreground">Action, not activity</p></div><BarChart3 className="h-4 w-4 text-[#7c6cf4]" /></div><div className="mt-6 flex h-28 items-end gap-2">{[38, 52, 44, 69, 61, 76, 88].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-[#7c6cf4]/15" style={{ height: `${height}%` }}><div className="h-2 rounded-full bg-[#7c6cf4]" /></div>)}</div></div>
                  <div className="rounded-2xl border bg-white p-4"><p className="text-sm font-semibold">Quick quests</p><div className="mt-3 grid gap-2">{questRows.map((quest) => <div key={quest.label} className="flex items-center gap-3 rounded-xl border p-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${quest.tone}`}>{quest.icon}</span><p className="min-w-0 flex-1 truncate text-xs font-medium">{quest.label}</p><span className="text-[10px] text-muted-foreground">{quest.xp}</span></div>)}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-white/55 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-3">
          {[
            { icon: Orbit, title: "Zoom without losing meaning", copy: "See the century, decade, year, month, week, and today as one connected chain of intent." },
            { icon: Swords, title: "Turn clarity into action", copy: "The highest-cost open loop becomes a playable quest with a finish line, steps, and a focus strike." },
            { icon: Trophy, title: "Reward proof, not motion", copy: "XP and progress move only when something changes in the world. Planning alone earns nothing." },
          ].map((feature) => (
            <div key={feature.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-[#241b40]"><feature.icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#241b40] px-6 py-14 text-center text-white sm:px-12">
          <Clock3 className="mx-auto h-6 w-6 text-[#ffcf4a]" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">A great life is built one honest day at a time.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55">Keep the vision huge, the next move small, and the feedback immediate.</p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-xl bg-[#ffcf4a] px-6 text-[#241b40] hover:bg-[#ffe07c]"><Link href="/life">Open the private command center <ChevronRight /></Link></Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>The Main Quest · built for one life</span><div className="flex gap-5"><Link href="/board" className="hover:text-foreground">Public demo</Link><Link href="/signin" className="hover:text-foreground">Private sign in</Link></div></div>
      </footer>
    </main>
  );
}
