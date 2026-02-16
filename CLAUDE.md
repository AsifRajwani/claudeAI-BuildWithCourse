# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Documentation-First Rule

**Before generating ANY code, Claude Code MUST first read and refer to the relevant documentation files in the `/docs` directory.** The docs contain project-specific guidelines, patterns, and specifications that take precedence over general knowledge. Always check `/docs` for applicable guidance before writing or modifying code.

Current docs:
- `docs/ui.md` — UI component guidelines and patterns
- `docs/data-fetching.md` — Data fetching rules and database query patterns
- `docs/auth.md` — Authentication standards and Clerk usage patterns
- `docs/data-mutations.md` — Data mutation rules, server actions, and Zod validation patterns
- `docs/server-components.md` — Server component standards (async params/searchParams)
- `docs/routing.md` — Routing standards and route protection patterns

If a relevant doc exists for the area of code being worked on, its instructions MUST be followed.

## Project Overview

This is a Next.js 16 application called "liftingdiarycourse" (a lifting diary course project) built with TypeScript, React 19, and Tailwind CSS v4. The project uses the modern Next.js App Router architecture with Clerk authentication.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### Next.js App Router Structure
- **`src/app/`**: Main application directory using App Router conventions
  - `layout.tsx`: Root layout with Geist font family (sans and mono variants)
  - `page.tsx`: Homepage component
  - `globals.css`: Global styles with Tailwind v4 imports and CSS variables for theming

### TypeScript Configuration
- Path alias `@/*` maps to `./src/*` for cleaner imports
- Target: ES2017 with strict mode enabled
- JSX compiled to `react-jsx` format

### Styling
- **Tailwind CSS v4** with PostCSS integration
- Theme customization via CSS variables in `globals.css`:
  - `--background` and `--foreground` for color theming
  - Custom font variables for Geist Sans and Geist Mono
  - Dark mode support using `prefers-color-scheme`

### Linting
- ESLint config in `eslint.config.mjs` uses Next.js recommended configs
- Includes both core-web-vitals and TypeScript presets
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Implementation Notes

### Font Loading
The project uses Next.js font optimization with Google Fonts (Geist family). Fonts are loaded in `layout.tsx` with CSS variables for theming.

### Styling Approach
Tailwind v4 uses the new inline theme syntax (`@theme inline`) in `globals.css`. Color and font tokens are defined via CSS variables, enabling dynamic theming.

### Component Development
- All pages and components should be placed in `src/app/` following App Router conventions
- Use TypeScript with proper types from `next` and `react`
- Follow the existing pattern of using CSS variables for theming

## Authentication with Clerk

This project uses [Clerk](https://clerk.com/) for authentication. **Always follow these patterns:**

### Clerk Setup
- **Middleware**: `src/middleware.ts` uses `clerkMiddleware()` from `@clerk/nextjs/server`
- **Provider**: `<ClerkProvider>` wraps the entire app in `src/app/layout.tsx`
- **Environment variables**: Stored in `.env.local` (not tracked in git)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

### Using Clerk Components
Import from `@clerk/nextjs`:
- `<SignInButton>` / `<SignUpButton>` - Authentication buttons
- `<SignedIn>` / `<SignedOut>` - Conditional rendering based on auth state
- `<UserButton>` - User profile menu

### Server-Side Auth
For server components and API routes, import from `@clerk/nextjs/server`:
```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

// In async server components/routes
const { userId } = await auth();
const user = await currentUser();
```

### CRITICAL: Never Use Deprecated Patterns
- ❌ Do NOT use `authMiddleware()` (replaced by `clerkMiddleware()`)
- ❌ Do NOT use pages-based patterns (`_app.tsx`, `pages/`)
- ❌ Do NOT hardcode or commit real API keys
