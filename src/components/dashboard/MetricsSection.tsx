import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../theme';

interface MetricsSectionProps {
  metrics: {
    total: number;
    unassigned: number;
    assigned: number;
    critical: number;
  };
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>{metrics.total}</Text>
        <Text style={styles.metricLabel}>Total Alerts</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={[styles.metricValue, { color: Theme.colors.error }]}>
          {metrics.unassigned}
        </Text>
        <Text style={styles.metricLabel}>Unassigned</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={[styles.metricValue, { color: Theme.colors.success }]}>
          {metrics.assigned}
        </Text>
        <Text style={styles.metricLabel}>Assigned</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={[styles.metricValue, { color: '#F44336' }]}>
          {metrics.critical}
        </Text>
        <Text style={styles.metricLabel}>Critical</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    ...Theme.shadows.md,
  },
  metricCard: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutral[900],
  },
  metricLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    marginTop: Theme.spacing.xs,
  },
});
