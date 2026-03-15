import type { Route } from "next";

export type StrengthSet = {
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
};

export type PlannedStrengthExercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  completedSets: StrengthSet[];
};

export type WorkoutSessionStatus = "idle" | "started" | "exercise_active" | "session_completed";

export type WorkoutSessionDraft = {
  id: string;
  title: string;
  source: "planned" | "free";
  status: WorkoutSessionStatus;
  currentExerciseIndex: number;
  exercises: PlannedStrengthExercise[];
};

export type TrainingModeCard = {
  href: Route;
  title: string;
  description: string;
  status: string;
  accent: "teal" | "coral" | "moss";
};

export type CardioWorkoutDraft = {
  title: string;
  activity: string;
  durationMinutes: number;
  distanceKm: number;
  avgHeartRate?: number;
  zoneFocus: string;
};

export type MobilityWorkoutDraft = {
  title: string;
  routineName: string;
  totalMinutes: number;
  exercises: Array<{
    name: string;
    durationSeconds: number;
  }>;
};

export type FreeWorkoutDraft = {
  title: string;
  notes: string;
  exercises: Array<{
    name: string;
    target: string;
  }>;
};
