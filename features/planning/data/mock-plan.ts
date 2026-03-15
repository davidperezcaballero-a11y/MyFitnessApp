import type { TrainingPlanDraft } from "@/features/planning/types";

export const mockTrainingPlan: TrainingPlanDraft = {
  name: "Base fuerza + cardio",
  startDate: "17 mar 2026",
  objective: "Mejorar consistencia, fuerza basica y capacidad aerobica.",
  weeklyTarget: "4 sesiones por semana",
  weeks: [
    {
      weekNumber: 1,
      focus: "Aterrizar rutina y ajustar cargas",
      sessions: [
        {
          dayLabel: "Lun",
          title: "Fuerza A",
          sessionType: "strength",
          exercises: [
            { name: "Press banca", prescription: "4 x 8 @ 70 kg" },
            { name: "Remo con barra", prescription: "4 x 10 @ 55 kg" },
            { name: "Zancadas", prescription: "3 x 12 @ 16 kg" },
          ],
        },
        {
          dayLabel: "Mie",
          title: "Rodaje base",
          sessionType: "cardio",
          exercises: [{ name: "Running", prescription: "45 min Z2" }],
        },
        {
          dayLabel: "Vie",
          title: "Fuerza B",
          sessionType: "strength",
          exercises: [
            { name: "Sentadilla", prescription: "4 x 6 @ 80 kg" },
            { name: "Press militar", prescription: "4 x 6 @ 42.5 kg" },
            { name: "Dominadas", prescription: "4 x 8" },
          ],
        },
        {
          dayLabel: "Sab",
          title: "Movilidad pre-running",
          sessionType: "mobility",
          exercises: [
            { name: "Dead bug", prescription: "60 s" },
            { name: "Hip airplane", prescription: "60 s" },
            { name: "Couch stretch", prescription: "60 s" },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      focus: "Consolidar volumen y regularidad",
      sessions: [
        {
          dayLabel: "Lun",
          title: "Fuerza A",
          sessionType: "strength",
          exercises: [
            { name: "Press banca", prescription: "4 x 8 @ 72.5 kg" },
            { name: "Remo con barra", prescription: "4 x 10 @ 57.5 kg" },
            { name: "Zancadas", prescription: "3 x 12 @ 18 kg" },
          ],
        },
        {
          dayLabel: "Mie",
          title: "Rodaje base",
          sessionType: "cardio",
          exercises: [{ name: "Running", prescription: "50 min Z2" }],
        },
        {
          dayLabel: "Vie",
          title: "Fuerza B",
          sessionType: "strength",
          exercises: [
            { name: "Sentadilla", prescription: "4 x 6 @ 82.5 kg" },
            { name: "Press militar", prescription: "4 x 6 @ 45 kg" },
            { name: "Dominadas", prescription: "4 x 8" },
          ],
        },
      ],
    },
  ],
};
