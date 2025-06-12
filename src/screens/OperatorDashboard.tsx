import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Alert, TeamMember } from '../types';
import { useAlerts } from '../contexts/AlertContext';
import { useUser } from '../contexts/UserContext';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import UserService from '../services/UserService';
import AssignmentService from '../services/AssignmentService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const OperatorDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state: alertState, getFilteredAlerts, assignAlert, updateFilters } = useAlerts();
  const { currentUser, teamMembers, setTeamMembers } = useUser();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  
  useEffect(() => {
    loadTeamMembers();
  }, []);

  useEffect(() => {
    // Update filters based on active filter
    switch (activeFilter) {
      case 'unassigned':
        updateFilters({ unassigned: true, assignedToMe: false });
        break;
      case 'assigned':
        updateFilters({ unassigned: false, assignedToMe: false });
        break;
      default:
        updateFilters({ unassigned: false, assignedToMe: false });
    }
  }, [activeFilter]);

  const loadTeamMembers = async () => {
    if (currentUser) {
      const members = await UserService.getTeamMembers(currentUser.id);
      setTeamMembers(members);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeamMembers();
    // In a real app, would also refresh alerts
    setRefreshing(false);
  };

  const handleAssignAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setAssignModalVisible(true);
  };

  const handleAssignToMember = async (member: TeamMember) => {
    if (!selectedAlert || !currentUser) return;

    const result = await AssignmentService.assignAlert(
      selectedAlert.id,
      member.id,
      currentUser.id
    );

    if (result.success) {
      assignAlert(
        selectedAlert.id,
        member.id,
        member.name,
        currentUser.id,
        currentUser.name
      );
      
      // Generate cure steps for the alert
      const cureSteps = AssignmentService.generateCureSteps(selectedAlert.type);
      // In a real app, would update the alert with cure steps
      
      RNAlert.alert(
        'Alert Assigned',
        `Alert assigned to ${member.name} successfully!`,
        [{ text: 'OK' }]
      );
    } else {
      RNAlert.alert('Error', result.error || 'Failed to assign alert');
    }

    setAssignModalVisible(false);
    setSelectedAlert(null);
  };

  const filteredAlerts = getFilteredAlerts();
  const metrics = {
    total: filteredAlerts.length,
    unassigned: filteredAlerts.filter(a => !a.assignedTo).length,
    assigned: filteredAlerts.filter(a => a.assignedTo).length,
    critical: filteredAlerts.filter(a => a.priority === 'CRITICAL').length,
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={styles.teamMemberItem}
      onPress={() => handleAssignToMember(item)}
    >
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role.replace('_', ' ')}</Text>
        <Text style={[styles.memberStatus, { color: item.status === 'ACTIVE' ? '#4CAF50' : '#FF9800' }]}>
          {item.status}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Operator Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {currentUser?.name}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total Alerts</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#FF5722' }]}>{metrics.unassigned}</Text>
          <Text style={styles.metricLabel}>Unassigned</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#4CAF50' }]}>{metrics.assigned}</Text>
          <Text style={styles.metricLabel}>Assigned</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#F44336' }]}>{metrics.critical}</Text>
          <Text style={styles.metricLabel}>Critical</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All Alerts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'unassigned' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('unassigned')}
        >
          <Text style={[styles.filterText, activeFilter === 'unassigned' && styles.filterTextActive]}>
            Unassigned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'assigned' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('assigned')}
        >
          <Text style={[styles.filterText, activeFilter === 'assigned' && styles.filterTextActive]}>
            Assigned
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
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            title="No alerts found"
            message={`No ${activeFilter === 'all' ? '' : activeFilter} alerts to display`}
            icon="notifications-off-outline"
          />
        ) : (
          filteredAlerts.map(alert => (
            <View key={alert.id} style={styles.alertWrapper}>
              <AlertCard
                alert={alert}
                onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
              />
              {!alert.assignedTo && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => handleAssignAlert(alert)}
                >
                  <Ionicons name="person-add" size={16} color="#FFF" />
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              )}
              {alert.assignedTo && (
                <View style={styles.assignedInfo}>
                  <Ionicons name="person" size={14} color="#666" />
                  <Text style={styles.assignedText}>
                    Assigned to {alert.assignedToName}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Alert</Text>
              <TouchableOpacity
                onPress={() => setAssignModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Select a team member to assign this alert
            </Text>

            <FlatList
              data={teamMembers.filter(m => m.status === 'ACTIVE')}
              renderItem={renderTeamMember}
              keyExtractor={item => item.id}
              style={styles.teamMembersList}
              ListEmptyComponent={
                <Text style={styles.noMembersText}>
                  No active team members available
                </Text>
              }
            />
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
    backgroundColor: '#1976D2',
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
    color: '#E3F2FD',
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
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
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
  assignButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  assignedText: {
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
    maxHeight: '70%',
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
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  teamMembersList: {
    paddingHorizontal: 20,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  noMembersText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 32,
  },
});

export default OperatorDashboard;