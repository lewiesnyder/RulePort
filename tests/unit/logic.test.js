const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const {
    parseArgs,
    createCopilotInstruction,
    createClaudeCodeRule,
    createAntigravityRule
} = require('../../sync-rules-advanced.js');

describe('Argument Parsing', () => {
    test('parses default arguments', () => {
        const config = parseArgs([]);
        assert.strictEqual(config.source, 'cursor');
        assert.strictEqual(config.isWatchMode, false);
        // Defaults to all targets if none specified
        assert.ok(config.targets.includes('copilot'));
        assert.ok(config.targets.includes('claude'));
        assert.ok(config.targets.includes('antigravity'));
    });

    test('parses --target flag', () => {
        const config = parseArgs(['--target', 'copilot']);
        assert.deepStrictEqual(config.targets, ['copilot']);
    });

    test('parses positional target argument', () => {
        const config = parseArgs(['antigravity']);
        assert.deepStrictEqual(config.targets, ['antigravity']);
    });

    test('throws on value-less flag', () => {
        assert.throws(() => parseArgs(['--target']), /requires a value/);
    });

    test('throws on multiple paths', () => {
        assert.throws(() => parseArgs(['path1', 'path2']), /Multiple paths provided/);
    });
});

describe('Rule Generation', () => {
    const mockRule = {
        name: 'test-rule',
        frontmatter: {
            description: 'A test rule',
            globs: ['*.js', '*.ts'],
            alwaysApply: true
        },
        content: '# Test Content\n\nRule logic here.'
    };

    test('generates Copilot instruction', () => {
        const output = createCopilotInstruction(mockRule);
        assert.match(output, /description: "A test rule"/);
        assert.match(output, /applyTo:/);
        assert.match(output, /  - "\*.js"/);
    });

    test('generates Claude Code rule', () => {
        const output = createClaudeCodeRule(mockRule);
        assert.match(output, /paths:/); // Should use paths
        assert.match(output, /always_apply: true/);
    });

    test('generates Antigravity rule', () => {
        const output = createAntigravityRule(mockRule);
        assert.match(output, /globs:/); // Should use globs
    });
});
