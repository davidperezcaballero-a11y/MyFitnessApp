export type HistorySessionType = "strength" | "cardio" | "mobility";

export type HistorySession = {
  id: string;
  title: string;
  type: HistorySessionType;
  date: string;
  durationMinutes: number;
  summary: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  detailSections: Array<{
    title: string;
    rows: Array<{
      label: string;
      value: string;
    }>;
  }>;
};
