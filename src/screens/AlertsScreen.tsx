import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyState } from '@/components';

const AlertsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <View style={styles.contentContainer}>
        <EmptyState
          title="No Alerts Yet"
          message="Alert system implementation will be added by the Alert Management Agent"
          icon="notifications-none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 0,
  },
  contentContainer: {
    flex: 1,
  },
});

export default AlertsScreen;