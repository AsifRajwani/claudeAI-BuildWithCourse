# UI Coding Standards

## Component Library: shadcn/ui Only

All UI components in this project **MUST** use [shadcn/ui](https://ui.shadcn.com/) components. No exceptions.

### Rules

- **ONLY** use shadcn/ui components for all UI elements (buttons, inputs, dialogs, cards, tables, etc.)
- **DO NOT** create custom UI components. If a component is needed, find and use the appropriate shadcn/ui component.
- **DO NOT** install or use any other component libraries (e.g., Material UI, Chakra UI, Ant Design, Radix primitives directly, etc.)
- If shadcn/ui does not have a specific component, compose it from existing shadcn/ui primitives rather than building from scratch.

### Adding New shadcn/ui Components

Use the CLI to add components as needed:

```bash
npx shadcn@latest add <component-name>
```

## Date Formatting: date-fns

All date formatting **MUST** use the [date-fns](https://date-fns.org/) library.

### Required Date Format

Dates must be displayed in the following format: `do MMM yyyy`

Examples:

- `1st Sep 2025`
- `2nd Aug 2025`
- `3rd Jan 2026`
- `4th Jun 2024`

### Usage

```typescript
import { format } from "date-fns";

const formatted = format(new Date(), "do MMM yyyy");
// => "12th Feb 2026"
```
