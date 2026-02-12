import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { getWorkoutsByDate } from "@/data/workouts";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const date = dateParam ? parseISO(dateParam) : new Date();
  const dateKey = format(date, "yyyy-MM-dd");

  const workouts = await getWorkoutsByDate(userId, date);

  return <DashboardClient workouts={workouts} dateKey={dateKey} />;
}
