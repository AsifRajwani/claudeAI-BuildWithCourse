"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed"]),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  title?: string;
  notes?: string;
  status: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.parse(params);

  await createWorkout(userId, {
    title: parsed.title,
    notes: parsed.notes,
    status: parsed.status,
    startedAt: parsed.startedAt,
  });

  redirect("/dashboard");
}
