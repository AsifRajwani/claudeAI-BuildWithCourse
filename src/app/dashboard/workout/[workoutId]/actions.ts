"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  updateWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  getNextExerciseOrder,
  addSet,
  updateSet,
  removeSet,
  getNextSetNumber,
} from "@/data/workouts";
import { createExercise } from "@/data/exercises";

const updateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
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

// --- Exercise management actions ---

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(params: {
  workoutId: string;
  exerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addExerciseToWorkoutSchema.parse(params);
  const order = await getNextExerciseOrder(userId, parsed.workoutId);

  await addExerciseToWorkout(userId, {
    workoutId: parsed.workoutId,
    exerciseId: parsed.exerciseId,
    order,
  });

  revalidatePath("/dashboard");
}

const createAndAddExerciseSchema = z.object({
  workoutId: z.string().min(1),
  exerciseName: z.string().min(1).max(255),
});

export async function createAndAddExerciseAction(params: {
  workoutId: string;
  exerciseName: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createAndAddExerciseSchema.parse(params);
  const exercise = await createExercise(userId, { name: parsed.exerciseName });
  const order = await getNextExerciseOrder(userId, parsed.workoutId);

  await addExerciseToWorkout(userId, {
    workoutId: parsed.workoutId,
    exerciseId: exercise.id,
    order,
  });

  revalidatePath("/dashboard");
}

const removeExerciseFromWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  workoutExerciseId: z.string().min(1),
});

export async function removeExerciseFromWorkoutAction(params: {
  workoutId: string;
  workoutExerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = removeExerciseFromWorkoutSchema.parse(params);
  await removeExerciseFromWorkout(userId, parsed.workoutExerciseId);

  revalidatePath("/dashboard");
}

// --- Set management actions ---

const addSetSchema = z.object({
  workoutId: z.string().min(1),
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().min(0).optional(),
  weight: z.string().optional(),
});

export async function addSetAction(params: {
  workoutId: string;
  workoutExerciseId: string;
  reps?: number;
  weight?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addSetSchema.parse(params);
  const setNumber = await getNextSetNumber(userId, parsed.workoutExerciseId);

  await addSet(userId, {
    workoutExerciseId: parsed.workoutExerciseId,
    setNumber,
    reps: parsed.reps,
    weight: parsed.weight,
  });

  revalidatePath("/dashboard");
}

const updateSetSchema = z.object({
  workoutId: z.string().min(1),
  setId: z.string().min(1),
  reps: z.number().int().min(0).optional(),
  weight: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export async function updateSetAction(params: {
  workoutId: string;
  setId: string;
  reps?: number;
  weight?: string;
  isCompleted?: boolean;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateSetSchema.parse(params);
  await updateSet(userId, parsed.setId, {
    reps: parsed.reps !== undefined ? parsed.reps : undefined,
    weight: parsed.weight !== undefined ? parsed.weight : undefined,
    isCompleted: parsed.isCompleted,
  });

  revalidatePath("/dashboard");
}

const removeSetSchema = z.object({
  workoutId: z.string().min(1),
  setId: z.string().min(1),
});

export async function removeSetAction(params: {
  workoutId: string;
  setId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = removeSetSchema.parse(params);
  await removeSet(userId, parsed.setId);

  revalidatePath("/dashboard");
}
