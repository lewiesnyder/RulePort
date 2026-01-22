import * as fs from 'fs';
import * as path from 'path';
import type { RuleIR } from '../core/ir.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { readSubdirectories } from '../core/fs.js';

/**
 * Load rules from Cursor's .cursor/rules/ directory structure.
 * 
 * Each rule is stored in a subdirectory with a RULE.md file:
 * .cursor/rules/<rule-name>/RULE.md
 * 
 * @param rulesDir - Path to .cursor/rules directory
 * @returns Array of RuleIR objects, sorted alphabetically by ID
 */
export function loadCursorRules(rulesDir: string): RuleIR[] {
    if (!fs.existsSync(rulesDir)) {
        throw new Error('.cursor/rules directory not found!');
    }

    const rules: RuleIR[] = [];
    const ruleDirs = readSubdirectories(rulesDir);

    // Sort alphabetically for deterministic ordering
    ruleDirs.sort();

    for (const ruleDir of ruleDirs) {
        const ruleDirPath = path.join(rulesDir, ruleDir);
        const ruleFilePath = path.join(ruleDirPath, 'RULE.md');

        if (!fs.existsSync(ruleFilePath)) {
            continue;
        }

        const content = fs.readFileSync(ruleFilePath, 'utf8');
        const { meta, body } = parseFrontmatter(content);

        // Convert frontmatter to RuleIR
        const rule: RuleIR = {
            id: ruleDir,
            title: ruleDir,
            description: typeof meta.description === 'string' ? meta.description : undefined,
            body,
            alwaysApply: meta.alwaysApply === true,
            globs: Array.isArray(meta.globs) ? meta.globs.map(String) : [],
            meta,
            source: 'cursor',
        };

        rules.push(rule);
    }

    return rules;
}
