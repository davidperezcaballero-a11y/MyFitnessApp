"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { HistorySession, HistorySessionType } from "@/features/history/types";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "all" | HistorySessionType; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "strength", label: "Fuerza" },
  { id: "cardio", label: "Cardio" },
  { id: "mobility", label: "Movilidad" },
];

const badgeStyles: Record<HistorySessionType, string> = {
  strength: "bg-coral text-white",
  cardio: "bg-teal text-white",
  mobility: "bg-moss text-white",
};

type HistoryTableProps = {
  sessions: HistorySession[];
};

function buildMetricSummary(session: HistorySession) {
  return session.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(" · ");
}

function escapeCsv(value: string | number) {
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
}

export function HistoryTable({ sessions }: HistoryTableProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | HistorySessionType>("all");
  const [search, setSearch] = useState("");

  const filteredSessions = useMemo(() => {
    const byType =
      activeFilter === "all"
        ? sessions
        : sessions.filter((session) => session.type === activeFilter);

    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return byType;
    }

    return byType.filter((session) =>
      [session.title, session.summary, session.date, session.type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [activeFilter, search, sessions]);

  function downloadCsv() {
    if (filteredSessions.length === 0) {
      return;
    }

    const rows = [
      ["Fecha", "Tipo", "Sesion", "Duracion (min)", "Resumen", "Metricas"],
      ...filteredSessions.map((session) => [
        session.date,
        session.type,
        session.title,
        String(session.durationMinutes),
        session.summary,
        buildMetricSummary(session),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSuffix = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `historial-${dateSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar sesion"
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
        <button
          type="button"
          onClick={downloadCsv}
          disabled={filteredSessions.length === 0}
          className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          Descargar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-sm text-ink">
          <thead>
            <tr className="bg-ink text-left text-white">
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Fecha</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Tipo</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Sesion</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Duracion</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Resumen</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Metricas</th>
              <th className="border-b border-white/10 px-4 py-3 font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id} className="border-b border-ink/8 align-top">
                <td className="px-4 py-3 whitespace-nowrap text-ink/72">{session.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                      badgeStyles[session.type],
                    )}
                  >
                    {session.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{session.title}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink/72">{session.durationMinutes} min</td>
                <td className="max-w-[320px] px-4 py-3 text-ink/68">{session.summary}</td>
                <td className="max-w-[360px] px-4 py-3 text-ink/62">{buildMetricSummary(session)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/historial/${session.id}`}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-coral"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink/60">
                  No hay sesiones que coincidan con el filtro actual.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
