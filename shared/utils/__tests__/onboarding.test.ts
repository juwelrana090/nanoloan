/**
 * Onboarding System Test
 *
 * This file can be used to test the onboarding functionality.
 * Import and call these functions in a development screen or console.
 */

import { hasCompletedOnboarding, markOnboardingCompleted, resetOnboarding } from '../onboarding';

/**
 * Test the onboarding flow
 */
export const testOnboardingFlow = async () => {
  console.log('=== Onboarding System Test ===');

  // 1. Check initial status
  const status1 = await hasCompletedOnboarding();
  console.log('Initial status:', status1);

  // 2. Mark as completed
  await markOnboardingCompleted();
  console.log('Marked as completed');

  // 3. Check status again
  const status2 = await hasCompletedOnboarding();
  console.log('After marking:', status2);

  // 4. Reset
  await resetOnboarding();
  console.log('Reset completed');

  // 5. Check final status
  const status3 = await hasCompletedOnboarding();
  console.log('After reset:', status3);

  console.log('=== Test Complete ===');
};

/**
 * Quick status check
 */
export const checkOnboardingStatus = async () => {
  const status = await hasCompletedOnboarding();
  console.log('Onboarding completed:', status);
  return status;
};

/**
 * Reset onboarding (for testing)
 */
export const resetForTesting = async () => {
  await resetOnboarding();
  console.log('Onboarding has been reset. You will see the onboarding screens again.');
};

// Example usage in development:
// import { testOnboardingFlow, checkOnboardingStatus, resetForTesting } from '@/shared/utils/__tests__/onboarding.test';
// await testOnboardingFlow();
// await checkOnboardingStatus();
// await resetForTesting();
