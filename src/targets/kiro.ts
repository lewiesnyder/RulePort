import * as path from 'path';
import type { RuleIR, RenderResult, PlannedWrite } from '../core/ir.js';
import type { PathConfig } from '../config/types.js';

/**
 * Generate frontmatter for a Kiro steering file.
 *
 * Kiro uses:
 * - inclusion: 'always' | 'fileMatch' | 'manual' | 'auto'
 * - fileMatchPattern: string (or array) for fileMatch inclusion
 */
function generateKiroFrontmatter(rule: RuleIR): string {
    let frontmatter = '---\n';

    if (rule.alwaysApply) {
        frontmatter += 'inclusion: always\n';
    } else if (rule.globs.length > 0) {
        frontmatter += 'inclusion: fileMatch\n';
        if (rule.globs.length === 1) {
            frontmatter += `fileMatchPattern: "${rule.globs[0]}"\n`;
        } else {
            frontmatter += 'fileMatchPattern:\n';
            for (const glob of rule.globs) {
                frontmatter += `  - "${glob}"\n`;
            }
        }
    } else {
        frontmatter += 'inclusion: always\n';
    }

    frontmatter += '---\n';
    return frontmatter;
}

/**
 * Generate a single Kiro steering file.
 */
function generateKiroRule(rule: RuleIR): string {
    return generateKiroFrontmatter(rule) + '\n' + rule.body;
}

/**
 * Render rules to Kiro steering format.
 *
 * Generates individual .md files:
 * .kiro/steering/<id>.md
 *
 * No consolidated file is generated (Kiro uses native individual-file system).
 *
 * @param rules - Rules to render
 * @param paths - Path configuration
 * @returns Render result with planned writes
 */
export function renderKiro(rules: RuleIR[], paths: PathConfig): RenderResult {
    const writes: PlannedWrite[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
        const filename = `${rule.id}.md`;
        const filepath = path.join(paths.targets.kiro, filename);
        const content = generateKiroRule(rule);

        writes.push({ path: filepath, content });
    }

    return { writes, warnings };
}
