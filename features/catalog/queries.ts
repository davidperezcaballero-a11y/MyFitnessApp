import { createClient } from "@/lib/supabase/server";
import type { CatalogExercise, CatalogOption } from "@/features/catalog/types";

type ExerciseRow = {
  id: string;
  name: string;
  exercise_type: CatalogExercise["exerciseType"];
  description: string | null;
  movement_patterns: { name: string }[] | { name: string } | null;
  exercise_muscle_group: Array<{
    muscle_groups: { name: string }[] | { name: string } | null;
  }>;
  exercise_equipment: Array<{
    equipment: { name: string }[] | { name: string } | null;
  }>;
};

function extractName(
  value: { name: string }[] | { name: string } | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0]?.name ?? null;
  }

  return value.name;
}

export async function getCatalogExercises(): Promise<CatalogExercise[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select(
      `
        id,
        name,
        exercise_type,
        description,
        movement_patterns(name),
        exercise_muscle_group(
          muscle_groups(name)
        ),
        exercise_equipment(
          equipment(name)
        )
      `,
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el catalogo: ${error.message}`);
  }

  return ((data ?? []) as unknown as ExerciseRow[]).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    exerciseType: exercise.exercise_type,
    description: exercise.description,
    movementPattern: extractName(exercise.movement_patterns),
    muscleGroups: exercise.exercise_muscle_group
      .map((item) => extractName(item.muscle_groups))
      .filter((value): value is string => Boolean(value)),
    equipment: exercise.exercise_equipment
      .map((item) => extractName(item.equipment))
      .filter((value): value is string => Boolean(value)),
  }));
}

export async function getCatalogOptions(): Promise<{
  movementPatterns: CatalogOption[];
  muscleGroups: CatalogOption[];
  equipment: CatalogOption[];
}> {
  const supabase = await createClient();

  const [movementPatternsResult, muscleGroupsResult, equipmentResult] = await Promise.all([
    supabase.from("movement_patterns").select("id, name").order("name", { ascending: true }),
    supabase.from("muscle_groups").select("id, name").order("name", { ascending: true }),
    supabase.from("equipment").select("id, name").order("name", { ascending: true }),
  ]);

  if (movementPatternsResult.error) {
    throw new Error(
      `No se pudieron cargar los patrones de movimiento: ${movementPatternsResult.error.message}`,
    );
  }

  if (muscleGroupsResult.error) {
    throw new Error(`No se pudieron cargar los grupos musculares: ${muscleGroupsResult.error.message}`);
  }

  if (equipmentResult.error) {
    throw new Error(`No se pudo cargar el material: ${equipmentResult.error.message}`);
  }

  return {
    movementPatterns: (movementPatternsResult.data ?? []) as CatalogOption[],
    muscleGroups: (muscleGroupsResult.data ?? []) as CatalogOption[],
    equipment: (equipmentResult.data ?? []) as CatalogOption[],
  };
}
