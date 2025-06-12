import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, withOpacity } from '../../theme';

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Operator Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {userName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Theme.colors.primary.DEFAULT,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.white,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.regular,
    color: withOpacity(Theme.colors.white, 0.9),
    marginTop: Theme.spacing.xs,
  },
});
