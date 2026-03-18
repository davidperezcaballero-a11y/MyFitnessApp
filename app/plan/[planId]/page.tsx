import { PlanDetailPage } from "@/features/planning/components/plan-detail-page";

type PlanDetailRouteProps = {
  params: Promise<{
    planId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function PlanDetailRoute({
  params,
  searchParams,
}: PlanDetailRouteProps) {
  const { planId } = await params;
  const { message } = await searchParams;

  return <PlanDetailPage planId={planId} message={message} />;
}
