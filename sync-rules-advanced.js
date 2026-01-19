#!/usr/bin/env node

/**
 * RulePort Sync Utility
 * 
 * Syncs directory-based rules between AI assistants:
 * - GitHub Copilot (.instructions.md files with applyTo)
 * - Claude Code (.claude/rules/)
 * - Google Antigravity (.agent/rules/)
 * 
 * Usage:
 *   node sync-rules-advanced.js [path/to/project]          # One-time sync
 *   node sync-rules-advanced.js [path/to/project] --watch  # Watch for changes
 */

// Parse arguments function
const fs = require('fs');
const path = require('path');
const yaml = require('yaml'); // Note: Install with `npm install yaml`

function parseArgs(args) {
    const defaultArgs = {
        baseDir: process.cwd(),
        isBaseDirExplicit: false,
        source: 'cursor',
        targets: [],
        isWatchMode: false
    };

    // Copy process.cwd() to baseDir initially
    let parsed = { ...defaultArgs };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--watch' || arg === '-w') {
            parsed.isWatchMode = true;
        } else if (arg === '--source') {
            if (i + 1 < args.length) {
                parsed.source = args[++i];
            } else {
                throw new Error('--source requires a value');
            }
        } else if (arg === '--target') {
            if (i + 1 < args.length) {
                parsed.targets.push(args[++i]);
            } else {
                throw new Error('--target requires a value');
            }
        } else if (arg.startsWith('-')) {
            console.warn(`⚠️  Warning: Unknown flag "${arg}" ignored.`);
        } else {
            // Positional argument
            const potentialTarget = arg.toLowerCase();
            if (['copilot', 'claude', 'antigravity'].includes(potentialTarget)) {
                console.log(`💡 Treating positional argument "${arg}" as target.`);
                parsed.targets.push(potentialTarget);
            } else {
                if (parsed.isBaseDirExplicit) {
                    throw new Error(`Multiple paths provided. First: "${parsed.baseDir}", Second: "${path.resolve(arg)}"`);
                }
                parsed.baseDir = path.resolve(arg);
                parsed.isBaseDirExplicit = true;
                console.log(`📂 Using project root: ${parsed.baseDir}\n`);
            }
        }
    }

    // Validation
    if (parsed.source !== 'cursor') {
        throw new Error(`Unsupported source "${parsed.source}". Only "cursor" is currently supported as a source.`);
    }

    const VALID_TARGETS = ['copilot', 'claude', 'antigravity'];
    if (parsed.targets.length === 0) {
        parsed.targets.push(...VALID_TARGETS);
    } else {
        const invalidTargets = parsed.targets.filter(t => !VALID_TARGETS.includes(t));
        if (invalidTargets.length > 0) {
            throw new Error(`Invalid targets: ${invalidTargets.join(', ')}`);
        }
    }

    return parsed;
}

// ... (Helper Functions) ...

const CURSOR_RULES_DIR_NAME = path.join('.cursor', 'rules');

function getPaths(baseDir) {
    return {
        rulesDir: path.join(baseDir, CURSOR_RULES_DIR_NAME),
        targets: {
            copilot: path.join(baseDir, '.github', 'instructions'),
            claudeCode: path.join(baseDir, '.claude', 'rules'),
            antigravity: path.join(baseDir, '.agent', 'rules'),
        },
        consolidated: {
            copilot: path.join(baseDir, '.github', 'copilot-instructions.md'),
            claudeCode: path.join(baseDir, '.claude', 'CLAUDE.md'),
            antigravity: path.join(baseDir, '.gemini', 'GEMINI.md'),
        }
    };
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function parseRuleFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
        return {
            frontmatter: {},
            content: content
        };
    }

    try {
        const frontmatter = yaml.parse(frontmatterMatch[1]);
        const markdownContent = frontmatterMatch[2];

        return {
            frontmatter,
            content: markdownContent.trim()
        };
    } catch (error) {
        console.error(`Error parsing frontmatter in ${filePath}:`, error.message);
        return {
            frontmatter: {},
            content: content
        };
    }
}

function getAllRules(rulesDir) {
    if (!fs.existsSync(rulesDir)) {
        console.error('❌ Error: .cursor/rules directory not found!');
        if (require.main === module) process.exit(1);
        throw new Error('.cursor/rules directory not found!');
    }

    const rules = [];
    const ruleDirs = fs.readdirSync(rulesDir);

    for (const ruleDir of ruleDirs) {
        const ruleDirPath = path.join(rulesDir, ruleDir);
        const stats = fs.statSync(ruleDirPath);

        if (stats.isDirectory()) {
            const ruleFilePath = path.join(ruleDirPath, 'RULE.md');

            if (fs.existsSync(ruleFilePath)) {
                const { frontmatter, content } = parseRuleFile(ruleFilePath);

                rules.push({
                    name: ruleDir,
                    path: ruleFilePath,
                    frontmatter,
                    content
                });
            }
        }
    }

    return rules;
}

