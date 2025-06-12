import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { AppProvider } from './src/contexts/AppProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useFonts } from './src/hooks/useFonts';
import { Theme } from './src/theme';

export default function App() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AppProvider>
    </ErrorBoundary>
  );
}
