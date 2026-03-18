export type CatalogExercise = {
  id: string;
  name: string;
  exerciseType: "strength" | "cardio" | "mobility";
  description: string | null;
  movementPattern: string | null;
  muscleGroups: string[];
  equipment: string[];
};

export type CatalogOption = {
  id: string;
  name: string;
};
