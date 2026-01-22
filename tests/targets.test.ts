import { describe, it, expect } from 'vitest';
import { renderCopilot } from '../src/targets/copilot.js';
import { renderClaude } from '../src/targets/claude.js';
import { renderAntigravity } from '../src/targets/antigravity.js';
import { getPaths } from '../src/config/defaults.js';
import type { RuleIR } from '../src/core/ir.js';

const mockRule: RuleIR = {
    id: 'test-rule',
    title: 'test-rule',
    description: 'A test rule',
    body: '# Test Content\n\nRule logic here.',
    alwaysApply: true,
    globs: ['*.js', '*.ts'],
    meta: {
        description: 'A test rule',
        globs: ['*.js', '*.ts'],
        alwaysApply: true,
    },
    source: 'cursor',
};

const paths = getPaths('/test/project');

describe('Copilot Target Adapter', () => {
    it('generates instruction files with applyTo', () => {
        const result = renderCopilot([mockRule], paths);

        expect(result.writes).toHaveLength(2); // 1 instruction + 1 consolidated

        const instructionFile = result.writes[0];
        expect(instructionFile.path).toContain('.instructions.md');
        expect(instructionFile.content).toContain('description: "A test rule"');
        expect(instructionFile.content).toContain('applyTo:');
        expect(instructionFile.content).toContain('- "*.js"');
        expect(instructionFile.content).toContain('- "*.ts"');
    });

    it('includes body content', () => {
        const result = renderCopilot([mockRule], paths);
        const instructionFile = result.writes[0];

        expect(instructionFile.content).toContain('# Test Content');
        expect(instructionFile.content).toContain('Rule logic here.');
    });

    it('generates consolidated file', () => {
        const result = renderCopilot([mockRule], paths);
        const consolidatedFile = result.writes[1];

        expect(consolidatedFile.path).toContain('copilot-instructions.md');
        expect(consolidatedFile.content).toContain('# AI Assistant Rules');
        expect(consolidatedFile.content).toContain('Always Apply Rules');
    });
});

describe('Claude Target Adapter', () => {
    it('generates rule files with paths', () => {
        const result = renderClaude([mockRule], paths);

        expect(result.writes).toHaveLength(2); // 1 rule + 1 consolidated

        const ruleFile = result.writes[0];
        expect(ruleFile.path).toContain('.md');
        expect(ruleFile.content).toContain('paths:');
        expect(ruleFile.content).toContain('- "*.js"');
        expect(ruleFile.content).toContain('always_apply: true');
    });

    it('includes description in frontmatter', () => {
        const result = renderClaude([mockRule], paths);
        const ruleFile = result.writes[0];

        expect(ruleFile.content).toContain('description: "A test rule"');
    });

    it('generates consolidated CLAUDE.md', () => {
        const result = renderClaude([mockRule], paths);
        const consolidatedFile = result.writes[1];

        expect(consolidatedFile.path).toContain('CLAUDE.md');
        expect(consolidatedFile.content).toContain('# AI Assistant Rules');
    });
});

describe('Antigravity Target Adapter', () => {
    it('generates rule files with globs', () => {
        const result = renderAntigravity([mockRule], paths);

        expect(result.writes).toHaveLength(2); // 1 rule + 1 consolidated

        const ruleFile = result.writes[0];
        expect(ruleFile.path).toContain('.md');
        expect(ruleFile.content).toContain('globs:');
        expect(ruleFile.content).toContain('- "*.js"');
        expect(ruleFile.content).toContain('- "*.ts"');
    });

    it('includes description in frontmatter', () => {
        const result = renderAntigravity([mockRule], paths);
        const ruleFile = result.writes[0];

        expect(ruleFile.content).toContain('description: "A test rule"');
    });

    it('generates consolidated GEMINI.md', () => {
        const result = renderAntigravity([mockRule], paths);
        const consolidatedFile = result.writes[1];

        expect(consolidatedFile.path).toContain('GEMINI.md');
        expect(consolidatedFile.content).toContain('# AI Assistant Rules');
    });
});
