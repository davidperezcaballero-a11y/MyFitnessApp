import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  MobilityWorkoutDraft,
  PlannedCardioSessionDraft,
  WorkoutSessionDraft,
} from "@/features/training/types";

type PlannedSessionRow = {
  id: string;
  name: string | null;
  session_type: "strength" | "cardio" | "mobility" | "mixed";
  day_of_week: number;
  week_number: number;
  plan_name: string | null;
  session_blocks: Array<{
    order_index: number;
    exercise_prescriptions: Array<{
      order_index: number;
      sets: number | null;
      reps: number | null;
      target_load: number | null;
      target_duration_seconds?: number | null;
      target_distance_meters?: number | null;
      notes?: string | null;
      exercises: {
        id?: string;
        name: string;
      } | null;
    }>;
  }>;
};

function normalizeSessionType(value: PlannedSessionRow["session_type"]) {
  return value === "mixed" ? "strength" : value;
}

type NextPlannedTrainingChoice = {
  href: string;
  title: string;
  description: string;
  status: string;
  accent: "teal" | "coral" | "moss";
};

export type PlannedTrainingChoice = {
  plannedSessionId: string;
  title: string;
  description: string;
  weekNumber: number;
  dayOfWeek: number;
  dateLabel: string;
  href: string;
  completedAt?: string;
  completionSummary?: string;
};

export type PlannedTrainingSection = {
  key: "strength" | "cardio" | "mobility";
  title: string;
  accent: "teal" | "coral" | "moss";
  sessions: PlannedTrainingChoice[];
};

export type LatestFreeTrainingItem = {
  type: "strength" | "cardio" | "mobility";
  title: string;
  summary: string;
  date: string;
};

function formatCompletedSessionSummary(
  sessionType: "strength" | "cardio" | "mobility" | "mixed",
  workout: {
    session_date: string | null;
    session_exercises?: Array<{
      strength_sets?: Array<{ id: string }>;
    }>;
    cardio_sessions?: Array<{
      duration_seconds: number | null;
      distance_meters: number | null;
    }>;
    mobility_sessions?: Array<{
      duration_seconds: number | null;
    }>;
  },
) {
  const dateLabel = workout.session_date ?? "fecha no disponible";

  if (normalizeSessionType(sessionType) === "strength") {
    const totalSets =
      workout.session_exercises?.reduce(
        (total, exercise) => total + (exercise.strength_sets?.length ?? 0),
        0,
      ) ?? 0;
    return `Realizada el ${dateLabel} · ${totalSets} sets guardados`;
  }

  if (normalizeSessionType(sessionType) === "cardio") {
    const cardio = workout.cardio_sessions?.[0];
    const minutes = cardio?.duration_seconds ? Math.round(cardio.duration_seconds / 60) : 0;
    const km = cardio?.distance_meters
      ? Number((cardio.distance_meters / 1000).toFixed(1))
      : 0;
    return `Realizada el ${dateLabel} · ${minutes} min · ${km} km`;
  }

  const mobility = workout.mobility_sessions?.[0];
  const mobilityMinutes = mobility?.duration_seconds ? Math.round(mobility.duration_seconds / 60) : 0;
  return `Realizada el ${dateLabel} · ${mobilityMinutes} min`;
}

function formatPlannedDate(startDate: string | null | undefined, weekNumber: number, dayOfWeek: number) {
  if (!startDate) {
    return `Semana ${weekNumber} · Dia ${dayOfWeek}`;
  }

  const [year, month, day] = startDate.split("-").map(Number);

  if (!year || !month || !day) {
    return `Semana ${weekNumber} · Dia ${dayOfWeek}`;
  }

  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + (weekNumber - 1) * 7 + (dayOfWeek - 1));

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(base);
}

