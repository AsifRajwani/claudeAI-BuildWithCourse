import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getExercisesForUser } from "@/data/exercises";
import { EditWorkoutForm } from "./edit-workout-form";
import { ExerciseList } from "./exercise-list";

type EditWorkoutPageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({
  params,
}: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) notFound();

  const availableExercises = await getExercisesForUser(userId);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Edit Workout</h2>
      <EditWorkoutForm workout={workout} />
      <ExerciseList
        workoutId={workout.id}
        exercises={workout.exercises}
        availableExercises={availableExercises}
      />
    </main>
  );
}
