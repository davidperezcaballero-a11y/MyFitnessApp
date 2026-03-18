import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  getLatestFreeTrainingItems,
  getPlannedTrainingSections,
} from "@/features/training/queries";

const accentClasses = {
  teal: "text-teal",
  coral: "text-coral",
  moss: "text-moss",
};

export async function TrainingPage() {
  const sections = await getPlannedTrainingSections();
  const latestFreeItems = await getLatestFreeTrainingItems();
  const hasAnyPlannedSession = sections.some((section) => section.sessions.length > 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Entrenar"
        title="Elige una sesion del plan activo"
        description="Entrenar ya no arranca una sesion automaticamente. Primero eliges la sesion planificada de fuerza, cardio o movilidad que quieres ejecutar."
      />

      {!hasAnyPlannedSession ? (
        <FeatureCard
          title="Sin sesiones disponibles"
          description="No hay sesiones planificadas en el plan activo. Activa un plan con contenido o crea sesiones en Plan."
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        {sections.map((section) => (
          <FeatureCard
            key={section.key}
            title={section.title}
            description={`Sesiones del plan activo para ${section.title.toLowerCase()}. Elige explicitamente cual quieres empezar.`}
          >
            {section.sessions.length > 0 ? (
              <div className="space-y-2">
                {section.sessions.map((session) => (
                  <Link
                    key={session.plannedSessionId}
                    href={session.href}
                    className="block border border-sand-strong bg-white px-4 py-3 transition hover:bg-[#fffaf3]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{session.title}</h3>
                        <p className="mt-1 text-sm text-ink/65">{session.description}</p>
                        {session.completionSummary ? (
                          <p className="mt-1 text-xs font-medium text-ink/60">
                            Sesion ya realizada. {session.completionSummary}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.14em] ${accentClasses[section.accent]}`}
                      >
                        {session.completionSummary ? "Repetir" : "Empezar"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-sand-strong bg-[#fbf8f1] px-4 py-4 text-sm text-ink/65">
                No hay sesiones de {section.title.toLowerCase()} en el plan activo.
              </div>
            )}
          </FeatureCard>
        ))}
      </section>

      <FeatureCard
        title="Sesion libre"
        description="Mantengo la opcion libre como alternativa secundaria para dias sin plan o ajustes puntuales."
      >
        <div className="space-y-3">
          <Link
            href="/entrenar/libre"
            className="inline-flex border border-ink bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Abrir sesion libre
          </Link>

          {latestFreeItems.length > 0 ? (
            <div className="space-y-2">
              {latestFreeItems.map((item) => (
                <div
                  key={item.type}
                  className="border border-sand-strong bg-[#fbf8f1] px-4 py-3 text-sm text-ink/72"
                >
                  Ultima sesion libre de {item.type}: <strong className="text-ink">{item.title}</strong>{" "}
                  · {item.date} · {item.summary}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </FeatureCard>
    </div>
  );
}
