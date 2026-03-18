import { MetricsPage } from "@/features/metrics/components/metrics-page";
import type { MetricsPeriod } from "@/features/metrics/types";

type MetricasPageProps = {
  searchParams?: Promise<{ period?: string }>;
};

function normalizePeriod(value?: string): MetricsPeriod {
  if (value === "week" || value === "last4weeks" || value === "activePlan" || value === "all") {
    return value;
  }

  return "all";
}

export default async function MetricasPage({ searchParams }: MetricasPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <MetricsPage period={normalizePeriod(params?.period)} />;
}
