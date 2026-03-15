import type {
  CardioWorkoutDraft,
  FreeWorkoutDraft,
  MobilityWorkoutDraft,
  TrainingModeCard,
  WorkoutSessionDraft,
} from "@/features/training/types";

export const mockWorkoutSession: WorkoutSessionDraft = {
  id: "session-strength-a",
  title: "Fuerza A",
  source: "planned",
  status: "started",
  currentExerciseIndex: 0,
  exercises: [
    {
      id: "bench-press",
      name: "Press banca",
      targetSets: 4,
      targetReps: 8,
      targetWeight: 70,
      completedSets: [
        { setNumber: 1, weight: 70, reps: 8, rpe: 7.5 },
        { setNumber: 2, weight: 70, reps: 7, rpe: 8 },
      ],
    },
    {
      id: "barbell-row",
      name: "Remo con barra",
      targetSets: 4,
      targetReps: 10,
      targetWeight: 55,
      completedSets: [],
    },
    {
      id: "walking-lunges",
      name: "Zancadas",
      targetSets: 3,
      targetReps: 12,
      targetWeight: 16,
      completedSets: [],
    },
  ],
};

export const trainingModeCards: TrainingModeCard[] = [
  {
    href: "/entrenar/sesion",
    title: "Sesion guiada",
    description: "Modo principal para fuerza con autocompletado de series y avance ejercicio a ejercicio.",
    status: "Activo",
    accent: "teal",
  },
  {
    href: "/entrenar/libre",
    title: "Entrenamiento libre",
    description: "Sesion flexible para dias sin plan fijo, con ejercicios anadidos manualmente.",
    status: "Mock listo",
    accent: "coral",
  },
  {
    href: "/entrenar/cardio",
    title: "Cardio",
    description: "Registro rapido de actividad, duracion, distancia y foco por zonas.",
    status: "Mock listo",
    accent: "moss",
  },
  {
    href: "/entrenar/movilidad",
    title: "Movilidad",
    description: "Rutinas repetibles de movilidad con tiempos sugeridos por ejercicio.",
    status: "Mock listo",
    accent: "teal",
  },
];

export const mockCardioWorkout: CardioWorkoutDraft = {
  title: "Rodaje base",
  activity: "Running",
  durationMinutes: 45,
  distanceKm: 8.2,
  avgHeartRate: 142,
  zoneFocus: "Z2 aeróbico base",
};

export const mockMobilityWorkout: MobilityWorkoutDraft = {
  title: "Movilidad pre-running",
  routineName: "rutina pre-running",
  totalMinutes: 9,
  exercises: [
    { name: "Dead bug", durationSeconds: 60 },
    { name: "Hip airplane", durationSeconds: 60 },
    { name: "Couch stretch", durationSeconds: 60 },
  ],
};

export const mockFreeWorkout: FreeWorkoutDraft = {
  title: "Sesion libre torso",
  notes: "Plantilla pensada para construir una sesion rapida sin depender del plan semanal.",
  exercises: [
    { name: "Press militar", target: "4 x 6 @ 42.5 kg" },
    { name: "Dominadas", target: "4 x 8" },
    { name: "Remo con barra", target: "4 x 10 @ 55 kg" },
  ],
};
