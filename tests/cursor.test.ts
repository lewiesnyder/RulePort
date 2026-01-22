import { describe, it, expect } from 'vitest';
import { loadCursorRules } from '../src/sources/cursor.js';
import { parseFrontmatter } from '../src/core/frontmatter.js';
import path from 'path';

describe('Cursor Source Adapter', () => {
    const fixturesDir = path.join(__dirname, 'fixtures', 'cursor-basic', '.cursor', 'rules');

    it('loads rules from .cursor/rules directory', () => {
        const rules = loadCursorRules(fixturesDir);
        expect(rules).toHaveLength(1);
        expect(rules[0].id).toBe('test-rule');
    });

    it('parses frontmatter correctly', () => {
        const rules = loadCursorRules(fixturesDir);
        const rule = rules[0];

        expect(rule.description).toBe('Test rule for unit testing');
        expect(rule.globs).toEqual(['*.ts', '*.js']);
        expect(rule.alwaysApply).toBe(false);
    });

    it('extracts body content without frontmatter', () => {
        const rules = loadCursorRules(fixturesDir);
        const rule = rules[0];

        expect(rule.body).toContain('# Test Rule');
        expect(rule.body).toContain('This is a test rule');
        expect(rule.body).not.toContain('---');
    });

    it('sets source to cursor', () => {
        const rules = loadCursorRules(fixturesDir);
        expect(rules[0].source).toBe('cursor');
    });

    it('preserves metadata in meta field', () => {
        const rules = loadCursorRules(fixturesDir);
        const rule = rules[0];

        expect(rule.meta.description).toBe('Test rule for unit testing');
        expect(rule.meta.globs).toEqual(['*.ts', '*.js']);
    });
});

describe('Frontmatter Parser', () => {
    it('parses valid YAML frontmatter', () => {
        const content = `---
description: "Test"
globs:
  - "*.ts"
---

Body content`;

        const result = parseFrontmatter(content);
        expect(result.meta.description).toBe('Test');
        expect(result.meta.globs).toEqual(['*.ts']);
        expect(result.body).toBe('Body content');
    });

    it('handles missing frontmatter', () => {
        const content = 'Just body content';
        const result = parseFrontmatter(content);

        expect(result.meta).toEqual({});
        expect(result.body).toBe('Just body content');
    });

    it('handles malformed YAML gracefully', () => {
        const content = `---
invalid: yaml: content:
---

Body`;

        const result = parseFrontmatter(content);
        expect(result.meta).toEqual({});
    });
});
