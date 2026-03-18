"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseCsvObjects } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

function toInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    return null;
  }

  const number = Number(parsed);
  return Number.isFinite(number) ? number : null;
}

function parseStrengthPrescription(prescription: string) {
  const normalized = prescription.trim().replace(",", ".");
  const match = normalized.match(
    /^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*@\s*(\d+(?:\.\d+)?))?(?:\s*kg)?$/i,
  );

  if (!match) {
    return {
      sets: null,
      reps: null,
      targetLoad: null,
      notes: normalized || null,
    };
  }

  return {
    sets: Number(match[1]),
    reps: Number(match[2]),
    targetLoad: match[3] ? Number(match[3]) : null,
    notes: normalized,
  };
}

function parseCardioPrescription(prescription: string) {
  const normalized = prescription.trim().replace(",", ".");
  const minutesMatch = normalized.match(/(\d+(?:\.\d+)?)\s*min/i);
  const distanceMatch = normalized.match(/(\d+(?:\.\d+)?)\s*km/i);

  return {
    targetDurationSeconds: minutesMatch ? Math.round(Number(minutesMatch[1]) * 60) : null,
    targetDistanceMeters: distanceMatch ? Math.round(Number(distanceMatch[1]) * 1000) : null,
    notes: normalized || null,
  };
}

function parseMobilityPrescription(prescription: string) {
  const normalized = prescription.trim().replace(",", ".");
  const minutesMatch = normalized.match(/(\d+(?:\.\d+)?)\s*min/i);
  const secondsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*s/i);

  return {
    targetDurationSeconds: minutesMatch
      ? Math.round(Number(minutesMatch[1]) * 60)
      : secondsMatch
        ? Math.round(Number(secondsMatch[1]))
        : null,
    notes: normalized || null,
  };
}

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

export async function createPlanAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  const durationWeeks = Math.min(Math.max(toInteger(formData.get("durationWeeks"), 4), 1), 24);

  if (!name || !startDate) {
    redirect("/plan?message=Nombre y fecha de inicio son obligatorios.");
  }

  const { data: createdPlan, error } = await supabase
    .from("training_plans")
    .insert({
      user_id: user.id,
      name,
      start_date: startDate,
      status: "inactive",
      inactivated_at: new Date().toISOString(),
      notes: objective || null,
    })
    .select("id")
    .single();

  if (error || !createdPlan) {
    redirect(`/plan?message=${encodeURIComponent(error?.message ?? "No se pudo crear el plan.")}`);
  }

  const weekRows = Array.from({ length: durationWeeks }, (_, index) => ({
    plan_id: createdPlan.id,
    week_number: index + 1,
  }));

  const { error: weeksError } = await supabase.from("plan_weeks").insert(weekRows);

  if (weeksError) {
    redirect(`/plan?message=${encodeURIComponent(weeksError.message)}`);
  }

  revalidatePath("/plan");
  redirect("/plan?message=Plan creado en estado inactivo.");
}

export async function setPlanInactiveAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();

  if (!planId) {
    redirect("/plan?message=No se encontro el plan.");
  }

  const { error } = await supabase
    .from("training_plans")
    .update({
      status: "inactive",
      inactivated_at: new Date().toISOString(),
      finished_at: null,
    })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/plan?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/plan");
  revalidatePath("/");
  redirect("/plan?message=Plan cancelado y marcado como inactivo.");
}

export async function activatePlanAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();

  if (!planId) {
    redirect("/plan?message=No se encontro el plan.");
  }

  const { error: deactivateError } = await supabase
    .from("training_plans")
    .update({
      status: "inactive",
      inactivated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (deactivateError) {
    redirect(`/plan?message=${encodeURIComponent(deactivateError.message)}`);
  }

  const { error } = await supabase
    .from("training_plans")
    .update({
      status: "active",
      inactivated_at: null,
      finished_at: null,
    })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/plan?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/plan");
  revalidatePath(`/plan/${planId}`);
  revalidatePath("/");
  redirect("/plan?message=Plan activado correctamente.");
}

export async function finishPlanAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();

  if (!planId) {
    redirect("/plan?message=No se encontro el plan.");
  }

  const { error } = await supabase
    .from("training_plans")
    .update({
      status: "finished",
      finished_at: new Date().toISOString(),
    })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/plan?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/plan");
  revalidatePath("/");
  redirect("/plan?message=Plan finalizado correctamente.");
}

