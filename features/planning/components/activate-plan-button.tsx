"use client";

import { activatePlanAction } from "@/features/planning/actions";

type ActivatePlanButtonProps = {
  planId: string;
  hasActivePlan: boolean;
};

export function ActivatePlanButton({
  planId,
  hasActivePlan,
}: ActivatePlanButtonProps) {
  return (
    <form
      action={activatePlanAction}
      onSubmit={(event) => {
        if (!hasActivePlan) {
          return;
        }

        const confirmed = window.confirm(
          "Ya hay un plan activo. Si activas este, el plan activo pasara a inactivo. ¿Quieres continuar?",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="planId" value={planId} />
      <button
        type="submit"
        className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Activar
      </button>
    </form>
  );
}
