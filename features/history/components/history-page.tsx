import { PageHeader } from "@/components/ui/page-header";
import { HistoryFilters } from "@/features/history/components/history-filters";
import { mockHistorySessions } from "@/features/history/data/mock-history";

export function HistoryPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Historial"
        title="Registro cronologico del trabajo realizado"
        description="Listado inicial con filtros por tipo y acceso a detalle de fuerza, cardio y movilidad."
      />

      <HistoryFilters sessions={mockHistorySessions} />
    </div>
  );
}
