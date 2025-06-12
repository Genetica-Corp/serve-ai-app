import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
  Alert as RNAlert,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Alert, TeamMember } from '../types';
import { useAlerts } from '../contexts/AlertContext';
import { useUser } from '../contexts/UserContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  DashboardHeader,
  MetricsSection,
  FilterSection,
  AlertListItem,
} from '../components/dashboard';
import UserService from '../services/UserService';
import AssignmentService from '../services/AssignmentService';
import { Theme, withOpacity } from '../theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const OperatorDashboard: React.FC = () => {
  console.log('OperatorDashboard rendering...');
  const navigation = useNavigation<NavigationProp>();
  const {
    state: alertState,
    getFilteredAlerts,
    assignAlert,
    updateFilters,
  } = useAlerts();
  const { currentUser, teamMembers, setTeamMembers } = useUser();

  console.log('OperatorDashboard - currentUser:', currentUser);
  console.log('OperatorDashboard - alerts:', alertState.alerts.length);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unassigned' | 'assigned'
  >('all');

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
  }, [activeFilter, updateFilters]);

  const loadTeamMembers = async () => {
    if (currentUser) {
      const members = await UserService.getTeamMembers(currentUser.id);
      setTeamMembers(members);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeamMembers();
    // In a real app, would also refresh alerts
    setRefreshing(false);
  }, []);

  const handleAssignAlert = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setAssignModalVisible(true);
  }, []);

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

  const handleFilterChange = useCallback(
    (filter: 'all' | 'unassigned' | 'assigned') => {
      setActiveFilter(filter);
    },
    []
  );

  const filteredAlerts = getFilteredAlerts();
  const metrics = {
    total: filteredAlerts.length,
    unassigned: filteredAlerts.filter(a => !a.assignedTo).length,
    assigned: filteredAlerts.filter(a => a.assignedTo).length,
    critical: filteredAlerts.filter(a => a.priority === 'CRITICAL').length,
  };

  const renderAlert: ListRenderItem<Alert> = useCallback(
    ({ item }) => (
      <AlertListItem
        alert={item}
        onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
        onAcknowledge={alertId => {
          console.log('Acknowledge alert:', alertId);
        }}
        onDismiss={alertId => {
          console.log('Dismiss alert:', alertId);
        }}
        onAssign={handleAssignAlert}
      />
    ),
    [navigation, handleAssignAlert]
  );

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={styles.teamMemberItem}
      onPress={() => handleAssignToMember(item)}
    >
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role.replace('_', ' ')}</Text>
        <Text
          style={[
            styles.memberStatus,
            {
              color:
                item.status === 'ACTIVE'
                  ? Theme.colors.success
                  : Theme.colors.warning,
            },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Ionicons
        name='chevron-forward'
        size={20}
        color={Theme.colors.neutral[400]}
      />
    </TouchableOpacity>
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <DashboardHeader userName={currentUser?.name || 'User'} />
        <MetricsSection metrics={metrics} />
        <FilterSection
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </>
    ),
    [currentUser?.name, metrics, activeFilter, handleFilterChange]
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <EmptyState
          title='No alerts found'
          message={`No ${
            activeFilter === 'all' ? '' : activeFilter
          } alerts to display`}
          iconName='notifications-off'
        />
      </View>
    ),
    [activeFilter]
  );

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  if (!currentUser) {
    console.log('OperatorDashboard - No current user, showing loading...');
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text='Loading user data...' />
      </SafeAreaView>
    );
  }

  if (alertState.loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderListHeader()}
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primary.DEFAULT]}
            tintColor={Theme.colors.primary.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of AlertListItem
          offset: 120 * index,
          index,
        })}
      />

      <Modal
        visible={assignModalVisible}
        animationType='slide'
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
                <Ionicons
                  name='close'
                  size={24}
                  color={Theme.colors.neutral[900]}
                />
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
  flatList: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
