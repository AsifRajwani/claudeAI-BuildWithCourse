import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, or, asc } from "drizzle-orm";

export async function getExercisesForUser(userId: string) {
  return db
    .select({
      id: exercises.id,
      name: exercises.name,
      isGlobal: exercises.isGlobal,
    })
    .from(exercises)
    .where(or(eq(exercises.isGlobal, true), eq(exercises.userId, userId)))
    .orderBy(asc(exercises.name));
}

export async function createExercise(
  userId: string,
  data: { name: string }
) {
  const [exercise] = await db
    .insert(exercises)
    .values({
      name: data.name,
      isGlobal: false,
      userId,
    })
    .returning();

  return exercise;
}
