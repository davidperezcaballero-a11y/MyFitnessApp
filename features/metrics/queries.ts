import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { MetricsPeriod, MetricsSummary } from "@/features/metrics/types";

type WorkoutMetricRow = {
  id: string;
  session_type: "strength" | "cardio" | "mobility" | "mixed";
  session_date: string;
  session_exercises: Array<{
    exercises: { name: string } | null;
    strength_sets: Array<{
      reps: number;
      weight: number | null;
    }>;
  }>;
  cardio_sessions: Array<{
    duration_seconds: number;
    distance_meters: number | null;
    exercises: { name: string } | null;
  }>;
  mobility_sessions: Array<{
    duration_seconds: number | null;
    mobility_exercises: Array<{
      exercises: { name: string } | null;
      duration_seconds: number;
    }>;
  }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  return weight * (1 + reps / 30);
}

function formatPace(totalSeconds: number, distanceKm: number) {
  if (totalSeconds <= 0 || distanceKm <= 0) {
    return "-";
  }

  const paceSeconds = Math.round(totalSeconds / distanceKm);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

function isRunningLikeActivity(name: string) {
  const normalized = name.toLowerCase();
  return (
    normalized.includes("correr") ||
    normalized.includes("carrera") ||
    normalized.includes("caminar") ||
    normalized.includes("run") ||
    normalized.includes("walk")
  );
}

function getPeriodConfig(period: MetricsPeriod, activePlanStartDate?: string | null) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "week") {
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + diffToMonday);
    return {
      startDate: start.toISOString().slice(0, 10),
      label: "Esta semana",
    };
  }

  if (period === "last4weeks") {
    const start = new Date(today);
    start.setDate(today.getDate() - 27);
    return {
      startDate: start.toISOString().slice(0, 10),
      label: "Ultimas 4 semanas",
    };
  }

  if (period === "activePlan" && activePlanStartDate) {
    return {
      startDate: activePlanStartDate,
      label: "Bloque actual",
    };
  }

  return {
    startDate: null,
    label: "Historico completo",
  };
}

function createStrengthPrMap(sessions: WorkoutMetricRow[]) {
  const map = new Map<
    string,
    {
      prWeight: number | null;
      prReps: number | null;
      prEstimated1rm: number | null;
    }
  >();

  for (const session of sessions) {
    for (const exercise of session.session_exercises) {
      const exerciseName = exercise.exercises?.name ?? "Ejercicio";
      const entry =
        map.get(exerciseName) ?? {
          prWeight: null as number | null,
          prReps: null as number | null,
          prEstimated1rm: null as number | null,
        };

      for (const set of exercise.strength_sets) {
        const weight = set.weight ?? 0;
        const reps = set.reps;
        const estimated1rm = estimateOneRepMax(weight, reps);

        entry.prWeight = entry.prWeight == null ? weight : Math.max(entry.prWeight, weight);
        entry.prReps = entry.prReps == null ? reps : Math.max(entry.prReps, reps);
        entry.prEstimated1rm =
          entry.prEstimated1rm == null ? estimated1rm : Math.max(entry.prEstimated1rm, estimated1rm);
      }

      map.set(exerciseName, entry);
    }
  }

  return map;
}

