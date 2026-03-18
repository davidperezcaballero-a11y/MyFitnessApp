import { FeatureCard } from "@/components/ui/feature-card";
import type { DashboardSummary } from "@/features/dashboard/types";

type ActivePlanOverviewCardProps = {
  plan: DashboardSummary["activePlan"];
};

export function ActivePlanOverviewCard({ plan }: ActivePlanOverviewCardProps) {
  if (!plan) {
    return (
      <FeatureCard
        title="Plan actual"
        description="Cuando actives un plan, aqui veras el bloque en curso y un resumen de fuerza, cardio y movilidad."
      />
    );
  }

  return (
    <FeatureCard
      title={plan.name}
      description="Cabecera ejecutiva del bloque activo: en que semana estas, cuanto queda y como van fuerza, cardio y movilidad a alto nivel."
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[24px] bg-sand px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Plan activo</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                Semana {plan.currentWeek} de {plan.totalWeeks}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{plan.objective}</p>
            </div>
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {plan.progressPercent}% completado
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${plan.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-sand px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Inicio</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.startDateLabel}</p>
          </div>
          <div className="rounded-[24px] bg-sand px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Fin estimado</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.estimatedEndDateLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {plan.disciplineSummary.map((item) => (
          <article key={item.key} className="rounded-[24px] border border-ink/8 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{item.primary}</p>
            <p className="mt-1 text-sm text-ink/62">{item.secondary}</p>
          </article>
        ))}
      </div>
    </FeatureCard>
  );
}
