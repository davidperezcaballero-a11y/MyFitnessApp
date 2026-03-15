"use client";

import Link from "next/link";

import { ExerciseHeader } from "@/features/training/components/exercise-header";
import { SetHistory } from "@/features/training/components/set-history";
import { SetInput } from "@/features/training/components/set-input";
import { useWorkoutSession } from "@/features/training/hooks/use-workout-session";

export function ActiveSession() {
  const {
    session,
    currentExercise,
    nextSetNumber,
    suggestedWeight,
    suggestedReps,
    isCurrentExerciseComplete,
    isSessionComplete,
    addStrengthSet,
    goToNextExercise,
    restartSession,
  } = useWorkoutSession();

  return (
    <div className="space-y-5">
      <ExerciseHeader
        exercise={currentExercise}
        exerciseIndex={session.currentExerciseIndex}
        totalExercises={session.exercises.length}
        nextSetNumber={nextSetNumber}
      />

      <SetHistory exercise={currentExercise} />

      {!isCurrentExerciseComplete ? (
        <SetInput
          nextSetNumber={nextSetNumber}
          suggestedWeight={suggestedWeight}
          suggestedReps={suggestedReps}
          onSubmit={addStrengthSet}
        />
      ) : (
        <section className="rounded-[28px] border border-moss/20 bg-white/90 p-5 shadow-panel">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
            Ejercicio completado
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Ya has terminado todas las series planificadas de {currentExercise.name}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goToNextExercise}
              className="rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink"
            >
              {isSessionComplete ? "Finalizar sesion" : "Pasar al siguiente ejercicio"}
            </button>
            <Link
              href="/entrenar"
              className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink"
            >
              Volver al menu
            </Link>
          </div>
        </section>
      )}

      {session.status === "session_completed" ? (
        <section className="rounded-[28px] bg-ink px-5 py-5 text-white shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-coral">
            Sesion finalizada
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            Flujo principal validado
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/72">
            La sesion mock termina correctamente. El siguiente paso sera persistir estos eventos en
            backend y enlazar historial y metricas.
          </p>
          <button
            type="button"
            onClick={restartSession}
            className="mt-4 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
          >
            Reiniciar demo
          </button>
        </section>
      ) : null}
    </div>
  );
}
