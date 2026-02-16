"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateWorkoutAction } from "./actions";

type EditWorkoutFormProps = {
  workout: {
    id: string;
    title: string | null;
    notes: string | null;
    status: string;
    startedAt: Date;
  };
};

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState(workout.title ?? "");
  const [notes, setNotes] = useState(workout.notes ?? "");
  const [status, setStatus] = useState(workout.status);
  const [startedAt, setStartedAt] = useState(
    format(workout.startedAt, "yyyy-MM-dd'T'HH:mm")
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      await updateWorkoutAction({
        workoutId: workout.id,
        title: title || undefined,
        notes: notes || undefined,
        status,
        startedAt: new Date(startedAt),
      });
      router.push("/dashboard");
    } catch {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Morning Push Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startedAt">Date & Time</Label>
            <Input
              id="startedAt"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
