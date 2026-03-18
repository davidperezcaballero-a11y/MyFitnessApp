import {
  deletePlanAction,
  finishPlanAction,
  setPlanInactiveAction,
} from "@/features/planning/actions";
import { FeatureCard } from "@/components/ui/feature-card";
import type { TrainingPlanDraft } from "@/features/planning/types";

type PlanHeaderCardProps = {
  plan: TrainingPlanDraft;
};

export function PlanHeaderCard({ plan }: PlanHeaderCardProps) {
  const statusLabel =
    plan.status === "active"
      ? "Activo"
      : plan.status === "finished"
        ? "Finalizado"
        : "Inactivo";

  return (
    <FeatureCard
      title={plan.name}
      description="Cabecera del plan con su objetivo general y duracion del bloque."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              plan.status === "active"
                ? "rounded-full bg-teal px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                : plan.status === "finished"
                  ? "rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                  : "rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/75"
            }
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Inicio</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.startDate}</p>
          </div>
          <div className="rounded-2xl bg-sand px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Duracion</p>
            <p className="mt-2 text-lg font-semibold text-ink">{plan.weeks.length} semanas</p>
          </div>
          <div className="rounded-2xl bg-sand px-4 py-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Objetivo</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink">{plan.objective}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {plan.status === "active" ? (
            <form action={setPlanInactiveAction}>
              <input type="hidden" name="planId" value={plan.id} />
              <button
                type="submit"
                className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-strong"
              >
                Cancelar plan
              </button>
            </form>
          ) : null}

          {plan.status === "active" ? (
            <form action={finishPlanAction}>
              <input type="hidden" name="planId" value={plan.id} />
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal"
              >
                Finalizar plan
              </button>
            </form>
          ) : null}

          <form action={deletePlanAction}>
            <input type="hidden" name="planId" value={plan.id} />
            <button
              type="submit"
              className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
            >
              Eliminar plan
            </button>
          </form>
        </div>
      </div>
    </FeatureCard>
  );
}
