import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { createCardioWorkoutAction } from "@/features/training/actions";
import type { PlannedCardioSessionDraft } from "@/features/training/types";

type CardioWorkoutPageProps = {
  exerciseOptions: Array<{
    id: string;
    name: string;
  }>;
  plannedSession?: PlannedCardioSessionDraft | null;
  message?: string;
};

export function CardioWorkoutPage({
  exerciseOptions,
  plannedSession,
  message,
}: CardioWorkoutPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cardio"
        title={plannedSession?.title ?? "Registro cardio real"}
        description={
          plannedSession
            ? `Sesion planificada para ${plannedSession.dateLabel}. La actividad y la carga salen del plan activo.`
            : "Formulario conectado a Supabase para guardar una sesion aerobica completa."
        }
      />

      <FeatureCard
        title={plannedSession ? "Sesion cardio planificada" : "Nueva sesion cardio"}
        description={
          plannedSession
            ? `Actividad prevista: ${plannedSession.activityName}. Ajusta solo la ejecucion real.`
            : "Selecciona actividad y guarda duracion, distancia y frecuencia cardiaca media."
        }
      >
        <form action={createCardioWorkoutAction} className="space-y-4">
          <input type="hidden" name="plannedSessionId" value={plannedSession?.plannedSessionId ?? ""} />
          <input type="hidden" name="sessionTitle" value={plannedSession?.title ?? "Sesion cardio"} />

          {plannedSession?.activityId ? (
            <>
              <input type="hidden" name="exerciseId" value={plannedSession.activityId} />
              <div className="rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-ink">Actividad planificada</p>
                <p className="mt-1 text-sm text-ink/68">{plannedSession.activityName}</p>
              </div>
            </>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Actividad</span>
              <select
                required
                name="exerciseId"
                defaultValue={plannedSession?.activityId ?? ""}
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              >
                <option value="">Selecciona una actividad</option>
                {exerciseOptions.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Duracion (min)</span>
              <input
                required
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                defaultValue={plannedSession?.durationMinutes ?? ""}
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Distancia (km)</span>
              <input
                required
                name="distanceKm"
                type="number"
                min="0"
                step="0.1"
                defaultValue={plannedSession?.distanceKm ?? ""}
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">FC media</span>
              <input
                name="avgHeartRate"
                type="number"
                min="0"
                step="1"
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>
          </div>

          {plannedSession?.notes ? (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm text-ink/68">
              Nota del plan: {plannedSession.notes}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
          >
            Guardar sesion cardio
          </button>
        </form>
      </FeatureCard>
    </div>
  );
}
