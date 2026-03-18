import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";

const badgeStyles: Record<"strength" | "cardio" | "mobility" | "mixed", string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
  mixed: "bg-ink text-white",
};

type UpcomingSessionsCardProps = {
  sessions: Array<{
    id: string;
    dayLabel: string;
    title: string;
    sessionType: "strength" | "cardio" | "mobility" | "mixed";
    weekLabel: string;
  }>;
};

export function UpcomingSessionsCard({ sessions }: UpcomingSessionsCardProps) {
  return (
    <FeatureCard
      title="Proximas sesiones"
      description="Resumen del plan actual para que puedas arrancar rapido desde la semana en curso."
    >
      {sessions.length > 0 ? (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between rounded-2xl bg-sand px-4 py-4"
            >
              <div>
                <p className="text-sm text-ink/58">{session.dayLabel}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{session.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/45">
                  {session.weekLabel}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  badgeStyles[session.sessionType],
                )}
              >
                {session.sessionType}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-sand px-4 py-4 text-sm text-ink/65">
          No hay sesiones planificadas todavia.
        </p>
      )}
    </FeatureCard>
  );
}
