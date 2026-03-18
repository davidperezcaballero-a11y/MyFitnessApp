export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  birthDate: string;
  heightCm: string;
  weightKg: string;
  preferredLocation: "home" | "gym" | "outdoor" | "travel" | "";
  unitsSystem: "metric" | "imperial";
};
