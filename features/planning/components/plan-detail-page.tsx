import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { MobilityPlanSection } from "@/features/planning/components/mobility-plan-section";
import { PlanHeaderCard } from "@/features/planning/components/plan-header-card";
import { PlanSectionTabs } from "@/features/planning/components/plan-section-tabs";
import { RunningPlanSection } from "@/features/planning/components/running-plan-section";
import { StrengthMatrixEditor } from "@/features/planning/components/strength-matrix-editor";
import {
  getPlanningExerciseOptions,
  getTrainingPlanById,
} from "@/features/planning/queries";

type PlanDetailPageProps = {
  planId: string;
  message?: string;
};

export async function PlanDetailPage({ planId, message }: PlanDetailPageProps) {
  const plan = await getTrainingPlanById(planId);

  if (!plan) {
    return (
      <div className="space-y-6 xl:space-y-8">
        <PageHeader
          eyebrow="Plan"
          title="Plan no encontrado"
          description="Puede que se haya eliminado o que no tengas acceso a ese bloque."
        />
        <FeatureCard
          title="No se encontro el plan"
          description="Vuelve al listado para abrir otro bloque disponible."
        >
          <Link
            href="/plan"
            className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal"
          >
            Volver a planes
          </Link>
        </FeatureCard>
      </div>
    );
  }

  const isEditable = plan.status !== "finished";
  const exerciseOptions = isEditable ? await getPlanningExerciseOptions() : [];

  return (
    <div className="space-y-6 xl:space-y-8">
      <PageHeader
        eyebrow="Plan"
        title={plan.name}
        description="Detalle del bloque en formato matricial. Los planes activos e inactivos se pueden editar; los finalizados quedan en solo lectura."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/plan"
          className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-strong"
        >
          Volver a planes
        </Link>
        {message ? (
          <span className="rounded-full bg-coral/12 px-4 py-2 text-sm text-ink">{message}</span>
        ) : null}
      </div>

      <PlanHeaderCard plan={plan} />
      <PlanSectionTabs editable={isEditable} />

      {!isEditable ? (
        <FeatureCard
          title="Plan finalizado"
          description="Este bloque queda congelado como historico. Puedes revisarlo entero, pero no editar su contenido."
        />
      ) : null}

      <StrengthMatrixEditor
        plan={plan}
        exerciseOptions={exerciseOptions}
        readOnly={!isEditable}
      />

      <RunningPlanSection
        plan={plan}
        exerciseOptions={exerciseOptions}
        readOnly={!isEditable}
      />
      <MobilityPlanSection
        plan={plan}
        exerciseOptions={exerciseOptions}
        readOnly={!isEditable}
      />
    </div>
  );
}
