# Rules — Non Negotiable
> Last updated: 2026-05-20 by /r-memory scan

## Naming Conventions

✅ **DO:**
- Use camelCase for variables and functions (`maskAccountNumber`, `formatTaka`)
- Use PascalCase for components (`HomeScreen`, `KeyboardAwareScreen`)
- Use kebab-case for file names (`id-capture-preview.tsx`, `auth-api.ts`)
- Use UPPER_SNAKE_CASE for constants (`STORAGE_KEYS`, `API_URL`)
- Use descriptive names that indicate purpose (`selectedAccountId` not `id`)
- Prefix boolean variables with `is`, `has`, `should` (`isLoading`, `isPrimary`)

❌ **DON'T:**
- Use single-letter variable names except in loop iterators
- Use abbreviations unless widely known (`btn` not `button`)
- Mix naming conventions in the same file
- Use `data` or `temp` as variable names

## Import Rules

✅ **DO:**
- Group imports in this order: React → Third-party → Internal → Types → Styles
- Use destructured imports from React Native (`import { View, Text } from 'react-native'`)
- Use path aliases (`@/shared/hooks/useAppSelector`)
- Use named exports for utilities and hooks
- Use type-only imports when possible (`import type { User } from './types'`)

❌ **DON'T:**
- Use default exports for components (use named exports)
- Import from `../../` - use path aliases instead
- Mix default and named imports from the same module
- Import unused dependencies

## Function Rules

✅ **DO:**
- Use arrow functions for component handlers
- Use explicit return types on RTK endpoints
- Use `async/await` for async operations
- Destructure parameters in function definitions
- Keep functions under 50 lines when possible

❌ **DON'T:**
- Use `var` keyword (use `const` or `let`)
- Create deeply nested functions (extract instead)
- Mix promises and async/await in same function
- Use `any` except FormData file objects (`as any`)

## Error Handling

✅ **DO:**
- Wrap API calls in try-catch blocks
- Use type assertions for error objects (`error as { status?: number; data?: { message?: string } }`)
- Show user-friendly error messages via toast
- Log errors with console.error for debugging
- Handle 422 validation errors with inline field errors

❌ **DON'T:**
- Throw errors directly to user (show toast instead)
- Use `any` for error types
- Silently catch errors without logging
- Show raw error messages to users

## Testing Rules

✅ **DO:**
- Write unit tests for utility functions
- Test error cases alongside happy paths
- Use descriptive test names (`should return masked account number`)

❌ **DON'T:**
- Test implementation details
- Write tests without fixing them first
- Skip tests without documenting why

## Forbidden Patterns

❌ **NEVER:**
- Use `console.log` for user-facing messages (use toast)
- Hardcode API URLs (use `shared/config`)
- Store tokens in plain text (use AsyncStorage)
- Commit secrets or API keys
- Use `any` unless absolutely necessary (FormData only)
- Skip TypeScript errors with `@ts-ignore`
- Use `StyleSheet.create` (use NativeWind classes)
- Directly manipulate Redux state outside reducers
- Call hooks conditionally or in loops

## Environment Variables

✅ **DO:**
- Use `EXPO_PUBLIC_` prefix for public env vars
- Provide default values for env vars
- Document required env vars in README
- Use different env vars for dev/staging/prod

❌ **DON'T:**
- Commit .env files to git
- Use env vars for secrets (use secure storage)
- Hardcode env values in code
