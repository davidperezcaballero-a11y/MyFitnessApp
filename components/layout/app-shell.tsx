import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { AppTopBar } from "@/components/layout/app-top-bar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 pb-28 pt-5 sm:px-6 xl:px-8">
      <AppTopBar />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
