import { MobilityWorkoutPage } from "@/features/training/components/mobility-workout-page";
import {
  getMobilityRoutineOptions,
  getPlannedMobilitySession,
} from "@/features/training/queries";

type TrainingMovilidadPageProps = {
  searchParams: Promise<{
    message?: string;
    plannedSessionId?: string;
  }>;
};

export default async function TrainingMovilidadPage({
  searchParams,
}: TrainingMovilidadPageProps) {
  const { message, plannedSessionId } = await searchParams;
  const routineOptions = await getMobilityRoutineOptions();
  const plannedSession = await getPlannedMobilitySession(plannedSessionId);

  return (
    <MobilityWorkoutPage
      routineOptions={routineOptions}
      plannedSession={plannedSession}
      message={message}
    />
  );
}
