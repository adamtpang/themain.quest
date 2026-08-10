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

const DEBT_START = 13133;

const ALL_ITEM_IDS = [
  ...TIER0.map((i) => i.id),
  ...TIER1.map((i) => i.id),
  TIER2_INVOICE.id,
  ...INCOME_COLLECT.map((i) => i.id),
  ...INCOME_POST.map((i) => i.id),
];

async function postState(key: "checklist" | "debt", value: unknown) {
  await fetch("/api/money-os-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
}

// Real shared state, backed by Neon Postgres, not localStorage. What's
// checked here is the same regardless of which browser or device looks.
function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/money-os-state")
      .then((r) => r.json())
      .then((state) => {
        if (state.checklist) setChecked(state.checklist);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      postState("checklist", next);
      return next;
    });
  }

  return { checked, toggle, loaded };
}

function useDebt() {
  const [debt, setDebt] = useState(DEBT_START);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("/api/money-os-state")
      .then((r) => r.json())
      .then((state) => {
        if (typeof state.debt === "number") setDebt(state.debt);
      })
      .catch(() => {});
  }, []);

  function logPayment() {
    const amount = Number(input);
    if (!amount || amount <= 0) return;
    const next = Math.max(0, debt - amount);
    setDebt(next);
    setInput("");
    postState("debt", next);
  }

  return { debt, input, setInput, logPayment };
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

function BossBar({
  debt,
  input,
  setInput,
  onLog,
}: {
  debt: number;
  input: string;
  setInput: (v: string) => void;
  onLog: () => void;
}) {
  const pct = Math.max(0, Math.min(100, (debt / DEBT_START) * 100));
  const defeated = debt <= 0;
  return (
    <Card style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <p style={{ fontWeight: 700 }}>{defeated ? "BOSS DEFEATED" : "Debt boss fight"}</p>
        <p style={{ fontFamily: "monospace", fontSize: "13px" }}>
          {debt.toLocaleString()} / {DEBT_START.toLocaleString()} HP
        </p>
      </div>
      <div
        style={{
          width: "100%",
          height: "18px",
          background: "#fff",
          border: "2px solid var(--ink)",
          borderRadius: "9px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: defeated ? "var(--grass-dark)" : pct > 50 ? "#b03a2e" : pct > 20 ? "#c98500" : "#3f9e2a",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      {!defeated && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem" }}>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="payment made, $"
            style={{
              flex: 1,
              padding: "0.5rem 0.6rem",
              border: "2px solid var(--ink)",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={onLog}
            style={{
              padding: "0.5rem 0.9rem",
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            hit
          </button>
        </div>
      )}
    </Card>
  );
}

function QuestProgress({ checked }: { checked: Record<string, boolean> }) {
  const done = ALL_ITEM_IDS.filter((id) => checked[id]).length;
  const total = ALL_ITEM_IDS.length;
  const pct = Math.round((done / total) * 100);
  return (
    <Card style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <p style={{ fontWeight: 700 }}>Quest progress</p>
        <p style={{ fontFamily: "monospace", fontSize: "13px" }}>
          {done} / {total} · {pct}%
        </p>
      </div>
      <div style={{ width: "100%", height: "10px", background: "#fff", border: "2px solid var(--ink)", borderRadius: "5px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--sky-top)", transition: "width 0.4s ease" }} />
      </div>
    </Card>
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
  const { debt, input, setInput, logPayment } = useDebt();

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.1rem 5rem" }}>
      <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, marginBottom: "0.3rem" }}>
        money os — command center
      </p>
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "1.5rem" }}>
        Income vs expenses, real numbers
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginBottom: "1.75rem" }}>
        <Kpi label="Verified stranger revenue" value="$0" />
        <Kpi label="Burn rate" value="$1,642/mo" />
        <Kpi label="Card debt" value={`$${debt.toLocaleString()}`} danger={debt > 0} />
        <Kpi label="Runway" value="0.2 mo" danger />
      </div>
      <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "-1.3rem", marginBottom: "1.5rem" }}>
        No revenue chart: the only stranger charges on this Stripe account are two unrelated
        personal sales, not fleet revenue. A chart here would misrepresent, not motivate.
      </p>

      <BossBar debt={debt} input={input} setInput={setInput} onLog={logPayment} />
      <QuestProgress checked={checked} />

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
        {loaded ? "Saved, real shared state via Neon, same on every device." : "Loading..."} Personal figures from
        deathmoney.fyi/private, statement data through May-Jul 2026. Fleet figures verified live
        2026-08-09.
      </p>
    </div>
  );
}
