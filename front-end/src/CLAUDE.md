# Package Manager

<package_manager>
- Always use `pnpm` for package management
- Examples:
  - `pnpm install` (not npm install)
  - `pnpm add <package>` (not npm install <package>)
  - `pnpm remove <package>` (not npm uninstall <package>)
</package_manager>

# Naming Conventions

<file_naming>
- Use kebab-case for all file names
- Examples: `user-profile.ts`, `auth-service.ts`, `api-routes.tsx`
</file_naming>

<code_naming>
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Examples:
  - `function getUserProfile()` ✓
  - `const userId = 123` ✓
  - `const MAX_RETRY_COUNT = 3` ✓
</code_naming>
