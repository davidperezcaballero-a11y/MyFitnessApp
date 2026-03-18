import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { DashboardSummary } from "@/features/dashboard/types";

type WorkoutSessionRow = {
  id: string;
  planned_session_id: string | null;
  session_type: "strength" | "cardio" | "mobility" | "mixed";
  session_date: string;
  finished_at: string | null;
  session_exercises: Array<{
    strength_sets: Array<{ reps: number; weight: number | null }>;
  }>;
  cardio_sessions: Array<{
    duration_seconds: number;
    distance_meters: number | null;
  }>;
  mobility_sessions: Array<{
    duration_seconds: number | null;
  }>;
};

const dayLabels = ["", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function formatLongDate(isoDate: string) {
  const value = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatSessionDate(startDate: string, weekNumber: number, dayOfWeek: number) {
  const base = new Date(`${startDate}T00:00:00`);
  const offsetDays = (weekNumber - 1) * 7 + (dayOfWeek - 1);
  base.setDate(base.getDate() + offsetDays);

  return {
    iso: base.toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(base),
  };
}

function formatCompletedLabel(date: string) {
  return `Realizada el ${new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  }).format(new Date(date))}`;
}

function sessionStartHref(sessionType: "strength" | "cardio" | "mobility", plannedSessionId: string) {
  if (sessionType === "strength") {
    return `/entrenar/sesion?plannedSessionId=${plannedSessionId}`;
  }

  if (sessionType === "cardio") {
    return `/entrenar/cardio?plannedSessionId=${plannedSessionId}`;
  }

  return `/entrenar/movilidad?plannedSessionId=${plannedSessionId}`;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { startDate, endDate } = getWeekBounds();

  const [workoutsThisWeekResult, activePlanResult] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select(
        `
          id,
          planned_session_id,
          session_type,
          session_date,
          finished_at,
          session_exercises(
            strength_sets(reps, weight)
          ),
          cardio_sessions(duration_seconds, distance_meters),
          mobility_sessions(duration_seconds)
        `,
      )
      .eq("user_id", user.id)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: false }),
    supabase
      .from("training_plans")
      .select(
        `
          id,
          name,
          notes,
          start_date,
          plan_weeks(
            id,
            week_number,
            planned_sessions(
              id,
              day_of_week,
              session_type,
              name
            )
          )
        `,
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (workoutsThisWeekResult.error) {
    throw new Error(`No se pudo cargar el resumen semanal: ${workoutsThisWeekResult.error.message}`);
  }

  if (activePlanResult.error) {
    throw new Error(`No se pudo cargar el plan activo: ${activePlanResult.error.message}`);
  }

  const workoutsThisWeek = (workoutsThisWeekResult.data ?? []) as WorkoutSessionRow[];
  const activePlan = activePlanResult.data as
    | {
        id: string;
        name: string | null;
        notes: string | null;
        start_date: string;
        plan_weeks: Array<{
          id: string;
          week_number: number;
          planned_sessions: Array<{
            id: string;
            day_of_week: number;
            session_type: "strength" | "cardio" | "mobility" | "mixed";
            name: string | null;
          }>;
        }>;
      }
    | null;

  if (!activePlan) {
    return {
      activePlan: null,
      nextSessionsByType: [],
    };
  }

  const totalWeeks = activePlan.plan_weeks.length;
  const startedAt = new Date(`${activePlan.start_date}T00:00:00`);
  const now = new Date();
  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const currentWeek = totalWeeks > 0 ? Math.min(totalWeeks, Math.floor(elapsedDays / 7) + 1) : 0;
  const estimatedEndDate = new Date(startedAt);
  estimatedEndDate.setDate(startedAt.getDate() + Math.max(totalWeeks * 7 - 1, 0));

  const strengthSessionsThisWeek = workoutsThisWeek.filter(
    (session) => session.session_type === "strength" || session.session_type === "mixed",
  );
  const cardioSessionsThisWeek = workoutsThisWeek.filter((session) => session.session_type === "cardio");
  const mobilitySessionsThisWeek = workoutsThisWeek.filter((session) => session.session_type === "mobility");

  const strengthVolume = Math.round(
    strengthSessionsThisWeek.reduce(
      (total, session) =>
        total +
        session.session_exercises.reduce(
          (sessionTotal, exercise) =>
            sessionTotal +
            exercise.strength_sets.reduce(
              (exerciseTotal, set) => exerciseTotal + (set.weight ?? 0) * set.reps,
              0,
            ),
          0,
        ),
      0,
    ),
  );

  const cardioSeconds = cardioSessionsThisWeek.reduce(
    (total, session) =>
      total +
      session.cardio_sessions.reduce(
        (sessionTotal, cardio) => sessionTotal + cardio.duration_seconds,
        0,
      ),
    0,
  );
  const cardioDistanceMeters = cardioSessionsThisWeek.reduce(
    (total, session) =>
      total +
      session.cardio_sessions.reduce(
        (sessionTotal, cardio) => sessionTotal + (cardio.distance_meters ?? 0),
        0,
      ),
    0,
  );
  const mobilitySeconds = mobilitySessionsThisWeek.reduce(
    (total, session) =>
      total +
      session.mobility_sessions.reduce(
        (sessionTotal, mobility) => sessionTotal + (mobility.duration_seconds ?? 0),
        0,
      ),
    0,
  );

  const disciplineSummary: NonNullable<DashboardSummary["activePlan"]>["disciplineSummary"] = [
    {
      key: "strength",
      label: "Fuerza",
      primary: `${strengthSessionsThisWeek.length} ses. esta semana`,
      secondary:
        strengthSessionsThisWeek.length > 0 ? `${strengthVolume} kg de volumen` : "Sin fuerza registrada",
    },
    {
      key: "cardio",
      label: "Cardio",
      primary: `${Math.round(cardioSeconds / 60)} min esta semana`,
      secondary:
        cardioDistanceMeters > 0
          ? `${(cardioDistanceMeters / 1000).toFixed(1)} km acumulados`
          : "Sin distancia registrada",
    },
    {
      key: "mobility",
      label: "Movilidad",
      primary: `${mobilitySessionsThisWeek.length} ses. esta semana`,
      secondary:
        mobilitySeconds > 0
          ? `${Math.round(mobilitySeconds / 60)} min acumulados`
          : "Sin movilidad registrada",
    },
  ];

  const allPlanSessions = activePlan.plan_weeks
    .flatMap((week) =>
      week.planned_sessions.map((session) => {
        const sessionType =
          session.session_type === "mixed" ? "strength" : session.session_type;
        const formattedDate = formatSessionDate(activePlan.start_date, week.week_number, session.day_of_week);
        const matchingWorkouts = workoutsThisWeek
          .filter((workout) => workout.planned_session_id === session.id)
          .sort((a, b) => {
            const aValue = a.finished_at ?? a.session_date;
            const bValue = b.finished_at ?? b.session_date;
            return bValue.localeCompare(aValue);
          });
        const latestWorkout = matchingWorkouts[0] ?? null;

        return {
          id: session.id,
          title: session.name ?? "Sesion planificada",
          sessionType,
          weekNumber: week.week_number,
          dayOfWeek: session.day_of_week,
          dayLabel: dayLabels[session.day_of_week] ?? `Dia ${session.day_of_week}`,
          dateIso: formattedDate.iso,
          dateLabel: formattedDate.label,
          completedWorkoutId: latestWorkout?.id ?? null,
          completedAt: latestWorkout?.finished_at ?? null,
        };
      }),
    )
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  const todayIso = new Date().toISOString().slice(0, 10);
  const nextSessionsByType = (["strength", "cardio", "mobility"] as const)
    .map((type) => {
      const matching = allPlanSessions.filter((session) => session.sessionType === type);
      const pendingUpcoming = matching.find(
        (session) => session.dateIso >= todayIso && !session.completedAt,
      );
      const nextUpcoming = matching.find((session) => session.dateIso >= todayIso);
      const nextSession = pendingUpcoming ?? nextUpcoming ?? matching[0] ?? null;

      if (!nextSession) {
        return null;
      }

      return {
        id: nextSession.id,
        title: nextSession.title,
        sessionType: type,
        weekLabel: `Semana ${nextSession.weekNumber}`,
        dayLabel: nextSession.dayLabel,
        dateLabel: nextSession.dateLabel,
        detail: `${nextSession.weekNumber === currentWeek ? "Semana actual" : `Semana ${nextSession.weekNumber}`} · ${nextSession.dayLabel}`,
        status: (nextSession.completedAt ? "completed" : "pending") as "completed" | "pending",
        completedLabel: nextSession.completedAt ? formatCompletedLabel(nextSession.completedAt) : undefined,
        startHref: sessionStartHref(type, nextSession.id),
        historyHref: nextSession.completedWorkoutId
          ? `/historial/${nextSession.completedWorkoutId}`
          : undefined,
      };
    })
    .filter((session): session is NonNullable<typeof session> => session !== null);

  return {
    activePlan: {
      name: activePlan.name ?? "Plan activo",
      objective: activePlan.notes ?? "Sin objetivo definido.",
      startDateLabel: formatLongDate(activePlan.start_date),
      estimatedEndDateLabel: new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(estimatedEndDate),
      currentWeek,
      totalWeeks,
      progressPercent: totalWeeks > 0 ? Math.round((currentWeek / totalWeeks) * 100) : 0,
      disciplineSummary,
    },
    nextSessionsByType,
  };
}
