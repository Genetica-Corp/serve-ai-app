import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyState } from '../components';

export function AlertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Alerts</Text>
      <View style={styles.contentContainer}>
        <EmptyState
          title="Alert History"
          message="View all alerts including resolved and dismissed items"
          icon="📋"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    padding: 20,
    paddingBottom: 0,
  },
  contentContainer: {
    flex: 1,
  },
});