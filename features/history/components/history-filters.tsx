"use client";

import { useState } from "react";

import { HistorySessionCard } from "@/features/history/components/history-session-card";
import type { HistorySession, HistorySessionType } from "@/features/history/types";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "all" | HistorySessionType; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "strength", label: "Fuerza" },
  { id: "cardio", label: "Cardio" },
  { id: "mobility", label: "Movilidad" },
];

type HistoryFiltersProps = {
  sessions: HistorySession[];
};

export function HistoryFilters({ sessions }: HistoryFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | HistorySessionType>("all");

  const filteredSessions =
    activeFilter === "all"
      ? sessions
      : sessions.filter((session) => session.type === activeFilter);

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4">
        {filteredSessions.map((session) => (
          <HistorySessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
