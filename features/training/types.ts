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
  sessionExerciseId?: string;
  completedSets: StrengthSet[];
};

export type WorkoutSessionStatus = "idle" | "started" | "exercise_active" | "session_completed";

export type WorkoutSessionDraft = {
  id: string;
  plannedSessionId?: string;
  workoutSessionId?: string;
  title: string;
  source: "planned" | "free";
  status: WorkoutSessionStatus;
  currentExerciseIndex: number;
  exercises: PlannedStrengthExercise[];
};

export type TrainingModeCard = {
  href: string;
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
  plannedSessionId?: string;
  title: string;
  routineName: string;
  totalMinutes: number;
  exercises: Array<{
    name: string;
    durationSeconds: number;
  }>;
};

export type PlannedCardioSessionDraft = {
  plannedSessionId: string;
  title: string;
  activityId?: string;
  activityName: string;
  durationMinutes?: number;
  distanceKm?: number;
  notes?: string;
  dateLabel: string;
};

export type FreeWorkoutDraft = {
  title: string;
  notes: string;
  exercises: Array<{
    name: string;
    target: string;
  }>;
};
