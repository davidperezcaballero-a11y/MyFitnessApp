import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { getHistorySessionById } from "@/features/history/queries";

type HistoryDetailPageProps = {
  sessionId: string;
};

export async function HistoryDetailPage({ sessionId }: HistoryDetailPageProps) {
  const session = await getHistorySessionById(sessionId);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Detalle"
        title={session.title}
        description={`${session.date} · ${session.durationMinutes} min · ${session.summary}`}
      />

      <FeatureCard
        title="Metricas clave"
        description="Vista resumida de la sesion para revisar rapidamente el trabajo realizado."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {session.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">{metric.label}</p>
              <p className="mt-2 text-lg font-semibold text-ink">{metric.value}</p>
            </div>
          ))}
        </div>
      </FeatureCard>

      {session.detailSections.map((section) => (
        <FeatureCard
          key={section.title}
          title={section.title}
          description="Bloque de detalle reutilizable para fuerza, cardio o movilidad."
        >
          <ul className="space-y-3">
            {section.rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between rounded-2xl bg-sand px-4 py-4">
                <span className="text-sm text-ink/70">{row.label}</span>
                <span className="text-sm font-semibold text-ink">{row.value}</span>
              </li>
            ))}
          </ul>
        </FeatureCard>
      ))}

      <Link
        href="/historial"
        className="inline-flex rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Volver al historial
      </Link>
    </div>
  );
}
