/**
 * Logging utilities with consistent formatting.
 * Preserves emoji-based output from the JavaScript version.
 */

export function info(message: string): void {
    console.log(message);
}

export function success(message: string): void {
    console.log(`✓ ${message}`);
}

export function warn(message: string): void {
    console.warn(`⚠️  ${message}`);
}

export function error(message: string): void {
    console.error(`❌ ${message}`);
}

export function section(title: string): void {
    console.log(`\n${title}`);
}

export function bullet(message: string): void {
    console.log(`   • ${message}`);
}

export function indent(message: string): void {
    console.log(`   ${message}`);
}
