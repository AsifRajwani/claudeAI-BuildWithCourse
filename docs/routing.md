# Routing Standards

## Route Structure

All application routes live under `/dashboard`. The root `/` page is a public landing page.

```
/                              — Public landing page
/dashboard                     — Main dashboard (protected)
/dashboard/workout/new         — Create workout (protected)
/dashboard/workout/[workoutId] — View/edit workout (protected)
```

## Route Protection

All `/dashboard` routes (and any sub-routes) are **protected routes** accessible only to logged-in users. Route protection is enforced via **Next.js middleware** using Clerk.

### Middleware Rules

- Use `clerkMiddleware()` from `@clerk/nextjs/server` in `src/middleware.ts`
- Protect all `/dashboard(.*)` routes by requiring authentication in the middleware
- Do NOT rely on individual page components to check auth for route protection — the middleware is the single source of truth
- The public landing page (`/`) must remain accessible to unauthenticated users

### Example Middleware Pattern

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

## Adding New Routes

- New authenticated pages **must** be placed under `src/app/dashboard/`
- Never create authenticated routes outside of `/dashboard`
- Dynamic routes use the `[param]` folder convention (e.g., `[workoutId]`)
- Follow Next.js App Router conventions: each route needs a `page.tsx` file

## Public vs Protected

| Route | Access |
|---|---|
| `/` | Public |
| `/dashboard/**` | Protected (logged-in users only) |
