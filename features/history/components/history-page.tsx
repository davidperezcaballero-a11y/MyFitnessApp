import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { importHistoryCsvAction } from "@/features/history/actions";
import { HistoryTable } from "@/features/history/components/history-table";
import { getHistorySessions } from "@/features/history/queries";

type HistoryPageProps = {
  message?: string;
};

export async function HistoryPage({ message }: HistoryPageProps) {
  const sessions = await getHistorySessions();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Historial"
        title="Registro cronologico del trabajo realizado"
        description="Sesiones reales del usuario cargadas desde Supabase con acceso a detalle."
      />

      <FeatureCard
        title="Importar historico desde CSV"
        description="Descarga la plantilla, vuelca tu historico previo en Excel y subelo para cargar fuerza, cardio o movilidad."
      >
        <div className="space-y-4">
          <Link
            href="/templates/history-import-template.csv"
            className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Descargar plantilla CSV
          </Link>
          <form action={importHistoryCsvAction} className="flex flex-wrap items-center gap-3">
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
              Cargar historico CSV
            </button>
          </form>
          {message ? (
            <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
          ) : null}
        </div>
      </FeatureCard>

      {sessions.length > 0 ? (
        <HistoryTable sessions={sessions} />
      ) : (
        <FeatureCard
          title="Sin sesiones registradas"
          description="Cuando empieces a guardar entrenamientos reales, apareceran aqui."
        />
      )}
    </div>
  );
}
