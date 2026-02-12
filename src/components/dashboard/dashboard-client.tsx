"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { WorkoutWithExercises, WorkoutExercise } from "@/data/workouts";

interface DashboardClientProps {
  workouts: WorkoutWithExercises[];
  dateKey: string;
}

function formatExerciseSummary(sets: WorkoutExercise["sets"]): string {
  if (sets.length === 0) return "No sets recorded";

  const firstSet = sets[0];
  const allSame = sets.every(
    (s) => s.reps === firstSet.reps && s.weight === firstSet.weight
  );

  if (allSame && firstSet.reps !== null && firstSet.weight !== null) {
    return `${sets.length} sets \u00d7 ${firstSet.reps} reps @ ${firstSet.weight} lbs`;
  }

  return `${sets.length} ${sets.length === 1 ? "set" : "sets"}`;
}

export function DashboardClient({ workouts, dateKey }: DashboardClientProps) {
  const router = useRouter();
  const date = parseISO(dateKey);
  const [open, setOpen] = useState(false);

  const exercises = workouts.flatMap((w) => w.exercises);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="size-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setOpen(false);
                  router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-4 size-10 text-muted-foreground" />
            <p className="text-lg font-medium">No workouts logged</p>
            <p className="text-sm text-muted-foreground">
              No exercises recorded for {format(date, "do MMM yyyy")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <Card key={exercise.workoutExerciseId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {exercise.exerciseName}
                </CardTitle>
                <CardDescription>
                  {formatExerciseSummary(exercise.sets)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
