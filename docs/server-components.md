# Server Components

## Async Params

In Next.js 15+, `params` and `searchParams` are **Promises** and MUST be awaited before use.

### Rules

- **ALWAYS** type `params` as `Promise<{ ... }>` in page and layout props.
- **ALWAYS** `await params` before accessing any values.
- **DO NOT** destructure `params` directly from props — await first.

### Correct Pattern

```tsx
type PageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  // use workoutId
}
```

### Incorrect Pattern

```tsx
// ❌ DO NOT access params without awaiting
export default async function WorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // will fail — params is a Promise
}
```

### Same Rule for `searchParams`

```tsx
type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  // use q
}
```
