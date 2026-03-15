import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { mockFreeWorkout } from "@/features/training/data/mock-workout-session";

export function FreeWorkoutPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Entrenamiento libre"
        title={mockFreeWorkout.title}
        description="Modo pensado para dias flexibles en los que quieres registrar trabajo sin depender de una sesion planificada."
      />

      <FeatureCard title="Notas de la sesion" description={mockFreeWorkout.notes} />

      <FeatureCard
        title="Ejercicios propuestos"
        description="En la integracion real aqui podras anadir, quitar y reordenar ejercicios sobre la marcha."
      >
        <ul className="space-y-3">
          {mockFreeWorkout.exercises.map((exercise) => (
            <li key={exercise.name} className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-sm font-semibold text-ink">{exercise.name}</p>
              <p className="mt-1 text-sm text-ink/65">{exercise.target}</p>
            </li>
          ))}
        </ul>
      </FeatureCard>
    </div>
  );
}
