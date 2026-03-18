"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "Email o contrasena incorrectos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesion.";
  }

  if (normalized.includes("too many requests")) {
    return "Demasiados intentos. Espera un momento y prueba otra vez.";
  }

  return message;
}

async function ensureProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(buildRedirect("/login", "Introduce email y contrasena."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/login", mapAuthError(error.message)));
  }

  await supabase.auth.getUser();

  try {
    await ensureProfile();
  } catch (caughtError) {
    redirect(
      buildRedirect(
        "/login",
        caughtError instanceof Error ? caughtError.message : "No se pudo preparar el perfil.",
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect("/?message=Sesion iniciada correctamente.");
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !confirmPassword) {
    redirect(buildRedirect("/registro", "Completa email y contrasena."));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/registro", "Las contrasenas no coinciden."));
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000"}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/perfil`,
      data: {
        name,
      },
    },
  });

  if (error) {
    redirect(buildRedirect("/registro", mapAuthError(error.message)));
  }

  revalidatePath("/", "layout");

  if (data.session) {
    try {
      await ensureProfile();
    } catch (caughtError) {
      redirect(
        buildRedirect(
          "/login",
          caughtError instanceof Error ? caughtError.message : "No se pudo preparar el perfil.",
        ),
      );
    }
    redirect("/");
  }

  redirect(
    buildRedirect(
      "/login",
      "Cuenta creada. Revisa tu email y confirma el acceso desde el enlace recibido.",
    ),
  );
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
