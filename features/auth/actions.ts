"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
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
    redirect(buildRedirect("/login", error.message));
  }

  revalidatePath("/", "layout");
  redirect("/");
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/registro", error.message));
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      user_id: data.user.id,
      name: name || null,
    });
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/");
  }

  redirect(buildRedirect("/login", "Cuenta creada. Revisa tu email para confirmar el acceso."));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
