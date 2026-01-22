import * as path from 'path';
import type { RuleIR, RenderResult, PlannedWrite } from '../core/ir.js';
import type { PathConfig } from '../config/types.js';

/**
 * Generate frontmatter for a Claude Code rule file.
 */
function generateClaudeFrontmatter(rule: RuleIR): string {
    let frontmatter = '---\n';

    if (rule.description) {
        frontmatter += `description: "${rule.description}"\n`;
    }

    if (rule.globs.length > 0) {
        frontmatter += 'paths:\n';
        for (const glob of rule.globs) {
            frontmatter += `  - "${glob}"\n`;
        }
    }

    if (rule.alwaysApply !== undefined) {
        frontmatter += `always_apply: ${rule.alwaysApply}\n`;
    }

    frontmatter += '---\n';
    return frontmatter;
}

/**
 * Generate a single Claude Code rule file.
 */
function generateClaudeRule(rule: RuleIR): string {
    return generateClaudeFrontmatter(rule) + '\n' + rule.body;
}

/**
 * Generate consolidated Claude file.
 */
function generateConsolidatedClaude(rules: RuleIR[]): string {
    const timestamp = new Date().toISOString();

    let output = `<!-- Auto-synced from .cursor/rules/ at ${timestamp} -->\n`;
    output += `<!-- DO NOT EDIT - Edit .cursor/rules/*/RULE.md instead -->\n\n`;
    output += `# AI Assistant Rules\n\n`;
    output += `This file consolidates all rules from cursor configuration\n\n`;
    output += `---\n\n`;

    // Group rules by alwaysApply
    const alwaysApplyRules = rules.filter(r => r.alwaysApply);
    const conditionalRules = rules.filter(r => !r.alwaysApply);

    if (alwaysApplyRules.length > 0) {
        output += `# Always Apply Rules\n\n`;
        output += `These rules apply to all files:\n\n`;

        for (const rule of alwaysApplyRules) {
            output += `## ${rule.id}\n\n`;
            if (rule.description) {
                output += `> ${rule.description}\n\n`;
            }
            output += rule.body + '\n\n---\n\n';
        }
    }

    if (conditionalRules.length > 0) {
        output += `# Conditional Rules\n\n`;
        output += `These rules apply to specific file patterns:\n\n`;

        for (const rule of conditionalRules) {
            output += `## ${rule.id}\n\n`;
            if (rule.description) {
                output += `> ${rule.description}\n\n`;
            }
            if (rule.globs.length > 0) {
                output += `**Applies to:** \`${rule.globs.join('`, `')}\`\n\n`;
            }
            output += rule.body + '\n\n---\n\n';
        }
    }

    return output;
}

/**
 * Render rules to Claude Code format.
 * 
 * Generates:
 * - Individual .md files in .claude/rules/
 * - Consolidated CLAUDE.md in .claude/
 * 
 * @param rules - Rules to render
 * @param paths - Path configuration
 * @returns Render result with planned writes
 */
export function renderClaude(rules: RuleIR[], paths: PathConfig): RenderResult {
    const writes: PlannedWrite[] = [];
    const warnings: string[] = [];

    // Generate individual rule files
    for (const rule of rules) {
        const filename = `${rule.id}.md`;
        const filepath = path.join(paths.targets.claudeCode, filename);
        const content = generateClaudeRule(rule);

        writes.push({ path: filepath, content });
    }

    // Generate consolidated file
    const consolidatedContent = generateConsolidatedClaude(rules);
    writes.push({
        path: paths.consolidated.claudeCode,
        content: consolidatedContent,
    });

    return { writes, warnings };
}
