import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { HistorySession, HistorySessionType } from "@/features/history/types";

type WorkoutSessionRow = {
  id: string;
  session_date: string;
  session_type: "strength" | "cardio" | "mobility" | "mixed";
  started_at: string | null;
  finished_at: string | null;
  notes: string | null;
  session_exercises: Array<{
    exercises: { name: string } | null;
    strength_sets: Array<{
      reps: number;
      weight: number | null;
      rpe: number | null;
      set_number: number;
    }>;
  }>;
  cardio_sessions: Array<{
    duration_seconds: number;
    distance_meters: number | null;
    avg_heart_rate: number | null;
    exercises: { name: string } | null;
  }>;
  mobility_sessions: Array<{
    duration_seconds: number | null;
    mobility_exercises: Array<{
      duration_seconds: number;
      exercises: { name: string } | null;
    }>;
  }>;
};

function normalizeType(value: WorkoutSessionRow["session_type"]): HistorySessionType {
  if (value === "mixed") {
    return "strength";
  }

  return value;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getDurationMinutes(session: WorkoutSessionRow) {
  if (session.started_at && session.finished_at) {
    const start = new Date(session.started_at).getTime();
    const end = new Date(session.finished_at).getTime();

    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      return Math.round((end - start) / 60000);
    }
  }

  const cardioSeconds = session.cardio_sessions.reduce(
    (total, item) => total + item.duration_seconds,
    0,
  );
  const mobilitySeconds = session.mobility_sessions.reduce(
    (total, item) => total + (item.duration_seconds ?? 0),
    0,
  );

  return Math.round((cardioSeconds + mobilitySeconds) / 60);
}

function buildStrengthMetrics(session: WorkoutSessionRow) {
  const sets = session.session_exercises.flatMap((exercise) => exercise.strength_sets);
  const volume = sets.reduce((total, set) => total + (set.weight ?? 0) * set.reps, 0);
  const averageRpe =
    sets.length > 0
      ? (
          sets.reduce((total, set) => total + (set.rpe ?? 0), 0) /
          sets.filter((set) => set.rpe != null).length
        ).toFixed(1)
      : "-";

  return [
    { label: "Volumen", value: `${Math.round(volume)} kg` },
    { label: "Sets", value: String(sets.length) },
    { label: "RPE medio", value: averageRpe },
  ];
}

function buildCardioMetrics(session: WorkoutSessionRow) {
  const totalDistance = session.cardio_sessions.reduce(
    (total, item) => total + (item.distance_meters ?? 0),
    0,
  );
  const averageHeartRate =
    session.cardio_sessions.find((item) => item.avg_heart_rate)?.avg_heart_rate ?? null;

  return [
    { label: "Distancia", value: `${(totalDistance / 1000).toFixed(1)} km` },
    { label: "FC media", value: averageHeartRate ? `${averageHeartRate} bpm` : "-" },
    { label: "Actividad", value: session.cardio_sessions[0]?.exercises?.name ?? "Cardio" },
  ];
}

function buildMobilityMetrics(session: WorkoutSessionRow) {
  const exerciseCount = session.mobility_sessions.reduce(
    (total, item) => total + item.mobility_exercises.length,
    0,
  );

  return [
    { label: "Ejercicios", value: String(exerciseCount) },
    { label: "Tiempo", value: `${getDurationMinutes(session)} min` },
    { label: "Bloques", value: String(session.mobility_sessions.length) },
  ];
}

function buildMetrics(session: WorkoutSessionRow) {
  const type = normalizeType(session.session_type);

  if (type === "cardio") {
    return buildCardioMetrics(session);
  }

  if (type === "mobility") {
    return buildMobilityMetrics(session);
  }

  return buildStrengthMetrics(session);
}

function buildSummary(session: WorkoutSessionRow) {
  if (session.notes) {
    return session.notes;
  }

  const exerciseNames = session.session_exercises
    .map((item) => item.exercises?.name)
    .filter((value): value is string => Boolean(value));

  if (exerciseNames.length > 0) {
    return exerciseNames.join(", ");
  }

  if (session.cardio_sessions[0]?.exercises?.name) {
    return `Sesion de ${session.cardio_sessions[0].exercises.name}.`;
  }

  if (session.mobility_sessions.length > 0) {
    return "Sesion de movilidad registrada.";
  }

  return "Sesion registrada.";
}

