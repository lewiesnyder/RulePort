#!/usr/bin/env node

/**
 * Initialize Cursor Rules Structure
 * 
 * Creates example rule directories to help you get started
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(process.cwd(), '.cursor', 'rules');

const EXAMPLE_RULES = {
    'general-standards': {
        description: 'General coding standards that apply to all files',
        alwaysApply: true,
        globs: [],
        content: `# General Coding Standards

## Code Quality
- Write clean, maintainable, and self-documenting code
- Follow DRY (Don't Repeat Yourself) principle
- Use meaningful names for variables, functions, and classes
- Keep functions small and focused (single responsibility)

## Documentation
- Add comments for complex logic
- Write clear commit messages
- Document public APIs and exported functions

## Error Handling
- Always handle errors gracefully
- Log errors with sufficient context
- Provide user-friendly error messages`
    },
    
    'python-standards': {
        description: 'Python-specific coding standards following PEP 8',
        alwaysApply: false,
        globs: ['**/*.py'],
        content: `# Python Coding Standards

## Style Guide
- Follow PEP 8 style guide
- Maximum line length: 100 characters
- Use 4 spaces for indentation (no tabs)

## Type Hints
- Use type hints for all function parameters and return values
- Use Optional[] for nullable types
- Use Union[] or | for multiple types

## Naming Conventions
- Functions and variables: snake_case
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private methods: _leading_underscore

## Documentation
Use Google-style docstrings:

\`\`\`python
def calculate_total(price: float, tax_rate: float) -> float:
    """
    Calculate the total price including tax.
    
    Args:
        price: Base price before tax
        tax_rate: Tax rate as decimal (e.g., 0.08 for 8%)
        
    Returns:
        Total price with tax applied
        
    Raises:
        ValueError: If price or tax_rate is negative
    """
    if price < 0 or tax_rate < 0:
        raise ValueError("Price and tax rate must be non-negative")
    return price * (1 + tax_rate)
\`\`\`

## Testing
- Write tests using pytest
- Aim for 80%+ coverage
- Use descriptive test names: \`test_should_return_error_when_price_is_negative\``
    },
    
    'typescript-standards': {
        description: 'TypeScript and React coding standards',
        alwaysApply: false,
        globs: ['**/*.ts', '**/*.tsx'],
        content: `# TypeScript/React Standards

## TypeScript Configuration
- Enable strict mode in tsconfig.json
- Use explicit types, avoid \`any\`
- Prefer interfaces over types for object shapes

## React Best Practices
- Use functional components with hooks (no class components)
- Keep components small and focused
- Use custom hooks to share logic
- Implement proper prop types

## Naming Conventions
- Variables & functions: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: PascalCase for components, kebab-case for utilities

## Example Component
\`\`\`typescript
interface UserCardProps {
  name: string;
  email: string;
  onEdit?: () => void;
}

export function UserCard({ name, email, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>{email}</p>
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  );
}
\`\`\`

## JSDoc Comments
\`\`\`typescript
/**
 * Formats a date string to locale format
 * @param date - Date to format
 * @param locale - Locale string (e.g., 'en-US')
 * @returns Formatted date string
 */
function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale);
}
\`\`\``
    },
    
    'sql-standards': {
        description: 'SQL and database migration standards',
        alwaysApply: false,
        globs: ['**/migrations/**/*.sql', '**/db/**/*.sql'],
        content: `# SQL Standards

## Formatting
- Use uppercase for SQL keywords: SELECT, FROM, WHERE
- Use snake_case for table and column names
- Indent nested queries consistently
- One column per line in SELECT statements

## Best Practices
- Always use explicit column names (avoid SELECT *)
- Use meaningful table and column names
- Add indexes for frequently queried columns
- Include foreign key constraints

## Migrations
- Never modify existing migrations
- Make migrations reversible when possible
- Test migrations on a copy of production data
- Include both up and down migrations

## Example
\`\`\`sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Add foreign key constraint
ALTER TABLE posts
ADD CONSTRAINT fk_posts_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
\`\`\``
    },
    
    'testing-standards': {
        description: 'Testing standards and best practices',
        alwaysApply: false,
        globs: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/test_*.py'],
        content: `# Testing Standards

## General Principles
- Write tests for all new features and bug fixes
- Aim for 80%+ code coverage
- Test edge cases and error scenarios
- Keep tests independent and repeatable

## Test Structure (AAA Pattern)
1. **Arrange**: Set up test data and conditions
2. **Act**: Execute the code being tested
3. **Assert**: Verify the results

## Naming Conventions
- Use descriptive names: \`test_should_return_error_when_price_is_negative\`
- Group related tests in describe/context blocks
- Make test names readable as documentation

## What to Test
✅ Business logic and calculations
✅ API endpoints and request handling
✅ Error handling and validation
✅ Edge cases and boundary conditions
❌ Simple getters/setters
❌ Framework code (unless extending)

## Example (Jest/TypeScript)
\`\`\`typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        email: '[email protected]',
        username: 'johndoe'
      };
      
      // Act
      const user = await userService.createUser(userData);
      
      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw error when email is invalid', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        username: 'johndoe'
      };
      
      // Act & Assert
      await expect(userService.createUser(invalidData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
\`\`\``
    }
};

