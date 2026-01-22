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
        targets: {
            copilot: path.join(baseDir, '.github', 'instructions'),
            claudeCode: path.join(baseDir, '.claude', 'rules'),
            antigravity: path.join(baseDir, '.agent', 'rules'),
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
export const VALID_TARGETS = ['copilot', 'claude', 'antigravity'] as const;
