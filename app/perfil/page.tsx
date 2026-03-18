import { ProfilePage } from "@/features/profile/components/profile-page";

type ProfileRouteProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function PerfilRoute({ searchParams }: ProfileRouteProps) {
  const { message } = await searchParams;

  return <ProfilePage message={message} />;
}
