import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function AppTopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();

    profileName = profile?.name ?? null;
  }

  const userLabel = profileName || user?.email || null;

  return (
    <header className="mb-6 flex items-center justify-between rounded-[28px] border border-white/70 bg-white/75 px-5 py-4 shadow-panel backdrop-blur">
      <div>
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          MyFitnessApp
        </Link>
        <p className="text-sm text-ink/70">Fase 1 web responsive</p>
      </div>
      <div className="flex items-center gap-2">
        {userLabel ? (
          <span className="rounded-full border border-sand-strong bg-[#fbf8f1] px-3 py-1 text-xs font-semibold text-ink/78">
            Usuario: {userLabel}
          </span>
        ) : null}
        <Link
          href="/perfil"
          className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
        >
          Perfil
        </Link>
        <Link
          href={user ? "/" : "/login"}
          className="rounded-full bg-teal px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          {user ? "Activa" : "Acceso"}
        </Link>
        {user ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-coral/25 bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
            >
              Cerrar sesion
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
