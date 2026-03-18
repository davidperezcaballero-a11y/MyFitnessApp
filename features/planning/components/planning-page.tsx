import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { CreatePlanForm } from "@/features/planning/components/create-plan-form";
import { MobilityPlanSection } from "@/features/planning/components/mobility-plan-section";
import { PlanHeaderCard } from "@/features/planning/components/plan-header-card";
import { RunningPlanSection } from "@/features/planning/components/running-plan-section";
import { PlanSectionTabs } from "@/features/planning/components/plan-section-tabs";
import { StrengthMatrixEditor } from "@/features/planning/components/strength-matrix-editor";
import {
  getCurrentTrainingPlan,
  getPlanningExerciseOptions,
} from "@/features/planning/queries";

type PlanningPageProps = {
  message?: string;
};

export async function PlanningPage({ message }: PlanningPageProps) {
  const plan = await getCurrentTrainingPlan();
  const exerciseOptions = await getPlanningExerciseOptions();

  return (
    <div className="space-y-6 xl:space-y-8">
      <PageHeader
        eyebrow="Plan"
        title="Planificacion estructurada para escritorio"
        description="La pantalla de plan ahora prioriza una lectura amplia en PC, con matrices semanales que aprovechan mejor el ancho disponible."
      />

      {plan ? <PlanHeaderCard plan={plan} /> : null}

      {plan ? (
        <>
          <PlanSectionTabs editable />
          <StrengthMatrixEditor plan={plan} exerciseOptions={exerciseOptions} />
          <RunningPlanSection plan={plan} />
          <MobilityPlanSection plan={plan} />
        </>
      ) : (
        <FeatureCard
          title="Sin plan activo"
          description="Crea el primer plan desde la app y despues podras anadir sesiones planificadas."
        >
          <CreatePlanForm message={message} />
        </FeatureCard>
      )}

    </div>
  );
}
