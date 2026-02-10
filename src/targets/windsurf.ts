import * as path from 'path';
import type { RuleIR, RenderResult, PlannedWrite } from '../core/ir.js';
import type { PathConfig } from '../config/types.js';

/**
 * Generate frontmatter for a Windsurf rule file.
 *
 * Windsurf uses:
 * - trigger: 'always_on' | 'glob' | 'model_decision' | 'manual'
 * - globs: comma-separated string for glob trigger
 */
function generateWindsurfFrontmatter(rule: RuleIR): string {
    let frontmatter = '---\n';

    if (rule.alwaysApply) {
        frontmatter += 'trigger: always_on\n';
    } else if (rule.globs.length > 0) {
        frontmatter += 'trigger: glob\n';
        frontmatter += `globs: "${rule.globs.join(', ')}"\n`;
    } else {
        frontmatter += 'trigger: always_on\n';
    }

    frontmatter += '---\n';
    return frontmatter;
}

/**
 * Generate a single Windsurf rule file.
 */
function generateWindsurfRule(rule: RuleIR): string {
    return generateWindsurfFrontmatter(rule) + '\n' + rule.body;
}

/**
 * Render rules to Windsurf format.
 *
 * Generates individual .md files:
 * .windsurf/rules/<id>.md
 *
 * No consolidated file is generated (Windsurf uses native individual-file system).
 *
 * @param rules - Rules to render
 * @param paths - Path configuration
 * @returns Render result with planned writes
 */
export function renderWindsurf(rules: RuleIR[], paths: PathConfig): RenderResult {
    const writes: PlannedWrite[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
        const filename = `${rule.id}.md`;
        const filepath = path.join(paths.targets.windsurf, filename);
        const content = generateWindsurfRule(rule);

        writes.push({ path: filepath, content });
    }

    return { writes, warnings };
}
