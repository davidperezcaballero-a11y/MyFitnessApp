"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  return { supabase, user };
}

function getMultiValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function createCatalogExerciseAction(formData: FormData) {
  const { supabase } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const exerciseType = String(formData.get("exerciseType") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const movementPatternId = String(formData.get("movementPatternId") ?? "").trim();
  const muscleGroupIds = getMultiValues(formData, "muscleGroupIds");
  const equipmentIds = getMultiValues(formData, "equipmentIds");

  if (!name || !["strength", "cardio", "mobility"].includes(exerciseType)) {
    redirect("/catalogo?message=Nombre y tipo son obligatorios.");
  }

  const { data: createdExercise, error } = await supabase
    .from("exercises")
    .insert({
      name,
      exercise_type: exerciseType,
      description: description || null,
      movement_pattern_id: movementPatternId || null,
    })
    .select("id")
    .single();

  if (error || !createdExercise) {
    redirect(`/catalogo?message=${encodeURIComponent(error?.message ?? "No se pudo crear la actividad.")}`);
  }

  if (muscleGroupIds.length > 0) {
    const { error: muscleError } = await supabase.from("exercise_muscle_group").insert(
      muscleGroupIds.map((muscleGroupId) => ({
        exercise_id: createdExercise.id,
        muscle_group_id: muscleGroupId,
      })),
    );

    if (muscleError) {
      redirect(`/catalogo?message=${encodeURIComponent(muscleError.message)}`);
    }
  }

  if (equipmentIds.length > 0) {
    const { error: equipmentError } = await supabase.from("exercise_equipment").insert(
      equipmentIds.map((equipmentId) => ({
        exercise_id: createdExercise.id,
        equipment_id: equipmentId,
      })),
    );

    if (equipmentError) {
      redirect(`/catalogo?message=${encodeURIComponent(equipmentError.message)}`);
    }
  }

  revalidatePath("/catalogo");
  redirect("/catalogo?message=Actividad catalogada correctamente.");
}

export async function deleteCatalogExerciseAction(formData: FormData) {
  const { supabase } = await requireUser();

  const exerciseId = String(formData.get("exerciseId") ?? "").trim();
  const exerciseName = String(formData.get("exerciseName") ?? "").trim();

  if (!exerciseId) {
    redirect("/catalogo?message=No se encontro la actividad.");
  }

  const usageChecks = await Promise.all([
    supabase.from("exercise_prescriptions").select("id", { count: "exact", head: true }).eq("exercise_id", exerciseId),
    supabase.from("session_exercises").select("id", { count: "exact", head: true }).eq("exercise_id", exerciseId),
    supabase.from("cardio_sessions").select("id", { count: "exact", head: true }).eq("exercise_id", exerciseId),
    supabase.from("mobility_exercises").select("id", { count: "exact", head: true }).eq("exercise_id", exerciseId),
    supabase
      .from("mobility_routine_exercises")
      .select("id", { count: "exact", head: true })
      .eq("exercise_id", exerciseId),
  ]);

  const blockingUsage = usageChecks.some((result) => (result.count ?? 0) > 0);
  const usageError = usageChecks.find((result) => result.error);

  if (usageError?.error) {
    redirect(`/catalogo?message=${encodeURIComponent(usageError.error.message)}`);
  }

  if (blockingUsage) {
    redirect(
      `/catalogo?message=${encodeURIComponent(
        `No se puede eliminar ${exerciseName || "la actividad"} porque ya esta usada en planes, rutinas o historial.`,
      )}`,
    );
  }

  const { error } = await supabase.from("exercises").delete().eq("id", exerciseId);

  if (error) {
    redirect(`/catalogo?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/catalogo");
  redirect("/catalogo?message=Actividad eliminada correctamente.");
}
