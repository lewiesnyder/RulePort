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

    /** Component logging level */
    logLevel: LogLevel;
}

/**
 * Available logging levels.
 * Ordered by verbosity (ERROR is least verbose, TRACE is most).
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Path configuration for rules and targets.
 */
export interface PathConfig {
    /** Source rules directory (cursor, backward-compat alias) */
    rulesDir: string;

    /** Source directories indexed by provider name */
    sources: {
        cursor: string;
        claude: string;
        copilot: string;
        antigravity: string;
        kiro: string;
        windsurf: string;
    };

    /** Target directories for individual rule files */
    targets: {
        copilot: string;
        claudeCode: string;
        antigravity: string;
        cursor: string;
        kiro: string;
        windsurf: string;
    };

    /** Paths for consolidated files */
    consolidated: {
        copilot: string;
        claudeCode: string;
        antigravity: string;
    };
}
