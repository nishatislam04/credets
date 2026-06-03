# shadcn/ui Component Guide

> Any AI agent should read this file before creating or modifying UI components.
> The canonical skill files live in `.agents/skills/shadcn/` (root level).

This project uses **shadcn/ui** with **Base UI** primitives (`@base-ui/react`).
See `apps/frontend/components.json` for the full config.

---

## Import Aliases

The project uses **`#/`** aliases (via `package.json` `imports` field):

```
components  →  #/components/ui/   e.g. import { Button } from "#/components/ui/button"
utils       →  #/lib/utils        cn() utility
hooks       →  #/hooks/
```

Some shadcn defaults reference `@/` — always use `#/` for this project.

---

## Project-Specific Libraries (not standard shadcn)

| Concern | This project uses | Standard shadcn uses |
|---------|------------------|---------------------|
| Forms | `@tanstack/react-form` (useForm) | React Hook Form |
| Toasts | `gooey-toast` (`gooeyToast` from `#/components/ui/goey-toaster`) | `sonner` |
| Primitives | `@base-ui/react` (Base UI) | Radix UI |
| Icons | `lucide-react` | `lucide-react` |

**Important:** When adding toast notifications, import `gooeyToast` from `#/components/ui/goey-toaster`, not from `sonner`.

---

## Critical Rules

### Styling

- **Semantic colors only.** Use `bg-primary`, `text-muted-foreground`, `bg-card`, `text-card-foreground`, etc. Never raw Tailwind colors like `bg-blue-500` or `dark:` overrides.
- **`className` for layout, not styling.** Don't override component colors or typography via className.
- **No `space-x-*` / `space-y-*`.** Use `flex gap-*` (horizontal) or `flex flex-col gap-*` (vertical).
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **Use `cn()` for conditional classes.** Not manual template literals. Import from `#/lib/utils`.
- **No manual `z-index` on overlays.** Dialog, Sheet, Popover handle their own stacking.

### Forms

- **Forms use `useForm` from `@tanstack/react-form`**, not React Hook Form.
- **Field layout uses `FieldGroup` + `Field`** from `#/components/ui/field`.
- **Field validation:** `data-invalid` on `Field`, `aria-invalid` on the control.
- **`FieldSet` + `FieldLegend` for grouping related fields.** Not a `div` with a heading.
- **Buttons inside inputs use `InputGroup` + `InputGroupAddon`.** Not absolute-positioned buttons.
- **CSRF tokens** are fetched via route loaders (create/update pages) — use `Route.useLoaderData()` to access.

### Component Composition

- **Items always inside their Group:** `SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`, `CommandItem` → `CommandGroup`.
- **Use `render` prop for custom triggers** (Base UI, not Radix). Example: `<DialogTrigger render={<Button />} />`.
- **Dialog, Sheet, Drawer always need a Title** (`DialogTitle`, `SheetTitle`, `DrawerTitle`). Use `className="sr-only"` if visually hidden.
- **Card uses full composition:** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- **Button has no `isPending`/`isLoading`.** Compose with `Spinner` + `disabled`.
- **`TabsTrigger` must be inside `TabsList`.**
- **`Avatar` always needs `AvatarFallback`.**
- **Use `Separator`** instead of `<hr>` or `<div className="border-t">`.
- **Use `Skeleton`** for loading placeholders (not custom `animate-pulse` divs).
- **Use `Badge`** instead of custom styled spans for status/tags.

### Icons

- **Icons in `Button` use `data-icon`:** `<SearchIcon data-icon="inline-start" />` (no sizing classes on the icon). The Button component supports `[data-icon=inline-start]` and `[data-icon=inline-end]` selectors.
- **No sizing classes on icons inside components.** Components handle icon sizing via CSS.
- **Pass icons as component objects, not strings.** `icon={CheckIcon}` not `icon="check"`.

---

## Base UI vs Radix (this project uses Base UI)

| Feature | Base UI (this project) | Radix |
|---------|----------------------|-------|
| Custom triggers | `render={<Button />}` | `asChild` |
| Select items | `items` prop on `Select`, `{ value: null }` for placeholder | Inline JSX, `<SelectValue placeholder="..." />` |
| ToggleGroup | `multiple` boolean prop, `defaultValue` is always array | `type="single"`/`type="multiple"`, `defaultValue` is string for single |
| Slider single thumb | `defaultValue={50}` (number) | `defaultValue={[50]}` (array) |
| Accordion | `multiple` boolean, `defaultValue` is array | `type="single"`/`type="multiple"`, `defaultValue` is string |
| Button as link | `render={<a href="..." />} nativeButton={false}` | `asChild` |

---

## Common Component Patterns

```tsx
// Form with TanStack React Form + Field
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

const form = useForm({
  defaultValues: { email: "" },
  onSubmit: async ({ value }) => { /* ... */ },
});

// In JSX:
<FieldGroup>
  <form.Field
    name="email"
    children={(field) => {
      const isInvalid = !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid} />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    }}
  />
</FieldGroup>

// Button with icon
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Toast notification
import { gooeyToast } from "#/components/ui/goey-toaster";
gooeyToast.success("Saved!");
gooeyToast.error("Failed");
gooeyToast.promise(fetchData(), { loading: "...", success: "Done", error: "Failed" });

// Card layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Select (Base UI — uses items prop)
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
const items = [
  { label: "Select...", value: null },
  { label: "Option A", value: "a" },
];
<Select items={items}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    {items.map(item => (
      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## Installed Components

Check `apps/frontend/src/components/ui/` for the actual file list.
Common installed components: Button, Card, Input, Textarea, Select, Badge, Skeleton,
Separator, AlertDialog, Spinner, Item (list item), Field, Label, Form.

---

## Theme

- Tailwind v4 with `@theme inline` blocks in `apps/frontend/src/styles.css`
- Dark mode via class-based toggle (`.dark` class on root element)
- CSS variables in `:root` (light) and `.dark` (dark)
- Font: Inter via `@fontsource-variable/inter`
