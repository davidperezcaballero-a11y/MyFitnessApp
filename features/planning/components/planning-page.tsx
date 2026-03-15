import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { mockTrainingPlan } from "@/features/planning/data/mock-plan";
import { PlanSummaryCard } from "@/features/planning/components/plan-summary-card";
import { WeekCard } from "@/features/planning/components/week-card";

export function PlanningPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plan"
        title="Planificacion semanal editable"
        description="Vision inicial del plan activo, sus semanas y las sesiones prescritas por dia."
      />

      <PlanSummaryCard plan={mockTrainingPlan} />

      <section className="grid gap-5">
        {mockTrainingPlan.weeks.map((week) => (
          <WeekCard key={week.weekNumber} week={week} />
        ))}
      </section>

      <FeatureCard
        title="Siguiente iteracion"
        description="El siguiente paso sera permitir editar semanas, reordenar sesiones y seleccionar ejercicios desde el catalogo."
      />
    </div>
  );
}