async function getActivePlanSessions() {
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
        name,
        start_date,
        plan_weeks(
          week_number,
          planned_sessions(
            id,
            name,
            session_type,
            day_of_week,
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
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la sesion planificada: ${error.message}`);
  }

  const sessions =
    (
      ((data as
        | {
            name: string | null;
            start_date: string | null;
            plan_weeks: Array<{
              week_number: number;
              planned_sessions: Array<Omit<PlannedSessionRow, "week_number" | "plan_name">>;
            }>;
          }
        | null)?.plan_weeks ?? []) as Array<{
        week_number: number;
        planned_sessions: Array<Omit<PlannedSessionRow, "week_number" | "plan_name">>;
      }>
    )
      .flatMap((week) =>
        week.planned_sessions.map((session) => ({
          ...session,
          week_number: week.week_number,
          plan_name: data?.name ?? null,
          date_label: formatPlannedDate(data?.start_date, week.week_number, session.day_of_week),
        })),
      )
      .sort((a, b) => {
        if (a.week_number !== b.week_number) {
          return a.week_number - b.week_number;
        }

        return a.day_of_week - b.day_of_week;
      });

  const plannedSessionIds = sessions.map((session) => session.id);

  const { data: completedWorkouts, error: completedWorkoutsError } = plannedSessionIds.length
    ? await supabase
        .from("workout_sessions")
        .select(
          `
            planned_session_id,
            finished_at,
            session_date,
            session_exercises(
              strength_sets(id)
            ),
            cardio_sessions(
              duration_seconds,
              distance_meters
            ),
            mobility_sessions(
              duration_seconds
            )
          `,
        )
        .eq("user_id", user.id)
        .in("planned_session_id", plannedSessionIds)
        .not("finished_at", "is", null)
        .order("finished_at", { ascending: false })
    : { data: [], error: null };

  if (completedWorkoutsError) {
    throw new Error(`No se pudo cargar el estado de las sesiones realizadas: ${completedWorkoutsError.message}`);
  }

  const latestCompletedByPlannedSession = new Map<
    string,
    {
      finished_at: string | null;
      session_date: string | null;
      session_exercises?: Array<{ strength_sets?: Array<{ id: string }> }>;
      cardio_sessions?: Array<{ duration_seconds: number | null; distance_meters: number | null }>;
      mobility_sessions?: Array<{ duration_seconds: number | null }>;
    }
  >();

  for (const workout of completedWorkouts ?? []) {
    if (!workout.planned_session_id || latestCompletedByPlannedSession.has(workout.planned_session_id)) {
      continue;
    }

    latestCompletedByPlannedSession.set(workout.planned_session_id, {
      finished_at: workout.finished_at,
      session_date: workout.session_date,
      session_exercises: workout.session_exercises,
      cardio_sessions: workout.cardio_sessions,
      mobility_sessions: workout.mobility_sessions,
    });
  }

  return {
    planName: data?.name ?? null,
    sessions,
    latestCompletedByPlannedSession,
  };
}

export async function getNextStrengthPlannedSession(
  plannedSessionId?: string,
): Promise<WorkoutSessionDraft | null> {
  const { sessions, planName } = await getActivePlanSessions();
  const strengthSessions = sessions.filter(
    (session) => normalizeSessionType(session.session_type) === "strength",
  );

  if (strengthSessions.length === 0) {
    return null;
  }

  const session =
    strengthSessions.find((item) => item.id === plannedSessionId) ?? strengthSessions[0];

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    plannedSessionId: session.id,
    title: session.name ?? session.plan_name ?? "Sesion de fuerza",
    source: "planned",
    status: "started",
    currentExerciseIndex: 0,
    exercises: [...session.session_blocks]
      .sort((a, b) => a.order_index - b.order_index)
      .flatMap((block, blockIndex) =>
        [...block.exercise_prescriptions]
          .sort((a, b) => a.order_index - b.order_index)
          .map((exercise, exerciseIndex) => ({
            id: `${session.id}-${blockIndex + 1}-${exerciseIndex + 1}`,
            name: exercise.exercises?.name ?? "Ejercicio",
            targetSets: exercise.sets ?? 1,
            targetReps: exercise.reps ?? 0,
            targetWeight: exercise.target_load ?? undefined,
            completedSets: [],
          })),
      ),
  };
}

export async function getNextPlannedSessionChoices(): Promise<NextPlannedTrainingChoice[]> {
  const { sessions } = await getActivePlanSessions();
  const sessionByType = {
    strength: sessions.find((session) => normalizeSessionType(session.session_type) === "strength"),
    cardio: sessions.find((session) => normalizeSessionType(session.session_type) === "cardio"),
    mobility: sessions.find((session) => normalizeSessionType(session.session_type) === "mobility"),
  };

  return [
    {
      href: "/entrenar/sesion",
      title: "Siguiente fuerza",
      description: sessionByType.strength
        ? `${sessionByType.strength.name ?? "Sesion de fuerza"} · semana ${sessionByType.strength.week_number}`
        : "No hay una sesion de fuerza planificada en el bloque activo.",
      status: sessionByType.strength ? "Plan activo" : "Sin plan",
      accent: "teal",
    },
    {
      href: "/entrenar/cardio",
      title: "Siguiente cardio",
      description: sessionByType.cardio
        ? `${sessionByType.cardio.name ?? "Sesion cardio"} · semana ${sessionByType.cardio.week_number}`
        : "No hay una sesion cardio planificada en el bloque activo.",
      status: sessionByType.cardio ? "Plan activo" : "Sin plan",
      accent: "coral",
    },
    {
      href: "/entrenar/movilidad",
      title: "Siguiente movilidad",
      description: sessionByType.mobility
        ? `${sessionByType.mobility.name ?? "Sesion de movilidad"} · semana ${sessionByType.mobility.week_number}`
        : "No hay una sesion de movilidad planificada en el bloque activo.",
      status: sessionByType.mobility ? "Plan activo" : "Sin plan",
      accent: "moss",
    },
  ];
}

export async function getPlannedTrainingSections(): Promise<PlannedTrainingSection[]> {
  const { sessions, latestCompletedByPlannedSession } = await getActivePlanSessions();

  const grouped = {
    strength: sessions.filter((session) => normalizeSessionType(session.session_type) === "strength"),
    cardio: sessions.filter((session) => normalizeSessionType(session.session_type) === "cardio"),
    mobility: sessions.filter((session) => normalizeSessionType(session.session_type) === "mobility"),
  };

  return [
    {
      key: "strength",
      title: "Fuerza",
      accent: "teal",
      sessions: grouped.strength.map((session) => ({
        ...(latestCompletedByPlannedSession.get(session.id)
          ? {
              completedAt: latestCompletedByPlannedSession.get(session.id)?.finished_at ?? undefined,
              completionSummary: formatCompletedSessionSummary(
                session.session_type,
                latestCompletedByPlannedSession.get(session.id)!,
              ),
            }
          : {}),
        plannedSessionId: session.id,
        title: session.name ?? "Sesion de fuerza",
        description: `Semana ${session.week_number} · ${session.date_label}`,
        weekNumber: session.week_number,
        dayOfWeek: session.day_of_week,
        dateLabel: session.date_label,
        href: `/entrenar/sesion?plannedSessionId=${session.id}`,
      })),
    },
    {
      key: "cardio",
      title: "Cardio",
      accent: "coral",
      sessions: grouped.cardio.map((session) => ({
        ...(latestCompletedByPlannedSession.get(session.id)
          ? {
              completedAt: latestCompletedByPlannedSession.get(session.id)?.finished_at ?? undefined,
              completionSummary: formatCompletedSessionSummary(
                session.session_type,
                latestCompletedByPlannedSession.get(session.id)!,
              ),
            }
          : {}),
        plannedSessionId: session.id,
        title: session.name ?? "Sesion cardio",
        description: `Semana ${session.week_number} · ${session.date_label}`,
        weekNumber: session.week_number,
        dayOfWeek: session.day_of_week,
        dateLabel: session.date_label,
        href: `/entrenar/cardio?plannedSessionId=${session.id}`,
      })),
    },
    {
      key: "mobility",
      title: "Movilidad",
      accent: "moss",
      sessions: grouped.mobility.map((session) => ({
        ...(latestCompletedByPlannedSession.get(session.id)
          ? {
              completedAt: latestCompletedByPlannedSession.get(session.id)?.finished_at ?? undefined,
              completionSummary: formatCompletedSessionSummary(
                session.session_type,
                latestCompletedByPlannedSession.get(session.id)!,
              ),
            }
          : {}),
        plannedSessionId: session.id,
        title: session.name ?? "Sesion de movilidad",
        description: `Semana ${session.week_number} · ${session.date_label}`,
        weekNumber: session.week_number,
        dayOfWeek: session.day_of_week,
        dateLabel: session.date_label,
        href: `/entrenar/movilidad?plannedSessionId=${session.id}`,
      })),
    },
  ];
}

export async function getPlannedCardioSession(
  plannedSessionId?: string,
): Promise<PlannedCardioSessionDraft | null> {
  if (!plannedSessionId) {
    return null;
  }

  const { sessions } = await getActivePlanSessions();
  const session = sessions.find(
    (item) => item.id === plannedSessionId && normalizeSessionType(item.session_type) === "cardio",
  );

  if (!session) {
    return null;
  }

  const prescription = [...session.session_blocks]
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap((block) => [...block.exercise_prescriptions].sort((a, b) => a.order_index - b.order_index))[0];

  return {
    plannedSessionId: session.id,
    title: session.name ?? "Sesion cardio",
    activityId: prescription?.exercises?.id,
    activityName: prescription?.exercises?.name ?? "Actividad cardio",
    durationMinutes: prescription?.target_duration_seconds
      ? Math.round(prescription.target_duration_seconds / 60)
      : undefined,
    distanceKm: prescription?.target_distance_meters
      ? Number((prescription.target_distance_meters / 1000).toFixed(1))
      : undefined,
    notes: prescription?.notes ?? undefined,
    dateLabel: session.date_label,
  };
}

export async function getPlannedMobilitySession(
  plannedSessionId?: string,
): Promise<MobilityWorkoutDraft | null> {
  if (!plannedSessionId) {
    return null;
  }

  const { sessions } = await getActivePlanSessions();
  const session = sessions.find(
    (item) => item.id === plannedSessionId && normalizeSessionType(item.session_type) === "mobility",
  );

  if (!session) {
    return null;
  }

  const exercises = [...session.session_blocks]
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap((block) =>
      [...block.exercise_prescriptions]
        .sort((a, b) => a.order_index - b.order_index)
        .map((exercise) => ({
          name: exercise.exercises?.name ?? "Ejercicio de movilidad",
          durationSeconds: exercise.target_duration_seconds ?? 60,
        })),
    );

  const totalMinutes = Math.max(
    1,
    Math.round(exercises.reduce((total, exercise) => total + exercise.durationSeconds, 0) / 60),
  );

  return {
    plannedSessionId: session.id,
    title: session.name ?? "Sesion de movilidad",
    routineName: session.name ?? "Movilidad planificada",
    totalMinutes,
    exercises,
  };
}

export async function getCardioExerciseOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("id, name")
    .eq("exercise_type", "cardio")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el catalogo cardio: ${error.message}`);
  }

  return data ?? [];
}

