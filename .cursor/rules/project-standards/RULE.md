---
description: "Global project standards and best practices"
alwaysApply: true
---

# Project Standards

## Commit Protocol
- Use **Conventional Commits** format: `type(scope): subject`.
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
  - Example: `feat(sync): add support for --target flag`

## Documentation
- **Keep README Updated**: Any change to `sync-rules-advanced.js` arguments MUST be reflected in `README-advanced.md`.
- **Self-Documenting Code**: Complex logic in sync scripts must have comments explaining the "why", not just the "how".

## File Organization
- New features should be modular.
- Do not create files in the root directory unless they are critical configuration or entry points.
