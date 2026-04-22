# Task: Implement `facial-recognition.tsx` — KYC Facial Recognition Screen

## Context

You are working on a **React Native Expo KYC flow** (TypeScript, NativeWind/Tailwind CSS).
The project uses `expo-router`, `expo-camera`, `expo-face-detector`, `expo-image-manipulator`,
`expo-image`, `react-redux`, and `react-native-svg`.
Redux slice is at `@/shared/libs/redux/features/kyc/kycSlice` and must expose `setFaceImage`.
Route after success: `/kyc/verified`.

---

## Objective

Replace the existing static `facial-recognition.tsx` with a **fully working** screen that:

1. Opens the **front-facing live camera** via `expo-camera` `CameraView`
2. Runs **real-time face detection** via `expo-face-detector` `onFacesDetected`
3. Enforces a **3-step liveness check** to reject spoofed / non-human images
4. **Auto-captures** when liveness is complete
5. Shows a **success screen** with the cropped face preview before proceeding

---

## Install (if not already present)

```bash
npx expo install expo-face-detector
```

---

## Screen states (implement all)

| State       | Meaning                                        |
| ----------- | ---------------------------------------------- |
| `waiting`   | No face detected — show idle oval              |
| `detected`  | Face found but not centered or wrong size      |
| `centered`  | Face correctly positioned — liveness running   |
| `capturing` | `takePictureAsync` in progress                 |
| `success`   | Photo captured — show preview + Continue btn   |
| `no_face`   | Capture succeeded but post-check found no face |

---

## Liveness check (anti-spoof — implement exactly in this order)

```
step 1 → "center"  : face must be centered in oval
step 2 → "left"    : yawAngle > +15° (user turns left)
step 3 → "right"   : yawAngle < -15° (user turns right)
step 4 → "done"    : back to center  → trigger autoCapture()
```

- Track progress with a `useRef<LivenessStep>` (NOT useState alone — avoids stale closure in callback)
- Show animated progress dots: ●●● advancing as steps complete
- A photo of a photo cannot pass this — it cannot physically rotate

---

## Face centering rules (`isFaceCentered`)

```ts
const OVAL_W = SW * 0.62;
const OVAL_H = OVAL_W * 1.28;
const OVAL_CX = SW / 2;
const OVAL_CY = SH * 0.38;

// Face center must be within ±60px horizontal, ±80px vertical of oval center
// Face width must be between 45% and 110% of OVAL_W
```

Use `face.bounds` from `FaceDetector.FaceFeature`. If multiple faces detected, use the largest.

---

## Oval mask (SVG fillRule="evenodd")

Render a dark overlay with a transparent oval cutout using `react-native-svg`:

```tsx
<Svg width={SW} height={SH} style={absoluteFill} pointerEvents="none">
  <Path
    d={`M 0 0 L ${SW} 0 L ${SW} ${SH} L 0 ${SH} Z
        M ${OVAL_CX} ${OVAL_CY}
        m ${-OVAL_W / 2} 0
        a ${OVAL_W / 2} ${OVAL_H / 2} 0 1 0 ${OVAL_W} 0
        a ${OVAL_W / 2} ${OVAL_H / 2} 0 1 0 ${-OVAL_W} 0`}
    fill="rgba(0,0,0,0.55)"
    fillRule="evenodd"
  />
  <Ellipse
    cx={OVAL_CX}
    cy={OVAL_CY}
    rx={OVAL_W / 2}
    ry={OVAL_H / 2}
    fill="none"
    stroke={borderColor}
    strokeWidth={2.5}
    strokeDasharray={isDashed ? '8 6' : undefined}
  />
</Svg>
```

Oval border color rules:

- `waiting` → `rgba(255,255,255,0.4)` + dashed
- `detected` → `rgba(255,255,255,0.9)` + dashed
- `centered` / `success` → `#00C897` + solid
- `no_face` → `#EF5350` + solid

---

## Pan responder / ref rules

- `cameraRef = useRef<CameraView>(null)` — attach to `<CameraView ref={cameraRef} />`
- `livenessRef = useRef<LivenessStep>('center')` — single source of truth for liveness state
- `statusRef = useRef<Status>('waiting')` — prevents stale closure in `onFacesDetected`
- `lastCaptureTime = useRef(0)` — debounce, reject calls within 3000ms of last capture
- PanResponders (if needed) must be created with `useRef(PanResponder.create(...))` — NEVER inside useMemo with state deps

