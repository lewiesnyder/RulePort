import type { LogLevel } from '../config/types.js';

/**
 * Logging utilities with consistent formatting.
 * Preserves emoji-based output from the JavaScript version.
 */

const LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};

let currentLogLevel: number = LOG_LEVELS.warn;

/**
 * Set the current log level.
 * @param level - The log level to set
 */
export function setLogLevel(level: LogLevel): void {
    currentLogLevel = LOG_LEVELS[level];
}

/**
 * Check if a log level is enabled.
 */
function isLevelEnabled(level: LogLevel): boolean {
    return currentLogLevel >= LOG_LEVELS[level];
}

export function info(message: string): void {
    if (isLevelEnabled('info')) {
        console.log(message);
    }
}

export function success(message: string): void {
    if (isLevelEnabled('info')) {
        console.log(`✓ ${message}`);
    }
}

export function warn(message: string): void {
    if (isLevelEnabled('warn')) {
        console.warn(`⚠️  ${message}`);
    }
}

export function error(message: string): void {
    if (isLevelEnabled('error')) {
        console.error(`❌ ${message}`);
    }
}

export function debug(message: string): void {
    if (isLevelEnabled('debug')) {
        console.log(`🔍 ${message}`);
    }
}

export function trace(message: string): void {
    if (isLevelEnabled('trace')) {
        console.log(`🔍 [TRACE] ${message}`);
    }
}

export function section(title: string): void {
    if (isLevelEnabled('info')) {
        console.log(`\n${title}`);
    }
}

export function bullet(message: string): void {
    if (isLevelEnabled('info')) {
        console.log(`   • ${message}`);
    }
}

export function indent(message: string): void {
    if (isLevelEnabled('info')) {
        console.log(`   ${message}`);
    }
}
