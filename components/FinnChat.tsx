"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What order should I beat my problems in?",
  "Why do I keep avoiding the income close?",
  "Plan my 10/10 S-tier day.",
];

export function FinnChat({ context }: { context: unknown }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/finn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      if (!res.body) {
        const txt = await res.text();
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: txt };
          return c;
        });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: `Finn could not reach the tower. ${msg}` };
        return c;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Finn button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn fixed bottom-4 right-3 z-40 flex items-center gap-1.5 bg-visa px-3 py-2 font-pixel text-[9px] uppercase text-paper"
        aria-label="open Finn"
      >
        <span className="text-base leading-none">🗡️</span>
        {open ? "close" : "finn"}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3">
          <div className="panel flex h-[70vh] flex-col bg-paper">
            {/* header */}
            <div className="flex items-center justify-between border-b-4 border-ink bg-visa px-3 py-2">
              <span className="flex items-center gap-1.5 font-pixel text-[10px] uppercase text-paper">
                🗡️ finn the ai agent
              </span>
              <button
                onClick={() => setOpen(false)}
                className="font-pixel text-[10px] text-paper/80 hover:text-paper"
                aria-label="close"
              >
                x
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
              <div className="inset px-2 py-1.5 text-base leading-snug text-ink">
                Hey dude. I am Finn. Tell me what is stuck and we will figure out why it keeps
                happening, then beat your bosses in the right order. One move at a time.
              </div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`px-2 py-1.5 text-base leading-snug ${
                    m.role === "user"
                      ? "tag ml-8 bg-bubblegum text-ink"
                      : "panel mr-6 bg-paper text-ink"
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 ? "..." : "")}
                </div>
              ))}

              {messages.length === 0 && (
                <div className="space-y-1.5 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="btn block w-full bg-paper px-2 py-1.5 text-left text-base text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* input */}
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
                placeholder="ask finn anything..."
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
          </div>
        </div>
      )}
    </>
  );
}
