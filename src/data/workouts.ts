import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt, asc, max } from "drizzle-orm";
import { startOfDay, addDays } from "date-fns";

export type WorkoutSet = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
  isCompleted: boolean;
};

export type WorkoutExercise = {
  workoutExerciseId: string;
  exerciseName: string;
  order: number;
  sets: WorkoutSet[];
};

export type WorkoutWithExercises = {
  id: string;
  title: string | null;
  status: string;
  startedAt: string;
  exercises: WorkoutExercise[];
};

export type WorkoutDetail = {
  id: string;
  title: string | null;
  notes: string | null;
  status: string;
  startedAt: Date;
  exercises: WorkoutExercise[];
};

export async function getWorkoutsByDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const dayStart = startOfDay(date);
  const nextDayStart = startOfDay(addDays(date, 1));

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
      workoutStatus: workouts.status,
      workoutStartedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      isCompleted: sets.isCompleted,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, dayStart),
        lt(workouts.startedAt, nextDayStart)
      )
    )
    .orderBy(asc(workoutExercises.order), asc(sets.setNumber));

  const workoutMap = new Map<
    string,
    {
      id: string;
      title: string | null;
      status: string;
      startedAt: string;
      exerciseMap: Map<string, WorkoutExercise>;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        title: row.workoutTitle,
        status: row.workoutStatus,
        startedAt: row.workoutStartedAt.toISOString(),
        exerciseMap: new Map(),
      });
    }

    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId && row.exerciseName) {
      if (!workout.exerciseMap.has(row.workoutExerciseId)) {
        workout.exerciseMap.set(row.workoutExerciseId, {
          workoutExerciseId: row.workoutExerciseId,
          exerciseName: row.exerciseName,
          order: row.exerciseOrder!,
          sets: [],
        });
      }

      if (row.setId) {
        workout.exerciseMap.get(row.workoutExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weight: row.weight,
          isCompleted: row.isCompleted!,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map(({ exerciseMap, ...rest }) => ({
    ...rest,
    exercises: Array.from(exerciseMap.values()),
  }));
}

export async function getWorkoutById(
  userId: string,
  workoutId: string
): Promise<WorkoutDetail | undefined> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
      workoutNotes: workouts.notes,
      workoutStatus: workouts.status,
      workoutStartedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      isCompleted: sets.isCompleted,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(asc(workoutExercises.order), asc(sets.setNumber));

  if (rows.length === 0) return undefined;

  const exerciseMap = new Map<string, WorkoutExercise>();

  for (const row of rows) {
    if (row.workoutExerciseId && row.exerciseName) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        exerciseMap.set(row.workoutExerciseId, {
          workoutExerciseId: row.workoutExerciseId,
          exerciseName: row.exerciseName,
          order: row.exerciseOrder!,
          sets: [],
        });
      }

      if (row.setId) {
        exerciseMap.get(row.workoutExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weight: row.weight,
          isCompleted: row.isCompleted!,
        });
      }
    }
  }

  const first = rows[0];
  return {
    id: first.workoutId,
    title: first.workoutTitle,
    notes: first.workoutNotes,
    status: first.workoutStatus,
    startedAt: first.workoutStartedAt,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: {
    title?: string | null;
    notes?: string | null;
    status?: string;
    startedAt?: Date;
  }
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function createWorkout(
  userId: string,
  data: {
    title?: string;
    notes?: string;
    status: string;
    startedAt: Date;
  }
) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      title: data.title || null,
      notes: data.notes || null,
      status: data.status,
      startedAt: data.startedAt,
    })
    .returning();

  return workout;
}

// --- Ownership verification helpers ---

async function verifyWorkoutOwnership(userId: string, workoutId: string) {
  const result = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  if (result.length === 0) throw new Error("Workout not found");
}

async function verifyWorkoutExerciseOwnership(
  userId: string,
  workoutExerciseId: string
) {
  const result = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );
  if (result.length === 0) throw new Error("Workout exercise not found");
}

async function verifySetOwnership(userId: string, setId: string) {
  const result = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(
      workoutExercises,
      eq(workoutExercises.id, sets.workoutExerciseId)
    )
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));
  if (result.length === 0) throw new Error("Set not found");
}

// --- Exercise-to-workout helpers ---

export async function getNextExerciseOrder(
  userId: string,
  workoutId: string
): Promise<number> {
  await verifyWorkoutOwnership(userId, workoutId);
  const result = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  return (result[0]?.maxOrder ?? 0) + 1;
}

export async function addExerciseToWorkout(
  userId: string,
  data: { workoutId: string; exerciseId: string; order: number }
) {
  await verifyWorkoutOwnership(userId, data.workoutId);
  const [row] = await db
    .insert(workoutExercises)
    .values({
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      order: data.order,
    })
    .returning();
  return row;
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: string
) {
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

// --- Set helpers ---

export async function getNextSetNumber(
  userId: string,
  workoutExerciseId: string
): Promise<number> {
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);
  const result = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  return (result[0]?.maxSetNumber ?? 0) + 1;
}

export async function addSet(
  userId: string,
  data: {
    workoutExerciseId: string;
    setNumber: number;
    reps?: number;
    weight?: string;
  }
) {
  await verifyWorkoutExerciseOwnership(userId, data.workoutExerciseId);
  const [row] = await db
    .insert(sets)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: data.setNumber,
      reps: data.reps ?? null,
      weight: data.weight ?? null,
      isCompleted: false,
    })
    .returning();
  return row;
}

export async function updateSet(
  userId: string,
  setId: string,
  data: { reps?: number | null; weight?: string | null; isCompleted?: boolean }
) {
  await verifySetOwnership(userId, setId);
  const [row] = await db
    .update(sets)
    .set(data)
    .where(eq(sets.id, setId))
    .returning();
  return row;
}

export async function removeSet(userId: string, setId: string) {
  await verifySetOwnership(userId, setId);
  await db.delete(sets).where(eq(sets.id, setId));
}
