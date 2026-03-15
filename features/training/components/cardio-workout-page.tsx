import { FeatureCard } from "@/components/ui/feature-card";
import { InfoList } from "@/components/ui/info-list";
import { PageHeader } from "@/components/ui/page-header";
import { mockCardioWorkout } from "@/features/training/data/mock-workout-session";

export function CardioWorkoutPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cardio"
        title={mockCardioWorkout.title}
        description="Pantalla base para registrar una actividad aerobica completa en pocos toques."
      />

      <FeatureCard
        title="Resumen de actividad"
        description="Maqueta inicial del registro de cardio con foco en duracion, distancia y zona de trabajo."
      >
        <InfoList
          items={[
            { label: "Actividad", value: mockCardioWorkout.activity },
            { label: "Duracion", value: `${mockCardioWorkout.durationMinutes} min` },
            { label: "Distancia", value: `${mockCardioWorkout.distanceKm} km` },
            { label: "FC media", value: mockCardioWorkout.avgHeartRate ? `${mockCardioWorkout.avgHeartRate} bpm` : "-" },
            { label: "Foco", value: mockCardioWorkout.zoneFocus },
          ]}
        />
      </FeatureCard>
    </div>
  );
}