export async function getMetricsSummary(period: MetricsPeriod = "all"): Promise<MetricsSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const [sessionsResult, activePlanResult] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select(
        `
          id,
          session_type,
          session_date,
          session_exercises(
            exercises(name),
            strength_sets(reps, weight)
          ),
          cardio_sessions(
            duration_seconds,
            distance_meters,
            exercises(name)
          ),
          mobility_sessions(
            duration_seconds,
            mobility_exercises(
              duration_seconds,
              exercises(name)
            )
          )
        `,
      )
      .eq("user_id", user.id)
      .order("session_date", { ascending: false }),
    supabase
      .from("training_plans")
      .select("start_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (sessionsResult.error) {
    throw new Error(`No se pudieron cargar las metricas: ${sessionsResult.error.message}`);
  }

  if (activePlanResult.error) {
    throw new Error(`No se pudo cargar el plan activo: ${activePlanResult.error.message}`);
  }

  const allSessions = (sessionsResult.data ?? []) as unknown as WorkoutMetricRow[];
  const activePlanStartDate = activePlanResult.data?.start_date ?? null;
  const periodConfig = getPeriodConfig(period, activePlanStartDate);
  const filteredSessions = periodConfig.startDate
    ? allSessions.filter((session) => session.session_date >= periodConfig.startDate)
    : allSessions;
  const strengthPrMap = createStrengthPrMap(allSessions);

  const strengthMap = new Map<
    string,
    {
      exerciseName: string;
      sessionIds: Set<string>;
      totalSets: number;
      totalVolume: number;
      lastDate: string;
      lastRecord: string;
    }
  >();

  const cardioMap = new Map<
    string,
    {
      activityName: string;
      isRunningLike: boolean;
      sessionIds: Set<string>;
      totalMinutes: number;
      totalSeconds: number;
      totalDistanceKm: number;
      fastestPaceSecondsPerKm: number | null;
      longestDistanceKm: number;
      lastDate: string;
      lastRecord: string;
    }
  >();

  const mobilityMap = new Map<
    string,
    {
      routineName: string;
      sessionIds: Set<string>;
      totalMinutes: number;
      lastDate: string;
      lastRecord: string;
    }
  >();

  let totalStrengthVolume = 0;
  let totalStrengthSets = 0;
  const strengthSessionIds = new Set<string>();

  let totalCardioMinutes = 0;
  let totalRunningMinutes = 0;
  let totalRunningSeconds = 0;
  let totalCardioDistanceKm = 0;
  let fastestCardioPaceSecondsPerKm: number | null = null;
  let longestCardioDistanceKm = 0;
  const cardioSessionIds = new Set<string>();

  let totalMobilityMinutes = 0;
  const mobilitySessionIds = new Set<string>();

  for (const session of filteredSessions) {
    const sessionDateLabel = formatDate(session.session_date);

    for (const exercise of session.session_exercises) {
      const exerciseName = exercise.exercises?.name ?? "Ejercicio";
      const sets = exercise.strength_sets;

      if (sets.length === 0) {
        continue;
      }

      strengthSessionIds.add(session.id);
      const entry =
        strengthMap.get(exerciseName) ??
        {
          exerciseName,
          sessionIds: new Set<string>(),
          totalSets: 0,
          totalVolume: 0,
          lastDate: session.session_date,
          lastRecord: sessionDateLabel,
        };

      entry.sessionIds.add(session.id);
      if (session.session_date > entry.lastDate) {
        entry.lastDate = session.session_date;
        entry.lastRecord = sessionDateLabel;
      }

      for (const set of sets) {
        const weight = set.weight ?? 0;
        const reps = set.reps;
        const volume = weight * reps;

        entry.totalSets += 1;
        entry.totalVolume += volume;
        totalStrengthSets += 1;
        totalStrengthVolume += volume;
      }

      strengthMap.set(exerciseName, entry);
    }

    for (const cardio of session.cardio_sessions) {
      const activityName = cardio.exercises?.name ?? "Cardio";
      const isRunningLike = isRunningLikeActivity(activityName);
      const minutes = Math.round(cardio.duration_seconds / 60);
      const distanceKm = (cardio.distance_meters ?? 0) / 1000;
      const paceSecondsPerKm =
        isRunningLike && distanceKm > 0 && cardio.duration_seconds > 0
          ? cardio.duration_seconds / distanceKm
          : null;

      cardioSessionIds.add(session.id);
      totalCardioMinutes += minutes;
      if (isRunningLike) {
        totalRunningMinutes += minutes;
        totalRunningSeconds += cardio.duration_seconds;
      }
      totalCardioDistanceKm += distanceKm;
      if (paceSecondsPerKm != null) {
        fastestCardioPaceSecondsPerKm =
          fastestCardioPaceSecondsPerKm == null
            ? paceSecondsPerKm
            : Math.min(fastestCardioPaceSecondsPerKm, paceSecondsPerKm);
      }
      longestCardioDistanceKm = Math.max(longestCardioDistanceKm, distanceKm);

      const entry =
        cardioMap.get(activityName) ??
        {
          activityName,
          isRunningLike,
          sessionIds: new Set<string>(),
          totalMinutes: 0,
          totalSeconds: 0,
          totalDistanceKm: 0,
          fastestPaceSecondsPerKm: null as number | null,
          longestDistanceKm: 0,
          lastDate: session.session_date,
          lastRecord: sessionDateLabel,
        };

      entry.sessionIds.add(session.id);
      entry.totalMinutes += minutes;
      entry.totalSeconds += cardio.duration_seconds;
      entry.totalDistanceKm += distanceKm;
      entry.longestDistanceKm = Math.max(entry.longestDistanceKm, distanceKm);
      if (paceSecondsPerKm != null) {
        entry.fastestPaceSecondsPerKm =
          entry.fastestPaceSecondsPerKm == null
            ? paceSecondsPerKm
            : Math.min(entry.fastestPaceSecondsPerKm, paceSecondsPerKm);
      }

      if (session.session_date > entry.lastDate) {
        entry.lastDate = session.session_date;
        entry.lastRecord = sessionDateLabel;
      }

      cardioMap.set(activityName, entry);
    }

    for (const mobility of session.mobility_sessions) {
      const mobilityExerciseNames = mobility.mobility_exercises
        .map((exercise) => exercise.exercises?.name)
        .filter((value): value is string => Boolean(value));

      const routineName =
        mobilityExerciseNames.length > 0 ? mobilityExerciseNames.join(", ") : "Movilidad";
      const minutes = Math.round(
        ((mobility.duration_seconds ?? 0) ||
          mobility.mobility_exercises.reduce((total, exercise) => total + exercise.duration_seconds, 0)) / 60,
      );

      mobilitySessionIds.add(session.id);
      totalMobilityMinutes += minutes;

      const entry =
        mobilityMap.get(routineName) ??
        {
          routineName,
          sessionIds: new Set<string>(),
          totalMinutes: 0,
          lastDate: session.session_date,
          lastRecord: sessionDateLabel,
        };

      entry.sessionIds.add(session.id);
      entry.totalMinutes += minutes;

      if (session.session_date > entry.lastDate) {
        entry.lastDate = session.session_date;
        entry.lastRecord = sessionDateLabel;
      }

      mobilityMap.set(routineName, entry);
    }
  }

  const strengthExercises = Array.from(strengthMap.values())
    .map((entry) => {
      const prs = strengthPrMap.get(entry.exerciseName);
      return {
        exerciseName: entry.exerciseName,
        sessions: entry.sessionIds.size,
        totalSets: entry.totalSets,
        totalVolume: Math.round(entry.totalVolume),
        lastRecord: entry.lastRecord,
        prWeight: prs?.prWeight && prs.prWeight > 0 ? prs.prWeight : null,
        prReps: prs?.prReps ?? null,
        prEstimated1rm: prs?.prEstimated1rm ? Math.round(prs.prEstimated1rm * 10) / 10 : null,
      };
    })
    .sort((a, b) => b.totalVolume - a.totalVolume);

  const cardioActivities = Array.from(cardioMap.values())
    .map((entry) => ({
      activityName: entry.activityName,
      isRunningLike: entry.isRunningLike,
      sessions: entry.sessionIds.size,
      totalMinutes: entry.totalMinutes,
      totalDistanceKm: Math.round(entry.totalDistanceKm * 10) / 10,
      averagePace: entry.isRunningLike ? formatPace(entry.totalSeconds, entry.totalDistanceKm) : "-",
      fastestPace:
        entry.isRunningLike && entry.fastestPaceSecondsPerKm != null
          ? formatPace(entry.fastestPaceSecondsPerKm, 1)
          : "-",
      longestDistanceKm: entry.isRunningLike ? Math.round(entry.longestDistanceKm * 10) / 10 : 0,
      lastRecord: entry.lastRecord,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const mobilityRoutines = Array.from(mobilityMap.values())
    .map((entry) => ({
      routineName: entry.routineName,
      sessions: entry.sessionIds.size,
      totalMinutes: entry.totalMinutes,
      lastRecord: entry.lastRecord,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  return {
    period,
    periodLabel: periodConfig.label,
    overview: [
      {
        label: "Fuerza",
        value: `${Math.round(totalStrengthVolume)} kg`,
        delta: `${strengthSessionIds.size} sesiones · ${totalStrengthSets} sets`,
      },
      {
        label: "Cardio",
        value: `${totalCardioMinutes} min`,
        delta: `${Math.round(totalCardioDistanceKm * 10) / 10} km · ${cardioSessionIds.size} sesiones`,
      },
      {
        label: "Movilidad",
        value: `${totalMobilityMinutes} min`,
        delta: `${mobilitySessionIds.size} sesiones registradas`,
      },
    ],
    strength: {
      totalVolume: Math.round(totalStrengthVolume),
      totalSessions: strengthSessionIds.size,
      totalSets: totalStrengthSets,
      exercises: strengthExercises,
    },
    cardio: {
      totalMinutes: totalCardioMinutes,
      totalDistanceKm: Math.round(totalCardioDistanceKm * 10) / 10,
      totalSessions: cardioSessionIds.size,
      runningMinutes: totalRunningMinutes,
      averagePace:
        totalCardioDistanceKm > 0 && totalRunningMinutes > 0
          ? formatPace(totalRunningSeconds, totalCardioDistanceKm)
          : "-",
      fastestPace:
        fastestCardioPaceSecondsPerKm != null
          ? formatPace(fastestCardioPaceSecondsPerKm, 1)
          : "-",
      longestDistanceKm: Math.round(longestCardioDistanceKm * 10) / 10,
      activities: cardioActivities,
    },
    mobility: {
      totalMinutes: totalMobilityMinutes,
      totalSessions: mobilitySessionIds.size,
      routines: mobilityRoutines,
    },
  };
}
