"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Coins, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type MoneySummary = {
  debt: number | null;
  completedCount: number;
};

async function loadSummary(): Promise<MoneySummary> {
  const response = await fetch("/api/money-os-state", { cache: "no-store" });
  const payload = await response.json() as MoneySummary & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Money state could not be loaded");
  return payload;
}

export default function MoneyOSPage() {
  const [summary, setSummary] = useState<MoneySummary | null>(null);
  const [payment, setPayment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSummary().then(setSummary).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Money state could not be loaded");
    });
  }, []);

  async function logPayment() {
    const amount = Number(payment);
    if (!summary || summary.debt === null || !Number.isFinite(amount) || amount <= 0) return;
    setSaving(true);
    setError(null);
    try {
      const nextDebt = Math.max(0, summary.debt - amount);
      const response = await fetch("/api/money-os-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "debt", value: nextDebt }),
      });
      const payload = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Payment could not be saved");
      setSummary({ ...summary, debt: nextDebt });
      setPayment("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Payment could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private money quest</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Fight one money boss at a time.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          This protected page keeps the sensitive numbers private. The actual money actions live in your processed outbox, where they compete fairly with the rest of life.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Money progress">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <Coins className="h-6 w-6 text-primary" />
            <p className="mt-5 text-sm text-muted-foreground">Remaining boss HP</p>
            <p className="mt-1 text-3xl font-semibold">
              {!summary ? <LoaderCircle className="h-7 w-7 animate-spin" /> : summary.debt === null ? "Not set" : `$${summary.debt.toLocaleString()}`}
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <p className="mt-5 text-sm text-muted-foreground">Completed money moves</p>
            <p className="mt-1 text-3xl font-semibold">{summary ? summary.completedCount : <LoaderCircle className="h-7 w-7 animate-spin" />}</p>
          </div>
        </section>

        {summary && summary.debt !== null && (
          <section className="mt-4 rounded-3xl border bg-card p-6 shadow-sm">
            <label htmlFor="payment" className="text-sm font-medium">Log a payment</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="payment"
                name="payment"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
                placeholder="Amount paid"
                className="min-h-11 flex-1 rounded-xl border bg-background px-3 outline-none ring-primary focus:ring-2"
              />
              <Button onClick={logPayment} disabled={saving || Number(payment) <= 0}>
                {saving ? <LoaderCircle className="animate-spin" /> : "Record hit"}
              </Button>
            </div>
          </section>
        )}

        {error && <p role="alert" className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <p className="font-medium">Ready for the next actual move?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Open Life to play the highest-priority quest selected from today&apos;s outbox.</p>
          <Button asChild className="mt-4">
            <Link href="/life">Open Life <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
