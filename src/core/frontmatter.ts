import yaml from 'yaml';

/**
 * Result of parsing a markdown file with YAML frontmatter.
 */
export interface ParsedFrontmatter {
    /** Parsed YAML metadata */
    meta: Record<string, unknown>;

    /** Markdown body content (without frontmatter) */
    body: string;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * 
 * Expects frontmatter to be delimited by `---` at the start and end.
 * If no frontmatter is found or parsing fails, returns empty metadata.
 * 
 * @param content - Raw file content
 * @returns Parsed frontmatter and body
 */
export function parseFrontmatter(content: string): ParsedFrontmatter {
    // Match YAML frontmatter pattern: ---\n...\n---\n
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
        return {
            meta: {},
            body: content,
        };
    }

    try {
        const meta = yaml.parse(frontmatterMatch[1]) as Record<string, unknown>;
        const body = frontmatterMatch[2].trim();

        return {
            meta: meta || {},
            body,
        };
    } catch (error) {
        // If YAML parsing fails, return empty metadata
        console.error(`Error parsing frontmatter: ${error instanceof Error ? error.message : String(error)}`);
        return {
            meta: {},
            body: content,
        };
    }
}
