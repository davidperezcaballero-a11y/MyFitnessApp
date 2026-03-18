import { createPlanAction } from "@/features/planning/actions";

type CreatePlanFormProps = {
  message?: string;
};

export function CreatePlanForm({ message }: CreatePlanFormProps) {
  return (
    <form action={createPlanAction} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Nombre del plan</span>
        <input
          required
          name="name"
          type="text"
          placeholder="Base fuerza + cardio"
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Fecha de inicio</span>
        <input
          required
          name="startDate"
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Duracion en semanas</span>
        <input
          required
          min={1}
          max={24}
          defaultValue={4}
          name="durationWeeks"
          type="number"
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Objetivo</span>
        <textarea
          name="objective"
          rows={3}
          placeholder="Mejorar consistencia, fuerza y capacidad aerobica."
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      {message ? (
        <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Crear plan
      </button>
    </form>
  );
}
