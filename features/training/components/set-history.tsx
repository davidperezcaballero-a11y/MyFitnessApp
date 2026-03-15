import type { PlannedStrengthExercise } from "@/features/training/types";

type SetHistoryProps = {
  exercise: PlannedStrengthExercise;
};

export function SetHistory({ exercise }: SetHistoryProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
          Historico de la sesion
        </h3>
        <span className="text-sm text-ink/60">
          {exercise.completedSets.length}/{exercise.targetSets} sets
        </span>
      </div>

      {exercise.completedSets.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-sand px-4 py-4 text-sm text-ink/65">
          Todavia no has registrado sets para este ejercicio.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {exercise.completedSets.map((set) => (
            <li
              key={set.setNumber}
              className="flex items-center justify-between rounded-2xl bg-sand px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-ink">Serie {set.setNumber}</p>
                <p className="text-sm text-ink/60">
                  {set.weight} kg x {set.reps}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/70">
                RPE {set.rpe ?? "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
