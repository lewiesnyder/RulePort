#!/usr/bin/env node

/**
 * RulePort Validation Script (Directory-based)
 * 
 * Validates your directory-based AI rules configuration
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const CURSOR_RULES_DIR = path.join(PROJECT_ROOT, '.cursor', 'rules');

// Color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getRuleDirectories() {
    if (!fs.existsSync(CURSOR_RULES_DIR)) {
        return [];
    }

    return fs.readdirSync(CURSOR_RULES_DIR)
        .filter(item => {
            const itemPath = path.join(CURSOR_RULES_DIR, item);
            return fs.statSync(itemPath).isDirectory();
        })
        .filter(dir => {
            const ruleFile = path.join(CURSOR_RULES_DIR, dir, 'RULE.md');
            return fs.existsSync(ruleFile);
        });
}

function checkTargetFiles() {
    const targets = [
        {
            name: 'GitHub Copilot (individual)',
            dir: path.join(PROJECT_ROOT, '.github', 'instructions'),
            pattern: '*.instructions.md'
        },
        {
            name: 'GitHub Copilot (consolidated)',
            file: path.join(PROJECT_ROOT, '.github', 'copilot-instructions.md')
        },
        {
            name: 'Claude Code (individual)',
            dir: path.join(PROJECT_ROOT, '.claude', 'rules'),
            pattern: '*.md'
        },
        {
            name: 'Claude Code (consolidated)',
            file: path.join(PROJECT_ROOT, '.claude', 'CLAUDE.md')
        },
        {
            name: 'Antigravity (individual)',
            dir: path.join(PROJECT_ROOT, '.agent', 'rules'),
            pattern: '*.md'
        },
        {
            name: 'Antigravity (consolidated)',
            file: path.join(PROJECT_ROOT, '.gemini', 'GEMINI.md')
        }
    ];

    const results = [];

    targets.forEach(target => {
        if (target.dir) {
            const exists = fs.existsSync(target.dir);
            const count = exists ? fs.readdirSync(target.dir).filter(f =>
                f.endsWith('.md') || f.endsWith('.instructions.md')
            ).length : 0;

            results.push({
                name: target.name,
                exists,
                count,
                type: 'directory'
            });
        } else if (target.file) {
            const exists = fs.existsSync(target.file);
            results.push({
                name: target.name,
                exists,
                type: 'file',
                path: target.file
            });
        }
    });

    return results;
}

function validateSetup() {
    log('\n🔍 Validating Directory-Based AI Rules Setup\n', 'cyan');
    log(`Project: ${PROJECT_ROOT}\n`, 'blue');

    let errors = 0;
    let warnings = 0;
    let successes = 0;

    // Check source directory
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('1. Checking Source Directory', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    if (!fs.existsSync(CURSOR_RULES_DIR)) {
        log('✗ ERROR: .cursor/rules directory not found!', 'red');
        log('  Run: npm run init\n', 'yellow');
        errors++;
    } else {
        const ruleDirs = getRuleDirectories();

        if (ruleDirs.length === 0) {
            log('⚠ WARNING: .cursor/rules directory is empty', 'yellow');
            log('  Run: npm run init\n', 'yellow');
            warnings++;
        } else {
            log(`✓ Found ${ruleDirs.length} rule(s) in .cursor/rules/`, 'green');
            ruleDirs.forEach(dir => {
                const ruleFile = path.join(CURSOR_RULES_DIR, dir, 'RULE.md');
                const content = fs.readFileSync(ruleFile, 'utf8');
                const hasGlobs = content.includes('globs:');
                const alwaysApply = content.includes('alwaysApply: true');

                log(`  • ${dir}`, 'blue');
                if (alwaysApply) {
                    log(`    [Always applies]`, 'green');
                } else if (hasGlobs) {
                    log(`    [Pattern-based]`, 'cyan');
                }
            });
            successes++;
        }
    }

    // Check synced files
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('2. Checking Synced Files', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    const targetFiles = checkTargetFiles();
    const ruleDirs = getRuleDirectories();

    targetFiles.forEach(target => {
        log(`📄 ${target.name}:`);

        if (!target.exists) {
            log('  ✗ Not found', 'yellow');
            log('  → Run: npm run sync', 'yellow');
            warnings++;
        } else if (target.type === 'directory') {
            if (target.count === 0) {
                log('  ✗ Directory empty', 'yellow');
                log('  → Run: npm run sync', 'yellow');
                warnings++;
            } else if (target.count !== ruleDirs.length) {
                log(`  ⚠ Has ${target.count} file(s), expected ${ruleDirs.length}`, 'yellow');
                log('  → Run: npm run sync to update', 'yellow');
                warnings++;
            } else {
                log(`  ✓ ${target.count} rule file(s) synced`, 'green');
                successes++;
            }
        } else {
            log('  ✓ Consolidated file exists', 'green');

            // Check if it's auto-synced
            const content = fs.readFileSync(target.path, 'utf8');
            if (content.includes('Auto-synced from .cursor/rules/')) {
                const match = content.match(/Auto-synced from \.cursor\/rules\/ at (.+)/);
                if (match) {
                    log(`  → Last synced: ${match[1]}`, 'blue');
                }
            }
            successes++;
        }
        console.log();
    });

    // Check for YAML package
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('3. Checking Dependencies', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    try {
        require.resolve('yaml');
        log('✓ yaml package installed', 'green');
        successes++;
    } catch (e) {
        log('✗ yaml package not found', 'red');
        log('  → Run: npm install', 'yellow');
        errors++;
    }

    // Summary
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Summary', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    log(`✓ Successes: ${successes}`, 'green');
    if (warnings > 0) {
        log(`⚠ Warnings: ${warnings}`, 'yellow');
    }
    if (errors > 0) {
        log(`✗ Errors: ${errors}`, 'red');
    }

    console.log();

    if (errors === 0 && warnings === 0) {
        log('🎉 Perfect! Your AI rules are properly configured!\n', 'green');
        return 0;
    } else if (errors === 0) {
        log('✅ Setup is working, but there are some suggestions above\n', 'yellow');
        log('Quick fix: npm run sync\n', 'yellow');
        return 0;
    } else {
        log('❌ Please fix the errors above\n', 'red');
        log('Quick fixes:', 'yellow');
        log('  • No rules? Run: npm run init', 'yellow');
        log('  • Missing dependencies? Run: npm install', 'yellow');
        log('  • Need to sync? Run: npm run sync', 'yellow');
        console.log();
        return 1;
    }
}

// Run validation
const exitCode = validateSetup();
process.exit(exitCode);
