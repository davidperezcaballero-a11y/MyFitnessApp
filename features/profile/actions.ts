"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function toNullableString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed ? parsed : null;
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();

  if (!parsed) {
    return null;
  }

  const number = Number(parsed);
  return Number.isFinite(number) ? number : null;
}

function toUnitsSystem(value: FormDataEntryValue | null) {
  return value === "imperial" ? "imperial" : "metric";
}

function toPreferredLocation(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();

  if (parsed === "home" || parsed === "gym" || parsed === "outdoor" || parsed === "travel") {
    return parsed;
  }

  return null;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const payload = {
    user_id: user.id,
    name: toNullableString(formData.get("name")),
    birth_date: toNullableString(formData.get("birthDate")),
    height_cm: toNullableNumber(formData.get("heightCm")),
    weight_kg: toNullableNumber(formData.get("weightKg")),
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    redirect(`/perfil?message=${encodeURIComponent(error.message)}`);
  }

  const { error: preferencesError } = await supabase.from("training_preferences").upsert(
    {
      user_id: user.id,
      preferred_location: toPreferredLocation(formData.get("preferredLocation")),
      units_system: toUnitsSystem(formData.get("unitsSystem")),
    },
    {
      onConflict: "user_id",
    },
  );

  if (preferencesError) {
    redirect(`/perfil?message=${encodeURIComponent(preferencesError.message)}`);
  }

  revalidatePath("/perfil");
  redirect("/perfil?message=Perfil actualizado correctamente.");
}
