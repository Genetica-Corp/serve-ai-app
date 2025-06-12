import { Alert, AssignmentHistoryEntry, CureStep } from '../types';
import UserService from './UserService';

class AssignmentService {
  async assignAlert(
    alertId: string,
    assignedTo: string,
    assignedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const assignee = await UserService.getUserById(assignedTo);
      const assigner = await UserService.getUserById(assignedBy);

      if (!assignee || !assigner) {
        return { success: false, error: 'User not found' };
      }

      // In a real app, this would update the alert in the backend
      // For now, we'll return success and let the context handle the state update
      return { 
        success: true,
      };
    } catch (error) {
      return { success: false, error: 'Failed to assign alert' };
    }
  }

  async reassignAlert(
    alertId: string,
    newAssignee: string,
    assignedBy: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const assignee = await UserService.getUserById(newAssignee);
      const assigner = await UserService.getUserById(assignedBy);

      if (!assignee || !assigner) {
        return { success: false, error: 'User not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to reassign alert' };
    }
  }

  async unassignAlert(
    alertId: string,
    unassignedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await UserService.getUserById(unassignedBy);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to unassign alert' };
    }
  }

  generateCureSteps(alertType: string): CureStep[] {
    // Generate cure steps based on alert type
    const cureStepsMap: Record<string, string[]> = {
      EQUIPMENT: [
        'Identify the faulty equipment',
        'Power cycle the device',
        'Check all connections and cables',
        'Run diagnostic tests',
        'Contact maintenance if issue persists',
        'Document the resolution',
      ],
      INVENTORY: [
        'Verify current stock levels',
        'Check for discrepancies in counts',
        'Review recent deliveries',
        'Update inventory system',
        'Place emergency order if needed',
        'Adjust par levels if necessary',
      ],
      STAFF: [
        'Assess current staffing levels',
        'Contact available team members',
        'Adjust break schedules if needed',
        'Redistribute responsibilities',
        'Update scheduling system',
        'Document coverage changes',
      ],
      SAFETY: [
        'Secure the affected area',
        'Ensure staff and customer safety',
        'Document the incident',
        'Contact relevant authorities if needed',
        'Implement corrective measures',
        'Update safety protocols',
      ],
      CUSTOMER: [
        'Contact the customer immediately',
        'Listen to their concerns',
        'Offer appropriate resolution',
        'Document the interaction',
        'Follow up to ensure satisfaction',
        'Update customer records',
      ],
      ORDER: [
        'Review order details',
        'Check order status in system',
        'Contact kitchen/preparation team',
        'Update customer on status',
        'Expedite if necessary',
        'Ensure order completion',
      ],
      DEFAULT: [
        'Assess the situation',
        'Identify root cause',
        'Implement immediate fix',
        'Monitor for recurrence',
        'Document resolution',
        'Update procedures if needed',
      ],
    };

    const steps = cureStepsMap[alertType] || cureStepsMap.DEFAULT;
    
    return steps.map((description, index) => ({
      id: `step-${index + 1}`,
      description,
      completed: false,
    }));
  }

  async updateCureStep(
    alertId: string,
    stepId: string,
    updates: Partial<CureStep>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, this would update the cure step in the backend
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update cure step' };
    }
  }

  async addResolutionNotes(
    alertId: string,
    notes: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, this would add notes to the alert in the backend
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add resolution notes' };
    }
  }

  getAssignmentMetrics(alerts: Alert[], userId: string): {
    totalAssigned: number;
    activeAssigned: number;
    resolvedAssigned: number;
    avgResolutionTime: number;
    byPriority: Record<string, number>;
  } {
    const assignedAlerts = alerts.filter(a => a.assignedTo === userId);
    const activeAlerts = assignedAlerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
    const resolvedAlerts = assignedAlerts.filter(a => a.status === 'RESOLVED');

    const byPriority = assignedAlerts.reduce((acc, alert) => {
      acc[alert.priority] = (acc[alert.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolutionTimes = resolvedAlerts
      .filter(a => a.resolvedAt && a.timestamp)
      .map(a => (a.resolvedAt!.getTime() - a.timestamp) / (1000 * 60)); // in minutes

    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    return {
      totalAssigned: assignedAlerts.length,
      activeAssigned: activeAlerts.length,
      resolvedAssigned: resolvedAlerts.length,
      avgResolutionTime: Math.round(avgResolutionTime),
      byPriority,
    };
  }
}

export default new AssignmentService();