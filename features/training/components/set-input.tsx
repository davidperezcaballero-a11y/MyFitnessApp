"use client";

import { useEffect, useState } from "react";

type SetInputProps = {
  nextSetNumber: number;
  suggestedWeight: number;
  suggestedReps: number;
  disabled?: boolean;
  onSubmit: (input: { weight: number; reps: number; rpe?: number }) => void;
};

export function SetInput({
  nextSetNumber,
  suggestedWeight,
  suggestedReps,
  disabled = false,
  onSubmit,
}: SetInputProps) {
  const [weight, setWeight] = useState(String(suggestedWeight));
  const [reps, setReps] = useState(String(suggestedReps));
  const [rpe, setRpe] = useState("");

  useEffect(() => {
    setWeight(String(suggestedWeight));
    setReps(String(suggestedReps));
    setRpe("");
  }, [suggestedWeight, suggestedReps, nextSetNumber]);

  return (
    <section className="rounded-[28px] border border-coral/20 bg-white/90 p-5 shadow-panel">
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
          Registrar serie
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Peso y repeticiones se autocompletan con la serie anterior para acelerar el registro.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            weight: Number(weight),
            reps: Number(reps),
            rpe: rpe ? Number(rpe) : undefined,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Peso (kg)</span>
            <input
              required
              min="0"
              step="0.5"
              type="number"
              disabled={disabled}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Reps</span>
            <input
              required
              min="0"
              step="1"
              type="number"
              disabled={disabled}
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">RPE</span>
            <input
              min="1"
              max="10"
              step="0.5"
              type="number"
              disabled={disabled}
              value={rpe}
              onChange={(event) => setRpe(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
        >
          {disabled ? "Guardando..." : `Guardar serie ${nextSetNumber}`}
        </button>
      </form>
    </section>
  );
}
