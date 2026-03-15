import { FeatureCard } from "@/components/ui/feature-card";
import { InfoList } from "@/components/ui/info-list";
import { PageHeader } from "@/components/ui/page-header";

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dashboard"
        title="Tu semana, clara y accionable"
        description="Resumen rapido del entrenamiento, proximas sesiones y acceso directo al flujo de registro."
      />

      <FeatureCard
        title="Resumen semanal"
        description="Panel inicial para mostrar actividad semanal, adherencia y proximos entrenamientos."
      >
        <InfoList
          items={[
            { label: "Sesiones completadas", value: "0 / 4" },
            { label: "Tiempo cardio", value: "0 min" },
            { label: "Volumen fuerza", value: "0 kg" },
          ]}
        />
      </FeatureCard>

      <FeatureCard
        title="Inicio rapido"
        description="Aqui ira el acceso a entrenamiento planificado, libre o a una sesion en curso."
      />
    </div>
  );
}
