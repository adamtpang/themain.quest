import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { SignInButton } from "@/components/auth/SignInButton";

export const metadata: Metadata = {
  title: "Private Sign In | The Main Quest",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-[#241b40]/10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-[#241b40] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7cc9ff]/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-[#ffcf4a]/15 blur-3xl" />
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">✦</div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[#ffcf4a]">The Main Quest</p>
            <h1 className="mt-4 max-w-md text-5xl font-semibold leading-[1.06] tracking-tight">Your whole life, in one playable view.</h1>
          </div>
          <div className="relative grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-white/60">One rule</p>
              <p className="mt-1 text-lg font-medium">Progress must leave proof in the real world.</p>
            </div>
            <p className="text-sm text-white/50">Private context stays behind your approved identity.</p>
          </div>
        </section>

        <section className="flex min-h-[620px] flex-col justify-center p-7 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary lg:hidden">✦</div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" /> Private command center
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with the single approved Google account to open your vault-backed life dashboard.</p>
            <div className="mt-8">
              <SignInButton callbackUrl={params.callbackUrl} />
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#3f9e2a]" /><span>Email allowlist plus signed server sessions.</span></div>
              <div className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-[#a06bff]" /><span>Live quests, XP, horizons, and private progress data.</span></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
