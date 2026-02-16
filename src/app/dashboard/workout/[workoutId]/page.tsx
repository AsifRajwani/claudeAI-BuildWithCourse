import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

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

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Edit Workout</h2>
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
