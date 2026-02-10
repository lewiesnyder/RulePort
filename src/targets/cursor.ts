import * as path from 'path';
import type { RuleIR, RenderResult, PlannedWrite } from '../core/ir.js';
import type { PathConfig } from '../config/types.js';

/**
 * Generate frontmatter for a Cursor rule file.
 */
function generateCursorFrontmatter(rule: RuleIR): string {
    let frontmatter = '---\n';

    if (rule.description) {
        frontmatter += `description: "${rule.description}"\n`;
    }

    if (rule.globs.length > 0) {
        frontmatter += 'globs:\n';
        for (const glob of rule.globs) {
            frontmatter += `  - "${glob}"\n`;
        }
    }

    frontmatter += `alwaysApply: ${rule.alwaysApply}\n`;
    frontmatter += '---\n';
    return frontmatter;
}

/**
 * Generate a single Cursor rule file.
 */
function generateCursorRule(rule: RuleIR): string {
    return generateCursorFrontmatter(rule) + '\n' + rule.body;
}

/**
 * Render rules to Cursor format.
 *
 * Generates individual RULE.md files in subdirectories:
 * .cursor/rules/<id>/RULE.md
 *
 * No consolidated file is generated (Cursor uses native individual-file system).
 *
 * @param rules - Rules to render
 * @param paths - Path configuration
 * @returns Render result with planned writes
 */
export function renderCursor(rules: RuleIR[], paths: PathConfig): RenderResult {
    const writes: PlannedWrite[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
        // Each rule goes in its own subdirectory
        const ruleDir = path.join(paths.targets.cursor, rule.id);
        const filepath = path.join(ruleDir, 'RULE.md');
        const content = generateCursorRule(rule);

        writes.push({ path: filepath, content });
    }

    return { writes, warnings };
}
