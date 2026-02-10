import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readFiles } from '../core/fs.js';

/**
 * Load rules from Windsurf's .windsurf/rules/ directory structure.
 *
 * Each rule is a flat .md file:
 * .windsurf/rules/<rule-name>.md
 *
 * Frontmatter fields:
 * - trigger: 'always_on' | 'glob' | 'model_decision' | 'manual'
 *   - 'always_on' → alwaysApply=true
 *   - 'glob' → use globs field
 * - globs: comma-separated string → split into string[]
 *
 * @param rulesDir - Path to .windsurf/rules directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadWindsurfRules(rulesDir: string): RuleIR[] {
    if (!fs.existsSync(rulesDir)) {
        throw new Error('.windsurf/rules directory not found!');
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
        const trigger = typeof meta.trigger === 'string' ? meta.trigger : 'always_on';
        const alwaysApply = trigger === 'always_on';

        // globs is a comma-separated string in Windsurf format
        let globs: string[] = [];
        if (!alwaysApply && typeof meta.globs === 'string') {
            globs = meta.globs.split(',').map((g: string) => g.trim()).filter(Boolean);
        } else if (!alwaysApply && Array.isArray(meta.globs)) {
            globs = meta.globs.map(String);
        }

        const rule: RuleIR = {
            id,
            title: id,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply,
            globs,
            meta,
            source: 'windsurf',
        };

        rules.push(rule);
    }

    return rules;
}
