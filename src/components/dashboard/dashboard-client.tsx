"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Dumbbell, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function formatStatus(status: string): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "Planned";
  }
}

export function DashboardClient({ workouts, dateKey }: DashboardClientProps) {
  const router = useRouter();
  const date = parseISO(dateKey);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Workout Dashboard</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              Workouts for {format(date, "do MMM yyyy")}
            </h3>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 size-4" />
                  {format(date, "do MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setCalendarOpen(false);
                      router.push(
                        `/dashboard?date=${format(d, "yyyy-MM-dd")}`
                      );
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button asChild>
            <Link href="/dashboard/workout/new">
              <Plus className="mr-2 size-4" />
              Log New Workout
            </Link>
          </Button>
        </div>

        <div>

          {workouts.length === 0 ? (
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
            <div className="space-y-4">
              {workouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/dashboard/workout/${workout.id}`}
                >
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardHeader>
                      <CardTitle>{workout.title || "Untitled Workout"}</CardTitle>
                      <CardDescription>{formatStatus(workout.status)}</CardDescription>
                    </CardHeader>
                    {workout.exercises.length > 0 && (
                      <CardContent className="space-y-2">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.workoutExerciseId}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <span className="font-medium">
                              {exercise.exerciseName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatExerciseSummary(exercise.sets)}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
