# NanoLoan — AI Agent Guide

> **READ THIS FILE FIRST** before opening any source file.

## What is this app?

NanoLoan is a React Native (Expo) mobile app for loan management.
Users register, complete KYC verification, and apply for loans.

## How to navigate this context folder

| File                | What it covers                                     |
| ------------------- | -------------------------------------------------- |
| project-overview.md | Stack, dependencies, folder structure              |
| auth.md             | Auth flow, token storage, useAuth hook API         |
| api.md              | HTTP client setup, base URL, how to make API calls |
| state.md            | Global stores, KYC state, user state               |
| screens-kyc.md      | All KYC screens, navigation flow, API connections  |
| error-handling.md   | Toast/alert patterns, loading states               |

## ⛔ Rules for all agents

- **ALWAYS** attach `Authorization: Bearer <token>` for authenticated endpoints
- **NEVER** hardcode the base URL — use the existing constant
- **ALWAYS** read existing screen code before editing it
- **ALWAYS** follow the existing error handling pattern
- **ALWAYS** follow the existing loading state pattern
- **NEVER** add new HTTP libraries — use RTK Query (already configured)
- **ALL** API calls must be typed with TypeScript interfaces
- **USE** existing Redux slices for state management
- **FOLLOW** the existing file naming conventions
