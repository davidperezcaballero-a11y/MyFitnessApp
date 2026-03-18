import { FreeWorkoutPage } from "@/features/training/components/free-workout-page";
import { getStrengthExerciseOptions } from "@/features/training/queries";

type TrainingLibrePageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function TrainingLibrePage({ searchParams }: TrainingLibrePageProps) {
  const strengthExerciseOptions = await getStrengthExerciseOptions();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <FreeWorkoutPage
      strengthExerciseOptions={strengthExerciseOptions}
      message={resolvedSearchParams?.message}
    />
  );
}
