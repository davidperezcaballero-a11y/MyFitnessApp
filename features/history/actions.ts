"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseCsvObjects } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

function toNumber(value: string) {
  const parsed = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function importHistoryCsvAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const file = formData.get("csvFile");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/historial?message=Selecciona un CSV de historial valido.");
  }

  const text = await file.text();
  const rows = parseCsvObjects(text);

  if (rows.length === 0) {
    redirect("/historial?message=El CSV de historial esta vacio.");
  }

  const exerciseNames = Array.from(
    new Set(rows.map((row) => String(row.item_name ?? "").trim()).filter(Boolean)),
  );

  const { data: exercises, error: exerciseLookupError } = await supabase
    .from("exercises")
    .select("id, name")
    .in("name", exerciseNames);

  if (exerciseLookupError) {
    redirect(`/historial?message=${encodeURIComponent(exerciseLookupError.message)}`);
  }

  const exerciseMap = new Map((exercises ?? []).map((exercise) => [exercise.name, exercise.id]));
  const missingExercise = exerciseNames.find((exerciseName) => !exerciseMap.has(exerciseName));

  if (missingExercise) {
    redirect(
      `/historial?message=${encodeURIComponent(
        `La actividad "${missingExercise}" no existe en el catalogo. Importala antes de cargar el historico.`,
      )}`,
    );
  }

  const workoutMap = new Map<string, string>();
  const sessionExerciseMap = new Map<string, string>();
  const mobilitySessionMap = new Map<string, string>();

  for (const row of rows) {
    const sessionDate = String(row.session_date ?? "").trim();
    const sessionType = String(row.session_type ?? "").trim() as "strength" | "cardio" | "mobility";
    const sessionName = String(row.session_name ?? "").trim();
    const itemName = String(row.item_name ?? "").trim();
    const notes = String(row.notes ?? "").trim();

    if (!sessionDate || !sessionType || !itemName) {
      continue;
    }

    const exerciseId = exerciseMap.get(itemName);
    if (!exerciseId) {
      continue;
    }

    const workoutKey = `${sessionDate}-${sessionType}-${sessionName || notes || "sesion"}`;
    let workoutId = workoutMap.get(workoutKey) ?? null;

    if (!workoutId) {
      const { data: createdWorkout, error: workoutError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          session_date: sessionDate,
          session_type: sessionType,
          started_at: `${sessionDate}T08:00:00`,
          finished_at: `${sessionDate}T08:00:00`,
          notes: sessionName || notes || null,
        })
        .select("id")
        .single();

      if (workoutError || !createdWorkout) {
        redirect(`/historial?message=${encodeURIComponent(workoutError?.message ?? "No se pudo crear una sesion historica.")}`);
      }

      workoutId = createdWorkout.id;
      workoutMap.set(workoutKey, createdWorkout.id);
    }

    if (!workoutId) {
      continue;
    }

    if (sessionType === "strength") {
      const sessionExerciseKey = `${workoutId}-${exerciseId}-${Math.max(1, toNumber(row.exercise_order ?? "") ?? 1)}`;
      let sessionExerciseId = sessionExerciseMap.get(sessionExerciseKey) ?? null;

      if (!sessionExerciseId) {
        const { data: createdSessionExercise, error: sessionExerciseError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: workoutId,
            exercise_id: exerciseId,
            order_index: Math.max(1, toNumber(row.exercise_order ?? "") ?? 1),
          })
          .select("id")
          .single();

        if (sessionExerciseError || !createdSessionExercise) {
          redirect(`/historial?message=${encodeURIComponent(sessionExerciseError?.message ?? "No se pudo crear un ejercicio historico.")}`);
        }

        sessionExerciseId = createdSessionExercise.id;
        sessionExerciseMap.set(sessionExerciseKey, createdSessionExercise.id);
      }

      const { error: setError } = await supabase.from("strength_sets").insert({
        session_exercise_id: sessionExerciseId,
        set_number: Math.max(1, toNumber(row.set_number ?? "") ?? 1),
        reps: Math.max(0, toNumber(row.reps ?? "") ?? 0),
        weight: toNumber(row.weight ?? ""),
        rpe: toNumber(row.rpe ?? ""),
      });

      if (setError) {
        redirect(`/historial?message=${encodeURIComponent(setError.message)}`);
      }

      continue;
    }

    if (sessionType === "cardio") {
      const { error: cardioError } = await supabase.from("cardio_sessions").insert({
        session_id: workoutId,
        exercise_id: exerciseId,
        duration_seconds: Math.round((toNumber(row.duration_minutes ?? "") ?? 0) * 60),
        distance_meters: Math.round((toNumber(row.distance_km ?? "") ?? 0) * 1000),
        avg_heart_rate: toNumber(row.avg_heart_rate ?? ""),
        notes: notes || null,
      });

      if (cardioError) {
        redirect(`/historial?message=${encodeURIComponent(cardioError.message)}`);
      }

      continue;
    }

    let mobilitySessionId = mobilitySessionMap.get(workoutId) ?? null;

    if (!mobilitySessionId) {
      const { data: mobilitySession, error: mobilitySessionError } = await supabase
        .from("mobility_sessions")
        .insert({
          session_id: workoutId,
          duration_seconds: null,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (mobilitySessionError || !mobilitySession) {
        redirect(`/historial?message=${encodeURIComponent(mobilitySessionError?.message ?? "No se pudo crear una sesion de movilidad historica.")}`);
      }

      mobilitySessionId = mobilitySession.id;
      mobilitySessionMap.set(workoutId, mobilitySession.id);
    }

    const { error: mobilityExerciseError } = await supabase.from("mobility_exercises").insert({
      mobility_session_id: mobilitySessionId,
      exercise_id: exerciseId,
      duration_seconds: Math.round((toNumber(row.duration_minutes ?? "") ?? 0) * 60),
      order_index: Math.max(1, toNumber(row.exercise_order ?? "") ?? 1),
    });

    if (mobilityExerciseError) {
      redirect(`/historial?message=${encodeURIComponent(mobilityExerciseError.message)}`);
    }
  }

  revalidatePath("/historial");
  revalidatePath("/metricas");
  redirect("/historial?message=Historico importado desde CSV.");
}
