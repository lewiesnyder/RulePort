import type { CLIConfig } from '../config/types.js';
import { getPaths } from '../config/defaults.js';
import { loadCursorRules } from '../sources/cursor.js';
import { renderCopilot } from '../targets/copilot.js';
import { renderClaude } from '../targets/claude.js';
import { renderAntigravity } from '../targets/antigravity.js';
import { writeFileAtomic } from '../core/fs.js';
import * as log from '../core/log.js';

/**
 * Execute the sync command.
 * Loads rules from source and syncs to all configured targets.
 * 
 * @param config - CLI configuration
 */
export function syncCommand(config: CLIConfig): void {
    const paths = getPaths(config.baseDir);
    log.debug(`Paths: ${JSON.stringify(paths, null, 2)}`);

    log.info(`🔄 Syncing AI rules (Source: ${config.source})...\n`);

    // Load rules from source
    let rules;
    try {
        rules = loadCursorRules(paths.rulesDir);
    } catch (error) {
        log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }

    log.debug(`Loaded ${rules.length} rules from ${paths.rulesDir}`);

    if (rules.length === 0) {
        log.warn('No rules found in .cursor/rules/');
        log.indent('Create rule directories with RULE.md files to get started.\n');
        return;
    }

    log.info(`📋 Found ${rules.length} rule(s):\n`);
    for (const rule of rules) {
        const globs = rule.globs.length > 0 ? ` (${rule.globs.length} pattern(s))` : '';
        const always = rule.alwaysApply ? ' [always]' : '';
        log.bullet(`${rule.id}${globs}${always}`);
    }
    log.info('');

    let successCount = 0;
    let errorCount = 0;
    const allWarnings: string[] = [];

    // Render to each target
    for (const target of config.targets) {
        log.info(`📝 Syncing to ${target === 'copilot' ? 'GitHub Copilot' : target === 'claude' ? 'Claude Code' : 'Google Antigravity'}...`);

        try {
            let result;

            if (target === 'copilot') {
                result = renderCopilot(rules, paths);
            } else if (target === 'claude') {
                result = renderClaude(rules, paths);
            } else if (target === 'antigravity') {
                result = renderAntigravity(rules, paths);
            } else {
                throw new Error(`Unknown target: ${target}`);
            }

            // Write all files
            for (const write of result.writes) {
                log.debug(`Writing file: ${write.path}`);
                writeFileAtomic(write.path, write.content);
            }

            // Collect warnings
            allWarnings.push(...result.warnings);

            // Report success
            const individualFiles = result.writes.length - 1; // Subtract consolidated file
            if (target === 'copilot') {
                log.indent(`✓ Created ${individualFiles} instruction file(s) in .github/instructions/`);
                log.indent(`✓ Created consolidated .github/copilot-instructions.md`);
            } else if (target === 'claude') {
                log.indent(`✓ Created ${individualFiles} rule file(s) in .claude/rules/`);
                log.indent(`✓ Created consolidated .claude/CLAUDE.md`);
            } else if (target === 'antigravity') {
                log.indent(`✓ Created ${individualFiles} rule file(s) in .agent/rules/`);
                log.indent(`✓ Created consolidated .gemini/GEMINI.md`);
            }

            successCount++;
        } catch (error) {
            log.indent(`✗ Error: ${error instanceof Error ? error.message : String(error)}`);
            errorCount++;
        }
    }

    // Print warnings if any
    if (allWarnings.length > 0) {
        log.info('');
        log.warn('Warnings:');
        for (const warning of allWarnings) {
            log.indent(warning);
        }
    }

    log.info(`\n📊 Sync complete: ${successCount} succeeded, ${errorCount} failed\n`);
}
