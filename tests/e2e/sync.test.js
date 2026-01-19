const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('E2E Sync Workflow', () => {
    const testDir = path.join(__dirname, 'temp_test_project');
    const rulesDir = path.join(testDir, '.cursor', 'rules');

    before(() => {
        // Setup test environment
        fs.mkdirSync(path.join(rulesDir, 'test-rule'), { recursive: true });
        fs.writeFileSync(
            path.join(rulesDir, 'test-rule', 'RULE.md'),
            '---\ndescription: E2E test rule\nglobs:\n  - "*.ts"\n---\n# Test\nContent'
        );
    });

    after(() => {
        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    test('runs sync command successfully', () => {
        const scriptPath = path.resolve(__dirname, '../../sync-rules-advanced.js');

        try {
            const output = execSync(`node ${scriptPath} ${testDir} --target antigravity`, { encoding: 'utf8' });
            assert.match(output, /Syncing AI rules/);
            assert.match(output, /Found 1 rule/);
            assert.match(output, /Sync complete: 1 succeeded/);
        } catch (e) {
            assert.fail(`Execution failed: ${e.message}\nSTDOUT: ${e.stdout}\nSTDERR: ${e.stderr}`);
        }
    });

    test('generates expected artifacts', () => {
        const agentRulesFile = path.join(testDir, '.agent', 'rules', 'test-rule.md');
        const geminiFile = path.join(testDir, '.gemini', 'GEMINI.md');

        assert.ok(fs.existsSync(agentRulesFile), '.agent/rules/test-rule.md should exist');
        assert.ok(fs.existsSync(geminiFile), '.gemini/GEMINI.md should exist');

        const content = fs.readFileSync(agentRulesFile, 'utf8');
        assert.match(content, /globs:/);
        assert.match(content, /\*\.ts/);
    });
});
