import * as fs from 'fs';
import * as path from 'path';
import type { CLIConfig } from '../config/types.js';
import { syncCommand } from './sync.js';
import * as log from '../core/log.js';

/**
 * Execute the watch command.
 * Monitors .cursor/rules/ for changes and re-runs sync.
 * 
 * @param config - CLI configuration
 */
export function watchCommand(config: CLIConfig): void {
    const rulesDir = path.join(config.baseDir, '.cursor', 'rules');

    log.info('👀 Watching rules directory for changes...');
    log.info('Press Ctrl+C to stop\n');

    // Run initial sync
    syncCommand(config);

    // Watch for changes
    if (!fs.existsSync(rulesDir)) {
        log.error('Error: .cursor/rules directory not found!');
        process.exit(1);
    }

    let timeoutId: NodeJS.Timeout | null = null;

    fs.watch(rulesDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('RULE.md')) {
            // Debounce changes
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                log.info(`\n📝 Change detected: ${filename}`);
                syncCommand(config);
            }, 500);
        }
    });
}
