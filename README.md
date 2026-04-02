# storybook-addon-zod-schemas

Auto-generate **Zod schemas** (TypeScript) and **Pydantic models** (Python) from Storybook ArgTypes — for LLM tool calling, AI chat UIs, and component registries.

## Quick Start (Try It on Your Storybook)

```bash
# 1. Clone the repo
git clone https://github.com/eransc/storybook-addon-zod-schemas.git
cd storybook-addon-zod-schemas

# 2. Install dependencies and build
npm install
npm run build

# 3. Run against your Storybook project's stories
node dist/cli/index.js generate --stories "/path/to/your-project/src/**/*.stories.tsx"

# Output will be in ./generated/schemas/ (Zod) and ./generated/models/ (Pydantic)
```

That's it. Replace `/path/to/your-project/src/**/*.stories.tsx` with the actual glob pattern to your story files.

### Custom output directory

```bash
node dist/cli/index.js generate \
  --stories "/path/to/your-project/src/**/*.stories.tsx" \
  --output "/path/to/your-project/generated"
```

### What to expect

For a project with 10 components, you'll see:

```
[zod-schemas] Found 10 story files

  [██████████████████████████████] 10/10 (100%) Processing: Avatar.stories.tsx

  ✓ Generated schemas for 10 components

    Button
    Card
    Input
    Modal
    ...

  TypeScript: /path/to/generated/schemas
  Python:     /path/to/generated/components
```

Generated files:
- `schemas/Button.ts` — Zod schema for each component
- `components/button.py` — Pydantic model for each component
- `registry.ts` — combined TypeScript registry importing all schemas
- `registry.py` — combined Python registry with Union types

### Supported story patterns

The CLI uses a Babel AST parser, so it handles:
- ✅ Inline argTypes: `argTypes: { variant: { control: 'select', ... } }`
- ✅ Object-form controls: `control: { type: 'text' }`
- ✅ Variable references: `argTypes: sharedArgTypes`
- ✅ Spread syntax: `argTypes: { ...sharedArgTypes, extraProp: { ... } }`
- ✅ Story-level argTypes: `Story.argTypes = { ... }`
- ✅ Both `.tsx` and `.js` story files
- ⚠️ Cross-file imports not yet supported (e.g. `import { sharedArgs } from './shared'`)

---

## Problem

Teams building AI chat UIs with dynamic component rendering maintain three sources of truth:

1. **Storybook ArgTypes** — define component props (source of truth)
2. **Zod schemas** — TypeScript validation for frontend
3. **Pydantic models** — Python validation for backend

Keeping these in sync manually wastes time and causes bugs.

## Solution

One CLI command scans all your Storybook stories and generates both Zod schemas and Pydantic models automatically:

```bash
npx zod-schemas-gen --stories "src/**/*.stories.tsx"
```

**Input** (your existing story):
```tsx
const meta = {
  title: 'Components/Button',
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    disabled: { control: 'boolean', defaultValue: false },
    children: { control: 'text', description: 'Button label' },
    onClick: { action: 'clicked' },
  },
};
```

**Output** — `generated/schemas/Button.ts`:
```typescript
import { z } from 'zod';

export const ButtonSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'danger']),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  /** Button label */
  children: z.string(),
});

export type ButtonProps = z.infer<typeof ButtonSchema>;
```

**Output** — `generated/models/button.py`:
```python
from typing import Literal
from pydantic import BaseModel, Field

class ButtonProps(BaseModel):
    variant: Literal["primary", "secondary", "danger"]
    size: Literal["sm", "md", "lg"] = "md"
    disabled: bool = False
    children: str = Field(..., description="Button label")

class ButtonComponent(BaseModel):
    type: Literal["Button"]
    props: ButtonProps
```

## Features

- **Babel AST parser** — resolves variable references, spread syntax, and nested objects
- **All common ArgType controls** — select, radio, text, number, boolean, object, color, range
- **Smart filtering** — event handlers (`onClick`, `onSubmit`) are automatically excluded
- **Registry files** — combined `registry.ts` and `registry.py` with all component imports
- **Vercel AI SDK** — optional `tool()` wrappers for direct use with the AI SDK
- **Tambo-AI compatible** — generates `{ name, description, propsSchema }` registration format
- **Progress bar** — shows processing status for large projects
- **Storybook addon panel** — preview schemas while browsing stories (optional)

## Installation

```bash
npm install storybook-addon-zod-schemas
```

## CLI Usage

```bash
# Generate schemas for all stories
npx zod-schemas-gen --stories "src/**/*.stories.tsx"

# Custom output directory
npx zod-schemas-gen --stories "src/**/*.stories.tsx" --output "./generated"

# TypeScript only
npx zod-schemas-gen --stories "src/**/*.stories.tsx" --ts-only

# Python only
npx zod-schemas-gen --stories "src/**/*.stories.tsx" --py-only

# With config file
npx zod-schemas-gen --config .storybook/zod-schemas.config.js
```

### Output Structure

```
generated/
├── schemas/          # Zod schemas (one per component)
│   ├── Button.ts
│   ├── Card.ts
│   └── Input.ts
├── registry.ts       # Combined registry with all imports
├── components/       # Pydantic models (one per component)
│   ├── button.py
│   ├── card.py
│   └── input.py
└── registry.py       # Combined Python registry
```

### Configuration

Create `.storybook/zod-schemas.config.js`:

```js
module.exports = {
  stories: ['src/**/*.stories.tsx'],
  output: {
    typescript: './generated/schemas',
    python: './generated/models',
  },
  includeVercelAISDK: true,     // Wrap schemas with tool() from 'ai'
  includeTamboRegistration: true, // Generate Tambo-compatible output
  generateIndex: true,
  exclude: ['internal/**'],
};
```

## Storybook Addon (Optional)

Add to `.storybook/main.ts` for an in-browser preview panel:

```ts
export default {
  addons: ['storybook-addon-zod-schemas'],
};
```

This adds a **"Zod Schemas"** tab in the addon panel showing the generated schema for whichever component you're viewing. Useful for development-time preview and quick copy.

## Type Mappings

| ArgType Control | Zod | Python |
|----------------|-----|--------|
| `text`, `color`, `date` | `z.string()` | `str` |
| `number`, `range` | `z.number()` | `float` |
| `boolean` | `z.boolean()` | `bool` |
| `select`, `radio` (with options) | `z.enum([...])` | `Literal[...]` |
| `object` | `z.record(z.any())` | `dict[str, Any]` |
| `control: false` / unknown | `z.any()` | `Any` |

### Modifiers

- **Default value** → `.default(value)` / `= value`
- **Optional** (no default, not required) → `.optional()` / `Optional[Type] = None`
- **Description** → JSDoc comment / `Field(description="...")`

## Programmatic API

```typescript
import { generateSchemas, parseArgTypes, generateZodSchema } from 'storybook-addon-zod-schemas';

const schemas = generateSchemas('Button', argTypes, 'A clickable button');
console.log(schemas.zodSchema);     // TypeScript code string
console.log(schemas.pydanticModel); // Python code string
```

## License

MIT
