import { AuthPage } from "@/features/auth/components/auth-page";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return <AuthPage mode="login" message={message} />;
}
