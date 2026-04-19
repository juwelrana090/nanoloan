import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import OnBoarding from '@/shared/components/welcome/OnBoarding';
import AfterAuthScreen from '@/shared/components/welcome/AfterAuthScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hasCompletedOnboarding, markOnboardingCompleted } from '@/shared/utils/onboarding';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await hasCompletedOnboarding();
      if (hasCompleted) {
        setStep(2);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = async (newStep: number) => {
    if (newStep === 2 && step === 1) {
      // User is completing onboarding, mark it as done
      await markOnboardingCompleted();
    }
    setStep(newStep);
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#00D09E', '#00D09E']}
        locations={[0.0001, 0.9999]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar style="light" backgroundColor="#00C897" translucent={false} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#00D09E', '#00D09E']}
      locations={[0.0001, 0.9999]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="light" backgroundColor="#00C897" translucent={false} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="flex-1">
        {step === 1 && <OnBoarding setStep={handleStepChange} />}

        {step === 2 && <AfterAuthScreen />}
      </ScrollView>
    </LinearGradient>
  );
}
