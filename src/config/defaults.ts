import * as path from 'path';
import type { CLIConfig, PathConfig } from './types.js';

/**
 * Get default CLI configuration.
 * 
 * @returns Default configuration
 */
export function getDefaultConfig(): CLIConfig {
    return {
        baseDir: process.cwd(),
        isBaseDirExplicit: false,
        source: 'cursor',
        targets: [],
        isWatchMode: false,
        logLevel: 'warn',
    };
}

/**
 * Get path configuration for a given base directory.
 * Matches the paths used in the JavaScript version.
 *
 * @param baseDir - Project root directory
 * @returns Path configuration
 */
export function getPaths(baseDir: string): PathConfig {
    return {
        rulesDir: path.join(baseDir, '.cursor', 'rules'),
        sources: {
            cursor: path.join(baseDir, '.cursor', 'rules'),
            claude: path.join(baseDir, '.claude', 'rules'),
            copilot: path.join(baseDir, '.github', 'instructions'),
            antigravity: path.join(baseDir, '.agent', 'rules'),
            kiro: path.join(baseDir, '.kiro', 'steering'),
            windsurf: path.join(baseDir, '.windsurf', 'rules'),
        },
        targets: {
            copilot: path.join(baseDir, '.github', 'instructions'),
            claudeCode: path.join(baseDir, '.claude', 'rules'),
            antigravity: path.join(baseDir, '.agent', 'rules'),
            cursor: path.join(baseDir, '.cursor', 'rules'),
            kiro: path.join(baseDir, '.kiro', 'steering'),
            windsurf: path.join(baseDir, '.windsurf', 'rules'),
        },
        consolidated: {
            copilot: path.join(baseDir, '.github', 'copilot-instructions.md'),
            claudeCode: path.join(baseDir, '.claude', 'CLAUDE.md'),
            antigravity: path.join(baseDir, '.gemini', 'GEMINI.md'),
        },
    };
}

/**
 * Valid target names.
 */
export const VALID_TARGETS = ['copilot', 'claude', 'antigravity', 'cursor', 'kiro', 'windsurf'] as const;

/**
 * Valid source names.
 */
export const VALID_SOURCES = ['cursor', 'claude', 'copilot', 'antigravity', 'kiro', 'windsurf'] as const;