function buildStrengthDetail(session: WorkoutSessionRow) {
  return session.session_exercises.map((exercise) => ({
    title: exercise.exercises?.name ?? "Ejercicio",
    rows: exercise.strength_sets
      .sort((a, b) => a.set_number - b.set_number)
      .map((set) => ({
        label: `Serie ${set.set_number}`,
        value: `${set.weight ?? 0} kg x ${set.reps}${set.rpe ? ` · RPE ${set.rpe}` : ""}`,
      })),
  }));
}

function buildCardioDetail(session: WorkoutSessionRow) {
  return session.cardio_sessions.map((item) => ({
    title: item.exercises?.name ?? "Cardio",
    rows: [
      { label: "Duracion", value: `${Math.round(item.duration_seconds / 60)} min` },
      {
        label: "Distancia",
        value: item.distance_meters ? `${(item.distance_meters / 1000).toFixed(1)} km` : "-",
      },
      { label: "FC media", value: item.avg_heart_rate ? `${item.avg_heart_rate} bpm` : "-" },
    ],
  }));
}

function buildMobilityDetail(session: WorkoutSessionRow) {
  return session.mobility_sessions.map((item, index) => ({
    title: `Bloque movilidad ${index + 1}`,
    rows: item.mobility_exercises.map((exercise) => ({
      label: exercise.exercises?.name ?? "Ejercicio",
      value: `${exercise.duration_seconds} s`,
    })),
  }));
}

function buildDetailSections(session: WorkoutSessionRow) {
  const type = normalizeType(session.session_type);

  if (type === "cardio") {
    return buildCardioDetail(session);
  }

  if (type === "mobility") {
    return buildMobilityDetail(session);
  }

  return buildStrengthDetail(session);
}

function mapSession(session: WorkoutSessionRow): HistorySession {
  const type = normalizeType(session.session_type);

  return {
    id: session.id,
    title:
      type === "strength"
        ? session.session_exercises[0]?.exercises?.name
          ? `Sesion ${session.session_exercises[0].exercises.name}`
          : "Sesion de fuerza"
        : type === "cardio"
          ? session.cardio_sessions[0]?.exercises?.name ?? "Sesion cardio"
          : "Sesion movilidad",
    type,
    date: formatDate(session.session_date),
    durationMinutes: getDurationMinutes(session),
    summary: buildSummary(session),
    metrics: buildMetrics(session),
    detailSections: buildDetailSections(session),
  };
}

async function getBaseQuery() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  return { supabase, userId: user.id };
}

export async function getHistorySessions(): Promise<HistorySession[]> {
  const { supabase, userId } = await getBaseQuery();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `
        id,
        session_date,
        session_type,
        started_at,
        finished_at,
        notes,
        session_exercises(
          exercises(name),
          strength_sets(set_number, reps, weight, rpe)
        ),
        cardio_sessions(
          duration_seconds,
          distance_meters,
          avg_heart_rate,
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
    .eq("user_id", userId)
    .order("session_date", { ascending: false });

  if (error) {
    throw new Error(`No se pudo cargar el historial: ${error.message}`);
  }

  return ((data ?? []) as unknown as WorkoutSessionRow[]).map(mapSession);
}

export async function getHistorySessionById(sessionId: string): Promise<HistorySession> {
  const { supabase, userId } = await getBaseQuery();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `
        id,
        session_date,
        session_type,
        started_at,
        finished_at,
        notes,
        session_exercises(
          exercises(name),
          strength_sets(set_number, reps, weight, rpe)
        ),
        cardio_sessions(
          duration_seconds,
          distance_meters,
          avg_heart_rate,
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
    .eq("user_id", userId)
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la sesion: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  return mapSession(data as unknown as WorkoutSessionRow);
}
