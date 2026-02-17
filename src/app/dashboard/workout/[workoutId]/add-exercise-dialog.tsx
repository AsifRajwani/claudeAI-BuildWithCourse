"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Plus } from "lucide-react";
import {
  addExerciseToWorkoutAction,
  createAndAddExerciseAction,
} from "./actions";

type AddExerciseDialogProps = {
  workoutId: string;
  availableExercises: Array<{ id: string; name: string; isGlobal: boolean }>;
};

export function AddExerciseDialog({
  workoutId,
  availableExercises,
}: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSelectExercise(exerciseId: string) {
    setIsPending(true);
    try {
      await addExerciseToWorkoutAction({ workoutId, exerciseId });
      setOpen(false);
      setSearch("");
    } finally {
      setIsPending(false);
    }
  }

  async function handleCreateExercise() {
    if (!search.trim()) return;
    setIsPending(true);
    try {
      await createAndAddExerciseAction({
        workoutId,
        exerciseName: search.trim(),
      });
      setOpen(false);
      setSearch("");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search exercises..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No exercises found.</CommandEmpty>
            <CommandGroup heading="Exercises">
              {availableExercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={() => handleSelectExercise(exercise.id)}
                  disabled={isPending}
                >
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {search.trim() && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Create New">
                  <CommandItem
                    onSelect={handleCreateExercise}
                    disabled={isPending}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Create &ldquo;{search.trim()}&rdquo;
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
