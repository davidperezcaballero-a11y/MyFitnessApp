import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/features/profile/types";

type ProfileRow = {
  user_id: string;
  name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
};

type PreferencesRow = {
  preferred_location: UserProfile["preferredLocation"] | null;
  units_system: UserProfile["unitsSystem"] | null;
};

export async function getCurrentProfile(): Promise<UserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Necesitas iniciar sesion.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, name, birth_date, height_cm, weight_kg")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: preferencesData, error: preferencesError } = await supabase
    .from("training_preferences")
    .select("preferred_location, units_system")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el perfil: ${error.message}`);
  }

  if (preferencesError) {
    throw new Error(`No se pudieron cargar las preferencias: ${preferencesError.message}`);
  }

  const profile = data as ProfileRow | null;
  const preferences = preferencesData as PreferencesRow | null;

  return {
    userId: user.id,
    email: user.email ?? "",
    name: profile?.name ?? "",
    birthDate: profile?.birth_date ?? "",
    heightCm: profile?.height_cm ? String(profile.height_cm) : "",
    weightKg: profile?.weight_kg ? String(profile.weight_kg) : "",
    preferredLocation: preferences?.preferred_location ?? "",
    unitsSystem: preferences?.units_system ?? "metric",
  };
}
