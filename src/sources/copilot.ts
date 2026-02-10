import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readFiles } from '../core/fs.js';

/**
 * Load rules from GitHub Copilot's .github/instructions/ directory structure.
 *
 * Each rule is a flat .instructions.md file:
 * .github/instructions/<rule-name>.instructions.md
 *
 * Frontmatter fields:
 * - description: string
 * - applyTo[]: mapped to globs; empty/absent → alwaysApply=true
 *
 * @param instructionsDir - Path to .github/instructions directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadCopilotRules(instructionsDir: string): RuleIR[] {
    if (!fs.existsSync(instructionsDir)) {
        throw new Error('.github/instructions directory not found!');
    }

    const rules: RuleIR[] = [];
    const files = readFiles(instructionsDir).filter(f => f.endsWith('.instructions.md'));

    // Sort alphabetically for deterministic ordering
    files.sort();

    for (const filename of files) {
        const filePath = path.join(instructionsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const { meta, body } = parseFrontmatter(content);

        // Strip .instructions.md suffix to get stable ID
        const id = filename.replace(/\.instructions\.md$/, '');
        const applyTo = Array.isArray(meta.applyTo) ? meta.applyTo.map(String) : [];
        // applyTo empty/absent means always-apply
        const alwaysApply = applyTo.length === 0;

        const rule: RuleIR = {
            id,
            title: id,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply,
            globs: alwaysApply ? [] : applyTo,
            meta,
            source: 'copilot',
        };

        rules.push(rule);
    }

    return rules;
}
