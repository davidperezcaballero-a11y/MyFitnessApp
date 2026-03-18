import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { createMobilityWorkoutAction } from "@/features/training/actions";
import type { MobilityWorkoutDraft } from "@/features/training/types";

type MobilityWorkoutPageProps = {
  routineOptions: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  plannedSession?: MobilityWorkoutDraft | null;
  message?: string;
};

export function MobilityWorkoutPage({
  routineOptions,
  plannedSession,
  message,
}: MobilityWorkoutPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Movilidad"
        title={plannedSession?.title ?? "Registro movilidad real"}
        description={
          plannedSession
            ? "Sesion planificada de movilidad cargada desde el plan activo."
            : "Selecciona una rutina y guarda un bloque completo de movilidad conectado a Supabase."
        }
      />

      <FeatureCard
        title={plannedSession ? "Sesion movilidad planificada" : "Nueva sesion movilidad"}
        description={
          plannedSession
            ? "La duracion y los ejercicios previstos se toman del plan. Puedes ajustarlo antes de guardar."
            : "Si eliges una rutina, tambien se guardaran sus ejercicios asociados."
        }
      >
        <form action={createMobilityWorkoutAction} className="space-y-4">
          <input type="hidden" name="plannedSessionId" value={plannedSession?.plannedSessionId ?? ""} />
          <input type="hidden" name="sessionTitle" value={plannedSession?.title ?? "Sesion movilidad"} />

          {!plannedSession ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Rutina</span>
              <select
                name="routineId"
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              >
                <option value="">Sin rutina concreta</option>
                {routineOptions.map((routine) => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Duracion total (min)</span>
              <input
                required
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                defaultValue={plannedSession?.totalMinutes ?? ""}
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>

          {plannedSession?.exercises.length ? (
            <ul className="space-y-2 rounded-2xl bg-sand px-4 py-4">
              {plannedSession.exercises.map((exercise) => (
                <li key={`${exercise.name}-${exercise.durationSeconds}`} className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>{exercise.name}</span>
                  <span className="text-ink/65">
                    {Math.round(exercise.durationSeconds / 60)} min
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {!plannedSession && routineOptions.length > 0 ? (
            <ul className="space-y-3">
              {routineOptions.map((routine) => (
                <li key={routine.id} className="rounded-2xl bg-sand px-4 py-4">
                  <p className="text-sm font-semibold text-ink">{routine.name}</p>
                  <p className="mt-1 text-sm text-ink/65">
                    {routine.description ?? "Rutina disponible en el catalogo."}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {message ? (
            <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
          >
            Guardar sesion movilidad
          </button>
        </form>
      </FeatureCard>
    </div>
  );
}
