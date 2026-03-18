"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createStrengthWorkoutAction(input: {
  title: string;
  plannedSessionId?: string;
  exercises: Array<{
    exerciseName: string;
    orderIndex: number;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Necesitas iniciar sesion.");
  }

  const { data: workoutSession, error: workoutError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      planned_session_id: input.plannedSessionId ?? null,
      session_date: new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      session_type: "strength",
      notes: input.title,
    })
    .select("id")
    .single();

  if (workoutError || !workoutSession) {
    throw new Error(workoutError?.message ?? "No se pudo crear la sesion.");
  }

  const exerciseNames = input.exercises.map((exercise) => exercise.exerciseName);
  const { data: catalogExercises, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")
    .in("name", exerciseNames);

  if (catalogError) {
    throw new Error(catalogError.message);
  }

  const exerciseMap = new Map((catalogExercises ?? []).map((exercise) => [exercise.name, exercise.id]));

  const sessionExercisesPayload = input.exercises.map((exercise) => {
    const exerciseId = exerciseMap.get(exercise.exerciseName);

    if (!exerciseId) {
      throw new Error(`No existe el ejercicio "${exercise.exerciseName}" en el catalogo.`);
    }

    return {
      session_id: workoutSession.id,
      exercise_id: exerciseId,
      order_index: exercise.orderIndex,
    };
  });

  const { data: sessionExercises, error: sessionExercisesError } = await supabase
    .from("session_exercises")
    .insert(sessionExercisesPayload)
    .select("id, exercise_id, order_index");

  if (sessionExercisesError) {
    throw new Error(sessionExercisesError.message);
  }

  return {
    workoutSessionId: workoutSession.id,
    sessionExercises: sessionExercises ?? [],
  };
}

