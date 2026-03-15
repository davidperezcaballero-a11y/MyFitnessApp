import Link from "next/link";

export function AppTopBar() {
  return (
    <header className="mb-6 flex items-center justify-between rounded-[28px] border border-white/70 bg-white/75 px-5 py-4 shadow-panel backdrop-blur">
      <div>
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          MyFitnessApp
        </Link>
        <p className="text-sm text-ink/70">Fase 1 web responsive</p>
      </div>
      <Link
        href="/login"
        className="rounded-full bg-teal px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
      >
        Acceso
      </Link>
    </header>
  );
}
