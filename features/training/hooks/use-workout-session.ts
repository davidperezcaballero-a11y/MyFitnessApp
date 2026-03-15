"use client";

import { useState } from "react";

import { mockWorkoutSession } from "@/features/training/data/mock-workout-session";
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

export function useWorkoutSession() {
  const [session, setSession] = useState<WorkoutSessionDraft>(() => cloneSession(mockWorkoutSession));

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const lastSet = currentExercise.completedSets[currentExercise.completedSets.length - 1];
  const nextSetNumber = currentExercise.completedSets.length + 1;
  const suggestedWeight = lastSet?.weight ?? currentExercise.targetWeight ?? 0;
  const suggestedReps = lastSet?.reps ?? currentExercise.targetReps;
  const isCurrentExerciseComplete = currentExercise.completedSets.length >= currentExercise.targetSets;
  const isSessionComplete = session.currentExerciseIndex >= session.exercises.length - 1 && isCurrentExerciseComplete;

  function addStrengthSet(input: SetInput) {
    setSession((current) => {
      const next = cloneSession(current);
      const exercise = next.exercises[next.currentExerciseIndex];

      const newSet: StrengthSet = {
        setNumber: exercise.completedSets.length + 1,
        weight: input.weight,
        reps: input.reps,
        rpe: input.rpe,
      };

      exercise.completedSets.push(newSet);
      next.status = "exercise_active";
      return next;
    });
  }

  function goToNextExercise() {
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
  }

  function restartSession() {
    setSession(cloneSession(mockWorkoutSession));
  }

  return {
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
  };
}