export async function deletePlanAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();

  if (!planId) {
    redirect("/plan?message=No se encontro el plan.");
  }

  const { error } = await supabase
    .from("training_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/plan?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/plan");
  revalidatePath("/");
  redirect("/plan?message=Plan eliminado correctamente.");
}

export async function importPlanCsvAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("csvFile");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/plan?message=Selecciona un CSV de plan valido.");
  }

  const text = await file.text();
  const rows = parseCsvObjects(text);

  if (rows.length === 0) {
    redirect("/plan?message=El CSV de plan esta vacio.");
  }

  const firstRow = rows[0];
  const name = String(firstRow.plan_name ?? "").trim();
  const startDate = String(firstRow.start_date ?? "").trim();
  const objective = String(firstRow.objective ?? "").trim();
  const declaredDurationWeeks = Math.max(1, toInteger(firstRow.duration_weeks, 4));

  if (!name || !startDate) {
    redirect("/plan?message=El CSV necesita plan_name y start_date en la primera fila.");
  }

  const maxWeekNumber = rows.reduce((max, row) => Math.max(max, toInteger(row.week_number, 1)), 1);
  const durationWeeks = Math.max(declaredDurationWeeks, maxWeekNumber);

  const exerciseNames = Array.from(
    new Set(rows.map((row) => String(row.item_name ?? "").trim()).filter(Boolean)),
  );

  const { data: exercises, error: exerciseLookupError } = await supabase
    .from("exercises")
    .select("id, name")
    .in("name", exerciseNames);

  if (exerciseLookupError) {
    redirect(`/plan?message=${encodeURIComponent(exerciseLookupError.message)}`);
  }

  const exerciseMap = new Map((exercises ?? []).map((exercise) => [exercise.name, exercise.id]));
  const missingExercise = exerciseNames.find((exerciseName) => !exerciseMap.has(exerciseName));

  if (missingExercise) {
    redirect(
      `/plan?message=${encodeURIComponent(
        `La actividad "${missingExercise}" no existe en el catalogo. Importala antes de cargar el plan.`,
      )}`,
    );
  }

  const { data: createdPlan, error: planError } = await supabase
    .from("training_plans")
    .insert({
      user_id: user.id,
      name,
      start_date: startDate,
      status: "inactive",
      inactivated_at: new Date().toISOString(),
      notes: objective || null,
    })
    .select("id")
    .single();

  if (planError || !createdPlan) {
    redirect(`/plan?message=${encodeURIComponent(planError?.message ?? "No se pudo crear el plan.")}`);
  }

  const weekRows = Array.from({ length: durationWeeks }, (_, index) => ({
    plan_id: createdPlan.id,
    week_number: index + 1,
  }));

  const { data: insertedWeeks, error: weeksError } = await supabase
    .from("plan_weeks")
    .insert(weekRows)
    .select("id, week_number");

  if (weeksError || !insertedWeeks) {
    redirect(`/plan?message=${encodeURIComponent(weeksError?.message ?? "No se pudieron crear las semanas.")}`);
  }

  const weekIdMap = new Map(insertedWeeks.map((week) => [week.week_number, week.id]));
  const sessionMap = new Map<string, string>();
  const blockMap = new Map<string, string>();

  for (const row of rows) {
    const weekNumber = Math.max(1, toInteger(row.week_number, 1));
    const dayOfWeek = Math.min(7, Math.max(1, toInteger(row.day_of_week, 1)));
    const sessionType = String(row.session_type ?? "strength").trim() as
      | "strength"
      | "cardio"
      | "mobility";
    const sessionName = String(row.session_name ?? "").trim() || `${sessionType} ${dayOfWeek}`;
    const itemName = String(row.item_name ?? "").trim();
    const prescription = String(row.prescription ?? "").trim();
    const weekId = weekIdMap.get(weekNumber);

    if (!weekId || !itemName || !prescription) {
      continue;
    }

    const sessionKey = `${weekNumber}-${dayOfWeek}-${sessionType}-${sessionName}`;
    let sessionId = sessionMap.get(sessionKey) ?? null;

    if (!sessionId) {
      const { data: insertedSession, error: sessionError } = await supabase
        .from("planned_sessions")
        .insert({
          week_id: weekId,
          day_of_week: dayOfWeek,
          session_type: sessionType,
          name: sessionName,
        })
        .select("id")
        .single();

      if (sessionError || !insertedSession) {
        redirect(`/plan?message=${encodeURIComponent(sessionError?.message ?? "No se pudo crear una sesion del plan.")}`);
      }

      sessionId = insertedSession.id;
      sessionMap.set(sessionKey, insertedSession.id);
    }

    if (!sessionId) {
      continue;
    }

    let blockId = blockMap.get(sessionKey) ?? null;
    if (!blockId) {
      const { data: insertedBlock, error: blockError } = await supabase
        .from("session_blocks")
        .insert({
          session_id: sessionId,
          block_type: sessionType,
          order_index: 1,
        })
        .select("id")
        .single();

      if (blockError || !insertedBlock) {
        redirect(`/plan?message=${encodeURIComponent(blockError?.message ?? "No se pudo crear un bloque del plan.")}`);
      }

      blockId = insertedBlock.id;
      blockMap.set(sessionKey, insertedBlock.id);
    }

    if (!blockId) {
      continue;
    }

    const exerciseId = exerciseMap.get(itemName);
    const orderIndex =
      rows
        .filter(
          (candidate) =>
            String(candidate.session_name ?? "").trim() === sessionName &&
            toInteger(candidate.week_number, 1) === weekNumber &&
            toInteger(candidate.day_of_week, 1) === dayOfWeek &&
            String(candidate.session_type ?? "strength").trim() === sessionType,
        )
        .findIndex((candidate) => candidate === row) + 1;

    if (!exerciseId) {
      continue;
    }

    if (sessionType === "strength") {
      const parsed = parseStrengthPrescription(prescription);
      const { error: insertError } = await supabase.from("exercise_prescriptions").insert({
        block_id: blockId,
        exercise_id: exerciseId,
        order_index: orderIndex,
        sets: parsed.sets,
        reps: parsed.reps,
        target_load: parsed.targetLoad,
        notes: parsed.notes,
      });

      if (insertError) {
        redirect(`/plan?message=${encodeURIComponent(insertError.message)}`);
      }
      continue;
    }

    if (sessionType === "cardio") {
      const parsed = parseCardioPrescription(prescription);
      const { error: insertError } = await supabase.from("exercise_prescriptions").insert({
        block_id: blockId,
        exercise_id: exerciseId,
        order_index: orderIndex,
        target_duration_seconds: parsed.targetDurationSeconds,
        target_distance_meters: parsed.targetDistanceMeters,
        notes: parsed.notes,
      });

      if (insertError) {
        redirect(`/plan?message=${encodeURIComponent(insertError.message)}`);
      }
      continue;
    }

    const parsed = parseMobilityPrescription(prescription);
    const { error: insertError } = await supabase.from("exercise_prescriptions").insert({
      block_id: blockId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      target_duration_seconds: parsed.targetDurationSeconds,
      notes: parsed.notes,
    });

    if (insertError) {
      redirect(`/plan?message=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath("/plan");
  redirect("/plan?message=Plan importado desde CSV en estado inactivo.");
}

export async function createPlannedSessionAction(formData: FormData) {
  const { supabase } = await requireUser();

  const planId = String(formData.get("planId") ?? "").trim();
  const weekNumber = toInteger(formData.get("weekNumber"), 1);
  const dayOfWeek = toInteger(formData.get("dayOfWeek"), 1);
  const sessionType = String(formData.get("sessionType") ?? "strength").trim();
  const sessionName = String(formData.get("sessionName") ?? "").trim();
  const exerciseId = String(formData.get("exerciseId") ?? "").trim();
  const sets = toNullableNumber(formData.get("sets"));
  const reps = toNullableNumber(formData.get("reps"));
  const targetLoad = toNullableNumber(formData.get("targetLoad"));
  const targetDurationMinutes = toNullableNumber(formData.get("targetDurationMinutes"));
  const targetDistanceKm = toNullableNumber(formData.get("targetDistanceKm"));

  if (!planId || !sessionName || !exerciseId) {
    redirect("/plan?message=Plan, nombre de sesion y ejercicio son obligatorios.");
  }

  const { data: existingWeek, error: weekLookupError } = await supabase
    .from("plan_weeks")
    .select("id")
    .eq("plan_id", planId)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (weekLookupError) {
    redirect(`/plan?message=${encodeURIComponent(weekLookupError.message)}`);
  }

  let weekId = existingWeek?.id;

  if (!weekId) {
    const { data: createdWeek, error: createWeekError } = await supabase
      .from("plan_weeks")
      .insert({
        plan_id: planId,
        week_number: weekNumber,
      })
      .select("id")
      .single();

    if (createWeekError || !createdWeek) {
      redirect(`/plan?message=${encodeURIComponent(createWeekError?.message ?? "No se pudo crear la semana.")}`);
    }

    weekId = createdWeek.id;
  }

  const { data: plannedSession, error: plannedSessionError } = await supabase
    .from("planned_sessions")
    .insert({
      week_id: weekId,
      day_of_week: dayOfWeek,
      session_type: sessionType,
      name: sessionName,
    })
    .select("id")
    .single();

  if (plannedSessionError || !plannedSession) {
    redirect(`/plan?message=${encodeURIComponent(plannedSessionError?.message ?? "No se pudo crear la sesion.")}`);
  }

  const { data: block, error: blockError } = await supabase
    .from("session_blocks")
    .insert({
      session_id: plannedSession.id,
      block_type: sessionType === "mixed" ? "strength" : sessionType,
      order_index: 1,
    })
    .select("id")
    .single();

  if (blockError || !block) {
    redirect(`/plan?message=${encodeURIComponent(blockError?.message ?? "No se pudo crear el bloque.")}`);
  }

  const { error: prescriptionError } = await supabase.from("exercise_prescriptions").insert({
    block_id: block.id,
    exercise_id: exerciseId,
    order_index: 1,
    sets,
    reps,
    target_load: targetLoad,
    target_duration_seconds: targetDurationMinutes ? Math.round(targetDurationMinutes * 60) : null,
    target_distance_meters: targetDistanceKm ? Math.round(targetDistanceKm * 1000) : null,
  });

  if (prescriptionError) {
    redirect(`/plan?message=${encodeURIComponent(prescriptionError.message)}`);
  }

  revalidatePath("/plan");
  redirect("/plan?message=Sesion planificada creada correctamente.");
}

export async function saveStrengthMatrixAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const planId = String(formData.get("planId") ?? "").trim();
  const matricesRaw = String(formData.get("matrices") ?? "").trim();

  if (!planId || !matricesRaw) {
    return {
      ok: false,
      message: "No se pudo guardar la matriz: faltan datos.",
    };
  }

  type MatrixPayload = Array<{
    dayLabel: string;
    title: string;
    rows: Array<{
      exerciseId: string | null;
      exerciseName: string;
      weeks: Array<{ prescription: string }>;
    }>;
  }>;

  const dayToNumber: Record<string, number> = {
    Lun: 1,
    Mar: 2,
    Mie: 3,
    Jue: 4,
    Vie: 5,
    Sab: 6,
    Dom: 7,
  };

  let matrices: MatrixPayload;

  try {
    matrices = JSON.parse(matricesRaw) as MatrixPayload;
  } catch {
    return {
      ok: false,
      message: "No se pudo interpretar la matriz enviada.",
    };
  }

  const { data: planWeeks, error: weeksError } = await supabase
    .from("plan_weeks")
    .select("id, week_number, training_plans!inner(user_id)")
    .eq("plan_id", planId)
    .eq("training_plans.user_id", user.id)
    .order("week_number", { ascending: true });

  if (weeksError || !planWeeks) {
    return {
      ok: false,
      message: weeksError?.message ?? "No se pudieron cargar las semanas del plan.",
    };
  }

  const weekIdByNumber = new Map(planWeeks.map((week) => [week.week_number, week.id]));
  const weekIds = planWeeks.map((week) => week.id);

  if (weekIds.length === 0) {
    return {
      ok: false,
      message: "El plan no tiene semanas creadas.",
    };
  }

  const hasAnyFilledValue = matrices.some((matrix) =>
    matrix.rows.some(
      (row) =>
        Boolean(row.exerciseId) &&
        row.weeks.some((week) => week.prescription.trim().length > 0),
    ),
  );

  if (!hasAnyFilledValue) {
    return {
      ok: true,
      message: "No habia celdas completas que guardar en fuerza.",
    };
  }

  const { data: existingStrengthSessions, error: existingSessionsError } = await supabase
    .from("planned_sessions")
    .select("id")
    .in("week_id", weekIds)
    .eq("session_type", "strength");

  if (existingSessionsError) {
    return {
      ok: false,
      message: existingSessionsError.message,
    };
  }

  if ((existingStrengthSessions ?? []).length > 0) {
    const { error: deleteError } = await supabase
      .from("planned_sessions")
      .delete()
      .in(
        "id",
        (existingStrengthSessions ?? []).map((session) => session.id),
      );

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
      };
    }
  }

  for (const matrix of matrices) {
    const dayOfWeek = dayToNumber[matrix.dayLabel];

    if (!dayOfWeek) {
      continue;
    }

    for (let weekIndex = 0; weekIndex < planWeeks.length; weekIndex += 1) {
      const weekNumber = weekIndex + 1;
      const weekId = weekIdByNumber.get(weekNumber);

      if (!weekId) {
        continue;
      }

      const filledRows = matrix.rows
        .map((row, rowIndex) => ({
          rowIndex,
          exerciseId: row.exerciseId,
          prescription: row.weeks[weekIndex]?.prescription?.trim() ?? "",
        }))
        .filter((row) => row.exerciseId && row.prescription);

      if (filledRows.length === 0) {
        continue;
      }

      const { data: createdSession, error: sessionError } = await supabase
        .from("planned_sessions")
        .insert({
          week_id: weekId,
          day_of_week: dayOfWeek,
          session_type: "strength",
          name: matrix.title || `Fuerza ${matrix.dayLabel}`,
        })
        .select("id")
        .single();

      if (sessionError || !createdSession) {
        return {
          ok: false,
          message: sessionError?.message ?? "No se pudo crear la sesion de fuerza.",
        };
      }

      const { data: createdBlock, error: blockError } = await supabase
        .from("session_blocks")
        .insert({
          session_id: createdSession.id,
          block_type: "strength",
          order_index: 1,
        })
        .select("id")
        .single();

      if (blockError || !createdBlock) {
        return {
          ok: false,
          message: blockError?.message ?? "No se pudo crear el bloque de fuerza.",
        };
      }

      const prescriptions = filledRows.map((row) => {
        const parsed = parseStrengthPrescription(row.prescription);

        return {
          block_id: createdBlock.id,
          exercise_id: row.exerciseId,
          order_index: row.rowIndex + 1,
          sets: parsed.sets,
          reps: parsed.reps,
          target_load: parsed.targetLoad,
          notes: parsed.notes,
        };
      });

      const { error: prescriptionError } = await supabase
        .from("exercise_prescriptions")
        .insert(prescriptions);

      if (prescriptionError) {
        return {
          ok: false,
          message: prescriptionError.message,
        };
      }
    }
  }

  revalidatePath("/plan");
  revalidatePath("/");
  revalidatePath("/entrenar");

  return {
    ok: true,
    message: "Matriz de fuerza guardada.",
  };
}

export async function saveCardioMatrixAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();
  const matricesRaw = String(formData.get("matrices") ?? "").trim();

  if (!planId || !matricesRaw) {
    return { ok: false, message: "No se pudo guardar la matriz de cardio." };
  }

  type MatrixPayload = Array<{
    dayLabel: string;
    title: string;
    rows: Array<{
      exerciseId: string | null;
      exerciseName: string;
      weeks: Array<{ prescription: string }>;
    }>;
  }>;

  const dayToNumber: Record<string, number> = {
    Lun: 1,
    Mar: 2,
    Mie: 3,
    Jue: 4,
    Vie: 5,
    Sab: 6,
    Dom: 7,
  };

  let matrices: MatrixPayload;

  try {
    matrices = JSON.parse(matricesRaw) as MatrixPayload;
  } catch {
    return { ok: false, message: "No se pudo interpretar la matriz de cardio." };
  }

  const { data: planWeeks, error: weeksError } = await supabase
    .from("plan_weeks")
    .select("id, week_number, training_plans!inner(user_id)")
    .eq("plan_id", planId)
    .eq("training_plans.user_id", user.id)
    .order("week_number", { ascending: true });

  if (weeksError || !planWeeks) {
    return { ok: false, message: weeksError?.message ?? "No se pudieron cargar las semanas." };
  }

  const weekIdByNumber = new Map(planWeeks.map((week) => [week.week_number, week.id]));
  const weekIds = planWeeks.map((week) => week.id);

  const hasAnyFilledValue = matrices.some((matrix) =>
    matrix.rows.some(
      (row) =>
        Boolean(row.exerciseId) &&
        row.weeks.some((week) => week.prescription.trim().length > 0),
    ),
  );

  if (!hasAnyFilledValue) {
    return { ok: true, message: "No habia celdas completas que guardar en cardio." };
  }

  const { data: existingSessions, error: existingSessionsError } = await supabase
    .from("planned_sessions")
    .select("id")
    .in("week_id", weekIds)
    .eq("session_type", "cardio");

  if (existingSessionsError) {
    return { ok: false, message: existingSessionsError.message };
  }

  if ((existingSessions ?? []).length > 0) {
    const { error: deleteError } = await supabase
      .from("planned_sessions")
      .delete()
      .in("id", (existingSessions ?? []).map((session) => session.id));

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }
  }

  for (const matrix of matrices) {
    const dayOfWeek = dayToNumber[matrix.dayLabel];
    if (!dayOfWeek) continue;

    for (let weekIndex = 0; weekIndex < planWeeks.length; weekIndex += 1) {
      const weekId = weekIdByNumber.get(weekIndex + 1);
      if (!weekId) continue;

      const filledRows = matrix.rows
        .map((row, rowIndex) => ({
          rowIndex,
          exerciseId: row.exerciseId,
          prescription: row.weeks[weekIndex]?.prescription?.trim() ?? "",
        }))
        .filter((row) => row.exerciseId && row.prescription);

      if (filledRows.length === 0) continue;

      const { data: createdSession, error: sessionError } = await supabase
        .from("planned_sessions")
        .insert({
          week_id: weekId,
          day_of_week: dayOfWeek,
          session_type: "cardio",
          name: matrix.title || `Cardio ${matrix.dayLabel}`,
        })
        .select("id")
        .single();

      if (sessionError || !createdSession) {
        return { ok: false, message: sessionError?.message ?? "No se pudo crear la sesion cardio." };
      }

      const { data: createdBlock, error: blockError } = await supabase
        .from("session_blocks")
        .insert({
          session_id: createdSession.id,
          block_type: "cardio",
          order_index: 1,
        })
        .select("id")
        .single();

      if (blockError || !createdBlock) {
        return { ok: false, message: blockError?.message ?? "No se pudo crear el bloque cardio." };
      }

      const prescriptions = filledRows.map((row) => {
        const parsed = parseCardioPrescription(row.prescription);

        return {
          block_id: createdBlock.id,
          exercise_id: row.exerciseId,
          order_index: row.rowIndex + 1,
          target_duration_seconds: parsed.targetDurationSeconds,
          target_distance_meters: parsed.targetDistanceMeters,
          notes: parsed.notes,
        };
      });

      const { error: prescriptionError } = await supabase
        .from("exercise_prescriptions")
        .insert(prescriptions);

      if (prescriptionError) {
        return { ok: false, message: prescriptionError.message };
      }
    }
  }

  revalidatePath("/plan");
  revalidatePath("/");
  revalidatePath("/entrenar");

  return { ok: true, message: "Matriz de cardio guardada." };
}

export async function saveMobilityMatrixAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const planId = String(formData.get("planId") ?? "").trim();
  const matricesRaw = String(formData.get("matrices") ?? "").trim();

  if (!planId || !matricesRaw) {
    return { ok: false, message: "No se pudo guardar la matriz de movilidad." };
  }

  type MatrixPayload = Array<{
    dayLabel: string;
    title: string;
    rows: Array<{
      exerciseId: string | null;
      exerciseName: string;
      weeks: Array<{ prescription: string }>;
    }>;
  }>;

  const dayToNumber: Record<string, number> = {
    Lun: 1,
    Mar: 2,
    Mie: 3,
    Jue: 4,
    Vie: 5,
    Sab: 6,
    Dom: 7,
  };

  let matrices: MatrixPayload;

  try {
    matrices = JSON.parse(matricesRaw) as MatrixPayload;
  } catch {
    return { ok: false, message: "No se pudo interpretar la matriz de movilidad." };
  }

  const { data: planWeeks, error: weeksError } = await supabase
    .from("plan_weeks")
    .select("id, week_number, training_plans!inner(user_id)")
    .eq("plan_id", planId)
    .eq("training_plans.user_id", user.id)
    .order("week_number", { ascending: true });

  if (weeksError || !planWeeks) {
    return { ok: false, message: weeksError?.message ?? "No se pudieron cargar las semanas." };
  }

  const weekIdByNumber = new Map(planWeeks.map((week) => [week.week_number, week.id]));
  const weekIds = planWeeks.map((week) => week.id);

  const hasAnyFilledValue = matrices.some((matrix) =>
    matrix.rows.some(
      (row) =>
        Boolean(row.exerciseId) &&
        row.weeks.some((week) => week.prescription.trim().length > 0),
    ),
  );

  if (!hasAnyFilledValue) {
    return { ok: true, message: "No habia celdas completas que guardar en movilidad." };
  }

  const { data: existingSessions, error: existingSessionsError } = await supabase
    .from("planned_sessions")
    .select("id")
    .in("week_id", weekIds)
    .eq("session_type", "mobility");

  if (existingSessionsError) {
    return { ok: false, message: existingSessionsError.message };
  }

  if ((existingSessions ?? []).length > 0) {
    const { error: deleteError } = await supabase
      .from("planned_sessions")
      .delete()
      .in("id", (existingSessions ?? []).map((session) => session.id));

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }
  }

  for (const matrix of matrices) {
    const dayOfWeek = dayToNumber[matrix.dayLabel];
    if (!dayOfWeek) continue;

    for (let weekIndex = 0; weekIndex < planWeeks.length; weekIndex += 1) {
      const weekId = weekIdByNumber.get(weekIndex + 1);
      if (!weekId) continue;

      const filledRows = matrix.rows
        .map((row, rowIndex) => ({
          rowIndex,
          exerciseId: row.exerciseId,
          prescription: row.weeks[weekIndex]?.prescription?.trim() ?? "",
        }))
        .filter((row) => row.exerciseId && row.prescription);

      if (filledRows.length === 0) continue;

      const { data: createdSession, error: sessionError } = await supabase
        .from("planned_sessions")
        .insert({
          week_id: weekId,
          day_of_week: dayOfWeek,
          session_type: "mobility",
          name: matrix.title || `Movilidad ${matrix.dayLabel}`,
        })
        .select("id")
        .single();

      if (sessionError || !createdSession) {
        return {
          ok: false,
          message: sessionError?.message ?? "No se pudo crear la sesion de movilidad.",
        };
      }

      const { data: createdBlock, error: blockError } = await supabase
        .from("session_blocks")
        .insert({
          session_id: createdSession.id,
          block_type: "mobility",
          order_index: 1,
        })
        .select("id")
        .single();

      if (blockError || !createdBlock) {
        return { ok: false, message: blockError?.message ?? "No se pudo crear el bloque de movilidad." };
      }

      const prescriptions = filledRows.map((row) => {
        const parsed = parseMobilityPrescription(row.prescription);

        return {
          block_id: createdBlock.id,
          exercise_id: row.exerciseId,
          order_index: row.rowIndex + 1,
          target_duration_seconds: parsed.targetDurationSeconds,
          notes: parsed.notes,
        };
      });

      const { error: prescriptionError } = await supabase
        .from("exercise_prescriptions")
        .insert(prescriptions);

      if (prescriptionError) {
        return { ok: false, message: prescriptionError.message };
      }
    }
  }

  revalidatePath("/plan");
  revalidatePath("/");
  revalidatePath("/entrenar");

  return { ok: true, message: "Matriz de movilidad guardada." };
}
