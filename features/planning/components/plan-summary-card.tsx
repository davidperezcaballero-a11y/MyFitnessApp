import { FeatureCard } from "@/components/ui/feature-card";
import { InfoList } from "@/components/ui/info-list";
import type { TrainingPlanDraft } from "@/features/planning/types";

type PlanSummaryCardProps = {
  plan: TrainingPlanDraft;
};

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  return (
    <FeatureCard
      title={plan.name}
      description="Vista general del plan activo para entender foco, fecha de inicio y objetivo semanal."
    >
      <InfoList
        items={[
          { label: "Inicio", value: plan.startDate },
          { label: "Objetivo", value: plan.objective },
          { label: "Meta semanal", value: plan.weeklyTarget },
          { label: "Semanas", value: String(plan.weeks.length) },
        ]}
      />
    </FeatureCard>
  );
}
