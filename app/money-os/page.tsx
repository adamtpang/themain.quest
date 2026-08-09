"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string; amount?: string };

const TIER0: Item[] = [
  { id: "t0-freeze", text: "Freeze the Discover card, zero new charges" },
  { id: "t0-audit", text: "List every auto-renew on both cards, kill what isn't earning" },
  { id: "t0-apr", text: "Call Discover direct: +1-224-888-7777 (1-800 doesn't connect from Malaysia)", amount: "~$70/mo" },
];

const TIER1: Item[] = [
  { id: "t1-vercel", text: "Vercel domain audit, kill unused domains", amount: "$50/mo" },
  { id: "t1-hosting", text: "Consolidate Namecheap + Hostinger", amount: "$22/mo" },
  { id: "t1-chase", text: "Chase fee: hardship call, not balance waiver ($0.82 balance)", amount: "$15/mo" },
];

const TIER2_INVOICE: Item = { id: "t2-invoice", text: "Invoice Quantus for month 1", amount: "$1,000" };

const INCOME_COLLECT: Item[] = [
  { id: "inc-quantus", text: "Em, Quantus invoice month 1", amount: "$1,000" },
  { id: "inc-joe", text: "Joe Mattia, owed", amount: "$500" },
];

const INCOME_POST: Item[] = [
  { id: "inc-beware", text: "beware.dog", amount: "$149/mo" },
  { id: "inc-moneymeta", text: "moneymeta.fun", amount: "$29" },
  { id: "inc-portal", text: "portal.voyage", amount: "$49" },
  { id: "inc-deathmoney", text: "deathmoney.fyi", amount: "$19" },
  { id: "inc-adamgives", text: "adam.gives", amount: "$750-1,500" },
];

const STORAGE_KEY = "money-os-checklist-v1";

function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return { checked, toggle, loaded };
}

function Checkbox({
  item,
  checked,
  onToggle,
}: {
  item: Item;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: "0.6rem",
        alignItems: "flex-start",
        fontSize: "14px",
        cursor: "pointer",
        padding: "0.3rem 0",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ width: "17px", height: "17px", marginTop: "2px", accentColor: "var(--grass-dark)", flexShrink: 0 }}
      />
      <span
        style={{
          flex: 1,
          textDecoration: checked ? "line-through" : "none",
          opacity: checked ? 0.5 : 1,
        }}
      >
        {item.text}
        {item.amount && (
          <span style={{ marginLeft: "0.4rem", fontFamily: "monospace", fontSize: "12px", opacity: 0.7 }}>
            {item.amount}
          </span>
        )}
      </span>
    </label>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "3px solid var(--ink)",
        borderRadius: "12px",
        padding: "1.1rem 1.25rem",
        boxShadow: "5px 5px 0 var(--ink)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Kpi({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div
      style={{
        background: danger ? "#b03a2e" : "var(--paper2)",
        border: "2px solid var(--ink)",
        borderRadius: "10px",
        padding: "0.8rem 0.9rem",
      }}
    >
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: danger ? 0.85 : 0.6, color: danger ? "#fff" : "var(--ink)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, marginTop: "4px", color: danger ? "#fff" : "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

export default function MoneyOSPage() {
  const { checked, toggle, loaded } = useChecklist();

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.1rem 5rem" }}>
      <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, marginBottom: "0.3rem" }}>
        money os — command center
      </p>
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "1.5rem" }}>
        Income vs expenses, real numbers
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginBottom: "1.75rem" }}>
        <Kpi label="Income, active" value="$2,167/mo" />
        <Kpi label="Burn rate" value="$1,642/mo" />
        <Kpi label="Card debt" value="$13,133" danger />
        <Kpi label="Runway" value="0.2 mo" danger />
      </div>

      <Card style={{ marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Tier 0 — today, $0</p>
        {TIER0.map((item) => (
          <Checkbox key={item.id} item={item} checked={!!checked[item.id]} onToggle={() => toggle(item.id)} />
        ))}
      </Card>

      <Card style={{ marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Tier 1 — this week</p>
        {TIER1.map((item) => (
          <Checkbox key={item.id} item={item} checked={!!checked[item.id]} onToggle={() => toggle(item.id)} />
        ))}
      </Card>

      <Card style={{ marginBottom: "1rem", opacity: 0.55 }}>
        <p style={{ fontWeight: 700, marginBottom: "0.5rem", textDecoration: "line-through" }}>
          Tier 2 — balance transfer
        </p>
        <p style={{ fontSize: "13px" }}>Dead 2026-08-09, Wells Fargo declined. Don&apos;t try a third issuer.</p>
        <div style={{ marginTop: "0.4rem" }}>
          <Checkbox item={TIER2_INVOICE} checked={!!checked[TIER2_INVOICE.id]} onToggle={() => toggle(TIER2_INVOICE.id)} />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "10px", marginBottom: "1rem" }}>
        <Card>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Collect, not sell</p>
          {INCOME_COLLECT.map((item) => (
            <Checkbox key={item.id} item={item} checked={!!checked[item.id]} onToggle={() => toggle(item.id)} />
          ))}
        </Card>
        <Card>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Post what&apos;s built, 9 ready</p>
          {INCOME_POST.map((item) => (
            <Checkbox key={item.id} item={item} checked={!!checked[item.id]} onToggle={() => toggle(item.id)} />
          ))}
        </Card>
      </div>

      <p style={{ fontSize: "12px", opacity: 0.55, marginTop: "2rem" }}>
        {loaded ? "Saved to this device." : "Loading saved state..."} Personal figures from
        deathmoney.fyi/private, statement data through May-Jul 2026. Fleet figures verified live
        2026-08-09.
      </p>
    </div>
  );
}
