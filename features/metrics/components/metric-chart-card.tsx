import { FeatureCard } from "@/components/ui/feature-card";
import type { MetricChart } from "@/features/metrics/types";
import { cn } from "@/lib/utils";

const accentClasses: Record<MetricChart["color"], string> = {
  coral: "bg-coral",
  teal: "bg-teal",
  moss: "bg-moss",
};

type MetricChartCardProps = {
  chart: MetricChart;
};

export function MetricChartCard({ chart }: MetricChartCardProps) {
  const maxValue = Math.max(...chart.points.map((point) => point.value), 1);

  return (
    <FeatureCard title={chart.title} description={chart.description}>
      <div className="space-y-4">
        {chart.points.map((point) => {
          const width = `${Math.max((point.value / maxValue) * 100, 8)}%`;

          return (
            <div key={point.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-ink/68">
                <span>{point.label}</span>
                <span className="font-semibold text-ink">
                  {point.value} {chart.unit}
                </span>
              </div>
              <div className="h-3 rounded-full bg-sand">
                <div
                  className={cn("h-3 rounded-full", accentClasses[chart.color])}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FeatureCard>
  );
}
