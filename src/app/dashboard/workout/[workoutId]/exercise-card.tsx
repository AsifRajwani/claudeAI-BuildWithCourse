"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { addSetAction, removeExerciseFromWorkoutAction } from "./actions";
import { SetRow } from "./set-row";
import type { WorkoutExercise } from "@/data/workouts";

type ExerciseCardProps = {
  workoutId: string;
  exercise: WorkoutExercise;
};

export function ExerciseCard({ workoutId, exercise }: ExerciseCardProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAddSet() {
    setIsPending(true);
    try {
      await addSetAction({
        workoutId,
        workoutExerciseId: exercise.workoutExerciseId,
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemoveExercise() {
    setIsPending(true);
    try {
      await removeExerciseFromWorkoutAction({
        workoutId,
        workoutExerciseId: exercise.workoutExerciseId,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{exercise.exerciseName}</CardTitle>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleRemoveExercise}
          disabled={isPending}
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercise.sets.length > 0 && (
          <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground text-center">
              Set
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Reps
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Weight
            </span>
            <span className="text-xs font-medium text-muted-foreground text-center">
              Done
            </span>
            <span />

            {exercise.sets.map((set) => (
              <SetRow key={set.id} workoutId={workoutId} set={set} />
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSet}
          disabled={isPending}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
