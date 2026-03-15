import { AuthPage } from "@/features/auth/components/auth-page";

type RegistroPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const { message } = await searchParams;

  return <AuthPage mode="register" message={message} />;
}
