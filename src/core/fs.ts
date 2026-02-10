import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure a directory exists, creating it recursively if needed.
 * 
 * @param dirPath - Absolute path to the directory
 */
export function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Write content to a file atomically.
 * Creates parent directories if they don't exist.
 * 
 * @param filePath - Absolute path to the file
 * @param content - Content to write
 */
export function writeFileAtomic(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    ensureDirectoryExists(dir);
    fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Read a file if it exists, otherwise return null.
 * 
 * @param filePath - Absolute path to the file
 * @returns File content or null if file doesn't exist
 */
export function readFileIfExists(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if a path exists and is a directory.
 * 
 * @param dirPath - Path to check
 * @returns True if path exists and is a directory
 */
export function isDirectory(dirPath: string): boolean {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

/**
 * Read all subdirectories in a directory.
 *
 * @param dirPath - Directory to read
 * @returns Array of subdirectory names
 */
export function readSubdirectories(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs.readdirSync(dirPath).filter(name => {
        const fullPath = path.join(dirPath, name);
        return isDirectory(fullPath);
    });
}

/**
 * Read all filenames in a directory (non-recursive, files only).
 *
 * @param dirPath - Directory to read
 * @returns Array of filenames (not full paths)
 */
export function readFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs.readdirSync(dirPath).filter(name => {
        const fullPath = path.join(dirPath, name);
        return !isDirectory(fullPath);
    });
}
