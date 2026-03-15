"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/entrenar", label: "Entrenar" },
  { href: "/plan", label: "Plan" },
  { href: "/historial", label: "Historial" },
  { href: "/metricas", label: "Metricas" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[28px] border border-white/70 bg-ink px-2 py-2 shadow-panel sm:max-w-xl">
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 items-center justify-center rounded-[20px] px-2 text-center text-xs font-medium transition",
                  active ? "bg-coral text-white" : "text-white/72 hover:bg-white/10",
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
