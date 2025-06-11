import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyState } from '../components';

export function NotificationSettingsScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Notification Settings"
        message="Detailed notification preferences will be implemented here"
        icon="🔔"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});