import { updateProfileAction } from "@/features/profile/actions";
import type { UserProfile } from "@/features/profile/types";

type ProfileFormProps = {
  profile: UserProfile;
  message?: string;
};

export function ProfileForm({ profile, message }: ProfileFormProps) {
  return (
    <form action={updateProfileAction} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Email</span>
        <input
          disabled
          type="email"
          value={profile.email}
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink/65 outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Nombre</span>
        <input
          name="name"
          type="text"
          defaultValue={profile.name}
          placeholder="David"
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Fecha de nacimiento</span>
        <input
          name="birthDate"
          type="date"
          defaultValue={profile.birthDate}
          className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Altura (cm)</span>
          <input
            name="heightCm"
            type="number"
            min="0"
            step="0.1"
            defaultValue={profile.heightCm}
            placeholder="175"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Peso (kg)</span>
          <input
            name="weightKg"
            type="number"
            min="0"
            step="0.1"
            defaultValue={profile.weightKg}
            placeholder="72"
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Lugar habitual</span>
          <select
            name="preferredLocation"
            defaultValue={profile.preferredLocation}
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          >
            <option value="">Selecciona una opcion</option>
            <option value="home">Casa</option>
            <option value="gym">Gimnasio</option>
            <option value="outdoor">Exterior</option>
            <option value="travel">Viaje</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Sistema de unidades</span>
          <select
            name="unitsSystem"
            defaultValue={profile.unitsSystem}
            className="w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-ink outline-none transition focus:border-teal"
          >
            <option value="metric">Metrico</option>
            <option value="imperial">Imperial</option>
          </select>
        </label>
      </div>

      {message ? (
        <p className="rounded-2xl bg-coral/12 px-4 py-3 text-sm text-ink">{message}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Guardar perfil
      </button>
    </form>
  );
}
