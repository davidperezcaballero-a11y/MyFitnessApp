import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { mockMobilityWorkout } from "@/features/training/data/mock-workout-session";

export function MobilityWorkoutPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Movilidad"
        title={mockMobilityWorkout.title}
        description="Rutina reutilizable de movilidad pensada para uso rapido desde movil antes o despues del entrenamiento."
      />

      <FeatureCard
        title={mockMobilityWorkout.routineName}
        description={`Duracion total estimada: ${mockMobilityWorkout.totalMinutes} min.`}
      >
        <ul className="space-y-3">
          {mockMobilityWorkout.exercises.map((exercise) => (
            <li key={exercise.name} className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-sm font-semibold text-ink">{exercise.name}</p>
              <p className="mt-1 text-sm text-ink/65">{exercise.durationSeconds} segundos</p>
            </li>
          ))}
        </ul>
      </FeatureCard>
    </div>
  );
}
