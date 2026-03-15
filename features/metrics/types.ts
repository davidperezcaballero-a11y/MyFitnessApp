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
