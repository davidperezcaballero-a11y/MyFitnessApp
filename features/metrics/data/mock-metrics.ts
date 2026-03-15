import type { MetricChart, MetricKpi } from "@/features/metrics/types";

export const metricKpis: MetricKpi[] = [
  {
    label: "Adherencia semanal",
    value: "75%",
    delta: "+1 sesion vs semana anterior",
  },
  {
    label: "Volumen fuerza",
    value: "4,920 kg",
    delta: "+8% respecto a la ultima semana",
  },
  {
    label: "Tiempo cardio",
    value: "95 min",
    delta: "+20 min acumulados",
  },
  {
    label: "Movilidad",
    value: "3 sesiones",
    delta: "Rutina estable esta semana",
  },
];

export const metricCharts: MetricChart[] = [
  {
    title: "Volumen de fuerza",
    description: "Seguimiento semanal del volumen total levantado.",
    unit: "kg",
    color: "coral",
    points: [
      { label: "Sem 1", value: 3200 },
      { label: "Sem 2", value: 3640 },
      { label: "Sem 3", value: 4180 },
      { label: "Sem 4", value: 4920 },
    ],
  },
  {
    title: "Tiempo cardio",
    description: "Minutos aerobicos por semana con foco en base y consistencia.",
    unit: "min",
    color: "teal",
    points: [
      { label: "Sem 1", value: 40 },
      { label: "Sem 2", value: 65 },
      { label: "Sem 3", value: 75 },
      { label: "Sem 4", value: 95 },
    ],
  },
  {
    title: "Frecuencia de movilidad",
    description: "Numero de sesiones de movilidad registradas por semana.",
    unit: "ses",
    color: "moss",
    points: [
      { label: "Sem 1", value: 1 },
      { label: "Sem 2", value: 2 },
      { label: "Sem 3", value: 2 },
      { label: "Sem 4", value: 3 },
    ],
  },
];

export const adherenceBreakdown = [
  { label: "Sesiones planificadas", value: "4" },
  { label: "Sesiones completadas", value: "3" },
  { label: "Pendientes", value: "1" },
  { label: "Racha activa", value: "6 dias" },
];
