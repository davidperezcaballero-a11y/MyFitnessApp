import { createPlannedSessionAction } from "@/features/planning/actions";

type CreateSessionFormProps = {
  planId: string;
  exerciseOptions: Array<{
    id: string;
    name: string;
    exerciseType: "strength" | "cardio" | "mobility";
  }>;
  message?: string;
};

export function CreateSessionForm({
  planId,
  exerciseOptions,
  message,
}: CreateSessionFormProps) {
  return (
    <form action={createPlannedSessionAction} className="space-y-4">
      <input type="hidden" name="planId" value={planId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Semana</span>
          <input
            required
            name="weekNumber"
            type="number"
            min="1"
            defaultValue="1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Dia</span>
          <select
            name="dayOfWeek"
            defaultValue="1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          >
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miercoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sabado</option>
            <option value="7">Domingo</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Tipo de sesion</span>
          <select
            name="sessionType"
            defaultValue="strength"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          >
            <option value="strength">Fuerza</option>
            <option value="cardio">Cardio</option>
            <option value="mobility">Movilidad</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Nombre de sesion</span>
          <input
            required
            name="sessionName"
            type="text"
            placeholder="Fuerza A"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Ejercicio</span>
        <select
          required
          name="exerciseId"
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        >
          <option value="">Selecciona un ejercicio</option>
          {exerciseOptions.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name} · {exercise.exerciseType}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Sets</span>
          <input
            name="sets"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Reps</span>
          <input
            name="reps"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Carga objetivo</span>
          <input
            name="targetLoad"
            type="number"
            min="0"
            step="0.5"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Duracion objetivo (min)</span>
          <input
            name="targetDurationMinutes"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Distancia objetivo (km)</span>
          <input
            name="targetDistanceKm"
            type="number"
            min="0"
            step="0.1"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
      </div>

      {message ? (
        <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Anadir sesion
      </button>
    </form>
  );
}
