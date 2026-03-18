import { cn } from "@/lib/utils";

const sections = [
  { id: "strength", label: "Fuerza", active: true },
  { id: "running", label: "Running", active: false },
  { id: "mobility", label: "Movilidad", active: false },
];

type PlanSectionTabsProps = {
  editable: boolean;
};

export function PlanSectionTabs({ editable }: PlanSectionTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            section.active ? "bg-ink text-white" : "bg-white/80 text-ink/65 shadow-panel",
          )}
        >
          {section.label}
        </div>
      ))}
      <span
        className={cn(
          "rounded-full px-4 py-2 text-sm font-semibold",
          editable ? "bg-teal text-white" : "bg-sand text-ink/75",
        )}
      >
        {editable ? "Modo edicion" : "Solo lectura"}
      </span>
    </div>
  );
}
