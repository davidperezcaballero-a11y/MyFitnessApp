import type { MetricKpi } from "@/features/metrics/types";

type MetricKpiGridProps = {
  items: MetricKpi[];
};

export function MetricKpiGrid({ items }: MetricKpiGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel"
        >
          <p className="text-sm text-ink/58">{item.label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            {item.value}
          </p>
          <p className="mt-2 text-sm text-teal">{item.delta}</p>
        </article>
      ))}
    </section>
  );
}
