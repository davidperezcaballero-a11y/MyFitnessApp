"use client";

import { useMemo, useState, useTransition } from "react";

import { FeatureCard } from "@/components/ui/feature-card";
import { saveMobilityMatrixAction } from "@/features/planning/actions";
import type { TrainingPlanDraft } from "@/features/planning/types";

type MobilityPlanSectionProps = {
  plan: TrainingPlanDraft;
  exerciseOptions?: Array<{
    id: string;
    name: string;
    exerciseType: string;
  }>;
  readOnly?: boolean;
};

type MobilityGridRow = {
  id: string;
  exerciseId: string | null;
  routineName: string;
  weeks: Array<{
    prescription: string;
  }>;
};

type MobilityDayBlock = {
  dayLabel: string;
  title: string;
  weekHeaders: Array<string>;
  rows: MobilityGridRow[];
};

const mobilityDays = [
  { dayLabel: "Lun", title: "Movilidad" },
  { dayLabel: "Mar", title: "Movilidad" },
  { dayLabel: "Mie", title: "Movilidad" },
  { dayLabel: "Jue", title: "Movilidad" },
  { dayLabel: "Vie", title: "Movilidad" },
  { dayLabel: "Sab", title: "Movilidad" },
  { dayLabel: "Dom", title: "Movilidad" },
];

function buildMobilityBlocks(plan: TrainingPlanDraft): MobilityDayBlock[] {
  const mobilityBlocks = new Map<string, MobilityDayBlock>();

  mobilityDays.forEach((day) => {
    mobilityBlocks.set(`${day.dayLabel}-${day.title}`, {
      dayLabel: day.dayLabel,
      title: day.title,
      weekHeaders: Array.from({ length: plan.weeks.length }, (_, index) => `Semana ${index + 1}`),
      rows: [],
    });
  });

  plan.weeks.forEach((week, weekIndex) => {
    const weekLabel = `Semana ${week.weekNumber}`;

    week.sessions
      .filter((session) => session.sessionType === "mobility")
      .forEach((session) => {
        const blockKey = `${session.dayLabel}-${session.title}`;
        const existingBlock: MobilityDayBlock = mobilityBlocks.get(blockKey) ?? {
          dayLabel: session.dayLabel,
          title: session.title,
          weekHeaders: Array(plan.weeks.length).fill(""),
          rows: [],
        };

        existingBlock.weekHeaders[weekIndex] = weekLabel;

        session.exercises.forEach((exercise, exerciseIndex) => {
          const existingRow = existingBlock.rows.find((row) => row.routineName === exercise.name);

          if (existingRow) {
            existingRow.weeks[weekIndex] = { prescription: exercise.prescription };
            return;
          }

          existingBlock.rows.push({
            id: `${blockKey}-${exerciseIndex + 1}`,
            exerciseId: exercise.exerciseId ?? null,
            routineName: exercise.name,
            weeks: Array.from({ length: plan.weeks.length }, (_, index) => ({
              prescription: index === weekIndex ? exercise.prescription : "",
            })),
          });
        });

        mobilityBlocks.set(blockKey, existingBlock);
      });
  });

  return Array.from(mobilityBlocks.values());
}

function blockHasContent(block: MobilityDayBlock) {
  return block.rows.some(
    (row) =>
      Boolean(row.exerciseId) ||
      row.routineName.trim().length > 0 ||
      row.weeks.some((week) => week.prescription.trim().length > 0),
  );
}

