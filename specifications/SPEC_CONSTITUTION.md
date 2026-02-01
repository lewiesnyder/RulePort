# Specification Constitution

## for a Node.js (TypeScript) Project

This document defines the **binding technical constitution** for this repository.

Its purpose is to:

* Prevent architectural entropy
* Ensure consistency, safety, and maintainability
* Provide contributors with clear, enforceable standards
* Make design decisions explicit rather than implicit

All code, tooling, and contributions **MUST comply** with this constitution unless it is formally amended.

---

## Article I: TypeScript First

### I.1 TypeScript Is Mandatory

* All production code MUST be written in TypeScript.
* Plain JavaScript (`.js`) is allowed **only** for:

  * Generated build output
  * Temporary migration code (with explicit TODO + removal plan)

### I.2 Strict Typing

* `strict: true` MUST be enabled in `tsconfig.json`.
* `any` is forbidden unless:

  * Interfacing with untyped external APIs
  * Explicitly justified with a comment

### I.3 Types Are Part of the API

* Public types are considered part of the public contract.
* Breaking changes to exported types REQUIRE a major version bump.

---

## Article II: Determinism & Predictability

### II.1 Deterministic Behavior

Given the same inputs:

* Outputs MUST be identical
* Ordering MUST be stable
* No behavior may depend on:

  * Timestamps
  * Randomness
  * Host-specific environment quirks

### II.2 No Hidden State

* Global mutable state is forbidden
* Side effects MUST be explicit and localized
* Functions SHOULD be referentially transparent where feasible

---

## Article III: Architecture & Separation of Concerns

### III.1 Layered Architecture

Code MUST be structured into clear layers:

* **Core / Domain**

  * Pure logic
  * No filesystem, network, or process access
* **Adapters**

  * Translate between external systems and internal models
* **Commands / Entry Points**

  * Orchestration only
  * No business logic

### III.2 No Layer Violations

* Core MUST NOT import adapters or CLI code
* Adapters MUST NOT call other adapters directly
* CLI MUST NOT implement domain logic

---

## Article IV: Functional Boundaries

### IV.1 Pure Functions Preferred

* Functions SHOULD be pure whenever possible
* Side effects MUST be isolated behind explicit interfaces

### IV.2 Explicit Inputs and Outputs

* No function may rely on implicit globals
* Configuration MUST be passed explicitly

---

## Article V: Filesystem & IO Safety

### V.1 Explicit IO

* Filesystem access MUST be centralized
* No scattered `fs` calls across the codebase

### V.2 Atomic Writes

* All file writes MUST be atomic
* Partial writes and corrupt states are forbidden

### V.3 Ownership of Generated Files

* Generated files MUST include a clear header indicating:

  * They are generated
  * They should not be edited manually

---

## Article VI: CLI Contract (If Applicable)

### VI.1 Stable CLI Interface

* CLI commands are user-facing APIs
* Breaking changes REQUIRE a major version bump

### VI.2 Machine-Friendly Output

* Commands intended for automation MUST:

  * Support non-interactive usage
  * Use stable exit codes
  * Avoid ambiguous output

---

## Article VII: Configuration Discipline

### VII.1 Explicit Configuration

* Configuration MUST be explicit and discoverable
* Environment-variable magic is discouraged

### VII.2 Backward Compatibility

* Config keys MUST NOT be removed without:

  * Deprecation notice
  * Migration path

---

## Article VIII: Dependency Management

### VIII.1 Minimal Dependencies

* Every dependency MUST justify its existence
* Prefer standard library over third-party packages

### VIII.2 No Dependency Leakage

* Dependencies MUST NOT leak into public APIs unless intentional
* Internal tooling dependencies SHOULD remain internal

---

## Article IX: Testing & Verification

### IX.1 Tests Are Mandatory

* All non-trivial logic MUST be tested
* Tests MUST be deterministic and offline-capable

### IX.2 Behavior Over Implementation

* Tests SHOULD validate behavior, not internal structure
* Snapshot tests MUST be stable and intentional

---

## Article X: Errors & Failure Modes

### X.1 Explicit Errors

* Errors MUST be explicit, typed where possible, and actionable
* Silent failures are forbidden

### X.2 Fail Fast

* Invalid states SHOULD be detected early
* Defensive programming is preferred over recovery from corruption

---

## Article XI: Observability & Debuggability

### XI.1 Predictable Logging

* Logging MUST be structured and intentional
* All functionality MUST be logged at appropriate severity levels (INFO, WARN, DEBUG, TRACE, ERROR)
* Debug logs MUST be gated behind explicit flags

### XI.2 No Noisy Defaults

* Default execution SHOULD be quiet and signal-only
* Verbosity MUST be opt-in

---

## Article XII: Evolution & Governance

### XII.1 Additive by Default

* Changes SHOULD be additive whenever possible
* Breaking changes REQUIRE strong justification

### XII.2 Constitutional Amendments

Changes to this constitution REQUIRE:

* Explicit discussion
* Clear rationale
* Documentation of tradeoffs

---

## Article XIII: Design Philosophy

This project values:

1. **Clarity over cleverness**
2. **Determinism over convenience**
3. **Explicitness over magic**
4. **Architecture over shortcuts**

If a contribution violates these principles, it should not be merged.

---
