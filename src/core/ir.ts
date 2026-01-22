/**
 * Core Rule IR (Intermediate Representation)
 * 
 * This is the canonical data model for all rule transformations.
 * All source adapters convert to this format, and all target adapters
 * consume this format.
 */

export type RuleSource = "cursor";
export type RuleTarget = "copilot" | "claude" | "antigravity";

/**
 * Intermediate representation of a rule.
 * This is the single source of truth for rule data.
 */
export interface RuleIR {
    /** Stable identifier (typically the rule directory name) */
    id: string;

    /** Display name for the rule */
    title: string;

    /** Optional description from frontmatter */
    description?: string;

    /** Markdown body content (without frontmatter) */
    body: string;

    /** Whether this rule applies unconditionally to all files */
    alwaysApply: boolean;

    /** File/path glob patterns for scoped rules */
    globs: string[];

    /** Raw metadata passthrough for preserving additional fields */
    meta: Record<string, unknown>;

    /** Source system this rule was loaded from */
    source: RuleSource;
}

/**
 * Represents a planned file write operation.
 * Used to separate planning from execution for testability.
 */
export interface PlannedWrite {
    /** Absolute path where the file should be written */
    path: string;

    /** Content to write to the file */
    content: string;
}

/**
 * Result of rendering rules to a target format.
 */
export interface RenderResult {
    /** Planned file write operations */
    writes: PlannedWrite[];

    /** Warning messages generated during rendering */
    warnings: string[];
}
