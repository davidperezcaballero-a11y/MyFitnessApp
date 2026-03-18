import { FeatureCard } from "@/components/ui/feature-card";
import type { TrainingPlanDraft } from "@/features/planning/types";

type StrengthPlanSectionProps = {
  plan: TrainingPlanDraft;
};

type StrengthGridRow = {
  exerciseName: string;
  workLabel: string;
  seriesLabel: string;
  weeks: Array<{
    prescription: string;
  }>;
};

type StrengthDayBlock = {
  dayLabel: string;
  title: string;
  weekHeaders: Array<string>;
  rows: StrengthGridRow[];
};

function buildStrengthBlocks(plan: TrainingPlanDraft): StrengthDayBlock[] {
  const strengthBlocks = new Map<string, StrengthDayBlock>();

  plan.weeks.forEach((week, weekIndex) => {
    const weekLabel = `Semana ${week.weekNumber}`;

    week.sessions
      .filter((session) => session.sessionType === "strength")
      .forEach((session) => {
        const blockKey = `${session.dayLabel}-${session.title}`;
        const existingBlock: StrengthDayBlock = strengthBlocks.get(blockKey) ?? {
          dayLabel: session.dayLabel,
          title: session.title,
          weekHeaders: Array(plan.weeks.length).fill(""),
          rows: [],
        };

        existingBlock.weekHeaders[weekIndex] = weekLabel;

        session.exercises.forEach((exercise) => {
          const existingRow = existingBlock.rows.find((row) => row.exerciseName === exercise.name);
          const workLabel = exercise.prescription.includes("x")
            ? exercise.prescription.split("@")[0]?.trim() ?? exercise.prescription
            : exercise.prescription;
          const seriesLabel = exercise.prescription.includes("x")
            ? exercise.prescription.split("x")[0]?.trim() ?? "-"
            : "-";

          if (existingRow) {
            existingRow.weeks[weekIndex] = { prescription: exercise.prescription };
            return;
          }

          existingBlock.rows.push({
            exerciseName: exercise.name,
            workLabel,
            seriesLabel,
            weeks: Array.from({ length: plan.weeks.length }, (_, index) => ({
              prescription: index === weekIndex ? exercise.prescription : "-",
            })),
          });
        });

        strengthBlocks.set(blockKey, existingBlock);
      });
  });

  return Array.from(strengthBlocks.values());
}

export function StrengthPlanSection({ plan }: StrengthPlanSectionProps) {
  const blocks = buildStrengthBlocks(plan);

  if (blocks.length === 0) {
    return (
      <FeatureCard
        title="Fuerza"
        description="Todavia no hay sesiones de fuerza creadas. Usa el formulario inferior para anadir la primera."
      />
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((block) => (
        <FeatureCard
          key={`${block.dayLabel}-${block.title}`}
          title={`${block.dayLabel} · ${block.title}`}
          description="Vista matricial inicial por semanas para la seccion de fuerza."
        >
          <div className="overflow-x-auto">
            <table className="min-w-[900px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="rounded-tl-2xl bg-ink px-4 py-3 text-left text-sm font-semibold text-white">
                    Ejercicio
                  </th>
                  <th className="bg-ink px-4 py-3 text-left text-sm font-semibold text-white">
                    Trabajo
                  </th>
                  <th className="bg-ink px-4 py-3 text-left text-sm font-semibold text-white">
                    Series
                  </th>
                  {block.weekHeaders.map((weekHeader, index) => (
                    <th
                      key={`${weekHeader}-${index}`}
                      className="bg-coral px-4 py-3 text-left text-sm font-semibold text-white last:rounded-tr-2xl"
                    >
                      {weekHeader || `Semana ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.exerciseName}>
                    <td className="border-b border-white/70 bg-white px-4 py-4 text-sm font-semibold text-ink">
                      {row.exerciseName}
                    </td>
                    <td className="border-b border-white/70 bg-white px-4 py-4 text-sm text-ink/72">
                      {row.workLabel}
                    </td>
                    <td className="border-b border-white/70 bg-white px-4 py-4 text-sm text-ink/72">
                      {row.seriesLabel}
                    </td>
                    {row.weeks.map((week, index) => (
                      <td
                        key={`${row.exerciseName}-${index}`}
                        className="border-b border-white/70 bg-sky-50 px-4 py-4 text-sm text-ink"
                      >
                        {week.prescription}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FeatureCard>
      ))}
    </div>
  );
}
