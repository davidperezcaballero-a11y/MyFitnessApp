export type DashboardSummary = {
  activePlan: {
    name: string;
    objective: string;
    startDateLabel: string;
    estimatedEndDateLabel: string;
    currentWeek: number;
    totalWeeks: number;
    progressPercent: number;
    disciplineSummary: Array<{
      key: "strength" | "cardio" | "mobility";
      label: string;
      primary: string;
      secondary: string;
    }>;
  } | null;
  nextSessionsByType: Array<{
    id: string;
    title: string;
    sessionType: "strength" | "cardio" | "mobility";
    weekLabel: string;
    dayLabel: string;
    dateLabel: string;
    detail: string;
    status: "pending" | "completed";
    completedLabel?: string;
    startHref: string;
    historyHref?: string;
  }>;
};
