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
import { Theme, withOpacity } from '../theme';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
        <Text style={[styles.memberStatus, { color: item.status === 'ACTIVE' ? Theme.colors.success : Theme.colors.warning }]}>
          {item.status}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Theme.colors.neutral[400]} />
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
          <Text style={[styles.metricValue, { color: Theme.colors.error }]}>{metrics.unassigned}</Text>
          <Text style={styles.metricLabel}>Unassigned</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Theme.colors.success }]}>{metrics.assigned}</Text>
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
                  <Ionicons name="person-add" size={16} color={Theme.colors.white} />
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              )}
              {alert.assignedTo && (
                <View style={styles.assignedInfo}>
                  <Ionicons name="person" size={14} color={Theme.colors.neutral[500]} />
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
                <Ionicons name="close" size={24} color={Theme.colors.neutral[900]} />
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
    backgroundColor: Theme.colors.neutral[50],
  },
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    ...Theme.shadows.md,
  },
  metricCard: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutral[900],
  },
  metricLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    marginTop: Theme.spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    marginTop: 1,
    ...Theme.shadows.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary.DEFAULT,
    borderColor: Theme.colors.primary.DEFAULT,
  },
  filterText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.neutral[600],
  },
  filterTextActive: {
    color: Theme.colors.white,
    fontFamily: Theme.typography.fontFamily.semibold,
  },
  alertsList: {
    flex: 1,
    padding: Theme.spacing.md,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: withOpacity(Theme.colors.black, 0.5),
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.borderRadius['2xl'],
    borderTopRightRadius: Theme.borderRadius['2xl'],
    paddingTop: Theme.spacing.lg,
    maxHeight: '70%',
    ...Theme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  teamMembersList: {
    paddingHorizontal: Theme.spacing.lg,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
  },
  memberRole: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    marginTop: Theme.spacing.xs / 2,
  },
  memberStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.semibold,
    marginTop: Theme.spacing.xs,
  },
  noMembersText: {
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    paddingVertical: 32,
  },
});

export default OperatorDashboard;