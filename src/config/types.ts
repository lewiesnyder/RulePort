import type { RuleSource, RuleTarget } from '../core/ir.js';

/**
 * CLI configuration parsed from command-line arguments.
 */
export interface CLIConfig {
    /** Base directory (project root) */
    baseDir: string;

    /** Whether baseDir was explicitly provided by user */
    isBaseDirExplicit: boolean;

    /** Source system to read rules from */
    source: RuleSource;

    /** Target systems to sync rules to */
    targets: RuleTarget[];

    /** Whether to run in watch mode */
    isWatchMode: boolean;
}

/**
 * Path configuration for rules and targets.
 */
export interface PathConfig {
    /** Source rules directory */
    rulesDir: string;

    /** Target directories for individual rule files */
    targets: {
        copilot: string;
        claudeCode: string;
        antigravity: string;
    };

    /** Paths for consolidated files */
    consolidated: {
        copilot: string;
        claudeCode: string;
        antigravity: string;
    };
}
