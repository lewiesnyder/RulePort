import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readFiles } from '../core/fs.js';

/**
 * Load rules from Antigravity's .agent/rules/ directory structure.
 *
 * Each rule is a flat .md file:
 * .agent/rules/<rule-name>.md
 *
 * Frontmatter fields:
 * - description: string
 * - globs[]: file patterns; empty/absent → alwaysApply=true
 *
 * @param rulesDir - Path to .agent/rules directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadAntigravityRules(rulesDir: string): RuleIR[] {
    if (!fs.existsSync(rulesDir)) {
        throw new Error('.agent/rules directory not found!');
    }

    const rules: RuleIR[] = [];
    const files = readFiles(rulesDir).filter(f => f.endsWith('.md'));

    // Sort alphabetically for deterministic ordering
    files.sort();

    for (const filename of files) {
        const filePath = path.join(rulesDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const { meta, body } = parseFrontmatter(content);

        const id = filename.replace(/\.md$/, '');
        const globs = Array.isArray(meta.globs) ? meta.globs.map(String) : [];
        // globs empty/absent means always-apply
        const alwaysApply = globs.length === 0;

        const rule: RuleIR = {
            id,
            title: id,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply,
            globs,
            meta,
            source: 'antigravity',
        };

        rules.push(rule);
    }

    return rules;
}
