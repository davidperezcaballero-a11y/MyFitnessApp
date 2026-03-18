"use client";

import { useMemo, useState } from "react";

import { deleteCatalogExerciseAction } from "@/features/catalog/actions";
import type { CatalogExercise } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "all" | CatalogExercise["exerciseType"]; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "strength", label: "Fuerza" },
  { id: "cardio", label: "Cardio" },
  { id: "mobility", label: "Movilidad" },
];

const badgeStyles: Record<CatalogExercise["exerciseType"], string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
};

type CatalogListProps = {
  exercises: CatalogExercise[];
};

export function CatalogList({ exercises }: CatalogListProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | CatalogExercise["exerciseType"]>("all");
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(() => {
    const byType =
      activeFilter === "all"
        ? exercises
        : exercises.filter((exercise) => exercise.exerciseType === activeFilter);

    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return byType;
    }

    return byType.filter((exercise) =>
      [
        exercise.name,
        exercise.description ?? "",
        exercise.movementPattern ?? "",
        exercise.muscleGroups.join(" "),
        exercise.equipment.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [activeFilter, exercises, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar actividad"
          className="min-w-[240px] rounded-xl border border-ink/10 bg-sand px-4 py-2.5 text-sm text-ink outline-none transition focus:border-teal"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activeFilter === filter.id
                  ? "bg-ink text-white"
                  : "bg-white/80 text-ink shadow-panel",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-sm text-ink">
          <thead>
            <tr className="bg-ink text-left text-white">
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Actividad</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Tipo</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Patron</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Musculos</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Material</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Descripcion</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredExercises.map((exercise) => (
              <tr key={exercise.id} className="border-b border-ink/8 align-top">
                <td className="px-4 py-3 font-semibold text-ink">{exercise.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                      badgeStyles[exercise.exerciseType],
                    )}
                  >
                    {exercise.exerciseType}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/72">{exercise.movementPattern ?? "-"}</td>
                <td className="px-4 py-3 text-ink/72">
                  {exercise.muscleGroups.length > 0 ? exercise.muscleGroups.join(", ") : "-"}
                </td>
                <td className="px-4 py-3 text-ink/72">
                  {exercise.equipment.length > 0 ? exercise.equipment.join(", ") : "-"}
                </td>
                <td className="px-4 py-3 text-ink/68">
                  {exercise.description ?? "Actividad del catalogo base."}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteCatalogExerciseAction}>
                    <input type="hidden" name="exerciseId" value={exercise.id} />
                    <input type="hidden" name="exerciseName" value={exercise.name} />
                    <button
                      type="submit"
                      className="rounded-full border border-coral/30 px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10"
                    >
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {filteredExercises.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink/60">
                  No hay actividades que coincidan con el filtro actual.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
