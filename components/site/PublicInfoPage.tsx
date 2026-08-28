import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteNavbar } from "@/components/site/SiteNavbar";

type PublicInfoPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
};

export function PublicInfoPage({
  eyebrow,
  title,
  introduction,
  children,
}: PublicInfoPageProps) {
  return (
    <main className="min-h-screen bg-brand-bg">
      <SiteNavbar />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to The Main Quest
        </Link>
        <div className="quest-card mt-8 bg-card p-6 sm:p-10">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {introduction}
          </p>
          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </section>
      <footer className="border-t-[3px] border-border py-8">
        <nav
          aria-label="Project information"
          className="mx-auto flex max-w-4xl flex-wrap gap-x-6 gap-y-3 px-5 text-sm font-semibold text-muted-foreground sm:px-8"
        >
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/board" className="hover:text-foreground">Public Board</Link>
        </nav>
      </footer>
    </main>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-4 text-base leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
