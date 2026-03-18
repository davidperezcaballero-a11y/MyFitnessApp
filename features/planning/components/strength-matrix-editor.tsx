"use client";

import { useMemo, useState, useTransition } from "react";

import { FeatureCard } from "@/components/ui/feature-card";
import { saveStrengthMatrixAction } from "@/features/planning/actions";
import type { TrainingPlanDraft } from "@/features/planning/types";

type StrengthMatrixEditorProps = {
  plan: TrainingPlanDraft;
  exerciseOptions: Array<{
    id: string;
    name: string;
    exerciseType: string;
  }>;
  readOnly?: boolean;
};

type StrengthCell = {
  sets: string;
  reps: string;
  load: string;
  prescription: string;
};

type StrengthRow = {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  weeks: StrengthCell[];
};

type StrengthDayMatrix = {
  id: string;
  dayLabel: string;
  title: string;
  weekHeaders: string[];
  rows: StrengthRow[];
};

const strengthDays = [
  { dayLabel: "Lun", title: "Fuerza" },
  { dayLabel: "Mar", title: "Fuerza" },
  { dayLabel: "Mie", title: "Fuerza" },
  { dayLabel: "Jue", title: "Fuerza" },
  { dayLabel: "Vie", title: "Fuerza" },
  { dayLabel: "Sab", title: "Fuerza" },
  { dayLabel: "Dom", title: "Fuerza" },
];

function parseStrengthPrescription(prescription: string): StrengthCell {
  const normalized = prescription.trim().replace(",", ".");
  const match = normalized.match(
    /^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*@\s*(\d+(?:\.\d+)?))?(?:\s*kg)?$/i,
  );

  if (!match) {
    return {
      sets: "",
      reps: "",
      load: "",
      prescription: normalized,
    };
  }

  return {
    sets: match[1] ?? "",
    reps: match[2] ?? "",
    load: match[3] ?? "",
    prescription: normalized,
  };
}

function formatStrengthPrescription(cell: Pick<StrengthCell, "sets" | "reps" | "load">) {
  const sets = cell.sets.trim();
  const reps = cell.reps.trim();
  const load = cell.load.trim();

  if (!sets && !reps && !load) {
    return "";
  }

  if (!sets || !reps) {
    return [sets, reps, load ? `@ ${load} kg` : ""].filter(Boolean).join(" ").trim();
  }

  return `${sets} x ${reps}${load ? ` @ ${load} kg` : ""}`;
}

function buildStrengthMatrices(plan: TrainingPlanDraft): StrengthDayMatrix[] {
  const matrices = new Map<string, StrengthDayMatrix>();

  strengthDays.forEach((day) => {
    matrices.set(`${day.dayLabel}-${day.title}`, {
      id: `${day.dayLabel}-${day.title}`,
      dayLabel: day.dayLabel,
      title: day.title,
      weekHeaders: Array.from({ length: plan.weeks.length }, (_, index) => `Semana ${index + 1}`),
      rows: [],
    });
  });

  plan.weeks.forEach((week, weekIndex) => {
    const weekLabel = `Semana ${week.weekNumber}`;

    week.sessions
      .filter((session) => session.sessionType === "strength")
      .forEach((session) => {
        const matrixKey = `${session.dayLabel}-${session.title}`;
        const currentMatrix: StrengthDayMatrix = matrices.get(matrixKey) ?? {
          id: matrixKey,
          dayLabel: session.dayLabel,
          title: session.title,
          weekHeaders: Array(plan.weeks.length).fill(""),
          rows: [],
        };

        currentMatrix.weekHeaders[weekIndex] = weekLabel;

        session.exercises.forEach((exercise, exerciseIndex) => {
          const existingRow = currentMatrix.rows.find((row) => row.exerciseName === exercise.name);

          if (existingRow) {
            existingRow.weeks[weekIndex] = parseStrengthPrescription(exercise.prescription);
            return;
          }

          currentMatrix.rows.push({
            id: `${matrixKey}-${exerciseIndex + 1}`,
            exerciseId: exercise.exerciseId ?? null,
            exerciseName: exercise.name,
            weeks: Array.from({ length: plan.weeks.length }, (_, index) => ({
              ...(index === weekIndex
                ? parseStrengthPrescription(exercise.prescription)
                : {
                    sets: "",
                    reps: "",
                    load: "",
                    prescription: "",
                  }),
            })),
          });
        });

        matrices.set(matrixKey, currentMatrix);
      });
  });

  return Array.from(matrices.values());
}

