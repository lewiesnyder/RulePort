---
description: "Logging standards and best practices"
paths:
  - "**/*.ts"
always_apply: true
---

# Logging Standards

## Logging Format
- Include timestamp, log level, message, and any relevant metadata.
- Use **log levels** (e.g., `info`, `warn`, `debug`, `error`).

## Error Logging
- Always include error messages and stack traces in error logs.

## Debug Logging
- Debug logs should be gated behind a `DEBUG` environment variable.
- Use **debug** level for verbose logging.

## Logging levels
- Use **info** level for general information.
- Use **warn** level for warnings.
- Use **debug** level for detailed debugging.
- Use **error** level for errors.