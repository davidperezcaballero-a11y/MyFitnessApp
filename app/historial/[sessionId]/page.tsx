import { HistoryDetailPage } from "@/features/history/components/history-detail-page";

type HistoryDetailRouteProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function HistorialDetailRoute({ params }: HistoryDetailRouteProps) {
  const { sessionId } = await params;

  return <HistoryDetailPage sessionId={sessionId} />;
}