function convertGlobsToApplyTo(globs) {
    // Copilot uses simpler glob patterns in applyTo
    if (!globs || globs.length === 0) return null;

    // Return the first glob or combine multiple
    return globs.join(', ');
}

function createCopilotInstruction(rule) {
    const { name, frontmatter, content } = rule;

    let output = '---\n';

    if (frontmatter.description) {
        output += `description: "${frontmatter.description}"\n`;
    }

    if (frontmatter.globs && frontmatter.globs.length > 0) {
        output += `applyTo:\n`;
        frontmatter.globs.forEach(glob => {
            output += `  - "${glob}"\n`;
        });
    }

    output += '---\n\n';
    output += content;

    return output;
}

function createClaudeCodeRule(rule) {
    const { name, frontmatter, content } = rule;

    let output = '---\n';

    if (frontmatter.description) {
        output += `description: "${frontmatter.description}"\n`;
    }

    if (frontmatter.globs && frontmatter.globs.length > 0) {
        output += `paths:\n`;
        frontmatter.globs.forEach(glob => {
            output += `  - "${glob}"\n`;
        });
    }

    if (frontmatter.alwaysApply !== undefined) {
        output += `always_apply: ${frontmatter.alwaysApply}\n`;
    }

    output += '---\n\n';
    output += content;

    return output;
}

function createAntigravityRule(rule) {
    const { name, frontmatter, content } = rule;

    let output = '---\n';

    if (frontmatter.description) {
        output += `description: "${frontmatter.description}"\n`;
    }

    if (frontmatter.globs && frontmatter.globs.length > 0) {
        output += `globs:\n`;
        frontmatter.globs.forEach(glob => {
            output += `  - "${glob}"\n`;
        });
    }

    output += '---\n\n';
    output += content;

    return output;
}

function createConsolidatedFile(rules, targetType, source) {
    const timestamp = new Date().toISOString();

    let output = `<!-- Auto-synced from .cursor/rules/ at ${timestamp} -->\n`;
    output += `<!-- DO NOT EDIT - Edit .cursor/rules/*/RULE.md instead -->\n\n`;
    output += `# AI Assistant Rules\n\n`;
    output += `This file consolidates all rules from ${source} configuration\n\n`;
    output += `---\n\n`;

    // Group rules by alwaysApply
    const alwaysApplyRules = rules.filter(r => r.frontmatter.alwaysApply === true);
    const conditionalRules = rules.filter(r => r.frontmatter.alwaysApply !== true);

    if (alwaysApplyRules.length > 0) {
        output += `# Always Apply Rules\n\n`;
        output += `These rules apply to all files:\n\n`;

        alwaysApplyRules.forEach(rule => {
            output += `## ${rule.name}\n\n`;
            if (rule.frontmatter.description) {
                output += `> ${rule.frontmatter.description}\n\n`;
            }
            output += rule.content + '\n\n---\n\n';
        });
    }

    if (conditionalRules.length > 0) {
        output += `# Conditional Rules\n\n`;
        output += `These rules apply to specific file patterns:\n\n`;

        conditionalRules.forEach(rule => {
            output += `## ${rule.name}\n\n`;
            if (rule.frontmatter.description) {
                output += `> ${rule.frontmatter.description}\n\n`;
            }
            if (rule.frontmatter.globs && rule.frontmatter.globs.length > 0) {
                output += `**Applies to:** \`${rule.frontmatter.globs.join('`, `')}\`\n\n`;
            }
            output += rule.content + '\n\n---\n\n';
        });
    }

    return output;
}

