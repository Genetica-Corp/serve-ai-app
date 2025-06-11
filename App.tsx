import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppProvider } from './src/contexts/AppProvider';

// Demo component to show state management integration
function DemoApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serve AI Restaurant Alerts</Text>
      <Text style={styles.subtitle}>State Management System Ready</Text>
      <Text style={styles.description}>
        The state management system has been successfully implemented with:
      </Text>
      <Text style={styles.feature}>✅ AlertContext for alert state management</Text>
      <Text style={styles.feature}>✅ NotificationContext for notification preferences</Text>
      <Text style={styles.feature}>✅ RestaurantContext for restaurant profile data</Text>
      <Text style={styles.feature}>✅ AlertService with mock alert generation</Text>
      <Text style={styles.feature}>✅ MockDataGenerator following SERVE_AI_PSEUDOCODE.md</Text>
      <Text style={styles.feature}>✅ AsyncStorage persistence for offline functionality</Text>
      <Text style={styles.feature}>✅ Error handling and loading states</Text>
      <Text style={styles.feature}>✅ State management hooks for easy integration</Text>
      
      <Text style={styles.next}>
        Next: Implement UI components using the state management system
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DemoApp />
      <StatusBar style="auto" />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    color: '#444',
    lineHeight: 22,
  },
  feature: {
    fontSize: 14,
    marginBottom: 8,
    color: '#2d5a27',
    lineHeight: 20,
  },
  next: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 22,
  },
});
