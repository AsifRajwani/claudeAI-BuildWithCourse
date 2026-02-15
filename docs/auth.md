# Authentication Standards

## Provider: Clerk Only

This project uses [Clerk](https://clerk.com/) for all authentication. No other auth providers or custom auth solutions are permitted.

## Environment Variables

Clerk requires two environment variables stored in `.env.local` (never committed to git):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Rules

- **DO NOT** hardcode or commit real API keys
- **DO NOT** create `.env` or `.env.production` files with real keys
- **ALWAYS** use `.env.local` for local development secrets

## Middleware

Authentication middleware lives in `src/middleware.ts` and uses `clerkMiddleware()` from `@clerk/nextjs/server`.

### Required Pattern

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Rules

- **DO NOT** use the deprecated `authMiddleware()` — it has been replaced by `clerkMiddleware()`
- **DO NOT** modify the matcher config unless absolutely necessary
- **DO NOT** add custom authentication logic outside of Clerk's middleware

## ClerkProvider

`<ClerkProvider>` wraps the entire application in `src/app/layout.tsx`. This is required for all Clerk functionality.

### Rules

- `<ClerkProvider>` must remain the outermost provider in the root layout
- **DO NOT** remove or conditionally render `<ClerkProvider>`
- **DO NOT** add a second `<ClerkProvider>` in nested layouts

## Client-Side Auth Components

Import all Clerk UI components from `@clerk/nextjs`:

| Component | Purpose |
|---|---|
| `<SignInButton>` | Triggers sign-in flow |
| `<SignUpButton>` | Triggers sign-up flow |
| `<SignedIn>` | Renders children only when user is authenticated |
| `<SignedOut>` | Renders children only when user is not authenticated |
| `<UserButton>` | Displays user avatar with profile/sign-out menu |

### Required Pattern

Use `<SignedIn>` and `<SignedOut>` for conditional rendering based on auth state:

```tsx
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

<SignedOut>
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

### Rules

- **ALWAYS** use `mode="modal"` for `<SignInButton>` and `<SignUpButton>` unless a dedicated sign-in page is created
- **DO NOT** build custom sign-in/sign-up forms — use Clerk's built-in components
- **DO NOT** use `useUser()` or `useAuth()` hooks for conditional rendering — use `<SignedIn>` / `<SignedOut>` instead

## Server-Side Auth

For server components and data fetching, import from `@clerk/nextjs/server`:

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
```

### Getting the User ID

Use `auth()` to get the current user's ID in server components. This is the primary way to identify users.

```typescript
const { userId } = await auth();
```

### Protected Pages

Every page that requires authentication **MUST** check for a `userId` and redirect unauthenticated users:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // ... page content
}
```

### Rules

- **ALWAYS** use `await auth()` (it is async) — do not call it synchronously
- **ALWAYS** redirect unauthenticated users with `redirect("/")` — do not throw errors on pages
- **ALWAYS** derive `userId` server-side via `auth()` — never trust a user ID passed from the client
- **DO NOT** use `currentUser()` when you only need the `userId` — `auth()` is lighter
- **DO NOT** create custom session management or token handling

## Passing Auth to Data Layer

The `userId` from `auth()` must be passed to all data helper functions in `src/data/`. See `docs/data-fetching.md` for full data isolation rules.

### Required Pattern

```tsx
// Server component
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const workouts = await getWorkouts(userId);
  return <WorkoutList workouts={workouts} />;
}
```

### Rules

- **EVERY** data helper must accept `userId` as its first parameter
- **NEVER** call `auth()` inside data helpers — call it in the server component and pass the result
- **NEVER** pass `userId` from client components to server actions or API routes

## Deprecated Patterns — Do Not Use

- `authMiddleware()` — replaced by `clerkMiddleware()`
- `pages/` directory or `_app.tsx` — this project uses App Router only
- `getAuth()` from older Clerk versions — use `auth()` instead
- `withClerkMiddleware()` — removed in current Clerk versions
- Custom JWT decoding or session cookie parsing — Clerk handles this internally
