import { SignOutButton } from "@clerk/nextjs";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { clerkConfigured, developmentAuthBypassEnabled } from "@/lib/auth-policy";

export const metadata: Metadata = {
  title: "Private Sign In | The Main Quest",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const localPreview = developmentAuthBypassEnabled();
  const clerkReady = clerkConfigured();
  const setupMissing = params.reason === "not-configured" || (!localPreview && !clerkReady);
  const wrongIdentity = params.reason === "not-allowed";
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-5 py-12">
      <div className="quest-card grid w-full max-w-5xl overflow-hidden border-ink bg-card lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
          <div className="world-sun absolute -right-12 -top-12 h-52 w-52 opacity-25" />
          <div className="world-hill absolute -bottom-32 -left-28 h-72 w-[120%] opacity-25" />
          <div className="relative">
            <div className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-paper bg-gold text-xl text-ink">✦</div>
            <p className="mt-8 font-mono text-sm font-bold uppercase tracking-[0.18em] text-gold">The Main Quest</p>
            <h1 className="mt-4 max-w-md text-5xl font-semibold leading-[1.06] tracking-tight">Your whole life, in one playable view.</h1>
          </div>
          <div className="relative grid gap-4">
            <div className="rounded-[1.4rem_1rem_1.5rem_1.1rem] border-2 border-paper/20 bg-paper/5 p-5 backdrop-blur">
              <p className="text-sm text-paper/60">One rule</p>
              <p className="mt-1 text-lg font-medium">Progress must leave proof in the real world.</p>
            </div>
            <p className="text-sm text-paper/50">Private context stays behind your approved identity.</p>
          </div>
        </section>

        <section className="flex min-h-[620px] flex-col justify-center p-7 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-[45%_55%] border-[3px] border-ink bg-gold text-ink shadow-pix-sm lg:hidden">✦</div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" /> Private command center
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {localPreview
                ? "Local preview access is enabled on this machine. Production still requires the single approved Google account through Clerk."
                : setupMissing
                  ? "Clerk owner access is not configured yet. Add the production Clerk keys, enable Google, and allow the approved email before opening the private dashboard."
                  : wrongIdentity
                    ? "That identity is signed in, but it is not the approved owner account."
                    : "Sign in with the single approved Google account through Clerk to open your vault-backed life dashboard."}
            </p>
            <div className="mt-8">
              {wrongIdentity && clerkReady ? (
                <SignOutButton redirectUrl="/signin">
                  <Button size="lg" className="quest-button h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90">
                    Sign out and use the approved Google account
                  </Button>
                </SignOutButton>
              ) : (
                <SignInButton callbackUrl={params.callbackUrl} localPreview={localPreview} clerkReady={clerkReady} />
              )}
            </div>
            <div className="mt-8 grid gap-3 text-base text-muted-foreground">
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /><span>Clerk sessions plus a server-side email allowlist.</span></div>
              <div className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-stream" /><span>Live quests, XP, and private progress data.</span></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
