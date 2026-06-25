import { PRIORITY_LABEL, Priority } from "@/lib/types";

const STYLES: Record<Priority, { text: string; border: string; bg: string; dot: string }> = {
  Life: { text: "text-life", border: "border-life/50", bg: "bg-life/10", dot: "bg-life" },
  Health: { text: "text-health", border: "border-health/50", bg: "bg-health/10", dot: "bg-health" },
  Visa: { text: "text-visa", border: "border-visa/50", bg: "bg-visa/10", dot: "bg-visa" },
  Taxes: { text: "text-taxes", border: "border-taxes/50", bg: "bg-taxes/10", dot: "bg-taxes" },
  Leverage: { text: "text-leverage", border: "border-leverage/50", bg: "bg-leverage/10", dot: "bg-leverage" },
  Marketplace: { text: "text-marketplace", border: "border-marketplace/50", bg: "bg-marketplace/10", dot: "bg-marketplace" },
  Loops: { text: "text-loops", border: "border-loops/50", bg: "bg-loops/10", dot: "bg-loops" },
};

export function PriorityTag({ priority }: { priority: Priority }) {
  const s = STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.text} ${s.border} ${s.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function MotionTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-loops/50 bg-loops/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-loops">
      <span className="h-1.5 w-1.5 rounded-full bg-loops" />
      Motion
    </span>
  );
}
