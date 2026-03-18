import { HistoryPage } from "@/features/history/components/history-page";

type HistorialPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function HistorialPage({ searchParams }: HistorialPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <HistoryPage message={params?.message} />;
}
