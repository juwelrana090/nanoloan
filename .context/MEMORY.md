# Memory Index — nanoloan
**Created:** 2026-05-20
**Purpose:** Navigation index for AI agents

## Memory System Files (.claude/memory/)

### Core Memory
- [Architecture](../.claude/memory/architecture.md) - Stack, folder structure, system layers, data flow, auth flow
- [Rules](../.claude/memory/rules.md) - Naming conventions, import rules, function rules, error handling, testing rules
- [Patterns](../.claude/memory/patterns.md) - Established code patterns with examples
- [Dependencies](../.claude/memory/dependencies.md) - Module dependency map, shared utilities, high risk modules
- [Context](../.claude/memory/context.md) - Project purpose, target users, success criteria, must-never-break
- [Gotchas](../.claude/memory/gotchas.md) - Known traps and footguns
- [Decisions](../.claude/memory/decisions.md) - Architecture decision log

### Index & Version
- [Memory Index](../.claude/memory/INDEX.md) - Memory system directory structure
- [VERSION](../.claude/memory/VERSION) - Memory system version info (v1.1.0)

## Module Documentation (.claude/modules/)

- [Auth Module](../.claude/modules/auth.md) - Authentication, registration, profile management
- [Bank Module](../.claude/modules/bank.md) - Bank accounts, transactions, account selection
- [Loan Module](../.claude/modules/loan.md) - Loan eligibility, applications, management
- [KYC Module](../.claude/modules/kyc.md) - ID verification, address proof, facial recognition
- [Home Module](../.claude/modules/home.md) - Home screen logic, biometric status, account switching
- [Login Module](../.claude/modules/login.md) - Login flow, credential validation

## Context Files (.context/)

### Project Documentation
- [CLAUDE.md](CLAUDE.md) - Claude Code agent instructions
- [AGENTS.md](AGENTS.md) - Project rules, tech stack, API reference, screen inventory
- [PROJECT_STRUCTURE_AND_SUMMARY.md](PROJECT_STRUCTURE_AND_SUMMARY.md) - Detailed project structure

### State & API
- [State Management](state.md) - Redux state structure, slices, persistence
- [API Contracts](api-contracts-task03.md) - API endpoint contracts

### Screen Documentation
- [KYC Screens](screens-kyc.md) - KYC flow screen documentation

### Troubleshooting
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

### Session & History
- [Task Completion Summary](TASK_COMPLETION_SUMMARY.md) - Completed tasks log
- [Session Summary](SESSION-SUMMARY.md) - Session summaries
- [Conversation History](CONVERSATION_HISTORY.md) - Conversation logs

### Build & Setup
- [Android Signing Setup](ANDROID_SIGNING_SETUP.md) - Android build signing configuration
- [Expo Prebuild Setup](EXPO_PREBUILD_SETUP.md) - Expo prebuild configuration
- [Build Fix Summary](BUILD_FIX_SUMMARY.md) - Build issues and fixes

## Key Project Files Reference

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `app.json` - Expo app configuration
- `babel.config.js` - Babel configuration

### Redux Setup
- `shared/libs/redux/store.ts` - Redux store configuration
- `shared/libs/redux/apiSlice.ts` - RTK Query base API setup
- `shared/libs/redux/features/auth/authSlice.ts` - Auth state
- `shared/libs/redux/features/kyc/kycSlice.ts` - KYC state
- `shared/libs/redux/features/bank/bankSlice.ts` - Bank state
- `shared/libs/redux/features/auth/authApi.ts` - Auth API endpoints
- `shared/libs/redux/features/bank/bankApi.ts` - Bank API endpoints
- `shared/libs/redux/features/loan/loanApi.ts` - Loan API endpoints

### Screens
- `app/(tabs)/index.tsx` - Home screen
- `app/auth/login.tsx` - Login screen
- `app/auth/register.tsx` - Registration screen
- `app/kyc/started.tsx` - KYC start screen
- `app/kyc/id-capture.tsx` - ID card capture
- `app/kyc/facial-recognition.tsx` - Facial recognition
- `app/bank/accounts.tsx` - Bank accounts list
- `app/loans/my-loans.tsx` - My loans list

### Shared Code
- `shared/hooks/useAppSelector.ts` - Type-safe Redux hooks
- `shared/hooks/useToast.ts` - Toast notifications
- `shared/hooks/useSafePadding.ts` - Safe area padding
- `shared/config/index.ts` - API URL configuration
- `shared/libs/types/auth.types.ts` - Auth type definitions

## Tech Stack Summary

**Core:** React Native 0.81.5, Expo 54, React 19.1, TypeScript 5.9
**State:** Redux Toolkit 2.11, Redux Persist 6.0, RTK Query
**UI:** NativeWind (Tailwind), Expo Vector Icons, Gesture Handler, Reanimated
**Storage:** AsyncStorage 2.2, Firebase 12.10
**Features:** Expo Camera, ML Kit OCR, Toast Message

## API Endpoints Summary

**Base URL:** https://backend-nanoloan.giize.com/v1

**Auth:** `/auth/*` - Login, register, email verification, password reset
**User:** `/users/me/*` - Profile, addresses, basic info
**Bank:** `/bank/accounts/*` - Account list, details, transactions
**Loan:** `/loans/*` - Eligibility, application, management
**Biometric:** `/biometric/*` - KYC verification status

## Last Updated
2026-05-20 — Full memory scan completed, version bumped to 1.1.0

