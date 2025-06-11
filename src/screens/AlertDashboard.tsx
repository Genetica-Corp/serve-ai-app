import React, { useContext, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AlertCard, LoadingSpinner, EmptyState } from '../components';
import { AlertContext } from '../contexts/AlertContext';
import { RestaurantContext } from '../contexts/RestaurantContext';
import { Alert, AlertPriority, AlertType } from '../types';

export function AlertDashboard() {
  const { state: alertState, dispatch: alertDispatch } = useContext(AlertContext);
  const { generateMockAlerts, loadDemoScenario } = useContext(RestaurantContext);

  const { alerts, activeAlerts, loading, error, filters } = alertState;

  useEffect(() => {
    // Load initial demo data if no alerts exist
    if (alerts.length === 0) {
      loadInitialData();
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      alertDispatch({ type: 'SET_LOADING', payload: true });
      await loadDemoScenario('BUSY_LUNCH_RUSH');
    } catch (error) {
      alertDispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load alerts' 
      });
    } finally {
      alertDispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDemoScenario, alertDispatch]);

  const handleRefresh = useCallback(async () => {
    try {
      alertDispatch({ type: 'SET_LOADING', payload: true });
      await generateMockAlerts(3); // Generate 3 new alerts
    } catch (error) {
      alertDispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to refresh alerts' 
      });
    } finally {
      alertDispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [generateMockAlerts, alertDispatch]);

  const handleAlertPress = useCallback((alert: Alert) => {
    // Mark as read when pressed
    if (!alert.read) {
      alertDispatch({
        type: 'UPDATE_ALERT',
        payload: {
          id: alert.id,
          updates: { read: true, readAt: new Date() }
        }
      });
    }
    
    // In a real app, navigate to AlertDetail screen
    console.log('Navigate to alert detail:', alert.id);
  }, [alertDispatch]);

  const handleAcknowledge = useCallback((alertId: string) => {
    alertDispatch({
      type: 'ACKNOWLEDGE_ALERT',
      payload: { id: alertId }
    });
  }, [alertDispatch]);

  const handleDismiss = useCallback((alertId: string) => {
    alertDispatch({
      type: 'DISMISS_ALERT',
      payload: alertId
    });
  }, [alertDispatch]);

  const getFilteredAlerts = useCallback(() => {
    let filtered = activeAlerts;

    if (filters.priority) {
      filtered = filtered.filter(alert => alert.priority === filters.priority);
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchLower) ||
        alert.message.toLowerCase().includes(searchLower)
      );
    }

    if (!filters.showRead) {
      filtered = filtered.filter(alert => !alert.read);
    }

    return filtered.sort((a, b) => {
      // Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (newest first)
      return b.timestamp - a.timestamp;
    });
  }, [activeAlerts, filters]);

  const filteredAlerts = getFilteredAlerts();

  const renderSummaryCard = () => {
    const criticalCount = activeAlerts.filter(a => a.priority === 'CRITICAL').length;
    const highCount = activeAlerts.filter(a => a.priority === 'HIGH').length;
    const unreadCount = activeAlerts.filter(a => !a.read).length;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Alert Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#DC2626' }]}>{criticalCount}</Text>
            <Text style={styles.summaryLabel}>Critical</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{highCount}</Text>
            <Text style={styles.summaryLabel}>High</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#3B82F6' }]}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>Unread</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#10B981' }]}>{activeAlerts.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => loadDemoScenario('EQUIPMENT_FAILURE')}
        >
          <Text style={styles.actionButtonText}>Equipment Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => loadDemoScenario('STAFF_SHORTAGE')}
        >
          <Text style={styles.actionButtonText}>Staff Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => loadDemoScenario('INVENTORY_CRISIS')}
        >
          <Text style={styles.actionButtonText}>Inventory Alert</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <AlertCard
      alert={item}
      onPress={handleAlertPress}
      onAcknowledge={handleAcknowledge}
      onDismiss={handleDismiss}
    />
  );

  if (loading && alerts.length === 0) {
    return (
      <LoadingSpinner 
        text="Loading restaurant alerts..." 
        color="#3B82F6" 
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Alerts"
        message={error}
        actionText="Retry"
        onAction={loadInitialData}
        icon="⚠️"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        ListHeaderComponent={
          <View>
            {renderSummaryCard()}
            {renderQuickActions()}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Active Alerts ({filteredAlerts.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No Active Alerts"
            message="All clear! No alerts require your attention right now."
            actionText="Generate Demo Alerts"
            onAction={handleRefresh}
            icon="✅"
          />
        }
        contentContainerStyle={
          filteredAlerts.length === 0 ? styles.emptyContainer : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});