import { PageHeader } from "@/components/ui/page-header";
import { ActiveSession } from "@/features/training/components/active-session";
import { FeatureCard } from "@/components/ui/feature-card";
import { getNextStrengthPlannedSession } from "@/features/training/queries";

type ActiveSessionPageProps = {
  searchParams?: Promise<{
    plannedSessionId?: string;
  }>;
};

export default async function ActiveSessionPage({ searchParams }: ActiveSessionPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const plannedSessionId = resolvedSearchParams?.plannedSessionId;
  const initialSession = await getNextStrengthPlannedSession(plannedSessionId);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sesion activa"
        title="Cuaderno de fuerza"
        description="Ejecuta la sesion planificada viendo toda la hoja de trabajo y registrando cada set dentro de la propia tabla."
      />
      {initialSession ? (
        <ActiveSession initialSession={initialSession} />
      ) : (
        <FeatureCard
          title="Sin sesion planificada"
          description="No se encontro esa sesion de fuerza dentro del plan activo. Vuelve a Entrenar y elige una sesion valida."
        />
      )}
    </div>
  );
}
