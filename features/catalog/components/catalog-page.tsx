import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogList } from "@/features/catalog/components/catalog-list";
import { getCatalogExercises, getCatalogOptions } from "@/features/catalog/queries";
import { createCatalogExerciseAction } from "@/features/catalog/actions";

type CatalogPageProps = {
  message?: string;
};

export async function CatalogPage({ message }: CatalogPageProps) {
  const [exercises, options] = await Promise.all([getCatalogExercises(), getCatalogOptions()]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogo"
        title="Catalogo de actividades"
        description="Tabla ligera para revisar fuerza, cardio y movilidad catalogados y dar de alta nuevas actividades."
      />

      <FeatureCard title="Nueva actividad" description="Da de alta una nueva entrada del catalogo global.">
        <form action={createCatalogExerciseAction} className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.1fr,0.5fr,0.8fr,1.2fr,auto]">
            <input
              required
              name="name"
              type="text"
              placeholder="Nombre de la actividad"
              className="rounded-xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition focus:border-teal"
            />
            <select
              required
              name="exerciseType"
              defaultValue="strength"
              className="rounded-xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition focus:border-teal"
            >
              <option value="strength">Fuerza</option>
              <option value="cardio">Cardio</option>
              <option value="mobility">Movilidad</option>
            </select>
            <select
              name="movementPatternId"
              defaultValue=""
              className="rounded-xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition focus:border-teal"
            >
              <option value="">Sin patron</option>
              {options.movementPatterns.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.name}
                </option>
              ))}
            </select>
            <input
              name="description"
              type="text"
              placeholder="Descripcion opcional"
              className="rounded-xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition focus:border-teal"
            />
            <button
              type="submit"
              className="rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink"
            >
              Anadir
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-4">
              <legend className="px-1 text-sm font-semibold text-ink">Musculos</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {options.muscleGroups.map((muscle) => (
                  <label key={muscle.id} className="flex items-center gap-2 text-sm text-ink/78">
                    <input type="checkbox" name="muscleGroupIds" value={muscle.id} />
                    <span>{muscle.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-4">
              <legend className="px-1 text-sm font-semibold text-ink">Material</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {options.equipment.map((equipment) => (
                  <label key={equipment.id} className="flex items-center gap-2 text-sm text-ink/78">
                    <input type="checkbox" name="equipmentIds" value={equipment.id} />
                    <span>{equipment.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </form>
        {message ? (
          <p className="mt-3 rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
        ) : null}
      </FeatureCard>

      <FeatureCard
        title="Catalogo actual"
        description={`Ahora mismo hay ${exercises.length} actividades catalogadas en la base de datos.`}
      >
        <CatalogList exercises={exercises} />
      </FeatureCard>
    </div>
  );
}
