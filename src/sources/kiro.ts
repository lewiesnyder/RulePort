import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readFiles } from '../core/fs.js';

/**
 * Load rules from Kiro's .kiro/steering/ directory structure.
 *
 * Each rule is a flat .md file:
 * .kiro/steering/<rule-name>.md
 *
 * Frontmatter fields:
 * - inclusion: 'always' | 'fileMatch' | 'manual' | 'auto'
 *   - 'always' or absent → alwaysApply=true
 *   - 'fileMatch' → use fileMatchPattern for globs
 * - fileMatchPattern: string | string[] → globs
 *
 * @param steeringDir - Path to .kiro/steering directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadKiroRules(steeringDir: string): RuleIR[] {
    if (!fs.existsSync(steeringDir)) {
        throw new Error('.kiro/steering directory not found!');
    }

    const rules: RuleIR[] = [];
    const files = readFiles(steeringDir).filter(f => f.endsWith('.md'));

    // Sort alphabetically for deterministic ordering
    files.sort();

    for (const filename of files) {
        const filePath = path.join(steeringDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const { meta, body } = parseFrontmatter(content);

        const id = filename.replace(/\.md$/, '');
        const inclusion = typeof meta.inclusion === 'string' ? meta.inclusion : 'always';
        const alwaysApply = inclusion === 'always' || !meta.inclusion;

        // fileMatchPattern can be a string or array of strings
        let globs: string[] = [];
        if (!alwaysApply && meta.fileMatchPattern !== undefined) {
            if (Array.isArray(meta.fileMatchPattern)) {
                globs = meta.fileMatchPattern.map(String);
            } else if (typeof meta.fileMatchPattern === 'string') {
                globs = [meta.fileMatchPattern];
            }
        }

        const rule: RuleIR = {
            id,
            title: id,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply,
            globs,
            meta,
            source: 'kiro',
        };

        rules.push(rule);
    }

    return rules;
}
