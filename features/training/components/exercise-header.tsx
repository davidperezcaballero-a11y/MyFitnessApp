import type { PlannedStrengthExercise } from "@/features/training/types";

type ExerciseHeaderProps = {
  exercise: PlannedStrengthExercise;
  exerciseIndex: number;
  totalExercises: number;
  nextSetNumber: number;
};

export function ExerciseHeader({
  exercise,
  exerciseIndex,
  totalExercises,
  nextSetNumber,
}: ExerciseHeaderProps) {
  return (
    <section className="rounded-[28px] bg-ink px-5 py-5 text-white shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-coral">
        Ejercicio {exerciseIndex + 1} de {totalExercises}
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{exercise.name}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Serie actual</p>
          <p className="mt-2 text-lg font-semibold">
            {nextSetNumber} de {exercise.targetSets}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Objetivo</p>
          <p className="mt-2 text-lg font-semibold">
            {exercise.targetReps} reps
            {exercise.targetWeight ? ` @ ${exercise.targetWeight} kg` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
