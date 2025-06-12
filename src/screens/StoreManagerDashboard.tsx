import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Alert, CureStep } from '../types';
import { useAlerts } from '../contexts/AlertContext';
import { useUser } from '../contexts/UserContext';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AssignmentService from '../services/AssignmentService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const StoreManagerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state: alertState, getFilteredAlerts, updateFilters, updateCureStep, addResolutionNotes, resolveAlert } = useAlerts();
  const { currentUser } = useUser();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [cureModalVisible, setCureModalVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeFilter, setActiveFilter] = useState<'my_alerts' | 'all'>('my_alerts');

  useEffect(() => {
    // Set filter to show only alerts assigned to current user
    if (activeFilter === 'my_alerts' && currentUser) {
      updateFilters({ assignedTo: currentUser.id });
    } else {
      updateFilters({ assignedTo: undefined });
    }
  }, [activeFilter, currentUser]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, would refresh alerts from server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenCureSteps = (alert: Alert) => {
    // Generate cure steps if not already present
    if (!alert.cureSteps || alert.cureSteps.length === 0) {
      const cureSteps = AssignmentService.generateCureSteps(alert.type);
      alert.cureSteps = cureSteps;
    }
    setSelectedAlert(alert);
    setCureModalVisible(true);
  };

  const handleToggleCureStep = (stepId: string) => {
    if (!selectedAlert || !currentUser) return;

    const step = selectedAlert.cureSteps?.find(s => s.id === stepId);
    if (step) {
      updateCureStep(selectedAlert.id, stepId, {
        completed: !step.completed,
        completedAt: !step.completed ? new Date() : undefined,
        completedBy: !step.completed ? currentUser.id : undefined,
      });
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert || !currentUser) return;

    // Check if all cure steps are completed
    const allStepsCompleted = selectedAlert.cureSteps?.every(step => step.completed) ?? false;
    
    if (!allStepsCompleted) {
      RNAlert.alert(
        'Incomplete Steps',
        'Please complete all cure steps before resolving the alert.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (resolutionNotes.trim()) {
      addResolutionNotes(selectedAlert.id, resolutionNotes);
    }

    resolveAlert(selectedAlert.id);
    
    RNAlert.alert(
      'Alert Resolved',
      'The alert has been successfully resolved!',
      [{ text: 'OK' }]
    );

    setCureModalVisible(false);
    setSelectedAlert(null);
    setResolutionNotes('');
  };

  const myAlerts = getFilteredAlerts();
  const metrics = AssignmentService.getAssignmentMetrics(alertState.alerts, currentUser?.id || '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Store Manager Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {currentUser?.name}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalAssigned}</Text>
          <Text style={styles.metricLabel}>My Alerts</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#FF5722' }]}>{metrics.activeAssigned}</Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#4CAF50' }]}>{metrics.resolvedAssigned}</Text>
          <Text style={styles.metricLabel}>Resolved</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#2196F3' }]}>
            {metrics.avgResolutionTime}m
          </Text>
          <Text style={styles.metricLabel}>Avg Time</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'my_alerts' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('my_alerts')}
        >
          <Text style={[styles.filterText, activeFilter === 'my_alerts' && styles.filterTextActive]}>
            My Alerts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.alertsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {alertState.loading ? (
          <LoadingSpinner />
        ) : myAlerts.length === 0 ? (
          <EmptyState
            title="No alerts assigned"
            message="You don't have any alerts assigned to you yet"
            icon="notifications-off-outline"
          />
        ) : (
          myAlerts.map(alert => (
            <View key={alert.id} style={styles.alertWrapper}>
              <AlertCard
                alert={alert}
                onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
              />
              {alert.assignedTo === currentUser?.id && alert.status !== 'RESOLVED' && (
                <TouchableOpacity
                  style={styles.cureButton}
                  onPress={() => handleOpenCureSteps(alert)}
                >
                  <Ionicons name="medical" size={16} color="#FFF" />
                  <Text style={styles.cureButtonText}>Cure Steps</Text>
                </TouchableOpacity>
              )}
              {alert.assignedTo === currentUser?.id && (
                <View style={styles.assignmentInfo}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.assignmentText}>
                    Assigned {alert.assignedAt ? new Date(alert.assignedAt).toLocaleDateString() : 'recently'}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={cureModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cure Steps</Text>
              <TouchableOpacity
                onPress={() => setCureModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.cureStepsList}>
              {selectedAlert?.cureSteps?.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.cureStepItem}
                  onPress={() => handleToggleCureStep(step.id)}
                >
                  <View style={styles.stepCheckbox}>
                    {step.completed ? (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color="#CCC" />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[
                      styles.stepDescription,
                      step.completed && styles.stepDescriptionCompleted
                    ]}>
                      {index + 1}. {step.description}
                    </Text>
                    {step.completed && step.completedAt && (
                      <Text style={styles.stepMeta}>
                        Completed {new Date(step.completedAt).toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.resolutionSection}>
              <Text style={styles.resolutionLabel}>Resolution Notes</Text>
              <TextInput
                style={styles.resolutionInput}
                placeholder="Add any notes about the resolution..."
                value={resolutionNotes}
                onChangeText={setResolutionNotes}
                multiline
                numberOfLines={3}
              />
              
              <TouchableOpacity
                style={[
                  styles.resolveButton,
                  (!selectedAlert?.cureSteps?.every(s => s.completed)) && styles.resolveButtonDisabled
                ]}
                onPress={handleResolveAlert}
              >
                <Text style={styles.resolveButtonText}>Resolve Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#388E3C',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricCard: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#388E3C',
    borderColor: '#388E3C',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  alertsList: {
    flex: 1,
    padding: 16,
  },
  alertWrapper: {
    marginBottom: 12,
  },
  cureButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cureButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  assignmentText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  cureStepsList: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  cureStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepCheckbox: {
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  stepDescriptionCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stepMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resolutionSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resolutionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resolutionInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resolveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  resolveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StoreManagerDashboard;