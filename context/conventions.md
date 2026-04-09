# Conventions

## Module Structure
Every feature lives in `modules/<feature>/` with:
- `components/` — UI components used only by this module
- `actions/` — imperative logic / thunks
- `hooks/` — RTK Query hooks wrapped with local state (loading, error, success)
- `types/` — TypeScript interfaces derived from Swagger docs

Screens (e.g., `app/auth/login.tsx`) live **outside** the module folder and import from it.

## API Layer
- All RTK Query auth endpoints → `shared/libs/redux/features/auth/authApi.ts`
- Base URL → `shared/config/index.ts` → `apiUrl`; never hardcode
- baseQuery in `apiSlice.ts` appends `/v1` to the base URL, so endpoint paths start with `/auth/...`

## TypeScript Types
- Request/response interfaces are derived from Swagger docs (exact field names, case-sensitive)
- Required fields have no `?`; optional fields use `?`
- Module-level types live in `modules/<feature>/types/`
- Shared user types live in `shared/libs/types/user.types.ts`

## Styling
- NativeWind (Tailwind) utility classes via `className` prop
- Brand color: `#00C897` (primary green)
- Card background: `#F0FFF4`
- Input background: `#E4F7EE`
- Text primary: `#1A1A1A`, secondary: `#888`

## Navigation
- Uses `expo-router` file-based routing
- Auth routes: `app/auth/*`
- Tabs: `app/(tabs)/*`
- After login → `/(tabs)`; after register → `/auth/email-otp-verification`