---

## autoCapture() implementation

```ts
const autoCapture = useCallback(async () => {
  if (Date.now() - lastCaptureTime.current < 3000) return;
  lastCaptureTime.current = Date.now();
  if (!cameraRef.current || capturing) return;

  setCapturing(true);
  setStatus('capturing');
  statusRef.current = 'capturing';

  const photo = await cameraRef.current.takePictureAsync({ quality: 0.92, base64: false });
  if (!photo?.uri) throw new Error('No URI');

  // Crop to face oval area
  const cropW = Math.round(OVAL_W * 1.1);
  const cropX = Math.round(OVAL_CX - cropW / 2);
  const cropY = Math.round(OVAL_CY - OVAL_H * 0.6);

  const cropped = await manipulateAsync(
    photo.uri,
    [
      {
        crop: {
          originX: Math.max(0, cropX),
          originY: Math.max(0, cropY),
          width: cropW,
          height: Math.round(OVAL_H * 1.2),
        },
      },
    ],
    { compress: 0.9, format: SaveFormat.JPEG }
  );

  dispatch(setFaceImage(cropped.uri));
  setCapturedUri(cropped.uri);
  setStatus('success');
  statusRef.current = 'success';
}, [capturing, dispatch]);
```

---

## UI layout (all Tailwind/NativeWind — NO StyleSheet except `absoluteFillObject`)

```
┌─────────────────────────────┐
│  ← back     [Facial Recog]  │  ← top bar, bg-black/40 pill
├─────────────────────────────┤
│                             │
│   "Look straight ahead"     │  ← instruction above oval
│                             │
│      ╭───────────╮          │
│      │           │          │  ← oval cutout (SVG mask)
│      │  (camera) │          │
│      │           │          │
│      ╰───────────╯          │
│                             │
│   ● ● ●  [status pill]      │  ← progress dots + status
│                             │
├─────────────────────────────┤
│      ○  shutter button      │  ← enabled only when centered
│  Tips: well-lit, no hat...  │
└─────────────────────────────┘
```

**Shutter button** — disabled (white/30) when `waiting` or `detected`. Enabled (green) when `centered` or liveness `done`. Shows `ActivityIndicator` while `capturing`.

**Pulsing ring** — `Animated.Value` opacity loop (0→1→0, 1000ms) on an absolute `View` slightly larger than the oval. Only visible when `status === 'centered'`.

---

## Success screen (separate JSX branch)

Show when `status === 'success' && capturedUri`:

- Blurred background from `capturedUri` (`blurRadius={8}`)
- Circular face preview (`180×180`, `rounded-full`, `border-4 border-[#00C897]`)
- Green checkmark badge below
- "Face Verified" heading
- `Continue` button → `router.push('/kyc/verified')`
- `Retake` button → reset all state back to `waiting`

---

## Permission screen

If `!permission.granted`:

- Show a centred card with camera icon, explanation text
- `Grant Permission` button → `requestPermission()`

---

## Redux — add to kycSlice if missing

```ts
// In kycSlice state:
faceImageUri: null as string | null,

// In reducers:
setFaceImage: (state, action: PayloadAction<string>) => {
  state.faceImageUri = action.payload;
},
```

Export `setFaceImage` from the slice.

---

## Critical rules

- **DO NOT** use `StyleSheet.create` for anything except `absoluteFillObject`
- **DO NOT** recreate pan responders inside `useMemo` with state deps
- **DO NOT** read `crop` / `status` / `livenessStep` state directly inside `useCallback` — always read from `useRef` mirrors
- **ALWAYS** guard `cameraRef.current` before calling `takePictureAsync`
- **ALWAYS** call `setCapturing(false)` in a `finally` block
- `onFacesDetected` fires every 150ms — keep it synchronous and fast, no awaits inside
- Image must be `contentFit="cover"` with explicit `style={{ width, height }}` — never `className="absolute inset-0"` on `expo-image`

---

## File to create

`app/kyc/facial-recognition.tsx`

Write the complete file. No partial snippets. No placeholder comments like `// implement this`.
Every branch must be fully implemented.
