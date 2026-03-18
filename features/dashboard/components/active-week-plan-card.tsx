import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";

const badgeStyles: Record<"strength" | "cardio" | "mobility" | "mixed", string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
  mixed: "bg-ink text-white",
};

type ActiveWeekPlanCardProps = {
  days: Array<{
    dayLabel: string;
    sessions: Array<{
      id: string;
      title: string;
      sessionType: "strength" | "cardio" | "mobility" | "mixed";
    }>;
  }>;
};

export function ActiveWeekPlanCard({ days }: ActiveWeekPlanCardProps) {
  return (
    <FeatureCard
      title="Plan activo por dias"
      description="Vista semanal del plan activo para que tengas claro que toca cada dia."
    >
      {days.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {days.map((day) => (
            <div key={day.dayLabel} className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-sm font-semibold text-ink">{day.dayLabel}</p>
              <div className="mt-3 space-y-2">
                {day.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-3"
                  >
                    <p className="text-sm font-medium text-ink">{session.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        badgeStyles[session.sessionType],
                      )}
                    >
                      {session.sessionType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-sand px-4 py-4 text-sm text-ink/65">
          El plan activo todavia no tiene sesiones distribuidas por dias.
        </p>
      )}
    </FeatureCard>
  );
}
