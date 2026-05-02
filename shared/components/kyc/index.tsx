import { View, Text } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';

interface KycHeaderProps {
  title: string;
  showBar?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const KycHeader = ({
  title,
  showBar = false,
  currentStep = 1,
  totalSteps = 5,
}: KycHeaderProps) => {
  const { paddingTop } = useSafePadding();

  const renderStepIndicator = () => {
    if (!showBar) return null;

    const dots = [];
    for (let i = 1; i <= totalSteps; i++) {
      const isCompleted = i < currentStep;
      const isCurrent = i === currentStep;

      // Style based on step state
      let dotStyle = 'h-[3px] w-6 rounded-[10px]';

      if (isCompleted || isCurrent) {
        // Completed or current step - filled dark dot
        dotStyle += ' bg-[#1d1d1d]';
      } else {
        // Upcoming step - light background dot
        dotStyle += ' bg-[rgba(29,29,29,0.1)]';
      }

      dots.push(<View key={i} className={dotStyle} />);

      // Add spacing between dots (except after the last one)
      if (i < totalSteps) {
        dots.push(<View key={`spacing-${i}`} className="w-2" />);
      }
    }

    return <View className="mt-3 flex-row items-center">{dots}</View>;
  };

  return (
    <View style={{ paddingTop }} className="items-center bg-[#00C897] px-6 pb-8">
      <Text className="mt-6 text-center text-[24px] font-bold text-[#0D2B1E]">{title}</Text>
      {renderStepIndicator()}
    </View>
  );
};

export const KycCard = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4]">{children}</View>
);