function syncRules(config) {
    const { baseDir, source, targets } = config;
    const paths = getPaths(baseDir);

    console.log(`🔄 Syncing AI rules (Source: ${source})...\n`);

    if (!fs.existsSync(paths.rulesDir)) {
        console.error('❌ Error: .cursor/rules directory not found!');
        if (require.main === module) process.exit(1);
        throw new Error('.cursor/rules directory not found!');
    }

    const rules = [];
    const ruleDirs = fs.readdirSync(paths.rulesDir);

    for (const ruleDir of ruleDirs) {
        const ruleDirPath = path.join(paths.rulesDir, ruleDir);
        const stats = fs.statSync(ruleDirPath);

        if (stats.isDirectory()) {
            const ruleFilePath = path.join(ruleDirPath, 'RULE.md');

            if (fs.existsSync(ruleFilePath)) {
                const { frontmatter, content } = parseRuleFile(ruleFilePath);
                rules.push({ name: ruleDir, path: ruleFilePath, frontmatter, content });
            }
        }
    }
    // ... (Use `rules` to sync based on `targets` and `paths`) ...

    if (rules.length === 0) {
        console.log('⚠️  No rules found in .cursor/rules/');
        console.log('   Create rule directories with RULE.md files to get started.\n');
        return;
    }

    console.log(`📋 Found ${rules.length} rule(s):\n`);
    rules.forEach(rule => {
        const globs = rule.frontmatter.globs ? ` (${rule.frontmatter.globs.length} pattern(s))` : '';
        const always = rule.frontmatter.alwaysApply ? ' [always]' : '';
        console.log(`   • ${rule.name}${globs}${always}`);
    });
    console.log();

    let successCount = 0;
    let errorCount = 0;

    // 1. Sync to GitHub Copilot
    if (targets.includes('copilot')) {
        console.log('📝 Syncing to GitHub Copilot...');
        try {
            ensureDirectoryExists(paths.targets.copilot);

            // Create individual instruction files
            rules.forEach(rule => {
                const filename = `${rule.name}.instructions.md`;
                const filepath = path.join(paths.targets.copilot, filename);
                const content = createCopilotInstruction(rule);
                fs.writeFileSync(filepath, content, 'utf8');
            });

            // Create consolidated file
            ensureDirectoryExists(path.dirname(paths.consolidated.copilot));
            const consolidatedContent = createConsolidatedFile(rules, 'copilot', source);
            fs.writeFileSync(paths.consolidated.copilot, consolidatedContent, 'utf8');

            console.log(`   ✓ Created ${rules.length} instruction file(s) in .github/instructions/`);
            console.log(`   ✓ Created consolidated .github/copilot-instructions.md`);
            successCount++;
        } catch (error) {
            console.error(`   ✗ Error: ${error.message}`);
            errorCount++;
        }
    }

    // 2. Sync to Claude Code
    if (targets.includes('claude')) {
        console.log('📝 Syncing to Claude Code...');
        try {
            ensureDirectoryExists(paths.targets.claudeCode);

            // Create individual rule files
            rules.forEach(rule => {
                const filename = `${rule.name}.md`;
                const filepath = path.join(paths.targets.claudeCode, filename);
                const content = createClaudeCodeRule(rule);
                fs.writeFileSync(filepath, content, 'utf8');
            });

            // Create consolidated CLAUDE.md
            ensureDirectoryExists(path.dirname(paths.consolidated.claudeCode));
            const consolidatedContent = createConsolidatedFile(rules, 'claude', source);
            fs.writeFileSync(paths.consolidated.claudeCode, consolidatedContent, 'utf8');

            console.log(`   ✓ Created ${rules.length} rule file(s) in .claude/rules/`);
            console.log(`   ✓ Created consolidated .claude/CLAUDE.md`);
            successCount++;
        } catch (error) {
            console.error(`   ✗ Error: ${error.message}`);
            errorCount++;
        }
    }

    // 3. Sync to Google Antigravity
    if (targets.includes('antigravity')) {
        console.log('📝 Syncing to Google Antigravity...');
        try {
            ensureDirectoryExists(paths.targets.antigravity);

            // Create individual rule files
            rules.forEach(rule => {
                const filename = `${rule.name}.md`;
                const filepath = path.join(paths.targets.antigravity, filename);
                const content = createAntigravityRule(rule);
                fs.writeFileSync(filepath, content, 'utf8');
            });

            // Create consolidated GEMINI.md
            ensureDirectoryExists(path.dirname(paths.consolidated.antigravity));
            const consolidatedContent = createConsolidatedFile(rules, 'antigravity', source);
            fs.writeFileSync(paths.consolidated.antigravity, consolidatedContent, 'utf8');

            console.log(`   ✓ Created ${rules.length} rule file(s) in .agent/rules/`);
            console.log(`   ✓ Created consolidated .gemini/GEMINI.md`);
            successCount++;
        } catch (error) {
            console.error(`   ✗ Error: ${error.message}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Sync complete: ${successCount} succeeded, ${errorCount} failed\n`);
}

// ...

// Main execution
if (require.main === module) {
    // Check if yaml package is installed
    try {
        require.resolve('yaml');
    } catch (e) {
        console.error('❌ Error: "yaml" package not found!');
        console.error('   Install it with: npm install yaml\n');
        process.exit(1);
    }

    try {
        const config = parseArgs(process.argv.slice(2));
        if (config.isWatchMode) {
            console.log('👀 Watching rules directory for changes...');
            console.log('Press Ctrl+C to stop\n');
            syncRules(config);
            // Watch logic...
            const rulesDir = path.join(config.baseDir, '.cursor', 'rules');
            let timeoutId;
            if (fs.existsSync(rulesDir)) {
                fs.watch(rulesDir, { recursive: true }, (eventType, filename) => {
                    if (filename && filename.endsWith('RULE.md')) {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            console.log(`\n📝 Change detected: ${filename}`);
                            syncRules(config);
                        }, 500);
                    }
                });
            }
        } else {
            syncRules(config);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = {
    parseArgs,
    createCopilotInstruction,
    createClaudeCodeRule,
    createAntigravityRule,
    createConsolidatedFile,
    syncRules
};
