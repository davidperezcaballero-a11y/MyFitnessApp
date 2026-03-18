import Link from "next/link";

import type { WorkoutSessionDraft } from "@/features/training/types";

type SessionOverviewProps = {
  session: WorkoutSessionDraft;
};

export function SessionOverview({ session }: SessionOverviewProps) {
  const completedSets = session.exercises.reduce(
    (total, exercise) => total + exercise.completedSets.length,
    0,
  );

  const plannedSets = session.exercises.reduce((total, exercise) => total + exercise.targetSets, 0);

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">
            Sesion lista
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
            {session.title}
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            Sesion preparada desde el plan actual para arrancar el flujo guiado de entrenamiento.
          </p>
        </div>
        <span className="rounded-full bg-moss px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {session.source}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sand px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Ejercicios</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{session.exercises.length}</p>
        </div>
        <div className="rounded-2xl bg-sand px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Sets hechos</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {completedSets}/{plannedSets}
          </p>
        </div>
        <div className="rounded-2xl bg-sand px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Estado</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{session.status}</p>
        </div>
      </div>

      <Link
        href="/entrenar/sesion"
        className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Continuar sesion activa
      </Link>
    </section>
  );
}
