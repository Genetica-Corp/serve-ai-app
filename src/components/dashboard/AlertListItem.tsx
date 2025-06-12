import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, TeamMember } from '../../types';
import { AlertCard } from '../AlertCard';
import { Theme } from '../../theme';

interface AlertListItemProps {
  alert: Alert;
  onPress: () => void;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onAssign: (alert: Alert) => void;
}

export const AlertListItem: React.FC<AlertListItemProps> = ({
  alert,
  onPress,
  onAcknowledge,
  onDismiss,
  onAssign,
}) => {
  return (
    <View style={styles.alertWrapper}>
      <AlertCard
        alert={alert}
        onPress={onPress}
        onAcknowledge={onAcknowledge}
        onDismiss={onDismiss}
      />
      {!alert.assignedTo && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => onAssign(alert)}
        >
          <Ionicons name='person-add' size={16} color={Theme.colors.white} />
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      )}
      {alert.assignedTo && (
        <View style={styles.assignedInfo}>
          <Ionicons name='person' size={14} color={Theme.colors.neutral[500]} />
          <Text style={styles.assignedText}>
            Assigned to {alert.assignedToName}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  alertWrapper: {
    marginBottom: Theme.spacing.sm,
  },
  assignButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: Theme.colors.secondary.DEFAULT,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  assignButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.semibold,
    marginLeft: Theme.spacing.xs,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  assignedText: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    marginLeft: Theme.spacing.xs,
  },
});
