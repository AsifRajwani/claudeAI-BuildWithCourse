"use client";

import { ExerciseCard } from "./exercise-card";
import { AddExerciseDialog } from "./add-exercise-dialog";
import type { WorkoutExercise } from "@/data/workouts";

type ExerciseListProps = {
  workoutId: string;
  exercises: WorkoutExercise[];
  availableExercises: Array<{ id: string; name: string; isGlobal: boolean }>;
};

export function ExerciseList({
  workoutId,
  exercises,
  availableExercises,
}: ExerciseListProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Exercises{exercises.length > 0 && ` (${exercises.length})`}
        </h3>
        <AddExerciseDialog
          workoutId={workoutId}
          availableExercises={availableExercises}
        />
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exercises added yet. Click &ldquo;Add Exercise&rdquo; to get
          started.
        </p>
      ) : (
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.workoutExerciseId}
              workoutId={workoutId}
              exercise={exercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}
