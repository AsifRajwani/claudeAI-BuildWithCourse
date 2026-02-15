# Data Mutations

Rules and patterns for all data mutations (inserts, updates, deletes) in this application.

## Core Rules

1. **All database mutations MUST go through helper functions in `src/data/`** — components and server actions never call `db` directly.
2. **All mutations MUST be triggered via server actions** defined in colocated `actions.ts` files.
3. **Server action parameters MUST be explicitly typed** — never use `FormData`.
4. **All server action arguments MUST be validated with Zod** before any work is done.

## Data Helper Functions (`src/data/`)

Mutation helpers live alongside query helpers in `src/data/`. They wrap Drizzle ORM calls and handle the actual database interaction.

```typescript
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, data: { startedAt: Date }) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      startedAt: data.startedAt,
      status: "planned",
    })
    .returning();

  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Rules for data helpers

- Use Drizzle ORM only — no raw SQL.
- Every mutation MUST include a `userId` filter to enforce data isolation.
- Accept `userId` as an explicit parameter — never call `auth()` inside a data helper.
- Return the mutated row(s) when useful (use `.returning()`).

## Server Actions (`actions.ts`)

Server actions are the **only** entry point for mutations from the client. They live in `actions.ts` files colocated with the page or feature that uses them.

```
src/app/dashboard/
├── page.tsx
└── actions.ts       # server actions for the dashboard
```

### Structure of a server action

Every server action follows this pattern:

```typescript
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: { startedAt: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.parse(params);

  await createWorkout(userId, { startedAt: parsed.startedAt });

  revalidatePath("/dashboard");
}
```

### Rules for server actions

- File MUST start with `"use server"`.
- Parameters MUST be typed with a plain object type — **never `FormData`**.
- Arguments MUST be validated with a Zod schema **before** any mutation logic.
- Authenticate with `auth()` from `@clerk/nextjs/server` and reject if no `userId`.
- Pass `userId` to the data helper — never let the data layer handle auth.
- Call `revalidatePath` or `revalidateTag` after successful mutations to keep the UI in sync.
- Keep actions focused — one mutation per function.

## Calling Server Actions from Components

Client components import and call the server action directly. Never wrap server actions in API routes.

```typescript
"use client";

import { createWorkoutAction } from "./actions";

export function CreateWorkoutButton({ date }: { date: Date }) {
  async function handleClick() {
    await createWorkoutAction({ startedAt: date });
  }

  return <button onClick={handleClick}>Create Workout</button>;
}
```

## What NOT to Do

- **Do NOT** use `FormData` as a server action parameter.
- **Do NOT** call `db` directly from server actions or components.
- **Do NOT** skip Zod validation on server action inputs.
- **Do NOT** put server actions in `page.tsx` or component files — use a separate `actions.ts`.
- **Do NOT** use API routes (`route.ts`) for mutations.
- **Do NOT** call `auth()` inside data helpers — pass `userId` in explicitly.
