# Data Fetching Standards

## Server Components Only

All data fetching in this project **MUST** happen in server components. No exceptions.

### Rules

- **ONLY** fetch data in server components (any `.tsx` file that does NOT have `"use client"` at the top)
- **DO NOT** fetch data in client components (no `useEffect` + `fetch`, no `useSWR`, no `@tanstack/react-query`, etc.)
- **DO NOT** create API route handlers (`route.ts`) for data fetching
- **DO NOT** use `fetch()` calls to your own API from the client
- If a client component needs data, pass it down as props from a parent server component

### Correct Pattern

```tsx
// src/app/dashboard/page.tsx (server component — no "use client")
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

### Incorrect Patterns

```tsx
// ❌ DO NOT fetch in client components
"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then((res) => res.json()).then(setWorkouts);
  }, []);
  // ...
}
```

```tsx
// ❌ DO NOT create route handlers for data fetching
// src/app/api/workouts/route.ts
export async function GET() {
  const workouts = await db.select().from(workoutsTable);
  return Response.json(workouts);
}
```

## Data Helper Functions: `src/data/` Directory

All database queries **MUST** live in helper functions inside the `src/data/` directory. Components should never import from `src/db/` directly.

### Rules

- **EVERY** database query must be a dedicated helper function in `src/data/`
- Name files after the resource they query (e.g., `src/data/workouts.ts`, `src/data/exercises.ts`)
- Each function should be focused and reusable — one query per function
- Server components import from `@/data/*`, never from `@/db/*` directly

### Example Structure

```
src/data/
  workouts.ts    — getWorkouts(), getWorkoutById(), etc.
  exercises.ts   — getExercises(), getExerciseById(), etc.
  sets.ts        — getSetsForWorkoutExercise(), etc.
```

## Drizzle ORM Only — No Raw SQL

All database queries **MUST** use [Drizzle ORM](https://orm.drizzle.team/) query builder syntax. No exceptions.

### Rules

- **ONLY** use Drizzle's query builder API (`db.select()`, `db.insert()`, `db.update()`, `db.delete()`, `db.query.*`)
- **DO NOT** write raw SQL strings via `sql` template tags for full queries
- **DO NOT** use `db.execute()` with raw SQL strings

### Correct Pattern

```typescript
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Incorrect Pattern

```typescript
// ❌ DO NOT use raw SQL
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
}
```

## CRITICAL: User Data Isolation

A logged-in user must **ONLY** be able to access their own data. This is non-negotiable.

### Rules

- **EVERY** data helper function must accept or retrieve the current user's `userId`
- **EVERY** query must include a `WHERE user_id = <userId>` filter (via Drizzle's `eq()`)
- **ALWAYS** get the `userId` from Clerk's `auth()` in the server component, then pass it to the data helper
- **NEVER** trust a `userId` passed from the client — always derive it server-side via `auth()`
- For queries that join across tables, ensure the root table is filtered by `userId`

### Required Pattern

```typescript
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

export async function getWorkoutById(userId: string, workoutId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)));
  return result[0];
}
```

```tsx
// src/app/dashboard/page.tsx (server component)
import { auth } from "@clerk/nextjs/server";
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workouts = await getWorkouts(userId);
  return <WorkoutList workouts={workouts} />;
}
```

### Incorrect Pattern

```typescript
// ❌ DO NOT omit userId filtering — this exposes ALL users' data
export async function getWorkouts() {
  return db.select().from(workouts);
}
```
