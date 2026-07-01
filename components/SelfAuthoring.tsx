"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/storage";

type Msg = { role: "user" | "assistant"; content: string };

const PROGRAMS = [
  { id: "past", emoji: "📜", name: "Past", desc: "Write your autobiography in seven epochs.", bg: "bg-visa" },
  { id: "faults", emoji: "🕳️", name: "Faults", desc: "Name and rank your faults, honestly.", bg: "bg-loops" },
  { id: "virtues", emoji: "⭐", name: "Virtues", desc: "See your real strengths clearly.", bg: "bg-gold" },
  { id: "future", emoji: "🔮", name: "Future", desc: "Design the life you want, and the one to avoid.", bg: "bg-health" },
];

export function SelfAuthoring() {
  const [store, setStore] = useLocalStorage<Record<string, Msg[]>>("tmq.author", {});
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, active]);

  function open(id: string) {
    setMsgs(store[id] || []);
    setActive(id);
  }
  function close() {
    setActive(null);
  }

  const program = PROGRAMS.find((p) => p.id === active);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !active) return;
    const next: Msg[] = [...msgs, { role: "user", content: trimmed }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    let acc = "";
    try {
      const res = await fetch("/api/finn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode: "author", program: active }),
      });
      if (!res.body) {
        acc = await res.text();
      } else {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMsgs([...next, { role: "assistant", content: acc }]);
        }
      }
    } catch (e) {
      acc = "Could not reach the Author. " + (e instanceof Error ? e.message : String(e));
    } finally {
      const finalMsgs: Msg[] = [...next, { role: "assistant", content: acc }];
      setMsgs(finalMsgs);
      setStore((s) => ({ ...s, [active]: finalMsgs }));
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <h2 className="mb-2 font-pixel text-[10px] uppercase text-ink">🖋 self authoring</h2>
      <p className="mb-2 text-sm leading-snug text-ink/70">
        An AI interviews you through Peterson's four programs. Putting your life into specific words
        moves it from stress to understanding.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PROGRAMS.map((p) => {
          const count = Math.floor((store[p.id]?.length ?? 0) / 2);
          return (
            <button key={p.id} onClick={() => open(p.id)} className={`btn p-2 text-left ${p.bg}`}>
              <span className="text-2xl">{p.emoji}</span>
              <span className="mt-1 block font-pixel text-[9px] uppercase text-ink">{p.name}</span>
              <span className="mt-1 block text-sm leading-tight text-ink/80">{p.desc}</span>
              <span className="mt-1 block font-pixel text-[6px] uppercase text-ink/60">
                {count > 0 ? `${count} exchanges · continue` : "begin"}
              </span>
            </button>
          );
        })}
      </div>

      {active && program && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-paper">
          <div className="flex items-center justify-between border-b-4 border-ink bg-ink px-3 py-2">
            <span className="font-pixel text-[10px] uppercase text-paper">
              🖋 {program.name} authoring
            </span>
            <button onClick={close} className="font-pixel text-[10px] text-paper/80 hover:text-paper">
              x
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl">{program.emoji}</span>
                <p className="max-w-xs text-base leading-snug text-ink/75">{program.desc}</p>
                <button
                  onClick={() => send("I'm ready to begin.")}
                  className="btn bg-health px-4 py-2 font-pixel text-[10px] uppercase text-ink"
                >
                  begin the interview
                </button>
              </div>
            ) : (
              msgs.map((m, i) => (
                <div
                  key={i}
                  className={`px-2 py-1.5 text-base leading-snug ${
                    m.role === "user" ? "tag ml-8 bg-bubblegum text-ink" : "panel mr-6 bg-paper text-ink"
                  }`}
                >
                  {m.content || (loading && i === msgs.length - 1 ? "..." : "")}
                </div>
              ))
            )}
          </div>

          {msgs.length > 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t-4 border-ink p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="write your answer..."
                className="inset flex-1 px-2 py-1.5 text-base text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn bg-health px-3 py-1.5 font-pixel text-[9px] uppercase text-ink disabled:opacity-50"
              >
                {loading ? "..." : "send"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
