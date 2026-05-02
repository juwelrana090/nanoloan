import { View, ViewStyle } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  withTopPadding?: boolean;
  withBottomPadding?: boolean;
  withTabBarPadding?: boolean;
  withModalPadding?: boolean;
}

/**
 * Global screen container component
 * Automatically handles safe areas and system navigation padding
 *
 * @example
 * ```tsx
 * // Basic screen
 * <ScreenContainer>
 *   <Text>My Screen Content</Text>
 * </ScreenContainer>
 *
 * // Screen with status bar and bottom padding
 * <ScreenContainer withTopPadding withBottomPadding>
 *   <Text>Safe Screen</Text>
 * </ScreenContainer>
 *
 * // Tab screen (with tab bar space)
 * <ScreenContainer withTopPadding withTabBarPadding>
 *   <Text>Tab Screen</Text>
 * </ScreenContainer>
 * ```
 */
export const ScreenContainer = ({
  children,
  style,
  backgroundColor = '#F0FFF4',
  withTopPadding = false,
  withBottomPadding = false,
  withTabBarPadding = false,
  withModalPadding = false,
}: ScreenContainerProps) => {
  const { paddingTop, paddingBottom, paddingBottomForTabs, paddingBottomForModal } = useSafePadding();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: withTopPadding ? paddingTop : 0,
    paddingBottom: withTabBarPadding
      ? paddingBottomForTabs
      : withModalPadding
        ? paddingBottomForModal
        : withBottomPadding
          ? paddingBottom
          : 0,
    ...style,
  };

  return <View style={containerStyle}>{children}</View>;
};
