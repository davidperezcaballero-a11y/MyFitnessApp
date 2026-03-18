import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  TrainingPlanDraft,
  TrainingPlanOverviewItem,
} from "@/features/planning/types";

type PlanRow = {
  id: string;
  name: string;
  start_date: string;
  status: "active" | "inactive" | "finished";
  notes: string | null;
  plan_weeks: Array<{
    week_number: number;
    planned_sessions: Array<{
      day_of_week: number;
      session_type: "strength" | "cardio" | "mobility" | "mixed";
      name: string | null;
      notes: string | null;
      session_blocks: Array<{
        order_index: number;
        exercise_prescriptions: Array<{
          order_index: number;
          sets: number | null;
          reps: number | null;
          target_load: number | null;
          target_duration_seconds: number | null;
          target_distance_meters: number | null;
          notes: string | null;
          exercises: {
            id: string;
            name: string;
          } | null;
        }>;
      }>;
    }>;
  }>;
};

const dayLabels = ["", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function getPlanStatusPriority(status: "active" | "inactive" | "finished") {
  if (status === "active") {
    return 0;
  }

  if (status === "inactive") {
    return 1;
  }

  return 2;
}

function formatPrescription(item: {
  sets: number | null;
  reps: number | null;
  target_load: number | null;
  target_duration_seconds: number | null;
  target_distance_meters: number | null;
  notes: string | null;
}) {
  if (item.notes) {
    return item.notes;
  }

  if (item.sets || item.reps || item.target_load) {
    const sets = item.sets ?? "-";
    const reps = item.reps ?? "-";
    const load = item.target_load ? ` @ ${item.target_load} kg` : "";
    return `${sets} x ${reps}${load}`;
  }

  if (item.target_duration_seconds) {
    const minutes = Math.round(item.target_duration_seconds / 60);
    return `${minutes} min`;
  }

  if (item.target_distance_meters) {
    return `${(item.target_distance_meters / 1000).toFixed(1)} km`;
  }

  return "Sin prescripcion";
}

function normalizeSessionType(
  value: "strength" | "cardio" | "mobility" | "mixed",
): "strength" | "cardio" | "mobility" {
  if (value === "mixed") {
    return "strength";
  }

  return value;
}

export async function getCurrentTrainingPlan(): Promise<TrainingPlanDraft | null> {
  const plans = await getTrainingPlansOverview();

  if (plans.length === 0) {
    return null;
  }

  const currentPlan =
    plans.find((plan) => plan.status === "active") ??
    plans.find((plan) => plan.status === "inactive") ??
    plans[0];

  return getTrainingPlanById(currentPlan.id);
}

export async function getTrainingPlansOverview(): Promise<TrainingPlanOverviewItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { data, error } = await supabase
    .from("training_plans")
    .select(
      `
        id,
        name,
        start_date,
        status,
        notes,
        plan_weeks(week_number)
      `,
    )
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`No se pudo cargar el plan: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return [...(data as unknown as PlanRow[])]
    .sort((a, b) => {
      const byStatus = getPlanStatusPriority(a.status) - getPlanStatusPriority(b.status);

      if (byStatus !== 0) {
        return byStatus;
      }

      return b.start_date.localeCompare(a.start_date);
    })
    .map((plan) => ({
      id: plan.id,
      name: plan.name,
      startDate: plan.start_date,
      status: plan.status,
      objective: plan.notes ?? "Sin objetivo definido.",
      totalWeeks: plan.plan_weeks.length,
    }));
}

export async function getTrainingPlanById(planId: string): Promise<TrainingPlanDraft | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { data, error } = await supabase
    .from("training_plans")
    .select(
      `
        id,
        name,
        start_date,
        status,
        notes,
        plan_weeks(
          week_number,
          planned_sessions(
            day_of_week,
            session_type,
            name,
            notes,
            session_blocks(
              order_index,
              exercise_prescriptions(
                order_index,
                sets,
                reps,
                target_load,
                target_duration_seconds,
                target_distance_meters,
                notes,
                exercises(id, name)
              )
            )
          )
        )
      `,
    )
    .eq("user_id", user.id)
    .eq("id", planId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el plan: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const plan = data as unknown as PlanRow;

  return {
    id: plan.id,
    name: plan.name,
    startDate: plan.start_date,
    status: plan.status,
    objective: plan.notes ?? "Plan activo cargado desde Supabase.",
    weeklyTarget: `${plan.plan_weeks.reduce(
      (total, week) => total + week.planned_sessions.length,
      0,
    )} sesiones planificadas`,
    weeks: [...plan.plan_weeks]
      .sort((a, b) => a.week_number - b.week_number)
      .map((week) => ({
        weekNumber: week.week_number,
        focus: `Semana ${week.week_number} del plan actual`,
        sessions: [...week.planned_sessions]
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((session) => ({
            dayLabel: dayLabels[session.day_of_week] ?? `Dia ${session.day_of_week}`,
            title: session.name ?? "Sesion planificada",
            sessionType: normalizeSessionType(session.session_type),
            exercises: [...session.session_blocks]
              .sort((a, b) => a.order_index - b.order_index)
              .flatMap((block) =>
                [...block.exercise_prescriptions]
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((exercise) => ({
                    exerciseId: exercise.exercises?.id,
                    name: exercise.exercises?.name ?? "Ejercicio",
                    prescription: formatPrescription(exercise),
                  })),
              ),
          })),
      })),
  };
}

export async function getPlanningExerciseOptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, exercise_type")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el catalogo de ejercicios: ${error.message}`);
  }

  return (data ?? []).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    exerciseType: exercise.exercise_type,
  }));
}
