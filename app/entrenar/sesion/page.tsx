import { PageHeader } from "@/components/ui/page-header";
import { ActiveSession } from "@/features/training/components/active-session";

export default function ActiveSessionPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sesion activa"
        title="Modo guiado ejercicio por ejercicio"
        description="Primera version del flujo central del producto con registro rapido de series y autocompletado."
      />
      <ActiveSession />
    </div>
  );
}
