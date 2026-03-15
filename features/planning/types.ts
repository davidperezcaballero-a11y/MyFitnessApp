export type PlannedExerciseItem = {
  name: string;
  prescription: string;
};

export type PlannedSessionItem = {
  dayLabel: string;
  title: string;
  sessionType: "strength" | "cardio" | "mobility";
  exercises: PlannedExerciseItem[];
};

export type TrainingPlanWeek = {
  weekNumber: number;
  focus: string;
  sessions: PlannedSessionItem[];
};

export type TrainingPlanDraft = {
  name: string;
  startDate: string;
  objective: string;
  weeklyTarget: string;
  weeks: TrainingPlanWeek[];
};
