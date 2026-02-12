"use client";

import { useState } from "react";
import { format } from "date-fns";
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

const MOCK_WORKOUTS: Record<string, { id: string; name: string; sets: number; reps: number; weight: number }[]> = {
  [format(new Date(), "yyyy-MM-dd")]: [
    { id: "1", name: "Bench Press", sets: 4, reps: 8, weight: 185 },
    { id: "2", name: "Overhead Press", sets: 3, reps: 10, weight: 95 },
    { id: "3", name: "Incline Dumbbell Press", sets: 3, reps: 12, weight: 60 },
    { id: "4", name: "Lateral Raises", sets: 4, reps: 15, weight: 20 },
  ],
};

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const dateKey = format(date, "yyyy-MM-dd");
  const workouts = MOCK_WORKOUTS[dateKey] ?? [];

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
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

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
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{workout.name}</CardTitle>
                <CardDescription>
                  {workout.sets} sets &times; {workout.reps} reps @ {workout.weight} lbs
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
