---
description: "Workflow and usage guidelines for the sync tool"
alwaysApply: true
---

# Workflow Standards

## Dogfooding
- This project uses itself to manage its rules.
- **Source of Truth**: `.cursor/rules/`.
- **Derived Files**: `.agent/`, `.claude/`, `.github/`.
- **NEVER** edit derived files manually. Always edit the Source of Truth and run sync.

## Sync Protocol
- After editing any file in `.cursor/rules/`, you MUST run:
  ```bash
  npm run sync
  ```
- Before committing, ensure the sync output is clean and updated.

## Testing
- When modifying the sync core (`sync-rules-advanced.js`), verify with generic arguments:
  ```bash
  npm run sync -- --target copilot
  ```
  