import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Create New Workout</h2>
      <NewWorkoutForm />
    </main>
  );
}
