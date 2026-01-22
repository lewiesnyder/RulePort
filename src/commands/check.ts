import type { CLIConfig } from '../config/types.js';
import { getPaths } from '../config/defaults.js';
import { loadCursorRules } from '../sources/cursor.js';
import { renderCopilot } from '../targets/copilot.js';
import { renderClaude } from '../targets/claude.js';
import { renderAntigravity } from '../targets/antigravity.js';
import { aggregateWrites, computeDiff } from '../core/planner.js';
import * as log from '../core/log.js';

/**
 * Execute the check command.
 * Computes planned writes and compares to filesystem.
 * Exits with code 1 if drift is detected, 0 if in sync.
 * 
 * @param config - CLI configuration
 */
export function checkCommand(config: CLIConfig): void {
    const paths = getPaths(config.baseDir);

    log.info(`🔍 Checking sync status...\n`);

    // Load rules from source
    let rules;
    try {
        rules = loadCursorRules(paths.rulesDir);
    } catch (error) {
        log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }

    // Render to all targets (planning only, no writes)
    const allResults = [];

    for (const target of config.targets) {
        if (target === 'copilot') {
            allResults.push(renderCopilot(rules, paths));
        } else if (target === 'claude') {
            allResults.push(renderClaude(rules, paths));
        } else if (target === 'antigravity') {
            allResults.push(renderAntigravity(rules, paths));
        }
    }

    const aggregated = aggregateWrites(allResults);
    const diff = computeDiff(aggregated.writes);

    // Report results
    if (!diff.hasDifferences) {
        log.success('All files are in sync! ✨\n');
        process.exit(0);
    }

    log.warn('Drift detected!\n');

    if (diff.created.length > 0) {
        log.info(`Files that would be created (${diff.created.length}):`);
        for (const file of diff.created) {
            log.bullet(file);
        }
        log.info('');
    }

    if (diff.modified.length > 0) {
        log.info(`Files that would be modified (${diff.modified.length}):`);
        for (const file of diff.modified) {
            log.bullet(file);
        }
        log.info('');
    }

    log.info(`Run 'npm run sync' to update files.\n`);
    process.exit(1);
}
