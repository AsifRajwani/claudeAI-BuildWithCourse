"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  title: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed"]),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: string;
  title?: string;
  notes?: string;
  status: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateWorkoutSchema.parse(params);

  await updateWorkout(userId, parsed.workoutId, {
    title: parsed.title || null,
    notes: parsed.notes || null,
    status: parsed.status,
    startedAt: parsed.startedAt,
  });

  revalidatePath("/dashboard");
}
