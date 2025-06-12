import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Theme } from '../theme';
import { Button } from './ui/Button';

export interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
  iconName?: string;
}

export function EmptyState({ 
  title, 
  message, 
  actionText, 
  onAction,
  icon,
  iconName 
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {iconName ? (
        <Icon name={iconName} size={48} color={Theme.colors.neutral[400]} style={styles.iconContainer} />
      ) : icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  message: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[500],
    textAlign: 'center',
    lineHeight: Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
    marginBottom: Theme.spacing.lg,
  },
});