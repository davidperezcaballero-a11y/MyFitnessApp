"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items: Array<{ href: string; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/entrenar", label: "Entrenar" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/plan", label: "Plan" },
  { href: "/historial", label: "Historial" },
  { href: "/metricas", label: "Metricas" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[30px] border border-white/90 bg-white/88 px-2 py-2 shadow-panel backdrop-blur md:max-w-3xl xl:max-w-5xl">
      <ul className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 items-center justify-center rounded-[22px] px-2 text-center text-[11px] font-semibold transition md:text-xs",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink/72 hover:bg-sand hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
