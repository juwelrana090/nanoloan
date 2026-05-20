# Gotchas
> Last updated: 2026-05-20 by /r-memory scan

#### Redux Persist — Async State Rehydration
- **What Happens**: App shows blank state on first load, then flickers when persisted state loads
- **Why**: AsyncStorage is async, state rehydration happens after initial render
- **How to Avoid**: Show loading spinner while auth state is being rehydrated, check `isAuthenticated` after rehydration complete
- **Discovered**: 2026-05-20

#### RTK Query — Token Missing on First Request
- **What Happens**: First API call after login fails with 401 because token not yet in AsyncStorage
- **Why**: `prepareHeaders` reads from AsyncStorage but token was just set to Redux, not AsyncStorage
- **How to Avoid**: Set token to AsyncStorage immediately after login, or read from Redux state in `prepareHeaders` (current implementation does both)
- **Discovered**: 2026-05-20

#### Expo Router — Type Safety Loss
- **What Happens**: `router.push('/some-route')` loses type safety, requires `as any` cast
- **Why**: Expo Router types not fully compatible with strict TypeScript
- **How to Avoid**: Use `as any` for route strings, ensure route exists in `app/` directory
- **Discovered**: 2026-05-20

#### NativeWind — Platform-Specific Styles
- **What Happens**: Styles work on iOS but not Android (or vice versa)
- **Why**: Tailwind classes have different behavior on different platforms
- **How to Avoid**: Test on both platforms, use Platform-specific code when needed
- **Discovered**: 2026-05-20

#### Error Type Casting — Runtime Errors
- **What Happens**: `error as { status?: number }` compiles but crashes at runtime if error is null
- **Why**: Type assertions don't guarantee runtime safety
- **How to Avoid**: Always check if error exists before accessing properties: `error?.status`
- **Discovered**: 2026-05-20

#### Firebase — Production vs Development Config
- **What Happens**: Firebase uses wrong project (dev instead of prod)
- **Why**: Firebase config not environment-aware
- **How to Avoid**: Use different Firebase configs for dev/staging/prod, set via env vars
- **Discovered**: 2026-05-20

#### Bottom Sheet — PanResponder Conflicts
- **What Happens**: Bottom sheet doesn't close when dragging down on some devices
- **Why**: PanResponder gesture threshold too high, conflicts with ScrollView
- **How to Avoid**: Set appropriate gesture thresholds, test on physical devices
- **Discovered**: 2026-05-20

#### Camera Permissions — Denied Forever
- **What Happens**: App can't access camera after user denies permission once
- **Why**: Android's "Don't ask again" option prevents future permission requests
- **How to Avoid**: Show explanatory screen before requesting permission, handle denial gracefully
- **Discovered**: 2026-05-20

#### ML Kit OCR — Poor Quality Images
- **What Happens**: OCR returns empty or garbled text for blurry/low-light photos
- **Why**: ML Kit requires clear, well-lit images for accurate text extraction
- **How to Avoid**: Add image quality checks, guide users to retake if quality is poor
- **Discovered**: 2026-05-20

#### AsyncStorage — Storage Limits
- **What Happens**: App crashes when trying to store large images in AsyncStorage
- **Why**: AsyncStorage has 6MB limit per app
- **How to Avoid**: Store images in filesystem, store only URIs in AsyncStorage
- **Discovered**: 2026-05-20

#### Navigation — State Loss on Back
- **What Happens**: Form data lost when user presses back button
- **Why**: Expo Router unmounts screen on back navigation
- **How to Avoid**: Store form data in Redux or use navigation state persistence
- **Discovered**: 2026-05-20
