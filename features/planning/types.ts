export type PlannedExerciseItem = {
  exerciseId?: string;
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
  id: string;
  name: string;
  startDate: string;
  status: "active" | "inactive" | "finished";
  objective: string;
  weeklyTarget: string;
  weeks: TrainingPlanWeek[];
};

export type TrainingPlanOverviewItem = {
  id: string;
  name: string;
  startDate: string;
  status: "active" | "inactive" | "finished";
  objective: string;
  totalWeeks: number;
};
