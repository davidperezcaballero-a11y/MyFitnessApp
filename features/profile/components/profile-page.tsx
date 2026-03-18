import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getCurrentProfile } from "@/features/profile/queries";

type ProfilePageProps = {
  message?: string;
};

export async function ProfilePage({ message }: ProfilePageProps) {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Perfil"
        title="Datos personales reales"
        description="Pantalla conectada a Supabase para consultar y guardar tu informacion basica."
      />

      <FeatureCard
        title="Tu perfil"
        description="Esta informacion servira despues para objetivos, preferencias y contexto de entrenamiento."
      >
        <ProfileForm profile={profile} message={message} />
      </FeatureCard>
    </div>
  );
}
