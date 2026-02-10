---
description: "Global project standards and best practices"
---

# Project Standards

## Primary Reference Documents

**ALWAYS** refer to:
- `specifications/SPEC_CONSTITUTION.md` - Project-wide standards

## Tasks
Predefined tasks can be found in the ./specifications/tasks dir. Use these when crafting features and planning your work. You will be told which task to pick up.

## Commit Protocol
- Use **Conventional Commits** format: `type(scope): subject`.
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
  - Example: `feat(sync): add support for --target flag`

## Documentation
- **Keep README Updated**: Any change to a user's interaction with `ruleport` must be reflected in `README.md`.
- **Self-Documenting Code**: Complex logic in sync scripts must have comments explaining the "why", not just the "how".

## File Organization
- New features should be modular.
- Do not create files in the root directory unless they are critical configuration or entry points.