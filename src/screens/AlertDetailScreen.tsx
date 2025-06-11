import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyState } from '../components';

export function AlertDetailScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Alert Details"
        message="Detailed alert view will be implemented here"
        icon="📋"
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