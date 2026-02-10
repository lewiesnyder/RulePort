import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readFiles } from '../core/fs.js';

/**
 * Load rules from Claude Code's .claude/rules/ directory structure.
 *
 * Each rule is a flat .md file:
 * .claude/rules/<rule-name>.md
 *
 * Frontmatter fields:
 * - description: string
 * - paths[]: mapped to globs
 * - always_apply: boolean → alwaysApply
 *
 * @param rulesDir - Path to .claude/rules directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadClaudeRules(rulesDir: string): RuleIR[] {
    if (!fs.existsSync(rulesDir)) {
        throw new Error('.claude/rules directory not found!');
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
        const globs = Array.isArray(meta.paths) ? meta.paths.map(String) : [];

        const rule: RuleIR = {
            id,
            title: id,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply: meta.always_apply === true,
            globs,
            meta,
            source: 'claude',
        };

        rules.push(rule);
    }

    return rules;
}
