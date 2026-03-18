import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { MetricKpiGrid } from "@/features/metrics/components/metric-kpi-grid";
import type { MetricsPeriod } from "@/features/metrics/types";
import { getMetricsSummary } from "@/features/metrics/queries";

const periods: Array<{ id: MetricsPeriod; label: string }> = [
  { id: "week", label: "Esta semana" },
  { id: "last4weeks", label: "Ultimas 4 semanas" },
  { id: "activePlan", label: "Bloque actual" },
  { id: "all", label: "Historico" },
];

function formatWeight(value: number | null) {
  return value != null ? `${value} kg` : "-";
}

function formatEstimatedMax(value: number | null) {
  return value != null ? `${value} kg` : "-";
}

type MetricsPageProps = {
  period?: MetricsPeriod;
};

export async function MetricsPage({ period = "all" }: MetricsPageProps) {
  const summary = await getMetricsSummary(period);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Metricas"
        title="Analisis real del trabajo realizado"
        description="Vista practica por disciplinas: carga del periodo seleccionado y PR historicos por ejercicio en fuerza."
      />

      <FeatureCard
        title="Periodo"
        description={`Ahora mismo estas viendo ${summary.periodLabel.toLowerCase()}. Los PRs de fuerza se mantienen sobre todo el historial.`}
      >
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <Link
              key={option.id}
              href={`/metricas?period=${option.id}`}
              className={
                summary.period === option.id
                  ? "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
              }
            >
              {option.label}
            </Link>
          ))}
        </div>
      </FeatureCard>

      <MetricKpiGrid items={summary.overview} />

      <FeatureCard
        title="Fuerza"
        description={`Volumen total ${summary.strength.totalVolume} kg · ${summary.strength.totalSessions} sesiones · ${summary.strength.totalSets} sets.`}
      >
        <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-white">
          <table className="min-w-full border-collapse text-sm text-ink">
            <thead>
              <tr className="bg-ink text-left text-white">
                <th className="border-b border-white/10 px-4 py-3 font-semibold">Ejercicio</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">Sesiones</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">Sets</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">Volumen</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">PR peso</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">PR reps</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">PR estimado</th>
                <th className="border-b border-white/10 px-4 py-3 font-semibold">Ultimo registro</th>
              </tr>
            </thead>
            <tbody>
              {summary.strength.exercises.map((exercise) => (
                <tr key={exercise.exerciseName} className="border-b border-ink/8">
                  <td className="px-4 py-3 font-semibold text-ink">{exercise.exerciseName}</td>
                  <td className="px-4 py-3 text-ink/72">{exercise.sessions}</td>
                  <td className="px-4 py-3 text-ink/72">{exercise.totalSets}</td>
                  <td className="px-4 py-3 text-ink/72">{exercise.totalVolume} kg</td>
                  <td className="px-4 py-3 text-ink/72">{formatWeight(exercise.prWeight)}</td>
                  <td className="px-4 py-3 text-ink/72">{exercise.prReps ?? "-"}</td>
                  <td className="px-4 py-3 text-ink/72">{formatEstimatedMax(exercise.prEstimated1rm)}</td>
                  <td className="px-4 py-3 text-ink/72">{exercise.lastRecord}</td>
                </tr>
              ))}
              {summary.strength.exercises.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-ink/60">
                    Todavia no hay ejercicios de fuerza registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </FeatureCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <FeatureCard
          title="Cardio"
          description={`${summary.cardio.totalMinutes} min totales · ${summary.cardio.totalSessions} sesiones. En carrera, ${summary.cardio.runningMinutes} min y ritmo medio ${summary.cardio.averagePace}.`}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Ritmo medio</p>
              <p className="mt-2 text-lg font-semibold text-ink">{summary.cardio.averagePace}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Sesion mas rapida</p>
              <p className="mt-2 text-lg font-semibold text-ink">{summary.cardio.fastestPace}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Distancia mayor</p>
              <p className="mt-2 text-lg font-semibold text-ink">{summary.cardio.longestDistanceKm} km</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-white">
            <table className="min-w-full border-collapse text-sm text-ink">
              <thead>
                <tr className="bg-ink text-left text-white">
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Actividad</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Sesiones</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Tiempo</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Distancia</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Ritmo medio</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Sesion mas rapida</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Distancia mayor</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Ultimo registro</th>
                </tr>
              </thead>
              <tbody>
                {summary.cardio.activities.map((activity) => (
                  <tr key={activity.activityName} className="border-b border-ink/8">
                    <td className="px-4 py-3 font-semibold text-ink">{activity.activityName}</td>
                    <td className="px-4 py-3 text-ink/72">{activity.sessions}</td>
                    <td className="px-4 py-3 text-ink/72">{activity.totalMinutes} min</td>
                    <td className="px-4 py-3 text-ink/72">
                      {activity.isRunningLike ? `${activity.totalDistanceKm} km` : "-"}
                    </td>
                    <td className="px-4 py-3 text-ink/72">{activity.averagePace}</td>
                    <td className="px-4 py-3 text-ink/72">{activity.fastestPace}</td>
                    <td className="px-4 py-3 text-ink/72">
                      {activity.isRunningLike ? `${activity.longestDistanceKm} km` : "-"}
                    </td>
                    <td className="px-4 py-3 text-ink/72">{activity.lastRecord}</td>
                  </tr>
                ))}
                {summary.cardio.activities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-ink/60">
                      Todavia no hay sesiones de cardio registradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Movilidad"
          description={`${summary.mobility.totalMinutes} min · ${summary.mobility.totalSessions} sesiones registradas.`}
        >
          <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-white">
            <table className="min-w-full border-collapse text-sm text-ink">
              <thead>
                <tr className="bg-ink text-left text-white">
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Rutina / bloque</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Sesiones</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Tiempo</th>
                  <th className="border-b border-white/10 px-4 py-3 font-semibold">Ultimo registro</th>
                </tr>
              </thead>
              <tbody>
                {summary.mobility.routines.map((routine) => (
                  <tr key={routine.routineName} className="border-b border-ink/8">
                    <td className="px-4 py-3 font-semibold text-ink">{routine.routineName}</td>
                    <td className="px-4 py-3 text-ink/72">{routine.sessions}</td>
                    <td className="px-4 py-3 text-ink/72">{routine.totalMinutes} min</td>
                    <td className="px-4 py-3 text-ink/72">{routine.lastRecord}</td>
                  </tr>
                ))}
                {summary.mobility.routines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-ink/60">
                      Todavia no hay sesiones de movilidad registradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}
