"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const exercises = workouts.flatMap((w) => w.exercises);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Workout Dashboard</h2>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Left side: Calendar */}
        <div className="shrink-0">
          <h3 className="mb-3 text-lg font-semibold">Select Date</h3>
          <Card>
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    router.push(
                      `/dashboard?date=${format(d, "yyyy-MM-dd")}`
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right side: Workouts */}
        <div className="flex-1">
          <h3 className="mb-3 text-lg font-semibold">
            Workouts for {format(date, "do MMM yyyy")}
          </h3>

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
        </div>
      </div>
    </main>
  );
}
