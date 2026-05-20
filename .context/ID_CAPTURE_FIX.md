# ID Capture State Management Fix

## Problem Description

**Issue**: When capturing ID card images, capturing one side (front or back) would remove the previously captured image, preventing users from having both front and back images simultaneously needed for backend API submission.

**Root Cause**: 
- Component-level state management with `useState` 
- State loss during navigation between camera and preview screens
- No persistence across screen transitions
- useEffect dependency issues causing state overwrites

## Solution Implementation

### 1. Created Redux KYC Slice
**File**: `shared/libs/redux/features/kyc/kycSlice.ts`

```typescript
export interface KYCState {
  documentType: DocumentType | null;
  frontImageUri: string | null;
  backImageUri: string | null;
  frontData: ExtractedData | null;
  backData: ExtractedData | null;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
}
```

**Key Actions**:
- `setFrontImage(uri)` - Store front image URI
- `setBackImage(uri)` - Store back image URI
- `setFrontData(data)` - Store front extracted data
- `setBackData(data)` - Store back extracted data
- `clearFrontImage()` - Clear front image for retake
- `clearBackImage()` - Clear back image for retake

### 2. Updated Redux Store
**File**: `shared/libs/redux/store.ts`

```typescript
const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,  // Added KYC state
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'kyc'], // Persist both auth and KYC state
};
```

### 3. Refactored ID Capture Preview Screen
**File**: `app/kyc/id-capture-preview.tsx`

**Before** (Component State):
```typescript
const [frontUri, setFrontUri] = useState<string | null>(null);
const [backUri, setBackUri] = useState<string | null>(null);
const [frontData, setFrontData] = useState<ExtractedData | null>(null);
const [backData, setBackData] = useState<ExtractedData | null>(null);
```

**After** (Redux State):
```typescript
// Get KYC state from Redux
const frontUri = useSelector((state: RootState) => state.kyc.frontImageUri);
const backUri = useSelector((state: RootState) => state.kyc.backImageUri);
const frontData = useSelector((state: RootState) => state.kyc.frontData);
const backData = useSelector((state: RootState) => state.kyc.backData);

const dispatch = useDispatch();
```

### 4. Updated Image Processing Logic

**useEffect for new images**:
```typescript
useEffect(() => {
  if (uri) {
    const targetSide = side || currentSide;

    if (targetSide === 'front') {
      // Only update if this is a different image
      if (frontUri !== uri) {
        dispatch(setFrontImage(uri as string));
        extractTextFromImage(uri as string, 'front');
      }
    } else if (targetSide === 'back') {
      // Only update if this is a different image
      if (backUri !== uri) {
        dispatch(setBackImage(uri as string));
        extractTextFromImage(uri as string, 'back');
      }
    }
  }
}, [uri, side]);
```

**extractTextFromImage function**:
```typescript
const extractTextFromImage = async (imageUri: string, side: CaptureSide) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const result = await TextRecognition.recognize(imageUri);
    const text = result.text;
    
    // Parse and validate data...
    const parsedData = parseIDCardData(text);
    
    // Store in Redux based on side
    if (side === 'front') {
      dispatch(setFrontData(parsedData));
    } else {
      dispatch(setBackData(parsedData));
    }
  } catch (err) {
    dispatch(setError('Failed to extract text from image.'));
  } finally {
    dispatch(setLoading(false));
  }
};
```

**handleRetake function**:
```typescript
const handleRetake = (side: CaptureSide) => {
  if (side === 'front') {
    dispatch(clearFrontImage());
    router.push('/kyc/id-capture?side=front');
  } else {
    dispatch(clearBackImage());
    router.push('/kyc/id-capture?side=back');
  }
};
```

## Benefits of This Solution

### 1. **State Persistence**
- Images and data persist across navigation
- Survives component unmounting/remounting
- Survives screen transitions
- Can be persisted to AsyncStorage

### 2. **State Consistency**
- Single source of truth for KYC data
- No state synchronization issues
- Predictable state updates
- Easy debugging with Redux DevTools

### 3. **Better User Experience**
- Users can capture front image
- Navigate to capture back image
- Return to review front image
- Both images are preserved
- Can retake either image without losing the other

### 4. **Scalability**
- Easy to add more KYC steps
- Can add facial recognition state
- Can add address capture state
- All KYC data in one place

### 5. **Backend Integration**
- Easy to prepare final submission payload
- All KYC data accessible from Redux
- Can add validation before submission
- Can track completion progress

## Data Flow

### Capture Flow:
1. User selects document type → `setDocumentType('NID')`
2. User captures front image → Camera navigates with `uri` + `side='front'`
3. Preview screen receives params → `setFrontImage(uri)` + `extractTextFromImage()`
4. Text extraction completes → `setFrontData(parsedData)`
5. User navigates to capture back → Front image preserved in Redux
6. User captures back image → Camera navigates with `uri` + `side='back'`
7. Preview screen receives params → `setBackImage(uri)` + `extractTextFromImage()`
8. Text extraction completes → `setBackData(parsedData)`
9. Both images now available in Redux state

### Submission Flow:
```typescript
// Get all KYC data for API submission
const kycData = {
  frontImage: frontUri,
  backImage: backUri,
  extractedData: {
    ...frontData,
    ...backData
  }
};

// Submit to backend
await api.submitKYC(kycData);
```

## Testing Checklist

✅ **Front Image Capture**
- [ ] Capture front image
- [ ] Navigate to back capture
- [ ] Return to preview
- [ ] Front image still visible

✅ **Back Image Capture**
- [ ] Capture back image
- [ ] Navigate to front capture
- [ ] Return to preview
- [ ] Back image still visible

✅ **Retake Functionality**
- [ ] Retake front image
- [ ] Back image preserved
- [ ] Retake back image
- [ ] Front image preserved

✅ **Data Persistence**
- [ ] Complete KYC flow
- [ ] Close and reopen app
- [ ] Data still available (if persisted)

✅ **Validation**
- [ ] Both images validated
- [ ] No data loss during validation
- [ ] Error handling works correctly

## Future Enhancements

### 1. **Add Facial Recognition State**
```typescript
facialImageUri: string | null;
facialData: FacialData | null;
```

### 2. **Add Address Capture State**
```typescript
presentAddressImageUri: string | null;
permanentAddressImageUri: string | null;
```

### 3. **Add Completion Tracking**
```typescript
completedSteps: string[];
currentProgress: number;
totalSteps: number;
```

### 4. **Add Offline Support**
- Store images locally until submission
- Queue API calls for when online
- Sync state when connection restored

## Related Files

### Created:
- `shared/libs/redux/features/kyc/kycSlice.ts` - KYC state management
- `D:\ReactNative\nanoloan\context\PROJECT_CONTEXT.md` - Project documentation
- `D:\ReactNative\nanoloan\context\ID_CAPTURE_FIX.md` - This file

### Modified:
- `shared/libs/redux/store.ts` - Added KYC reducer to store
- `app/kyc/id-capture-preview.tsx` - Refactored to use Redux state

### Next Steps:
1. Test the implementation thoroughly
2. Add error handling for edge cases
3. Consider adding loading states for better UX
4. Add progress indicators for multi-step KYC process
5. Implement backend API integration
6. Add analytics tracking for KYC completion rates

---

**Status**: ✅ Implemented and Ready for Testing
**Last Updated**: 2025-04-20
**Author**: Claude Code Assistant
