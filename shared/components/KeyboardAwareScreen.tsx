import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ViewStyle,
  StyleSheet,
  ScrollViewProps,
} from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';

interface KeyboardAwareScreenProps {
  children: ReactNode;
  /** backgroundColor for the outer KeyboardAvoidingView (default: transparent) */
  backgroundColor?: string;
  /** Extra bottom padding inside scroll content. Defaults to scrollPaddingBottom from useSafePadding. */
  extraScrollPadding?: number;
  /** Horizontal padding for scroll content (default: 0 — manage in children) */
  paddingHorizontal?: number;
  /** Pass-through props to the inner ScrollView */
  scrollViewProps?: ScrollViewProps;
  /** Disable the ScrollView wrapper — use when screen manages its own scroll (e.g. FlatList) */
  noScroll?: boolean;
  /** Additional style for the KeyboardAvoidingView */
  style?: ViewStyle;
}

/**
 * Drop-in wrapper that fixes ALL keyboard UX issues:
 *
 * 1. ✅ Auto-scrolls active input above keyboard (KeyboardAvoidingView)
 * 2. ✅ Tapping outside any input dismisses the keyboard (TouchableWithoutFeedback)
 * 3. ✅ Tapping buttons inside ScrollView still works (keyboardShouldPersistTaps="handled")
 * 4. ✅ Bottom padding auto-adjusts for system nav bar (scrollPaddingBottom)
 * 5. ✅ Correct behavior on both Android and iOS
 *
 * @example — form screen
 * ```tsx
 * <KeyboardAwareScreen>
 *   <TextInput ... />
 *   <TouchableOpacity onPress={submit}>...</TouchableOpacity>
 * </KeyboardAwareScreen>
 * ```
 *
 * @example — screen with its own outer structure
 * ```tsx
 * <View style={{ flex: 1, paddingTop, backgroundColor: '#00C897' }}>
 *   <Header />
 *   <KeyboardAwareScreen backgroundColor="#F0FFF4">
 *     <TextInput ... />
 *   </KeyboardAwareScreen>
 * </View>
 * ```
 */
export const KeyboardAwareScreen = ({
  children,
  backgroundColor = 'transparent',
  extraScrollPadding,
  paddingHorizontal = 0,
  scrollViewProps,
  noScroll = false,
  style,
}: KeyboardAwareScreenProps) => {
  const { scrollPaddingBottom } = useSafePadding();
  const bottomPadding = extraScrollPadding ?? scrollPaddingBottom;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.flex}>
          {noScroll ? (
            children
          ) : (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal,
                paddingBottom: bottomPadding,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              {...scrollViewProps}>
              {children}
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