export function MobilityPlanSection({
  plan,
  exerciseOptions = [],
  readOnly = false,
}: MobilityPlanSectionProps) {
  const [blocks, setBlocks] = useState<MobilityDayBlock[]>(() => buildMobilityBlocks(plan));
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(
    blocks.find(blockHasContent)
      ? `${blocks.find(blockHasContent)?.dayLabel}-${blocks.find(blockHasContent)?.title}`
      : blocks[0]
        ? `${blocks[0].dayLabel}-${blocks[0].title}`
        : null,
  );
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const mobilityExerciseOptions = exerciseOptions.filter(
    (exercise) => exercise.exerciseType === "mobility",
  );
  const serializedBlocks = useMemo(
    () =>
      JSON.stringify(
        blocks.map((block) => ({
          dayLabel: block.dayLabel,
          title: block.title,
          rows: block.rows.map((row) => ({
            id: row.id,
            exerciseId: row.exerciseId,
            exerciseName: row.routineName,
            weeks: row.weeks,
          })),
        })),
      ),
    [blocks],
  );

  const selectedBlock =
    blocks.find((block) => `${block.dayLabel}-${block.title}` === selectedBlockKey) ?? blocks[0] ?? null;

  function updateCell(rowId: string, weekIndex: number, value: string) {
    setBlocks((current) =>
      current.map((block) => {
        if (`${block.dayLabel}-${block.title}` !== selectedBlockKey) {
          return block;
        }

        return {
          ...block,
          rows: block.rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  weeks: row.weeks.map((week, index) =>
                    index === weekIndex ? { prescription: value } : week,
                  ),
                }
              : row,
          ),
        };
      }),
    );
  }

  function updateExercise(rowId: string, exerciseId: string) {
    const selectedExercise =
      mobilityExerciseOptions.find((exercise) => exercise.id === exerciseId) ?? null;

    setBlocks((current) =>
      current.map((block) => {
        if (`${block.dayLabel}-${block.title}` !== selectedBlockKey) {
          return block;
        }

        return {
          ...block,
          rows: block.rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  exerciseId,
                  routineName: selectedExercise?.name ?? row.routineName,
                }
              : row,
          ),
        };
      }),
    );
  }

  function addRow() {
    if (!selectedBlock) return;

    setBlocks((current) =>
      current.map((block) =>
        `${block.dayLabel}-${block.title}` === `${selectedBlock.dayLabel}-${selectedBlock.title}`
          ? {
              ...block,
              rows: [
                ...block.rows,
                {
                  id: `${block.dayLabel}-${block.title}-row-${block.rows.length + 1}`,
                  exerciseId: null,
                  routineName: "",
                  weeks: Array.from({ length: block.weekHeaders.length }, () => ({
                    prescription: "",
                  })),
                },
              ],
            }
          : block,
      ),
    );
  }

  function saveBlocks(formData: FormData) {
    setSaveMessage(null);
    startTransition(async () => {
      try {
        const result = await saveMobilityMatrixAction(formData);
        setSaveMessage(result?.message ?? "No se pudo guardar la matriz de movilidad.");
      } catch {
        setSaveMessage("No se pudo guardar la matriz de movilidad.");
      }
    });
  }

  if (!selectedBlock) {
    return (
      <FeatureCard
        title="Movilidad"
        description="Todavia no hay sesiones de movilidad creadas en el plan."
      />
    );
  }

  return (
    <FeatureCard
      title="Movilidad"
      description={
        readOnly
          ? "Vista matricial del bloque de movilidad en modo consulta."
          : "Hoja de planificacion de movilidad por semanas. Cada celda resume la rutina prevista."
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {blocks.map((block) => {
            const blockKey = `${block.dayLabel}-${block.title}`;

            return (
              <button
                key={blockKey}
                type="button"
                onClick={() => setSelectedBlockKey(blockKey)}
                className={
                  blockKey === `${selectedBlock.dayLabel}-${selectedBlock.title}`
                    ? "border border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-white"
                    : blockHasContent(block)
                      ? "border border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-white"
                      : "border border-sand-strong bg-[#fbf8f1] px-3 py-1.5 text-sm font-semibold text-ink/72"
                }
              >
                {block.dayLabel} · {block.title}
              </button>
            );
          })}
        </div>

        <div className="plan-matrix-scroll w-full overflow-x-auto rounded-xl border border-sand-strong/70 bg-white pb-2">
          <table className="w-max min-w-[1080px] border-collapse xl:min-w-[1360px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-sand-strong bg-[#f4efe7] px-3 py-2 text-left text-sm font-semibold text-ink">
                    Rutina / ejercicio
                  </th>
                  {selectedBlock.weekHeaders.map((weekHeader, index) => (
                    <th
                      key={`${weekHeader}-${index}`}
                      className="min-w-[124px] border-b border-r border-sand-strong bg-[#f4efe7] px-2 py-2 text-left text-sm font-semibold text-ink"
                    >
                      {weekHeader || `Semana ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedBlock.rows.length > 0 ? (
                  selectedBlock.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="sticky left-0 z-10 w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-sand-strong bg-white px-3 py-2 align-top text-sm font-semibold text-ink">
                      <select
                        value={row.exerciseId ?? ""}
                        onChange={(event) => updateExercise(row.id, event.target.value)}
                        disabled={readOnly}
                        className="w-full max-w-[220px] border border-sand-strong bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-teal"
                      >
                        <option value="">Selecciona ejercicio</option>
                        {mobilityExerciseOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {row.weeks.map((week, index) => (
                      <td
                        key={`${row.id}-${index}`}
                        className="min-w-[124px] border-b border-r border-sand-strong bg-white px-2 py-2 text-sm text-ink align-top"
                      >
                        <input
                          value={week.prescription}
                          onChange={(event) => updateCell(row.id, index, event.target.value)}
                          placeholder="10 min cadera"
                          readOnly={readOnly}
                          className="w-full border border-sand-strong bg-[#fffdfa] px-2 py-1.5 text-sm text-ink outline-none transition focus:border-teal"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={selectedBlock.weekHeaders.length + 1}
                    className="border-b border-sand-strong bg-[#fbf8f1] px-4 py-6 text-sm text-ink/65"
                  >
                    Todavia no hay bloques de movilidad en este dia. Pulsa "Anadir fila" para planificarlos.
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
              <form action={saveBlocks} className="flex flex-wrap gap-3">
                <input type="hidden" name="planId" value={plan.id} />
                <input type="hidden" name="matrices" value={serializedBlocks} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-teal/60"
                >
                  {isPending ? "Guardando..." : "Guardar movilidad"}
                </button>
              </form>
            </>
          ) : null}
          <span className="rounded-full bg-sand px-4 py-2 text-sm text-ink/68">
            {readOnly
              ? "Plan finalizado: consulta disponible, edicion bloqueada."
              : saveMessage ?? "La matriz de movilidad se guarda completa por seccion."}
          </span>
        </div>
      </div>
    </FeatureCard>
  );
}
