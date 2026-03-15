import { FeatureCard } from "@/components/ui/feature-card";
import { InfoList } from "@/components/ui/info-list";
import { PageHeader } from "@/components/ui/page-header";
import { MetricChartCard } from "@/features/metrics/components/metric-chart-card";
import { MetricKpiGrid } from "@/features/metrics/components/metric-kpi-grid";
import {
  adherenceBreakdown,
  metricCharts,
  metricKpis,
} from "@/features/metrics/data/mock-metrics";

export function MetricsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Metricas"
        title="Progreso visual del entrenamiento"
        description="Panel inicial de KPIs y evolucion semanal para fuerza, cardio, movilidad y adherencia."
      />

      <MetricKpiGrid items={metricKpis} />

      <section className="grid gap-5">
        {metricCharts.map((chart) => (
          <MetricChartCard key={chart.title} chart={chart} />
        ))}
      </section>

      <FeatureCard
        title="Adherencia"
        description="Resumen rapido de cumplimiento del plan semanal para apoyar decisiones de carga y consistencia."
      >
        <InfoList items={adherenceBreakdown} />
      </FeatureCard>
    </div>
  );
}
