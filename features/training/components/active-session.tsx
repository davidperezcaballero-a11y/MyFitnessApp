"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FeatureCard } from "@/components/ui/feature-card";
import { useWorkoutSession } from "@/features/training/hooks/use-workout-session";
import type { PlannedStrengthExercise, WorkoutSessionDraft } from "@/features/training/types";

type ActiveSessionProps = {
  initialSession: WorkoutSessionDraft;
};

type SetFormState = {
  weight: string;
  reps: string;
  rpe: string;
};

function buildPlannedSetLabels(exercise: PlannedStrengthExercise) {
  return Array.from({ length: exercise.targetSets }, (_, index) => {
    const loadLabel = exercise.targetWeight ? ` @ ${exercise.targetWeight} kg` : "";
    return {
      setNumber: index + 1,
      label: `${exercise.targetReps} reps${loadLabel}`,
    };
  });
}

export function ActiveSession({ initialSession }: ActiveSessionProps) {
  const {
    session,
    currentExercise,
    nextSetNumber,
    suggestedWeight,
    suggestedReps,
    isCurrentExerciseComplete,
    isSessionComplete,
    isPending,
    error,
    addStrengthSet,
    goToNextExercise,
    selectExercise,
    restartSession,
  } = useWorkoutSession(initialSession);

  const [form, setForm] = useState<SetFormState>({
    weight: String(suggestedWeight || ""),
    reps: String(suggestedReps || ""),
    rpe: "",
  });

  useEffect(() => {
    setForm({
      weight: suggestedWeight ? String(suggestedWeight) : "",
      reps: suggestedReps ? String(suggestedReps) : "",
      rpe: "",
    });
  }, [session.currentExerciseIndex, nextSetNumber, suggestedReps, suggestedWeight]);

  function submitCurrentSet() {
    const weight = Number(form.weight);
    const reps = Number(form.reps);
    const rpe = form.rpe.trim() ? Number(form.rpe) : undefined;

    if (!Number.isFinite(weight) || !Number.isFinite(reps)) {
      return;
    }

    addStrengthSet({
      weight,
      reps,
      rpe: Number.isFinite(rpe as number) ? rpe : undefined,
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
              Fuerza · Sesion activa
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {session.title}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-ink/68">
              Registra la ejecucion real comparando lo planificado con lo que vas haciendo en cada
              ejercicio. El ejercicio activo queda resaltado para que la sesion funcione como
              cuaderno de entrenamiento.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-ink/72 sm:text-right">
            <span>
              Ejercicio actual:{" "}
              <strong className="text-ink">
                {session.currentExerciseIndex + 1} / {session.exercises.length}
              </strong>
            </span>
            <span>
              Proximo set:{" "}
              <strong className="text-ink">
                {Math.min(nextSetNumber, currentExercise.targetSets)} / {currentExercise.targetSets}
              </strong>
            </span>
            <span>
              Estado:{" "}
              <strong className="text-ink">
                {session.status === "session_completed" ? "Sesion completada" : "En curso"}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-coral/25 bg-coral/12 px-4 py-3 text-sm text-ink">
          {error}
        </section>
      ) : null}

      <FeatureCard
        title="Orden de trabajo"
        description="Selecciona manualmente el ejercicio sobre el que quieres registrar la siguiente serie."
      >
        <div className="flex flex-wrap gap-1.5">
          {session.exercises.map((exercise, exerciseIndex) => {
            const isSelected = exerciseIndex === session.currentExerciseIndex;
            const isComplete = exercise.completedSets.length >= exercise.targetSets;

            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => selectExercise(exerciseIndex)}
                className={
                  isSelected
                    ? "border border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-white"
                    : isComplete
                      ? "border border-teal bg-teal/10 px-3 py-1.5 text-sm font-semibold text-ink"
                      : "border border-sand-strong bg-[#fbf8f1] px-3 py-1.5 text-sm font-semibold text-ink/75"
                }
              >
                {exercise.name}
              </button>
            );
          })}
        </div>
      </FeatureCard>

      <FeatureCard
        title="Hoja de trabajo"
        description="La sesion completa se muestra en tabla. La primera columna indica el ejercicio, y cada fila de set compara planificado y ejecutado."
      >
        <div className="plan-matrix-scroll w-full overflow-x-auto rounded-xl border border-sand-strong/70 bg-white">
          <table className="w-full min-w-[1120px] border-collapse">
            <thead>
              <tr>
                <th className="w-[230px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Ejercicio
                </th>
                <th className="w-[72px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Set
                </th>
                <th className="w-[180px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Plan
                </th>
                <th className="w-[180px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Hecho
                </th>
                <th className="w-[90px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  RPE
                </th>
                <th className="min-w-[260px] border-b border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Registro rapido
                </th>
              </tr>
            </thead>
            <tbody>
              {session.exercises.map((exercise, exerciseIndex) => {
                const plannedSets = buildPlannedSetLabels(exercise);
                const isCurrent = exerciseIndex === session.currentExerciseIndex;
                const rowTone = isCurrent ? "bg-[#fff7ef]" : "bg-white";

                return plannedSets.map((plannedSet, setIndex) => {
                  const completedSet = exercise.completedSets[setIndex];
                  const canFillRow = isCurrent && setIndex === exercise.completedSets.length;
                  const isExerciseComplete =
                    exercise.completedSets.length >= exercise.targetSets;

                  return (
                    <tr key={`${exercise.id}-${plannedSet.setNumber}`}>
                      {setIndex === 0 ? (
                        <td
                          rowSpan={plannedSets.length}
                          className={`border-b border-r border-sand-strong px-3 py-3 align-top text-sm font-semibold text-ink ${rowTone}`}
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-ink">{exercise.name}</p>
                            <p className="text-xs text-ink/55">
                              {exercise.targetSets} x {exercise.targetReps}
                              {exercise.targetWeight ? ` @ ${exercise.targetWeight} kg` : ""}
                            </p>
                            {isCurrent ? (
                              <span className="inline-flex border border-coral/30 bg-coral/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
                                Actual
                              </span>
                            ) : null}
                            {isExerciseComplete && !isCurrent ? (
                              <span className="inline-flex border border-teal/30 bg-teal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
                                Completado
                              </span>
                            ) : null}
                          </div>
                        </td>
                      ) : null}

                      <td className={`border-b border-r border-sand-strong px-3 py-2 text-sm text-ink/72 ${rowTone}`}>
                        {plannedSet.setNumber}
                      </td>
                      <td className={`border-b border-r border-sand-strong px-3 py-2 text-sm text-ink ${rowTone}`}>
                        {plannedSet.label}
                      </td>
                      <td className={`border-b border-r border-sand-strong px-3 py-2 text-sm text-ink ${rowTone}`}>
                        {completedSet ? `${completedSet.weight} kg x ${completedSet.reps}` : "—"}
                      </td>
                      <td className={`border-b border-r border-sand-strong px-3 py-2 text-sm text-ink ${rowTone}`}>
                        {completedSet?.rpe ?? "—"}
                      </td>
                      <td className={`border-b border-sand-strong px-3 py-2 ${rowTone}`}>
                        {canFillRow ? (
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="space-y-1">
                              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                                Kg
                              </span>
                              <input
                                value={form.weight}
                                onChange={(event) =>
                                  setForm((current) => ({ ...current, weight: event.target.value }))
                                }
                                inputMode="decimal"
                                className="w-[72px] border border-sand-strong bg-[#fffdfa] px-2 py-1 text-sm text-ink outline-none transition focus:border-teal"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                                Reps
                              </span>
                              <input
                                value={form.reps}
                                onChange={(event) =>
                                  setForm((current) => ({ ...current, reps: event.target.value }))
                                }
                                inputMode="numeric"
                                className="w-[64px] border border-sand-strong bg-[#fffdfa] px-2 py-1 text-sm text-ink outline-none transition focus:border-teal"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                                RPE
                              </span>
                              <input
                                value={form.rpe}
                                onChange={(event) =>
                                  setForm((current) => ({ ...current, rpe: event.target.value }))
                                }
                                inputMode="decimal"
                                className="w-[64px] border border-sand-strong bg-[#fffdfa] px-2 py-1 text-sm text-ink outline-none transition focus:border-teal"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={submitCurrentSet}
                              disabled={isPending}
                              className="border border-ink bg-ink px-3 py-[7px] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isPending ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        ) : completedSet ? (
                          <span className="text-xs font-medium uppercase tracking-[0.12em] text-teal">
                            Set registrado
                          </span>
                        ) : isCurrent ? (
                          <span className="text-xs text-ink/55">Espera al set actual</span>
                        ) : (
                          <span className="text-xs text-ink/55">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </FeatureCard>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-sand-strong/70 bg-white/90 px-4 py-4">
        <div className="space-y-1 text-sm text-ink/68">
          <p>
            Ejercicio actual: <strong className="text-ink">{currentExercise.name}</strong>
          </p>
          <p>
            Series completadas:{" "}
            <strong className="text-ink">
              {currentExercise.completedSets.length} / {currentExercise.targetSets}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={goToNextExercise}
            disabled={isPending || !isCurrentExerciseComplete}
            className="border border-teal bg-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSessionComplete ? "Finalizar sesion" : "Siguiente ejercicio"}
          </button>
          <Link
            href="/entrenar"
            className="border border-sand-strong bg-white px-4 py-2 text-sm font-semibold text-ink"
          >
            Volver
          </Link>
          {session.status === "session_completed" ? (
            <button
              type="button"
              onClick={restartSession}
              className="border border-coral bg-coral px-4 py-2 text-sm font-semibold text-white"
            >
              Reiniciar
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
