import { PlansOverviewPage } from "@/features/planning/components/plans-overview-page";

type PlanPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const { message } = await searchParams;

  return <PlansOverviewPage message={message} />;
}