function matrixHasContent(matrix: StrengthDayMatrix) {
  return matrix.rows.some(
    (row) =>
      Boolean(row.exerciseId) ||
      row.exerciseName.trim().length > 0 ||
      row.weeks.some((week) => week.prescription.trim().length > 0),
  );
}

export function StrengthMatrixEditor({
  plan,
  exerciseOptions,
  readOnly = false,
}: StrengthMatrixEditorProps) {
  const [matrices, setMatrices] = useState<StrengthDayMatrix[]>(() => buildStrengthMatrices(plan));
  const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(
    matrices.find(matrixHasContent)?.id ?? matrices[0]?.id ?? null,
  );
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const strengthExerciseOptions = exerciseOptions.filter(
    (exercise) => exercise.exerciseType === "strength",
  );
  const serializedMatrices = useMemo(
    () =>
      JSON.stringify(
        matrices.map((matrix) => ({
          id: matrix.id,
          dayLabel: matrix.dayLabel,
          title: matrix.title,
          rows: matrix.rows.map((row) => ({
            id: row.id,
            exerciseId: row.exerciseId,
            exerciseName: row.exerciseName,
            weeks: row.weeks,
          })),
        })),
      ),
    [matrices],
  );

  const selectedMatrix = matrices.find((matrix) => matrix.id === selectedMatrixId) ?? matrices[0] ?? null;

  function updateCell(
    rowId: string,
    weekIndex: number,
    field: keyof Pick<StrengthCell, "sets" | "reps" | "load">,
    value: string,
  ) {
    setMatrices((current) =>
      current.map((matrix) => {
        if (matrix.id !== selectedMatrixId) {
          return matrix;
        }

        return {
          ...matrix,
          rows: matrix.rows.map((row) => {
            if (row.id !== rowId) {
              return row;
            }

            const nextWeeks = row.weeks.map((week, index) =>
              index === weekIndex
                ? {
                    ...week,
                    [field]: value,
                    prescription: formatStrengthPrescription({
                      ...week,
                      [field]: value,
                    }),
                  }
                : week,
            );

            return {
              ...row,
              weeks: nextWeeks,
            };
          }),
        };
      }),
    );
  }

  function updateExercise(rowId: string, exerciseId: string) {
    const selectedExercise =
      strengthExerciseOptions.find((exercise) => exercise.id === exerciseId) ?? null;

    setMatrices((current) =>
      current.map((matrix) => {
        if (matrix.id !== selectedMatrixId) {
          return matrix;
        }

        return {
          ...matrix,
          rows: matrix.rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  exerciseId,
                  exerciseName: selectedExercise?.name ?? row.exerciseName,
                }
              : row,
          ),
        };
      }),
    );
  }

  function addRow() {
    if (!selectedMatrix) {
      return;
    }

    setMatrices((current) =>
      current.map((matrix) => {
        if (matrix.id !== selectedMatrix.id) {
          return matrix;
        }

        return {
          ...matrix,
          rows: [
            ...matrix.rows,
            {
              id: `${matrix.id}-row-${matrix.rows.length + 1}`,
              exerciseId: null,
              exerciseName: "",
              weeks: Array.from({ length: matrix.weekHeaders.length }, () => ({
                sets: "",
                reps: "",
                load: "",
                prescription: "",
              })),
            },
          ],
        };
      }),
    );
  }

  function saveMatrices(formData: FormData) {
    setSaveMessage(null);
    startTransition(async () => {
      try {
        const result = await saveStrengthMatrixAction(formData);
        setSaveMessage(result?.message ?? "No se pudo guardar la matriz de fuerza.");
      } catch {
        setSaveMessage("No se pudo guardar la matriz de fuerza.");
      }
    });
  }

  if (!selectedMatrix) {
    return (
      <FeatureCard
        title="Fuerza"
        description="Todavia no hay sesiones de fuerza creadas en el plan."
      />
    );
  }

  return (
    <FeatureCard
      title="Fuerza"
      description={
        readOnly
          ? "Vista matricial del bloque de fuerza en modo consulta."
          : "Planifica por semanas con una hoja ligera de escritorio. Cada celda resume sets, reps y carga."
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {matrices.map((matrix) => (
            <button
              key={matrix.id}
              type="button"
              onClick={() => setSelectedMatrixId(matrix.id)}
              className={
                matrix.id === selectedMatrix.id
                  ? "border border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-white"
                  : matrixHasContent(matrix)
                    ? "border border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-white"
                    : "border border-sand-strong bg-[#fbf8f1] px-3 py-1.5 text-sm font-semibold text-ink/72"
              }
            >
              {matrix.dayLabel} · {matrix.title}
            </button>
          ))}
        </div>

        <div className="plan-matrix-scroll w-full overflow-x-auto rounded-xl border border-sand-strong/70 bg-white pb-2">
          <table className="w-max min-w-[1180px] border-collapse xl:min-w-[1480px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                  Ejercicio
                </th>
                {selectedMatrix.weekHeaders.map((weekHeader, index) => (
                  <th
                    key={`${weekHeader}-${index}`}
                    className="min-w-[116px] border-b border-r border-sand-strong bg-[#f4efe7] px-2 py-2 text-left text-sm font-semibold text-ink"
                  >
                    {weekHeader || `Semana ${index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedMatrix.rows.length > 0 ? (
                selectedMatrix.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="sticky left-0 z-10 w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-sand-strong bg-white px-3 py-2 align-top text-sm font-semibold text-ink">
                      <select
                        value={row.exerciseId ?? ""}
                        onChange={(event) => updateExercise(row.id, event.target.value)}
                        disabled={readOnly}
                        className="w-full max-w-[220px] border border-sand-strong bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-teal"
                      >
                        <option value="">Selecciona ejercicio</option>
                        {strengthExerciseOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {row.weeks.map((week, weekIndex) => (
                      <td
                        key={`${row.id}-${weekIndex}`}
                        className="min-w-[116px] border-b border-r border-sand-strong bg-white px-2 py-2 align-top"
                      >
                        <div className="grid grid-cols-[34px_34px_46px] gap-1">
                          <label className="space-y-1">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              S
                            </span>
                            <input
                              value={week.sets}
                              onChange={(event) =>
                                updateCell(row.id, weekIndex, "sets", event.target.value)
                              }
                              placeholder="3"
                              readOnly={readOnly}
                              inputMode="numeric"
                              className="w-[34px] border border-sand-strong bg-[#fffdfa] px-1 py-1 text-center text-sm text-ink outline-none transition focus:border-teal"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              R
                            </span>
                            <input
                              value={week.reps}
                              onChange={(event) =>
                                updateCell(row.id, weekIndex, "reps", event.target.value)
                              }
                              placeholder="6"
                              readOnly={readOnly}
                              inputMode="numeric"
                              className="w-[34px] border border-sand-strong bg-[#fffdfa] px-1 py-1 text-center text-sm text-ink outline-none transition focus:border-teal"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              Kg
                            </span>
                            <input
                              value={week.load}
                              onChange={(event) =>
                                updateCell(row.id, weekIndex, "load", event.target.value)
                              }
                              placeholder="70"
                              readOnly={readOnly}
                              inputMode="decimal"
                              className="w-[46px] border border-sand-strong bg-[#fffdfa] px-1 py-1 text-center text-sm text-ink outline-none transition focus:border-teal"
                            />
                          </label>
                        </div>
                        {week.prescription ? (
                          <p className="mt-1.5 text-[11px] text-ink/55">{week.prescription}</p>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                    <td
                      colSpan={selectedMatrix.weekHeaders.length + 1}
                      className="border-b border-sand-strong bg-[#fbf8f1] px-4 py-6 text-sm text-ink/65"
                    >
                    Todavia no hay ejercicios en este dia. Pulsa "Anadir fila" para empezar a montar la matriz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          {!readOnly ? (
            <>
              <button
                type="button"
                onClick={addRow}
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Anadir fila
              </button>
              <form action={saveMatrices} className="flex flex-wrap gap-3">
                <input type="hidden" name="planId" value={plan.id} />
                <input type="hidden" name="matrices" value={serializedMatrices} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-teal/60"
                >
                  {isPending ? "Guardando..." : "Guardar fuerza"}
                </button>
              </form>
            </>
          ) : null}
          <span className="rounded-full bg-sand px-4 py-2 text-sm text-ink/68">
            {readOnly
              ? "Plan finalizado: consulta disponible, edicion bloqueada."
              : saveMessage ?? "La matriz se guarda completa por seccion."}
          </span>
        </div>
      </div>
    </FeatureCard>
  );
}
