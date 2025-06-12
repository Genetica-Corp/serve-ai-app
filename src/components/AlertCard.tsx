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
import { Theme, withOpacity } from '../theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

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
        return Theme.colors.primary.DEFAULT;
      case 'HIGH':
        return Theme.colors.error;
      case 'MEDIUM':
        return Theme.colors.secondary.DEFAULT;
      case 'LOW':
        return Theme.colors.neutral[400];
      default:
        return Theme.colors.neutral[300];
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
    <Card
      testID="alert-card"
      style={[
        styles.container,
        { borderLeftColor: getPriorityColor(alert.priority) }
      ]}
      onPress={() => onPress(alert)}
      elevated={!alert.read}
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
            color={Theme.colors.secondary.DEFAULT} 
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
                    <Icon name="thumb-up" size={16} color={Theme.colors.success} />
                    <Text style={styles.helpfulButtonText}>Yes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.helpfulButton}
                    onPress={() => onMarkHelpful?.(alert.id, false)}
                    testID="helpful-no-button"
                  >
                    <Icon name="thumb-down" size={16} color={Theme.colors.error} />
                    <Text style={styles.helpfulButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Tell Me More Button */}
              <Button
                testID="tell-me-more-button"
                title="Tell Me More"
                onPress={() => onTellMeMore?.(alert.id)}
                variant="primary"
                size="sm"
                icon="search"
                style={{ marginTop: Theme.spacing.sm }}
              />
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
          <Button
            testID="acknowledge-button"
            title="Acknowledge"
            onPress={() => onAcknowledge(alert.id)}
            variant="primary"
            size="sm"
            icon="check"
            style={{ marginRight: Theme.spacing.sm }}
          />
          
          <Button
            testID="dismiss-button"
            title="Dismiss"
            onPress={() => onDismiss(alert.id)}
            variant="secondary"
            size="sm"
            icon="close"
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.xs,
    marginHorizontal: Theme.spacing.md,
  },
  header: {
    marginBottom: Theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  title: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.secondary.DEFAULT,
    marginLeft: Theme.spacing.sm,
  },
  actionRequiredIndicator: {
    width: 20,
    height: 20,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.sm,
  },
  actionRequiredText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priority: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.semibold,
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.neutral[500],
  },
  message: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[700],
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
    marginBottom: Theme.spacing.sm,
  },
  acknowledgedContainer: {
    paddingVertical: Theme.spacing.sm,
  },
  acknowledgedText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.success,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  expandButtonText: {
    color: Theme.colors.secondary.DEFAULT,
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    marginRight: Theme.spacing.xs,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  explanationSection: {
    marginBottom: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.xs,
  },
  explanationText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },
  factorsSection: {
    marginBottom: Theme.spacing.sm,
  },
  factorText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
    marginBottom: Theme.spacing.xs / 2,
  },
  expandedActions: {
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  helpfulSection: {
    marginBottom: Theme.spacing.sm,
  },
  helpfulTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.xs,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.neutral[50],
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  helpfulButtonText: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[700],
    marginLeft: Theme.spacing.xs,
  },
});