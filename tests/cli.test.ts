import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/cli.js';

describe('CLI Argument Parsing', () => {
    it('parses default arguments', () => {
        const config = parseArgs([]);
        expect(config.source).toBe('cursor');
        expect(config.isWatchMode).toBe(false);
        // Defaults to all targets if none specified
        expect(config.targets).toContain('copilot');
        expect(config.targets).toContain('claude');
        expect(config.targets).toContain('antigravity');
    });

    it('parses --target flag', () => {
        const config = parseArgs(['--target', 'copilot']);
        expect(config.targets).toEqual(['copilot']);
    });

    it('parses positional target argument', () => {
        const config = parseArgs(['antigravity']);
        expect(config.targets).toEqual(['antigravity']);
    });

    it('throws on value-less flag', () => {
        expect(() => parseArgs(['--target'])).toThrow(/requires a value/);
    });

    it('throws on multiple paths', () => {
        expect(() => parseArgs(['path1', 'path2'])).toThrow(/Multiple paths provided/);
    });

    it('parses watch mode flag', () => {
        const config = parseArgs(['--watch']);
        expect(config.isWatchMode).toBe(true);
    });

    it('parses -w shorthand for watch', () => {
        const config = parseArgs(['-w']);
        expect(config.isWatchMode).toBe(true);
    });

    it('parses custom base directory', () => {
        const config = parseArgs(['/custom/path']);
        expect(config.baseDir).toContain('custom');
        expect(config.isBaseDirExplicit).toBe(true);
    });

    it('parses multiple targets', () => {
        const config = parseArgs(['--target', 'copilot', '--target', 'claude']);
        expect(config.targets).toEqual(['copilot', 'claude']);
    });
});
