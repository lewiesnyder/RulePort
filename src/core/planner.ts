import type { PlannedWrite, RenderResult } from './ir.js';
import { readFileIfExists } from './fs.js';

/**
 * Aggregate multiple render results into a single result.
 * 
 * @param results - Array of render results to combine
 * @returns Combined render result
 */
export function aggregateWrites(results: RenderResult[]): RenderResult {
    const allWrites: PlannedWrite[] = [];
    const allWarnings: string[] = [];

    for (const result of results) {
        allWrites.push(...result.writes);
        allWarnings.push(...result.warnings);
    }

    return {
        writes: allWrites,
        warnings: allWarnings,
    };
}

/**
 * Result of comparing planned writes to filesystem.
 */
export interface DiffResult {
    /** Files that would be created (don't exist) */
    created: string[];

    /** Files that would be modified (content differs) */
    modified: string[];

    /** Files that are unchanged */
    unchanged: string[];

    /** Whether any differences were found */
    hasDifferences: boolean;
}

/**
 * Compare planned writes to the current filesystem state.
 * 
 * @param planned - Planned write operations
 * @returns Diff result showing what would change
 */
export function computeDiff(planned: PlannedWrite[]): DiffResult {
    const created: string[] = [];
    const modified: string[] = [];
    const unchanged: string[] = [];

    for (const write of planned) {
        const existing = readFileIfExists(write.path);

        if (existing === null) {
            created.push(write.path);
        } else if (existing !== write.content) {
            modified.push(write.path);
        } else {
            unchanged.push(write.path);
        }
    }

    return {
        created,
        modified,
        unchanged,
        hasDifferences: created.length > 0 || modified.length > 0,
    };
}
