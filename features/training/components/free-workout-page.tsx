"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { createFreeStrengthWorkoutAction } from "@/features/training/actions";

type FreeWorkoutPageProps = {
  strengthExerciseOptions: Array<{
    id: string;
    name: string;
  }>;
  message?: string;
};

type FreeStrengthRow = {
  id: string;
  exerciseId: string;
  sets: string;
  reps: string;
  weight: string;
  rpe: string;
};

function createEmptyRow(index: number): FreeStrengthRow {
  return {
    id: `free-strength-${index}`,
    exerciseId: "",
    sets: "3",
    reps: "8",
    weight: "",
    rpe: "",
  };
}

export function FreeWorkoutPage({
  strengthExerciseOptions,
  message,
}: FreeWorkoutPageProps) {
  const [rows, setRows] = useState<FreeStrengthRow[]>([createEmptyRow(1)]);
  const [sessionTitle, setSessionTitle] = useState("Sesion libre de fuerza");

  const serializedExercises = useMemo(
    () =>
      JSON.stringify(
        rows.map((row) => ({
          exerciseId: row.exerciseId,
          sets: Number(row.sets || 0),
          reps: Number(row.reps || 0),
          weight: row.weight.trim() ? Number(row.weight) : null,
          rpe: row.rpe.trim() ? Number(row.rpe) : null,
        })),
      ),
    [rows],
  );

  function updateRow(rowId: string, field: keyof FreeStrengthRow, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, createEmptyRow(current.length + 1)]);
  }

  function removeRow(rowId: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sesion libre"
        title="Entrenamiento fuera del plan"
        description="Flujo secundario para registrar trabajo espontaneo sin depender del plan activo. Se guarda como sesion libre, sin planificacion asociada."
      />

      {message ? <FeatureCard title="Mensaje" description={message} /> : null}

      <section className="grid gap-5 xl:grid-cols-3">
        <FeatureCard
          title="Fuerza libre"
          description="Anade los ejercicios que quieras, registra sets repetidos por ejercicio y finaliza la sesion cuando la des por cerrada."
        >
          <form action={createFreeStrengthWorkoutAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Titulo</span>
              <input
                name="sessionTitle"
                value={sessionTitle}
                onChange={(event) => setSessionTitle(event.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>

            <input type="hidden" name="exercises" value={serializedExercises} />

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.id} className="rounded-2xl border border-sand-strong bg-white px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">Ejercicio {index + 1}</p>
                    {rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-coral"
                      >
                        Quitar
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-5">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-ink">Ejercicio</span>
                      <select
                        value={row.exerciseId}
                        onChange={(event) => updateRow(row.id, "exerciseId", event.target.value)}
                        className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
                      >
                        <option value="">Selecciona un ejercicio</option>
                        {strengthExerciseOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">Sets</span>
                      <input
                        value={row.sets}
                        onChange={(event) => updateRow(row.id, "sets", event.target.value)}
                        type="number"
                        min="1"
                        step="1"
                        className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">Reps</span>
                      <input
                        value={row.reps}
                        onChange={(event) => updateRow(row.id, "reps", event.target.value)}
                        type="number"
                        min="1"
                        step="1"
                        className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">Kg</span>
                      <input
                        value={row.weight}
                        onChange={(event) => updateRow(row.id, "weight", event.target.value)}
                        type="number"
                        min="0"
                        step="0.5"
                        className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">RPE</span>
                      <input
                        value={row.rpe}
                        onChange={(event) => updateRow(row.id, "rpe", event.target.value)}
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addRow}
                className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink"
              >
                Anadir ejercicio
              </button>
              <button
                type="submit"
                className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Finalizar fuerza libre
              </button>
            </div>
          </form>
        </FeatureCard>

        <FeatureCard
          title="Cardio libre"
          description="Usa el mismo registro de cardio, pero sin sesion planificada asociada."
        >
          <Link
            href="/entrenar/cardio"
            className="inline-flex border border-ink bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Abrir cardio libre
          </Link>
        </FeatureCard>

        <FeatureCard
          title="Movilidad libre"
          description="Usa el registro de movilidad sin vinculo con una rutina del plan activo."
        >
          <Link
            href="/entrenar/movilidad"
            className="inline-flex border border-ink bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Abrir movilidad libre
          </Link>
        </FeatureCard>
      </section>
    </div>
  );
}