export async function getStrengthExerciseOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("id, name")
    .eq("exercise_type", "strength")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el catalogo de fuerza: ${error.message}`);
  }

  return data ?? [];
}

export async function getMobilityRoutineOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mobility_routines")
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las rutinas: ${error.message}`);
  }

  return data ?? [];
}

export async function getLatestFreeTrainingItems(): Promise<LatestFreeTrainingItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `
        id,
        session_date,
        session_type,
        notes,
        planned_session_id,
        session_exercises(
          strength_sets(id)
        ),
        cardio_sessions(
          duration_seconds,
          distance_meters
        ),
        mobility_sessions(
          duration_seconds
        )
      `,
    )
    .eq("user_id", user.id)
    .is("planned_session_id", null)
    .order("session_date", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`No se pudieron cargar las sesiones libres: ${error.message}`);
  }

  const byType = new Map<string, LatestFreeTrainingItem>();

  for (const item of data ?? []) {
    const type = normalizeSessionType(item.session_type);

    if (byType.has(type)) {
      continue;
    }

    const summary =
      type === "strength"
        ? `${item.session_exercises?.reduce(
            (total, exercise) => total + (exercise.strength_sets?.length ?? 0),
            0,
          ) ?? 0} sets`
        : type === "cardio"
          ? `${Math.round((item.cardio_sessions?.[0]?.duration_seconds ?? 0) / 60)} min`
          : `${Math.round((item.mobility_sessions?.[0]?.duration_seconds ?? 0) / 60)} min`;

    byType.set(type, {
      type,
      title: item.notes ?? "Sesion libre",
      summary,
      date: item.session_date,
    });
  }

  return ["strength", "cardio", "mobility"]
    .map((type) => byType.get(type))
    .filter((value): value is LatestFreeTrainingItem => Boolean(value));
}
