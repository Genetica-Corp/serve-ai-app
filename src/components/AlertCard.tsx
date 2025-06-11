import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Alert, AlertPriority } from '../types';

export interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export function AlertCard({ alert, onPress, onAcknowledge, onDismiss }: AlertCardProps) {
  const getPriorityColor = (priority: AlertPriority): string => {
    switch (priority) {
      case 'CRITICAL':
        return '#DC2626'; // Red
      case 'HIGH':
        return '#F59E0B'; // Orange
      case 'MEDIUM':
        return '#3B82F6'; // Blue
      case 'LOW':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <TouchableOpacity
      testID="alert-card"
      style={[
        styles.container,
        { borderLeftColor: getPriorityColor(alert.priority) }
      ]}
      onPress={() => onPress(alert)}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{alert.title}</Text>
          {!alert.read && (
            <View testID="unread-indicator" style={styles.unreadIndicator} />
          )}
          {alert.actionRequired && (
            <View testID="action-required-indicator" style={styles.actionRequiredIndicator}>
              <Text style={styles.actionRequiredText}>!</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.priority, { color: getPriorityColor(alert.priority) }]}>
            {alert.priority}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(alert.timestamp)}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>{alert.message}</Text>

      {alert.acknowledged ? (
        <View style={styles.acknowledgedContainer}>
          <Text style={styles.acknowledgedText}>Acknowledged</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            testID="acknowledge-button"
            style={[styles.actionButton, styles.acknowledgeButton]}
            onPress={() => onAcknowledge(alert.id)}
          >
            <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            testID="dismiss-button"
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => onDismiss(alert.id)}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  actionRequiredIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionRequiredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priority: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  acknowledgedContainer: {
    paddingVertical: 8,
  },
  acknowledgedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  acknowledgeButton: {
    backgroundColor: '#3B82F6',
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: '#EF4444',
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});