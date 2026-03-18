import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/features/dashboard/types";

const badgeStyles: Record<DashboardSummary["nextSessionsByType"][number]["sessionType"], string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
};

type NextSessionsByTypeCardProps = {
  sessions: DashboardSummary["nextSessionsByType"];
};

export function NextSessionsByTypeCard({ sessions }: NextSessionsByTypeCardProps) {
  return (
    <FeatureCard
      title="Proximas sesiones"
      description="La siguiente propuesta de fuerza, cardio y movilidad dentro del plan activo, con su fecha y acceso directo a entrenar."
    >
      {sessions.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-[24px] bg-sand px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/55">{session.dateLabel}</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{session.title}</h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    badgeStyles[session.sessionType],
                  )}
                >
                  {session.sessionType}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/68">{session.detail}</p>
              <p className="mt-1 text-sm text-ink/52">{session.weekLabel}</p>
              {session.completedLabel ? (
                <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-ink/68">
                  {session.completedLabel}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={session.startHref}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral"
                >
                  {session.status === "completed" ? "Repetir" : "Empezar"}
                </Link>
                {session.historyHref ? (
                  <Link
                    href={session.historyHref}
                    className="rounded-full border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30"
                  >
                    Ver historial
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-sand px-4 py-4 text-sm text-ink/65">
          El plan activo todavia no tiene sesiones planificadas.
        </p>
      )}
    </FeatureCard>
  );
}
