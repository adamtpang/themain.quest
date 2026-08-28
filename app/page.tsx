import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Gamepad2,
  KeyRound,
  Landmark,
  LockKeyhole,
  Minimize2,
  Mountain,
  Orbit,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const flowSignals = [
  {
    icon: Compass,
    label: "Clear goal",
    title: "Know what done means",
    copy: "The Process action turns a day-scoped outbox into one concrete outcome and one physical starting move, so the player can act without carrying the whole plan at once.",
    color: "bg-sky/45",
  },
  {
    icon: Clock3,
    label: "Immediate feedback",
    title: "See momentum now",
    copy: "The runner offers 4 bounded timeboxes at 2, 5, 10, or 25 minutes, then makes completion and durable XP visible as soon as the real action is finished.",
    color: "bg-gold/55",
  },
  {
    icon: Minimize2,
    label: "Challenge balance",
    title: "Shrink, never shame",
    copy: "The challenge control makes an overwhelming quest smaller without deleting the original outcome, while a skipped quest stays preserved with the player's reason for later processing.",
    color: "bg-grass/35",
  },
];

const horizons = ["100 years", "10 decades", "10 years", "1 year", "12 months", "4 weeks", "1 week", "Today", "Next 2 minutes"];

const doorways = [
  { href: "/life", label: "Life", eyebrow: "Private", description: "Process your real outbox and play the one quest that matters now.", icon: Mountain, color: "bg-grass/35" },
  { href: "/board", label: "Board", eyebrow: "Public demo", description: "Try the original gamified quest board without opening private context.", icon: Gamepad2, color: "bg-sky/45" },
  { href: "/money-os", label: "Money OS", eyebrow: "Private", description: "See the financial system behind stability, runway, and wealth quests.", icon: Landmark, color: "bg-gold/50" },
  { href: "/signin", label: "Sign in", eyebrow: "Owner access", description: "Enter through the approved Google identity and signed session boundary.", icon: KeyRound, color: "bg-blossom/15" },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-brand-bg">
      <SiteNavbar />

      <section className="relative isolate mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute inset-x-[-15%] top-[-8rem] -z-20 h-[50rem] rounded-b-[48%] bg-sky/55 dark:bg-sky/10" />
        <div className="world-sun pointer-events-none absolute right-[5%] top-20 -z-10 hidden h-36 w-36 rotate-3 sm:block" />
        <div className="world-cloud pointer-events-none absolute left-[6%] top-10 -z-10 hidden h-11 w-36 -rotate-2 sm:block" />
        <div className="world-hill pointer-events-none absolute -bottom-32 -left-[24%] -z-10 h-72 w-[74%] rotate-2 opacity-75" />
        <div className="world-hill pointer-events-none absolute -bottom-40 -right-[28%] -z-10 h-80 w-[82%] -rotate-2 bg-grass-dark opacity-55" />

        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="rotate-[-1deg] rounded-full border-[3px] border-ink bg-card px-3 py-1 text-foreground shadow-pix-sm">
            <Sparkles className="mr-1 h-3 w-3 text-primary" /> One life. One next quest.
          </Badge>
          <h1 className="mt-8 text-balance text-5xl font-semibold leading-[0.93] tracking-[-0.065em] sm:text-7xl lg:text-[6.15rem]">
            Make your whole life<br className="hidden sm:block" /> feel clear and playable.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            The Main Quest connects your century-scale vision to one small move you can do now. It protects focus, learns from friction, and rewards proof in the real world.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="quest-button h-12 bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Link href="/life">Open Life <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="quest-button h-12 bg-card px-6 text-foreground hover:bg-secondary">
              <Link href="/board"><Play /> Play the public demo</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border-2 border-border bg-card/85 px-3 py-1.5"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-primary" />Private by identity</span>
            <span className="rounded-full border-2 border-border bg-card/85 px-3 py-1.5"><Orbit className="mr-1.5 inline h-3.5 w-3.5 text-stream" />Vault-backed context</span>
            <span className="rounded-full border-2 border-border bg-card/85 px-3 py-1.5"><Zap className="mr-1.5 inline h-3.5 w-3.5 text-taxes" />XP for real action</span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -left-7 top-24 hidden -rotate-6 rounded-full border-[3px] border-ink bg-gold px-4 py-2 font-mono text-xs font-bold shadow-pix-sm lg:block">One task, not twenty</div>
          <div className="absolute -right-6 bottom-28 hidden rotate-3 rounded-full border-[3px] border-ink bg-grass px-4 py-2 font-mono text-xs font-bold shadow-pix-sm lg:block">Challenge rebalanced</div>
          <div className="quest-card overflow-hidden border-ink bg-card">
            <div className="flex items-center gap-3 border-b-[3px] border-ink bg-card px-4 py-3 sm:px-6">
              <div className="flex h-10 w-10 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-ink bg-gold font-pixel text-[8px] text-ink">MQ</div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">The Main Quest</div>
                <div className="truncate text-[11px] text-muted-foreground">One thing at a time</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden rounded-full border-2 bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex"><Check className="mr-1 h-3.5 w-3.5 text-primary" />Live outbox</span>
                <span className="inline-flex rounded-full border-[3px] border-ink bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-pix-sm"><RefreshCw className="mr-1 h-3.5 w-3.5" />Process</span>
              </div>
            </div>

            <div className="world-grid p-4 sm:p-8">
              <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1 text-primary">●</span>Clear goal</span>
                <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1 text-sky">●</span>Immediate feedback</span>
                <span className="rounded-full border bg-card px-3 py-1.5"><span className="mr-1 text-gold">●</span>Challenge ready</span>
              </div>

              <Card className="quest-card mx-auto max-w-3xl overflow-hidden border-ink bg-ink text-paper">
                <CardContent className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-2 border-ink bg-gold text-ink hover:bg-gold">Next quest</Badge>
                    <Badge variant="outline" className="border-paper/20 text-paper/65">Tier 1</Badge>
                    <Badge variant="outline" className="border-paper/20 text-paper/65">100 XP</Badge>
                  </div>
                  <h2 className="mt-5 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">Close the loop that makes everything else easier.</h2>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border-2 border-paper/10 bg-paper/[0.05] p-4">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Clear goal</div>
                      <div className="mt-2 text-sm leading-6 text-paper/75">One useful outcome exists outside the app.</div>
                    </div>
                    <div className="rounded-2xl border-2 border-sky/25 bg-sky/10 p-4">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky">Do this now</div>
                      <div className="mt-2 text-lg font-semibold leading-7 text-paper">Open the source and look at the first unanswered line.</div>
                      <div className="mt-2 text-xs leading-5 text-paper/50">The setup move is the whole win. Stopping after it is allowed.</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/15 bg-paper/[0.05] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/45">Immediate feedback</div>
                        <div className="mt-1 font-mono text-4xl font-semibold tabular-nums">00:00</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[2, 5, 10, 25].map((minutes) => <span key={minutes} className={`rounded-lg border px-2 py-1.5 font-mono text-[10px] ${minutes === 5 ? "border-gold bg-gold text-ink" : "border-paper/15 text-paper/50"}`}>{minutes}m</span>)}
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-paper/10"><div className="h-full w-[12%] rounded-full bg-gold" /></div>
                    <span className="quest-button mt-4 flex h-10 w-full items-center justify-center bg-gold text-sm font-semibold text-ink"><Play className="mr-2 h-4 w-4" />Start 5m</span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <span className="quest-button flex h-10 items-center justify-center border-paper/25 bg-transparent text-sm text-paper"><Minimize2 className="mr-2 h-4 w-4" />Too hard? Make it smaller</span>
                    <span className="quest-button flex h-10 items-center justify-center border-paper/25 bg-transparent text-sm text-paper"><Brain className="mr-2 h-4 w-4" />Skip and explain why</span>
                  </div>
                  <span className="quest-button mt-4 flex h-12 items-center justify-center bg-grass text-base font-semibold text-ink"><Sparkles className="mr-2 h-4 w-4" />Done. Claim 100 XP</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 border-y-[4px] border-ink bg-card py-24" id="how-it-works">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">Built for flow</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Three signals. One honest loop.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">The Main Quest protects 3 practical flow signals: a clear goal, immediate feedback, and a challenge level that can be reduced when the next move feels too difficult.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {flowSignals.map((signal, index) => (
              <div key={signal.title} className={`quest-card bg-card p-6 ${index === 1 ? "lg:-translate-y-3" : ""}`}>
                <div className={`flex h-12 w-12 -rotate-2 items-center justify-center rounded-[45%_55%] border-[3px] border-ink text-ink shadow-pix-sm ${signal.color}`}><signal.icon className="h-5 w-5" /></div>
                <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{signal.label}</div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{signal.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{signal.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge variant="outline" className="rounded-full border-2 bg-card"><Orbit className="mr-1 h-3.5 w-3.5 text-stream" />Vision to action</Badge>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Zoom out until life feels meaningful. Zoom in until action feels easy.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">The questbook keeps the long movie of a life in view across 9 planning horizons, while the outbox stays day-scoped and the runner reveals only the next useful frame.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {horizons.map((horizon, index) => <span key={horizon} className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${index === horizons.length - 1 ? "border-ink bg-gold text-ink shadow-pix-sm" : "bg-card text-muted-foreground"}`}>{horizon}</span>)}
            </div>
          </div>

          <div className="quest-card relative overflow-hidden border-ink bg-ink p-6 text-paper sm:p-8">
            <div className="world-sun absolute -right-12 -top-14 h-36 w-36 opacity-25" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-paper/70 bg-gold text-ink"><LockKeyhole className="h-5 w-5" /></div>
                <div><div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Private world</div><div className="mt-1 text-sm text-paper/55">Built for player one</div></div>
              </div>
              <h3 className="mt-7 text-3xl font-semibold tracking-tight">Your context stays yours.</h3>
              <p className="mt-4 text-base leading-7 text-paper/60">The private Life and Money OS routes require the approved Google identity. Local development reads the Obsidian vault on the server, and the browser receives only the parsed fields required for the current view.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {["Single-user OAuth gate", "Server-side vault parsing", "Durable progress ledger", "No public raw life notes"].map((item) => <div key={item} className="flex items-center gap-2 rounded-2xl border-2 border-paper/10 bg-paper/[0.05] p-3 text-sm text-paper/75"><CheckCircle2 className="h-4 w-4 shrink-0 text-grass" />{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-[4px] border-ink bg-sky/25 py-20" id="doorways">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">Every route</div><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Choose your doorway.</h2></div>
            <p className="max-w-md text-base leading-7 text-muted-foreground">The public navigation names 4 product doorways and keeps each real destination one tap away, while every private doorway remains protected by the same owner-only identity boundary.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {doorways.map((doorway) => (
              <Link key={doorway.href} href={doorway.href} className="quest-card group flex items-start gap-4 bg-card p-5 transition-transform hover:-translate-y-1 sm:p-6">
                <span className={`flex h-12 w-12 shrink-0 -rotate-2 items-center justify-center rounded-[45%_55%] border-[3px] border-ink text-ink shadow-pix-sm ${doorway.color}`}><doorway.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{doorway.eyebrow}</span><span className="mt-1 block text-xl font-semibold">{doorway.label}</span><span className="mt-2 block text-base leading-7 text-muted-foreground">{doorway.description}</span></span>
                <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-[4px] border-ink bg-gold/35 py-20" id="offer">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">A clear public offer</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Try the life game without opening a private life.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">The public Board is a free demonstration for people who want to test a gamified goal and quest system in their own browser. The private Life runner is owner-only and is not offered as a public subscription.</p>
          </div>
          <div className="quest-card bg-card p-6 sm:p-8">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Pricing and access</div>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Pricing is simple: the public Board demo is free. Builders who want to discuss adapting the approach can contact the operator, while private vault data and owner tools remain outside every public path.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="quest-button bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/board">Try the free public demo <Gamepad2 /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="quest-button bg-card text-foreground hover:bg-secondary">
                <Link href="/contact">Contact the operator <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.2rem_1.6rem_2.4rem_1.8rem] border-[4px] border-ink bg-ink px-6 py-16 text-center text-paper shadow-pix-lg sm:px-12">
          <div className="world-sun absolute -right-8 -top-10 h-28 w-28 opacity-30" />
          <Trophy className="mx-auto h-7 w-7 text-gold" />
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Keep the vision huge and the next move tiny.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-paper/60">The Main Quest keeps one honest, playable day connected to a much larger life vision, then asks for proof through one concrete action instead of more planning.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="quest-button h-12 bg-gold px-6 text-ink hover:bg-gold/90"><Link href="/life">Open Life <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg" className="quest-button h-12 border-paper/30 bg-transparent px-6 text-paper hover:bg-paper/10 hover:text-paper"><Link href="/board">Play first <Gamepad2 /></Link></Button>
          </div>
        </div>
      </section>

      <footer className="border-t-[3px] border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><div className="font-semibold text-foreground">The Main Quest</div><div className="mt-1">Built for one real life.</div></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/life" className="hover:text-foreground">Life</Link>
            <Link href="/board" className="hover:text-foreground">Board</Link>
            <Link href="/money-os" className="hover:text-foreground">Money OS</Link>
            <Link href="/signin" className="hover:text-foreground">Sign in</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
