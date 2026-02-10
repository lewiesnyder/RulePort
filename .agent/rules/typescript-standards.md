---
description: "Typescript coding standards"
globs:
  - "**/*.ts"
---

# TypeScript Standards

## Syntax
- Use **ES Modules** (`import` / `export`) for all TypeScript files.
- Use `const` for variables that don't change, `let` for those that do. Avoid `var`.
- Use **String Interpolation** (Template Literals) over concatenation.
- Use **Interfaces** for object definitions and public contracts.
- Use **Explicit Return Types** for public functions to ensure stable contracts.

## Async Patterns
- Prefer `async/await` over raw `.then()` chains.
- Always wrap top-level await implementations or main execution logic in try/catch blocks.

## Error Handling
- Scripts must exit with `process.exit(1)` on fatal errors.
- console.error messages should be prefixed with an emoji (e.g., ❌) for visibility in terminal logs.

## Dependencies
- Minimize external dependencies. Usage of native `fs`, `path`, and `child_process` is preferred.
- `yaml` is the only strictly required 3rd party dependency for parsing.
- Use `vitest` for testing.