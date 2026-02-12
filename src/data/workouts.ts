import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt, asc } from "drizzle-orm";
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
