import Link from "next/link";

import { ActivePlanOverviewCard } from "@/features/dashboard/components/active-plan-overview-card";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { NextSessionsByTypeCard } from "@/features/dashboard/components/next-sessions-by-type-card";
import { getDashboardSummary } from "@/features/dashboard/queries";

export async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dashboard"
        title="Plan activo y siguiente entrenamiento"
        description="Vision ejecutiva del bloque actual: como van fuerza, cardio y movilidad y cual es la proxima sesion de cada una."
      />

      <ActivePlanOverviewCard plan={summary.activePlan} />
      <NextSessionsByTypeCard sessions={summary.nextSessionsByType} />

      <FeatureCard
        title="Accesos rapidos"
        description="Atajos utiles para revisar el bloque activo, abrir el entrenamiento, consultar el catalogo o revisar el historial."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/entrenar"
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
          >
            Ir a entrenar
          </Link>
          <Link
            href="/plan"
            className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white"
          >
            Ver planes
          </Link>
          <Link
            href="/historial"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Ver historial
          </Link>
          <Link
            href="/catalogo"
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Ver catalogo
          </Link>
          <Link
            href="/entrenar/libre"
            className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
          >
            Sesion libre
          </Link>
        </div>
      </FeatureCard>
    </div>
  );
}
