# RulePort
> **Write Once, Run Anywhere.** 

Manage your AI assistant rules in one place and sync them across all your tools.

RulePort handles the translation and synchronization of context, coding standards, and project rules between different AI assistants. Instead of maintaining separate `.cursorrules`, `.github/copilot-instructions.md`, and `.claude/rules/` configs, you define them once and let this tool handle the rest.

## 🔌 Supported Assistants

| Source \ Target | Claude Code | Cursor | GitHub Copilot | Google Antigravity | Kiro | Windsurf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Claude Code** | - | 🚧 | 🚧 | 🚧 | 🚧 | 🚧 |
| **Cursor** | ✅ | - | ✅ | ✅ | 🚧 | 🚧 |
| **GitHub Copilot** | 🚧 | 🚧 | - | 🚧 | 🚧 | 🚧 |
| **Google Antigravity** | 🚧 | 🚧 | 🚧 | - | 🚧 | 🚧 |
| **Kiro** | 🚧 | 🚧 | 🚧 | 🚧 | - | 🚧 |
| **Windsurf** | 🚧 | 🚧 | 🚧 | 🚧 | 🚧 | - |

> ✅ = Available Now | 🚧 = Coming Soon | - = N/A

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Rules
If you don't have rules yet, create the structure:
```bash
npm run init
```

### 3. Sync to Assistants
Translate your rules to all configured targets:
```bash
npm run sync
```

## ⚙️ Options

You can control the sync process using CLI arguments.

### By Project Path
Sync a specific project directory (useful for monorepos):
```bash
# Using npm
npm run sync -- /path/to/project

# Using node directly
node sync-rules-advanced.js /path/to/project
```

### By Target
Limit sync to specific assistants using the `--target` flag:
```bash
# Sync only to GitHub Copilot
npm run sync -- --target copilot

# Sync to Claude and Antigravity
npm run sync -- --target claude --target antigravity
```
*Available targets*: `copilot`, `claude`, `antigravity`

### Source
Currently, **Cursor** is the only supported source. The tool defaults to reading from `.cursor/rules/`.
```bash
# Optional flag (defaults to cursor)
npm run sync -- --source cursor
```

### Watch Mode
Automatically sync when you change rule files:
```bash
npm run sync:watch
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started, report bugs, or suggest features.
