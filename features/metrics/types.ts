export type MetricsPeriod = "week" | "last4weeks" | "activePlan" | "all";

export type MetricsSummary = {
  period: MetricsPeriod;
  periodLabel: string;
  overview: Array<{
    label: string;
    value: string;
    delta: string;
  }>;
  strength: {
    totalVolume: number;
    totalSessions: number;
    totalSets: number;
    exercises: Array<{
      exerciseName: string;
      sessions: number;
      totalSets: number;
      totalVolume: number;
      lastRecord: string;
      prWeight: number | null;
      prReps: number | null;
      prEstimated1rm: number | null;
    }>;
  };
  cardio: {
    totalMinutes: number;
    totalDistanceKm: number;
    totalSessions: number;
    runningMinutes: number;
    averagePace: string;
    fastestPace: string;
    longestDistanceKm: number;
    activities: Array<{
      activityName: string;
      isRunningLike: boolean;
      sessions: number;
      totalMinutes: number;
      totalDistanceKm: number;
      averagePace: string;
      fastestPace: string;
      longestDistanceKm: number;
      lastRecord: string;
    }>;
  };
  mobility: {
    totalMinutes: number;
    totalSessions: number;
    routines: Array<{
      routineName: string;
      sessions: number;
      totalMinutes: number;
      lastRecord: string;
    }>;
  };
};

export type MetricKpi = {
  label: string;
  value: string;
  delta: string;
};

export type MetricPoint = {
  label: string;
  value: number;
};

export type MetricChart = {
  title: string;
  description: string;
  unit: string;
  color: "coral" | "teal" | "moss";
  points: MetricPoint[];
};
