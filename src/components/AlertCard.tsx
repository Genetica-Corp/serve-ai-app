import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert } from '@/types';
import { getAlertColor, getAlertIcon, getRelativeTime } from '@/utils';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const alertColor = getAlertColor(alert.priority);
  const iconName = getAlertIcon(alert.type);

  return (
    <TouchableOpacity
      style={[styles.container, !alert.read && styles.unread]}
      onPress={() => onPress(alert)}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={24} color={alertColor} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {alert.message}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.time}>
            {getRelativeTime(alert.timestamp)}
          </Text>
          {!alert.read && <View style={styles.unreadDot} />}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={[styles.severityBadge, { backgroundColor: alertColor }]}>
          <Text style={styles.severityText}>{alert.priority}</Text>
        </View>
        {alert.resolved && (
          <View style={styles.resolvedBadge}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.resolvedText}>Resolved</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolvedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default AlertCard;