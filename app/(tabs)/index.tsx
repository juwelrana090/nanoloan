import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  const insets = useSafeAreaInsets();

  const visibility = NavigationBar.useVisibility();
  console.log(visibility);
  return (
    <>
      <StatusBar style="light" backgroundColor="#00C897" translucent={false} />
      <View style={[styles.container, { paddingTop: insets.top }]}></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