function createRule(ruleName, ruleData) {
    const ruleDir = path.join(RULES_DIR, ruleName);
    const ruleFile = path.join(ruleDir, 'RULE.md');
    
    // Create directory
    if (!fs.existsSync(ruleDir)) {
        fs.mkdirSync(ruleDir, { recursive: true });
    }
    
    // Create frontmatter
    let frontmatter = '---\n';
    frontmatter += `description: "${ruleData.description}"\n`;
    
    if (ruleData.globs && ruleData.globs.length > 0) {
        frontmatter += 'globs:\n';
        ruleData.globs.forEach(glob => {
            frontmatter += `  - "${glob}"\n`;
        });
    }
    
    frontmatter += `alwaysApply: ${ruleData.alwaysApply}\n`;
    frontmatter += '---\n\n';
    
    // Write file
    const content = frontmatter + ruleData.content;
    fs.writeFileSync(ruleFile, content, 'utf8');
    
    return ruleFile;
}

function initRulesStructure() {
    console.log('🚀 Initializing Cursor rules structure...\n');
    
    // Check if rules directory exists
    if (fs.existsSync(RULES_DIR)) {
        console.log('📁 .cursor/rules directory already exists');
        
        const existing = fs.readdirSync(RULES_DIR).filter(f => {
            const stat = fs.statSync(path.join(RULES_DIR, f));
            return stat.isDirectory();
        });
        
        if (existing.length > 0) {
            console.log(`   Found ${existing.length} existing rule(s): ${existing.join(', ')}`);
            console.log('\n⚠️  To avoid overwriting, only creating missing example rules...\n');
        }
    } else {
        console.log('📁 Creating .cursor/rules directory...\n');
        fs.mkdirSync(RULES_DIR, { recursive: true });
    }
    
    let created = 0;
    let skipped = 0;
    
    // Create example rules
    for (const [ruleName, ruleData] of Object.entries(EXAMPLE_RULES)) {
        const ruleDir = path.join(RULES_DIR, ruleName);
        
        if (fs.existsSync(ruleDir)) {
            console.log(`⏭️  Skipped: ${ruleName} (already exists)`);
            skipped++;
        } else {
            const ruleFile = createRule(ruleName, ruleData);
            console.log(`✅ Created: ${ruleName}`);
            if (ruleData.globs && ruleData.globs.length > 0) {
                console.log(`   Applies to: ${ruleData.globs.join(', ')}`);
            }
            if (ruleData.alwaysApply) {
                console.log(`   Always applies: Yes`);
            }
            created++;
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} rule(s)`);
    if (skipped > 0) {
        console.log(`   ⏭️  Skipped: ${skipped} rule(s) (already exist)`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('   1. Review and customize the rules in .cursor/rules/');
    console.log('   2. Run: npm run sync');
    console.log('   3. Verify: npm run validate\n');
}

// Run initialization
initRulesStructure();
