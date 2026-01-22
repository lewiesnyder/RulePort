import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('E2E Sync Workflow', () => {
    const testDir = path.join(__dirname, 'temp_test_project');
    const rulesDir = path.join(testDir, '.cursor', 'rules');

    beforeEach(() => {
        // Setup test environment
        fs.mkdirSync(path.join(rulesDir, 'test-rule'), { recursive: true });
        fs.writeFileSync(
            path.join(rulesDir, 'test-rule', 'RULE.md'),
            '---\ndescription: E2E test rule\nglobs:\n  - "*.ts"\n---\n# Test\nContent'
        );
    });

    afterEach(() => {
        // Cleanup
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('runs sync command successfully', () => {
        const cliPath = path.resolve(__dirname, '../dist/cli.js');

        const output = execSync(`node ${cliPath} ${testDir} --target antigravity`, {
            encoding: 'utf8'
        });

        expect(output).toContain('Syncing AI rules');
        expect(output).toContain('Found 1 rule');
        expect(output).toContain('Sync complete: 1 succeeded');
    });

    it('generates expected artifacts', () => {
        const cliPath = path.resolve(__dirname, '../dist/cli.js');
        execSync(`node ${cliPath} ${testDir} --target antigravity`, { encoding: 'utf8' });

        const agentRulesFile = path.join(testDir, '.agent', 'rules', 'test-rule.md');
        const geminiFile = path.join(testDir, '.gemini', 'GEMINI.md');

        expect(fs.existsSync(agentRulesFile)).toBe(true);
        expect(fs.existsSync(geminiFile)).toBe(true);

        const content = fs.readFileSync(agentRulesFile, 'utf8');
        expect(content).toContain('globs:');
        expect(content).toContain('*.ts');
    });

    it('syncs to all targets by default', () => {
        const cliPath = path.resolve(__dirname, '../dist/cli.js');
        execSync(`node ${cliPath} ${testDir}`, { encoding: 'utf8' });

        // Check Copilot files
        expect(fs.existsSync(path.join(testDir, '.github', 'instructions', 'test-rule.instructions.md'))).toBe(true);
        expect(fs.existsSync(path.join(testDir, '.github', 'copilot-instructions.md'))).toBe(true);

        // Check Claude files
        expect(fs.existsSync(path.join(testDir, '.claude', 'rules', 'test-rule.md'))).toBe(true);
        expect(fs.existsSync(path.join(testDir, '.claude', 'CLAUDE.md'))).toBe(true);

        // Check Antigravity files
        expect(fs.existsSync(path.join(testDir, '.agent', 'rules', 'test-rule.md'))).toBe(true);
        expect(fs.existsSync(path.join(testDir, '.gemini', 'GEMINI.md'))).toBe(true);
    });

    it('check command detects when files are in sync', () => {
        const cliPath = path.resolve(__dirname, '../dist/cli.js');

        // First sync
        execSync(`node ${cliPath} ${testDir}`, { encoding: 'utf8' });

        // Check should pass (exit code 0) - no drift since timestamps removed
        const output = execSync(`node ${cliPath} check ${testDir}`, { encoding: 'utf8' });
        expect(output).toContain('All files are in sync');
    });
});