export async function addStrengthSetAction(input: {
  sessionExerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("strength_sets").insert({
    session_exercise_id: input.sessionExerciseId,
    set_number: input.setNumber,
    reps: input.reps,
    weight: input.weight,
    rpe: input.rpe ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function finishWorkoutAction(input: { workoutSessionId: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sessions")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", input.workoutSessionId);

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function createCardioWorkoutAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const exerciseId = String(formData.get("exerciseId") ?? "");
  const plannedSessionId = String(formData.get("plannedSessionId") ?? "").trim();
  const sessionTitle = String(formData.get("sessionTitle") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);
  const distanceKm = Number(formData.get("distanceKm") ?? 0);
  const avgHeartRateRaw = String(formData.get("avgHeartRate") ?? "").trim();

  const { data: workoutSession, error: workoutError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      planned_session_id: plannedSessionId || null,
      session_date: new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      session_type: "cardio",
      notes: sessionTitle || "Sesion cardio",
    })
    .select("id")
    .single();

  if (workoutError || !workoutSession) {
    redirect(`/entrenar/cardio?message=${encodeURIComponent(workoutError?.message ?? "No se pudo crear la sesion.")}`);
  }

  const { error } = await supabase.from("cardio_sessions").insert({
    session_id: workoutSession.id,
    exercise_id: exerciseId,
    duration_seconds: Math.round(durationMinutes * 60),
    distance_meters: Math.round(distanceKm * 1000),
    avg_heart_rate: avgHeartRateRaw ? Number(avgHeartRateRaw) : null,
  });

  if (error) {
    redirect(`/entrenar/cardio?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/historial");
  revalidatePath("/entrenar");
  redirect("/entrenar?message=Sesion%20de%20cardio%20guardada.");
}

export async function createFreeStrengthWorkoutAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const sessionTitle = String(formData.get("sessionTitle") ?? "").trim() || "Sesion libre de fuerza";
  const exercisesRaw = String(formData.get("exercises") ?? "").trim();

  type FreeStrengthExercisePayload = {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number | null;
    rpe?: number | null;
  };

  let exercises: FreeStrengthExercisePayload[] = [];

  try {
    exercises = JSON.parse(exercisesRaw) as FreeStrengthExercisePayload[];
  } catch {
    redirect("/entrenar/libre?message=No se pudo interpretar la sesion libre.");
  }

  const validExercises = exercises.filter(
    (exercise) => exercise.exerciseId && exercise.sets > 0 && exercise.reps > 0,
  );

  if (validExercises.length === 0) {
    redirect("/entrenar/libre?message=Anade al menos un ejercicio valido.");
  }

  const { data: workoutSession, error: workoutError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      session_date: new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      session_type: "strength",
      notes: sessionTitle,
    })
    .select("id")
    .single();

  if (workoutError || !workoutSession) {
    redirect(`/entrenar/libre?message=${encodeURIComponent(workoutError?.message ?? "No se pudo crear la sesion libre.")}`);
  }

  const sessionExercisesPayload = validExercises.map((exercise, index) => ({
    session_id: workoutSession.id,
    exercise_id: exercise.exerciseId,
    order_index: index + 1,
  }));

  const { data: sessionExercises, error: sessionExerciseError } = await supabase
    .from("session_exercises")
    .insert(sessionExercisesPayload)
    .select("id, order_index");

  if (sessionExerciseError || !sessionExercises) {
    redirect(`/entrenar/libre?message=${encodeURIComponent(sessionExerciseError?.message ?? "No se pudieron crear los ejercicios libres.")}`);
  }

  const sessionExerciseByOrder = new Map(sessionExercises.map((item) => [item.order_index, item.id]));

  const strengthSetsPayload = validExercises.flatMap((exercise, index) =>
    Array.from({ length: exercise.sets }, (_, setIndex) => ({
      session_exercise_id: sessionExerciseByOrder.get(index + 1),
      set_number: setIndex + 1,
      reps: exercise.reps,
      weight: exercise.weight ?? null,
      rpe: exercise.rpe ?? null,
    })),
  );

  const { error: setsError } = await supabase.from("strength_sets").insert(strengthSetsPayload);

  if (setsError) {
    redirect(`/entrenar/libre?message=${encodeURIComponent(setsError.message)}`);
  }

  revalidatePath("/historial");
  revalidatePath("/entrenar");
  redirect("/entrenar?message=Sesion%20libre%20de%20fuerza%20guardada.");
}

export async function createMobilityWorkoutAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const routineId = String(formData.get("routineId") ?? "");
  const plannedSessionId = String(formData.get("plannedSessionId") ?? "").trim();
  const sessionTitle = String(formData.get("sessionTitle") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);

  const { data: workoutSession, error: workoutError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      planned_session_id: plannedSessionId || null,
      session_date: new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      session_type: "mobility",
      notes: sessionTitle || "Sesion movilidad",
    })
    .select("id")
    .single();

  if (workoutError || !workoutSession) {
    redirect(`/entrenar/movilidad?message=${encodeURIComponent(workoutError?.message ?? "No se pudo crear la sesion.")}`);
  }

  const { data: mobilitySession, error: mobilityError } = await supabase
    .from("mobility_sessions")
    .insert({
      session_id: workoutSession.id,
      routine_id: routineId || null,
      duration_seconds: Math.round(durationMinutes * 60),
    })
    .select("id")
    .single();

  if (mobilityError || !mobilitySession) {
    redirect(`/entrenar/movilidad?message=${encodeURIComponent(mobilityError?.message ?? "No se pudo crear el bloque de movilidad.")}`);
  }

  if (routineId) {
    const { data: routineExercises, error: routineError } = await supabase
      .from("mobility_routine_exercises")
      .select("exercise_id, order_index, default_duration_seconds")
      .eq("routine_id", routineId)
      .order("order_index", { ascending: true });

    if (routineError) {
      redirect(`/entrenar/movilidad?message=${encodeURIComponent(routineError.message)}`);
    }

    if ((routineExercises ?? []).length > 0) {
      const payload = (routineExercises ?? []).map((exercise) => ({
        mobility_session_id: mobilitySession.id,
        exercise_id: exercise.exercise_id,
        order_index: exercise.order_index,
        duration_seconds: exercise.default_duration_seconds ?? 60,
      }));

      const { error: insertExercisesError } = await supabase
        .from("mobility_exercises")
        .insert(payload);

      if (insertExercisesError) {
        redirect(`/entrenar/movilidad?message=${encodeURIComponent(insertExercisesError.message)}`);
      }
    }
  }

  revalidatePath("/historial");
  revalidatePath("/entrenar");
  redirect("/entrenar?message=Sesion%20de%20movilidad%20guardada.");
}
