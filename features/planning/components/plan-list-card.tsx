import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { ActivatePlanButton } from "@/features/planning/components/activate-plan-button";
import type { TrainingPlanOverviewItem } from "@/features/planning/types";

type PlanListCardProps = {
  plan: TrainingPlanOverviewItem;
  hasActivePlan: boolean;
};

export function PlanListCard({ plan, hasActivePlan }: PlanListCardProps) {
  const statusLabel =
    plan.status === "active"
      ? "Activo"
      : plan.status === "finished"
        ? "Finalizado"
        : "Inactivo";

  return (
    <FeatureCard
      title={plan.name}
      description={plan.objective}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Estado</p>
            <p className="mt-2 text-lg font-semibold text-ink">{statusLabel}</p>
          </div>
          <div className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Inicio</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.startDate}</p>
          </div>
          <div className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Duracion</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.totalWeeks} semanas</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/plan/${plan.id}`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal"
          >
            Abrir plan
          </Link>
          {plan.status === "inactive" ? (
            <ActivatePlanButton planId={plan.id} hasActivePlan={hasActivePlan} />
          ) : null}
        </div>
      </div>
    </FeatureCard>
  );
}
