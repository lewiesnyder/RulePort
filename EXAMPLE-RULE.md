---
description: "Example rule showing the proper format and structure"
globs:
  - "**/*.example"
  - "src/**/*.ts"
alwaysApply: false
---

# Example Rule Format

This file shows you the proper format for creating rules in `.cursor/rules/*/RULE.md`.

## Frontmatter (Required)

Every RULE.md must start with YAML frontmatter between `---` markers:

```yaml
---
description: "Brief description for semantic search"
globs:
  - "**/*.py"
  - "src/**/*.ts"
alwaysApply: false
---
```

### Fields

#### `description` (Required)
- **Type**: String
- **Purpose**: Brief description for AI assistants to understand when to use this rule
- **Examples**:
  - `"Python coding standards following PEP 8"`
  - `"React component development with TypeScript"`
  - `"SQL migration best practices"`

#### `globs` (Optional)
- **Type**: Array of glob patterns
- **Purpose**: Define which files this rule applies to
- **Examples**:
  ```yaml
  globs:
    - "**/*.py"                    # All Python files
    - "src/**/*.{ts,tsx}"          # TypeScript/TSX in src/
    - "**/migrations/**/*.sql"     # SQL migrations
    - "backend/api/**/*.py"        # Backend API files
  ```
- **Note**: Ignored if `alwaysApply: true`

#### `alwaysApply` (Required)
- **Type**: Boolean (`true` or `false`)
- **Purpose**: If `true`, this rule applies to ALL files regardless of glob patterns
- **Use cases**:
  - `true`: General coding standards, commit message formats
  - `false`: Language-specific rules, framework guidelines

## Content (Markdown)

After the frontmatter, write your rule content in standard Markdown:

### Use Clear Headers

```markdown
# Main Rule Title

## Section 1: Overview
...

## Section 2: Best Practices
...

## Section 3: Examples
...
```

### Include Code Examples

````markdown
## Example Function

```python
def calculate_total(price: float, tax_rate: float) -> float:
    """
    Calculate total with tax.
    
    Args:
        price: Base price
        tax_rate: Tax as decimal (0.08 for 8%)
        
    Returns:
        Total price with tax
    """
    return price * (1 + tax_rate)
```
````

### Show Good vs Bad

```markdown
## Naming Conventions

✅ **Good:**
```python
user_email = "[email protected]"
calculate_total_price()
```

❌ **Bad:**
```python
ue = "[email protected]"
calc()
```
```

### Use Lists for Clarity

```markdown
## Best Practices

- Use meaningful variable names
- Write self-documenting code
- Handle errors gracefully
- Add comments for complex logic
```

## Complete Example

Here's a complete RULE.md file:

````markdown
---
description: "TypeScript coding standards with ESLint configuration"
globs:
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: false
---

# TypeScript Standards

## Type Safety

- Enable `strict` mode in tsconfig.json
- Avoid `any` type - use `unknown` instead
- Use explicit return types for functions

### Example

```typescript
// ✅ Good
function getUserById(id: string): Promise<User | null> {
  return database.users.findOne({ id });
}

// ❌ Bad
function getUserById(id): Promise<any> {
  return database.users.findOne({ id });
}
```

## Naming Conventions

- Variables/functions: `camelCase`
- Classes/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: `_leadingUnderscore`

## File Organization

```
components/
├── UserCard/
│   ├── UserCard.tsx
│   ├── UserCard.types.ts
│   ├── UserCard.module.css
│   └── index.ts
```
````

## Tips for Writing Great Rules

1. **Be Specific**: Instead of "write good code", say "use descriptive variable names (minimum 3 characters)"

2. **Include Context**: Explain why, not just what
   ```markdown
   ## Use TypeScript Strict Mode
   
   Enable strict mode to catch type errors at compile time:
   ```

3. **Provide Examples**: Show concrete code examples

4. **Keep It Focused**: One rule per concern
   - ✅ `python-type-hints.md`
   - ✅ `python-docstrings.md`
   - ❌ `python-everything.md`

5. **Use Proper Globs**: Match your actual file structure
   ```yaml
   globs:
     - "backend/**/*.py"   # Backend Python only
     # Not just "**/*.py" if you have frontend Python too
   ```

## Testing Your Rule

After creating a rule:

1. **Sync**: `npm run sync`
2. **Validate**: `npm run validate`
3. **Test with AI**: Open a matching file and see if the rule applies

## Common Patterns

### Always-Apply General Rules

```yaml
---
description: "General coding standards for all files"
alwaysApply: true
---

# General Standards
...
```

### Language-Specific Rules

```yaml
---
description: "Python coding standards"
globs:
  - "**/*.py"
alwaysApply: false
---
```

### Framework-Specific Rules

```yaml
---
description: "React component standards"
globs:
  - "src/components/**/*.tsx"
  - "src/pages/**/*.tsx"
alwaysApply: false
---
```

### Migration/Schema Rules

```yaml
---
description: "Database migration best practices"
globs:
  - "**/migrations/**/*.sql"
  - "alembic/versions/**/*.py"
alwaysApply: false
---
```

## Directory Structure

Each rule should be in its own directory:

```
.cursor/rules/
├── rule-name/              # ← Descriptive directory name
│   └── RULE.md            # ← Must be named exactly "RULE.md"
```

Not:
```
.cursor/rules/
├── rule-name.md           # ❌ Wrong - must be in a directory
└── other/
    └── rules.md           # ❌ Wrong - must be named "RULE.md"
```

## Next Steps

1. Copy this file to `.cursor/rules/example-rule/RULE.md`
2. Customize the frontmatter and content
3. Run `npm run sync`
4. Test with your AI assistant

For more examples, see the rules created by `npm run init`.
