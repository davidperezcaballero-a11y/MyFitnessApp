import { CardioWorkoutPage } from "@/features/training/components/cardio-workout-page";
import {
  getCardioExerciseOptions,
  getPlannedCardioSession,
} from "@/features/training/queries";

type TrainingCardioPageProps = {
  searchParams: Promise<{
    message?: string;
    plannedSessionId?: string;
  }>;
};

export default async function TrainingCardioPage({ searchParams }: TrainingCardioPageProps) {
  const { message, plannedSessionId } = await searchParams;
  const exerciseOptions = await getCardioExerciseOptions();
  const plannedSession = await getPlannedCardioSession(plannedSessionId);

  return (
    <CardioWorkoutPage
      exerciseOptions={exerciseOptions}
      plannedSession={plannedSession}
      message={message}
    />
  );
}
