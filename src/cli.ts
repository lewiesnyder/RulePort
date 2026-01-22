#!/usr/bin/env node

import * as path from 'path';
import type { CLIConfig } from './config/types.js';
import { getDefaultConfig, VALID_TARGETS } from './config/defaults.js';
import { syncCommand } from './commands/sync.js';
import { checkCommand } from './commands/check.js';
import { watchCommand } from './commands/watch.js';
import * as log from './core/log.js';

/**
 * Parse command-line arguments into CLI configuration.
 * Matches the behavior of the JavaScript version's parseArgs function.
 * 
 * @param args - Command-line arguments (excluding node and script path)
 * @returns Parsed configuration
 */
function parseArgs(args: string[]): CLIConfig {
    const config = getDefaultConfig();

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--watch' || arg === '-w') {
            config.isWatchMode = true;
        } else if (arg === '--source') {
            if (i + 1 < args.length) {
                config.source = args[++i] as any;
            } else {
                throw new Error('--source requires a value');
            }
        } else if (arg === '--target') {
            if (i + 1 < args.length) {
                config.targets.push(args[++i] as any);
            } else {
                throw new Error('--target requires a value');
            }
        } else if (arg.startsWith('-')) {
            log.warn(`Warning: Unknown flag "${arg}" ignored.`);
        } else {
            // Positional argument
            const potentialTarget = arg.toLowerCase();
            if (VALID_TARGETS.includes(potentialTarget as any)) {
                log.info(`💡 Treating positional argument "${arg}" as target.`);
                config.targets.push(potentialTarget as any);
            } else {
                if (config.isBaseDirExplicit) {
                    throw new Error(`Multiple paths provided. First: "${config.baseDir}", Second: "${path.resolve(arg)}"`);
                }
                config.baseDir = path.resolve(arg);
                config.isBaseDirExplicit = true;
                log.info(`📂 Using project root: ${config.baseDir}\n`);
            }
        }
    }

    // Validation
    if (config.source !== 'cursor') {
        throw new Error(`Unsupported source "${config.source}". Only "cursor" is currently supported as a source.`);
    }

    if (config.targets.length === 0) {
        config.targets.push(...VALID_TARGETS);
    } else {
        const invalidTargets = config.targets.filter(t => !VALID_TARGETS.includes(t as any));
        if (invalidTargets.length > 0) {
            throw new Error(`Invalid targets: ${invalidTargets.join(', ')}`);
        }
    }

    return config;
}

/**
 * Display help text.
 */
function showHelp(): void {
    console.log(`
RulePort - Unified AI assistant rules syncing utility

Usage:
  ruleport [path] [options]
  ruleport [command] [path] [options]

Commands:
  sync      Sync rules from source to targets (default)
  check     Check if rules are in sync (exits 1 if drift detected)
  watch     Watch for changes and auto-sync

Options:
  --watch, -w           Watch for changes and auto-sync
  --source <name>       Source to read from (default: cursor)
  --target <name>       Target to sync to (can be specified multiple times)
                        Valid targets: copilot, claude, antigravity
                        Default: all targets

Examples:
  ruleport                           # Sync all targets in current directory
  ruleport /path/to/project          # Sync all targets in specified directory
  ruleport --target copilot          # Sync only to GitHub Copilot
  ruleport --watch                   # Watch mode
  ruleport check                     # Check sync status (for CI)

Legacy scripts:
  npm run legacy:sync                # Run original JavaScript version
`);
}

/**
 * Main CLI entry point.
 */
function main(): void {
    const args = process.argv.slice(2);

    // Handle help flag
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    // Handle command
    let command = 'sync';
    let commandArgs = args;

    if (args.length > 0 && ['sync', 'check', 'watch'].includes(args[0])) {
        command = args[0];
        commandArgs = args.slice(1);
    }

    try {
        const config = parseArgs(commandArgs);

        // Route to appropriate command
        if (command === 'check') {
            checkCommand(config);
        } else if (command === 'watch' || config.isWatchMode) {
            watchCommand(config);
        } else {
            syncCommand(config);
        }
    } catch (error) {
        log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { parseArgs, main };
