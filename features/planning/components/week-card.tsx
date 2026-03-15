import { FeatureCard } from "@/components/ui/feature-card";
import type { TrainingPlanWeek } from "@/features/planning/types";
import { cn } from "@/lib/utils";

const badgeStyles: Record<TrainingPlanWeek["sessions"][number]["sessionType"], string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
};

type WeekCardProps = {
  week: TrainingPlanWeek;
};

export function WeekCard({ week }: WeekCardProps) {
  return (
    <FeatureCard
      title={`Semana ${week.weekNumber}`}
      description={`Foco: ${week.focus}`}
    >
      <div className="space-y-4">
        {week.sessions.map((session) => (
          <article key={`${week.weekNumber}-${session.dayLabel}-${session.title}`} className="rounded-2xl bg-sand px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink/58">{session.dayLabel}</p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                  {session.title}
                </h3>
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

            <ul className="mt-4 space-y-2">
              {session.exercises.map((exercise) => (
                <li key={exercise.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                  <span className="text-sm text-ink">{exercise.name}</span>
                  <span className="text-sm font-semibold text-ink/72">{exercise.prescription}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </FeatureCard>
  );
}
