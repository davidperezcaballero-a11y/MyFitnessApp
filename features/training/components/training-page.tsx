import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { SessionOverview } from "@/features/training/components/session-overview";
import { TrainingModeCard } from "@/features/training/components/training-mode-card";
import {
  mockWorkoutSession,
  trainingModeCards,
} from "@/features/training/data/mock-workout-session";

export function TrainingPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Entrenar"
        title="Sesion guiada para registrar rapido"
        description="Entrada principal al entrenamiento planificado y al flujo guiado de registro rapido."
      />

      <SessionOverview session={mockWorkoutSession} />

      <section className="grid gap-4">
        {trainingModeCards.map((mode) => (
          <TrainingModeCard key={mode.href} mode={mode} />
        ))}
      </section>

      <FeatureCard
        title="Siguiente iteracion"
        description="Lo siguiente sera persistir estas acciones mock en backend y reflejarlas en Historial y Metricas."
      />
    </div>
  );
}
