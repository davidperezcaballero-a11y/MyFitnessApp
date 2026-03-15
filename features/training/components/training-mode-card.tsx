import Link from "next/link";

import type { TrainingModeCard } from "@/features/training/types";
import { cn } from "@/lib/utils";

const accentStyles: Record<TrainingModeCard["accent"], string> = {
  teal: "bg-teal text-white",
  coral: "bg-coral text-white",
  moss: "bg-moss text-white",
};

type TrainingModeCardProps = {
  mode: TrainingModeCard;
};

export function TrainingModeCard({ mode }: TrainingModeCardProps) {
  return (
    <Link
      href={mode.href}
      className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            {mode.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">{mode.description}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            accentStyles[mode.accent],
          )}
        >
          {mode.status}
        </span>
      </div>
    </Link>
  );
}
