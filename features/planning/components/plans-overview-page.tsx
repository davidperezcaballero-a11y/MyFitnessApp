import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { importPlanCsvAction } from "@/features/planning/actions";
import { CreatePlanForm } from "@/features/planning/components/create-plan-form";
import { PlanListCard } from "@/features/planning/components/plan-list-card";
import { getTrainingPlansOverview } from "@/features/planning/queries";

type PlansOverviewPageProps = {
  message?: string;
};

export async function PlansOverviewPage({ message }: PlansOverviewPageProps) {
  const plans = await getTrainingPlansOverview();
  const activePlans = plans.filter((plan) => plan.status === "active");
  const inactivePlans = plans.filter((plan) => plan.status === "inactive");
  const finishedPlans = plans.filter((plan) => plan.status === "finished");
  const hasActivePlan = activePlans.length > 0;

  return (
    <div className="space-y-6 xl:space-y-8">
      <PageHeader
        eyebrow="Planes"
        title="Tus bloques de entrenamiento"
        description="Desde aqui puedes crear nuevos planes, abrir los existentes y recuperar planes inactivos sin mezclar la vista de lista con el editor detallado."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <div className="space-y-6">
          <FeatureCard
            title="Crear nuevo plan"
            description="Los planes nuevos nacen inactivos. Solo pasan a activos cuando los activas explicitamente."
          >
            <CreatePlanForm message={message} />
          </FeatureCard>

          <FeatureCard
            title="Importar plan desde CSV"
            description="Descarga la plantilla, rellena el plan en Excel y luego sube el CSV para cargarlo en bloque."
          >
            <div className="space-y-4">
              <Link
                href="/templates/plan-import-template.csv"
                className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Descargar plantilla CSV
              </Link>
              <form action={importPlanCsvAction} className="flex flex-wrap items-center gap-3">
                <input
                  required
                  type="file"
                  name="csvFile"
                  accept=".csv,text/csv"
                  className="max-w-full rounded-xl border border-ink/10 bg-sand px-4 py-2 text-sm text-ink"
                />
                <button
                  type="submit"
                  className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white"
                >
                  Cargar plan CSV
                </button>
              </form>
            </div>
          </FeatureCard>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink">Activo</h2>
            {activePlans.length > 0 ? (
              activePlans.map((plan) => (
                <PlanListCard key={plan.id} plan={plan} hasActivePlan={hasActivePlan} />
              ))
            ) : (
              <FeatureCard
                title="Sin plan activo"
                description="Crea un plan nuevo o activa uno de los inactivos."
              />
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink">Inactivos</h2>
            {inactivePlans.length > 0 ? (
              inactivePlans.map((plan) => (
                <PlanListCard key={plan.id} plan={plan} hasActivePlan={hasActivePlan} />
              ))
            ) : (
              <FeatureCard
                title="Sin planes inactivos"
                description="Aqui apareceran los bloques pausados o sustituidos por uno nuevo."
              />
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink">Finalizados</h2>
            {finishedPlans.length > 0 ? (
              finishedPlans.map((plan) => (
                <PlanListCard key={plan.id} plan={plan} hasActivePlan={hasActivePlan} />
              ))
            ) : (
              <FeatureCard
                title="Sin planes finalizados"
                description="Cuando cierres un bloque, quedara aqui como historico en solo lectura."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
