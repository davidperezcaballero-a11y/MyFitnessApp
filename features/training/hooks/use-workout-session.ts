"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  addStrengthSetAction,
  createStrengthWorkoutAction,
  finishWorkoutAction,
} from "@/features/training/actions";
import type { StrengthSet, WorkoutSessionDraft } from "@/features/training/types";

type SetInput = {
  weight: number;
  reps: number;
  rpe?: number;
};

function cloneSession(session: WorkoutSessionDraft): WorkoutSessionDraft {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      completedSets: exercise.completedSets.map((set) => ({ ...set })),
    })),
  };
}

export function useWorkoutSession(initialSession: WorkoutSessionDraft) {
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSessionDraft>(() => cloneSession(initialSession));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initializedRef = useRef(false);

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const lastSet = currentExercise.completedSets[currentExercise.completedSets.length - 1];
  const nextSetNumber = currentExercise.completedSets.length + 1;
  const suggestedWeight = lastSet?.weight ?? currentExercise.targetWeight ?? 0;
  const suggestedReps = lastSet?.reps ?? currentExercise.targetReps;
  const isCurrentExerciseComplete = currentExercise.completedSets.length >= currentExercise.targetSets;
  const isSessionComplete = session.currentExerciseIndex >= session.exercises.length - 1 && isCurrentExerciseComplete;

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    startTransition(async () => {
      try {
        const created = await createStrengthWorkoutAction({
          title: session.title,
          plannedSessionId: session.plannedSessionId,
          exercises: session.exercises.map((exercise, index) => ({
            exerciseName: exercise.name.toLowerCase(),
            orderIndex: index + 1,
          })),
        });

        setError(null);
        setSession((current) => ({
          ...current,
          workoutSessionId: created.workoutSessionId,
          exercises: current.exercises.map((exercise, index) => ({
            ...exercise,
            sessionExerciseId: created.sessionExercises.find(
              (item) => item.order_index === index + 1,
            )?.id,
          })),
        }));
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "No se pudo iniciar la sesion.");
      }
    });
  }, [session.exercises, session.plannedSessionId, session.title]);

  function addStrengthSet(input: SetInput) {
    startTransition(async () => {
      const exercise = session.exercises[session.currentExerciseIndex];

      if (!exercise.sessionExerciseId) {
        setError("La sesion todavia no esta lista para guardar sets.");
        return;
      }

      try {
        await addStrengthSetAction({
          sessionExerciseId: exercise.sessionExerciseId,
          setNumber: exercise.completedSets.length + 1,
          weight: input.weight,
          reps: input.reps,
          rpe: input.rpe,
        });

        setSession((current) => {
          const next = cloneSession(current);
          const currentExercise = next.exercises[next.currentExerciseIndex];

          const newSet: StrengthSet = {
            setNumber: currentExercise.completedSets.length + 1,
            weight: input.weight,
            reps: input.reps,
            rpe: input.rpe,
          };

          currentExercise.completedSets.push(newSet);
          next.status = "exercise_active";
          return next;
        });
        setError(null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "No se pudo guardar la serie.");
      }
    });
  }

  function goToNextExercise() {
    startTransition(async () => {
      if (isSessionComplete && session.workoutSessionId) {
        try {
          await finishWorkoutAction({ workoutSessionId: session.workoutSessionId });
          setError(null);
          router.push("/entrenar?message=Sesion%20de%20fuerza%20guardada.");
          router.refresh();
          return;
        } catch (caughtError) {
          setError(
            caughtError instanceof Error ? caughtError.message : "No se pudo finalizar la sesion.",
          );
          return;
        }
      }

      setSession((current) => {
        if (current.currentExerciseIndex >= current.exercises.length - 1) {
          return {
            ...current,
            status: "session_completed",
          };
        }

        return {
          ...current,
          currentExerciseIndex: current.currentExerciseIndex + 1,
          status: "exercise_active",
        };
      });
    });
  }

  function selectExercise(exerciseIndex: number) {
    setSession((current) => ({
      ...current,
      currentExerciseIndex: exerciseIndex,
      status: current.status === "session_completed" ? current.status : "exercise_active",
    }));
  }

  function restartSession() {
    initializedRef.current = false;
    setError(null);
    setSession(cloneSession(initialSession));
  }

  return {
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
  };
}
