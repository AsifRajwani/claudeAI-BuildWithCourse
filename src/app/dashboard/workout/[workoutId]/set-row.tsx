"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { updateSetAction, removeSetAction } from "./actions";
import type { WorkoutSet } from "@/data/workouts";

type SetRowProps = {
  workoutId: string;
  set: WorkoutSet;
};

export function SetRow({ workoutId, set }: SetRowProps) {
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weight ?? "");
  const [isCompleted, setIsCompleted] = useState(set.isCompleted);
  const [isPending, setIsPending] = useState(false);

  async function handleUpdateSet() {
    const newReps = reps === "" ? undefined : Number(reps);
    const newWeight = weight === "" ? undefined : weight;

    if (newReps === (set.reps ?? undefined) && newWeight === (set.weight ?? undefined)) {
      return;
    }

    setIsPending(true);
    try {
      await updateSetAction({
        workoutId,
        setId: set.id,
        reps: newReps,
        weight: newWeight,
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggleComplete(checked: boolean) {
    setIsCompleted(checked);
    setIsPending(true);
    try {
      await updateSetAction({
        workoutId,
        setId: set.id,
        isCompleted: checked,
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemoveSet() {
    setIsPending(true);
    try {
      await removeSetAction({ workoutId, setId: set.id });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <span className="text-sm text-muted-foreground text-center">
        {set.setNumber}
      </span>
      <Input
        type="number"
        min={0}
        placeholder="—"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={handleUpdateSet}
        disabled={isPending}
      />
      <Input
        type="number"
        min={0}
        step="0.01"
        placeholder="—"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={handleUpdateSet}
        disabled={isPending}
      />
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) =>
            handleToggleComplete(checked === true)
          }
          disabled={isPending}
        />
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleRemoveSet}
        disabled={isPending}
      >
        <Trash2 />
      </Button>
    </>
  );
}
