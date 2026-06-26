import { PRIORITY_LABEL, Priority } from "@/lib/types";

const BG: Record<Priority, string> = {
  Life: "bg-life",
  Health: "bg-health",
  Visa: "bg-visa",
  Taxes: "bg-taxes",
  Leverage: "bg-leverage",
  Marketplace: "bg-marketplace",
  Loops: "bg-loops",
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span
      className={`tag inline-flex items-center px-1.5 py-px text-sm uppercase leading-none text-ink ${BG[priority]}`}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function MotionTag() {
  return (
    <span className="tag inline-flex items-center bg-loops px-1.5 py-px text-sm uppercase leading-none text-paper">
      ✦ trap
    </span>
  );
}
