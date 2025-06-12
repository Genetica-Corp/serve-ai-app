import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert, AlertPriority } from '../types';

export interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onMarkHelpful?: (alertId: string, helpful: boolean) => void;
  onTellMeMore?: (alertId: string) => void;
}

export function AlertCard({ alert, onPress, onAcknowledge, onDismiss, onMarkHelpful, onTellMeMore }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  
  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const getPriorityColor = (priority: AlertPriority): string => {
    switch (priority) {
      case 'CRITICAL':
        return '#374151'; // Dark Gray
      case 'HIGH':
        return '#6B7280'; // Medium Gray
      case 'MEDIUM':
        return '#14B8A6'; // Teal
      case 'LOW':
        return '#9CA3AF'; // Light Gray
      default:
        return '#D1D5DB'; // Very Light Gray
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
      
      {/* Expand/Collapse Button */}
      {(alert.explanation || alert.relatedFactors) && (
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={toggleExpanded}
          testID="expand-button"
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? 'Show Less' : 'Show More'}
          </Text>
          <Icon 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={20} 
            color="#14B8A6" 
          />
        </TouchableOpacity>
      )}
      
      {/* Expanded Content */}
      <Animated.View 
        style={[
          styles.expandedContent,
          {
            opacity: animatedHeight,
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300],
            }),
          }
        ]}
      >
        {isExpanded && (
          <View>
            {alert.explanation && (
              <View style={styles.explanationSection}>
                <Text style={styles.sectionTitle}>Explanation</Text>
                <Text style={styles.explanationText}>{alert.explanation}</Text>
              </View>
            )}
            
            {alert.relatedFactors && alert.relatedFactors.length > 0 && (
              <View style={styles.factorsSection}>
                <Text style={styles.sectionTitle}>Related Factors</Text>
                {alert.relatedFactors.map((factor, index) => (
                  <Text key={index} style={styles.factorText}>• {factor}</Text>
                ))}
              </View>
            )}
            
            <View style={styles.expandedActions}>
              {/* Was This Helpful Section */}
              <View style={styles.helpfulSection}>
                <Text style={styles.helpfulTitle}>Was this helpful?</Text>
                <View style={styles.helpfulButtons}>
                  <TouchableOpacity 
                    style={styles.helpfulButton}
                    onPress={() => onMarkHelpful?.(alert.id, true)}
                    testID="helpful-yes-button"
                  >
                    <Icon name="thumb-up" size={16} color="#10B981" />
                    <Text style={styles.helpfulButtonText}>Yes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.helpfulButton}
                    onPress={() => onMarkHelpful?.(alert.id, false)}
                    testID="helpful-no-button"
                  >
                    <Icon name="thumb-down" size={16} color="#EF4444" />
                    <Text style={styles.helpfulButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Tell Me More Button */}
              <TouchableOpacity 
                style={styles.tellMeMoreButton}
                onPress={() => onTellMeMore?.(alert.id)}
                testID="tell-me-more-button"
              >
                <Icon name="search" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.tellMeMoreButtonText}>Tell Me More</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

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
            <View style={styles.buttonContent}>
              <Icon name="check" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            testID="dismiss-button"
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => onDismiss(alert.id)}
          >
            <View style={styles.buttonContent}>
              <Icon name="close" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </View>
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
    backgroundColor: '#14B8A6',
    marginLeft: 8,
  },
  actionRequiredIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#374151',
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
    backgroundColor: '#14B8A6',
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: '#6B7280',
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  expandButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  explanationSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  factorsSection: {
    marginBottom: 12,
  },
  factorText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  expandedActions: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  helpfulSection: {
    marginBottom: 12,
  },
  helpfulTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpfulButtonText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  tellMeMoreButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tellMeMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});