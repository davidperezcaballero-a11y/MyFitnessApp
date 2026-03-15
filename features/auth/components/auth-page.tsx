import Link from "next/link";

import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { loginAction, registerAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/submit-button";

type AuthPageProps = {
  mode: "login" | "register";
  message?: string;
};

export function AuthPage({ mode, message }: AuthPageProps) {
  const isLogin = mode === "login";
  const action = isLogin ? loginAction : registerAction;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={isLogin ? "Acceso" : "Registro"}
        title={isLogin ? "Entra en tu espacio de entrenamiento" : "Crea tu cuenta personal"}
        description="Pantalla base para conectar Supabase Auth y la creacion automatica del perfil."
      />

      <FeatureCard
        title={isLogin ? "Iniciar sesion" : "Crear cuenta"}
        description="Formulario conectado con Supabase Auth mediante server actions."
      >
        <form action={action} className="space-y-4">
          {!isLogin ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Nombre</span>
              <input
                name="name"
                type="text"
                placeholder="David"
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Email</span>
            <input
              required
              name="email"
              type="email"
              placeholder="tu@email.com"
              className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Contrasena</span>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
            />
          </label>

          {!isLogin ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">
                Confirmar contrasena
              </span>
              <input
                required
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
              />
            </label>
          ) : null}

          {message ? (
            <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
          ) : null}

          <SubmitButton label={isLogin ? "Entrar" : "Crear cuenta"} />
        </form>

        <div className="mt-4 flex gap-3 text-sm font-medium">
          <Link
            href={isLogin ? "/registro" : "/login"}
            className="rounded-full bg-coral px-4 py-2 text-white"
          >
            {isLogin ? "Ir a registro" : "Ir a login"}
          </Link>
        </div>
      </FeatureCard>
    </div>
  );
}
