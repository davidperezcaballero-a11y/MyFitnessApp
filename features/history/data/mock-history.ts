import type { HistorySession } from "@/features/history/types";

export const mockHistorySessions: HistorySession[] = [
  {
    id: "strength-a-2026-03-12",
    title: "Fuerza A",
    type: "strength",
    date: "12 mar 2026",
    durationMinutes: 68,
    summary: "Press banca, remo con barra y zancadas con buen cumplimiento del plan.",
    metrics: [
      { label: "Volumen", value: "4,920 kg" },
      { label: "Sets", value: "11" },
      { label: "RPE medio", value: "7.9" },
    ],
    detailSections: [
      {
        title: "Press banca",
        rows: [
          { label: "Serie 1", value: "70 kg x 8" },
          { label: "Serie 2", value: "70 kg x 7" },
          { label: "Serie 3", value: "70 kg x 7" },
          { label: "Serie 4", value: "67.5 kg x 8" },
        ],
      },
      {
        title: "Remo con barra",
        rows: [
          { label: "Serie 1", value: "55 kg x 10" },
          { label: "Serie 2", value: "55 kg x 10" },
          { label: "Serie 3", value: "55 kg x 9" },
        ],
      },
    ],
  },
  {
    id: "cardio-z2-2026-03-11",
    title: "Rodaje base",
    type: "cardio",
    date: "11 mar 2026",
    durationMinutes: 45,
    summary: "Rodaje aerobico continuo con foco en zona 2.",
    metrics: [
      { label: "Distancia", value: "8.2 km" },
      { label: "FC media", value: "142 bpm" },
      { label: "Zona foco", value: "Z2" },
    ],
    detailSections: [
      {
        title: "Resumen cardio",
        rows: [
          { label: "Actividad", value: "Running" },
          { label: "Duracion", value: "45 min" },
          { label: "Distancia", value: "8.2 km" },
          { label: "FC media", value: "142 bpm" },
        ],
      },
    ],
  },
  {
    id: "mobility-pre-running-2026-03-10",
    title: "Movilidad pre-running",
    type: "mobility",
    date: "10 mar 2026",
    durationMinutes: 9,
    summary: "Secuencia breve de activacion de core y movilidad de cadera.",
    metrics: [
      { label: "Ejercicios", value: "3" },
      { label: "Tiempo", value: "9 min" },
      { label: "Rutina", value: "Pre-running" },
    ],
    detailSections: [
      {
        title: "Rutina",
        rows: [
          { label: "Dead bug", value: "60 s" },
          { label: "Hip airplane", value: "60 s" },
          { label: "Couch stretch", value: "60 s" },
        ],
      },
    ],
  },
];

export function getHistorySessionById(id: string) {
  return mockHistorySessions.find((session) => session.id === id);
}
