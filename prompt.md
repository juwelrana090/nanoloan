# task 01.

- NID detection is not working properly. check and fixe it
- NID Front to get :
  -- name
  -- date of birth
  -- NID No
  -- পিতা
  -- মাতা
- NID Back to get :
  -- ঠিকানা
  -- Place of Birth

- Passport Front to get :
  -- Surname
  -- Given Name
  -- Date of Birth
  -- Passport Number
  -- Date of Issue
  -- Date of Expiry

- Passport Back to get :
  -- Permanent Address
  -- Emergency Contact
  --- Address
  --- Telephone No

# task 02.

- ID Capture Screen
  app\kyc\id-capture.tsx is IDCaptureScreen
  image capture only Frame border aria inside
  {/_ Frame border + corners _/}
  <View
  className="absolute z-10 overflow-hidden rounded-xl border-2 border-white/40"
  style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, left: FRAME_LEFT, top: FRAME_TOP }}>
  {/_ Corner accents _/}
  <View className="absolute left-0 top-0 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-[#25d17f]" />
  <View className="absolute right-0 top-0 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-[#25d17f]" />
  <View className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-[#25d17f]" />
  <View className="absolute bottom-0 right-0 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-[#25d17f]" />

          {/* MRZ lines at bottom - as shown in Figma design */}
          <View className="absolute bottom-3 left-3 right-3">
            <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
              {'<'.repeat(44)}
            </Text>
            <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
              {'<'.repeat(44)}
            </Text>
          </View>
        </View>
