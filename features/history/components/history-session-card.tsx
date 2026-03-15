import Link from "next/link";

import type { HistorySession } from "@/features/history/types";
import { cn } from "@/lib/utils";

const badgeStyles: Record<HistorySession["type"], string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
};

type HistorySessionCardProps = {
  session: HistorySession;
};

export function HistorySessionCard({ session }: HistorySessionCardProps) {
  return (
    <Link
      href={`/historial/${session.id}`}
      className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink/58">{session.date}</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
            {session.title}
          </h2>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            badgeStyles[session.type],
          )}
        >
          {session.type}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink/68">{session.summary}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {session.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">{metric.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{metric.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium text-teal">Ver detalle</p>
    </Link>
  );
}
