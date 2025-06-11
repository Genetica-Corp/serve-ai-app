import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RestaurantContext, MockDataOptions, DemoScenario } from '../../types';
import { AlertService } from '../services/AlertService';
import { useAlerts } from '../contexts/AlertContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useNotifications } from '../contexts/NotificationContext';

interface UseAlertServiceReturn {
  alertService: AlertService;
  isGenerating: boolean;
  isSimulating: boolean;
  error: string | null;
  
  // Alert generation methods
  generateInitialAlerts: () => Promise<void>;
  generateDemoScenario: (scenario: DemoScenario) => Promise<void>;
  generateRealisticAlerts: (count?: number) => Promise<void>;
  
  // Real-time simulation
  startSimulation: (intervalMs?: number) => void;
  stopSimulation: () => void;
  simulateRandomAlert: () => Promise<Alert | null>;
  
  // Alert management
  acknowledgeAlert: (alertId: string, userId?: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  
  // Analytics
  getAlertStatistics: (timeRange?: { start: number; end: number }) => Promise<any>;
  refreshAlertCache: () => Promise<void>;
}

export function useAlertService(): UseAlertServiceReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const alertService = useRef(new AlertService()).current;
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { addAlert, updateAlert, setLoading, setError: setAlertError } = useAlerts();
  const { state: restaurantState } = useRestaurant();
  const { scheduleNotification, shouldSendNotification } = useNotifications();

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  // Alert generation methods
  const generateInitialAlerts = useCallback(async () => {
    if (!restaurantState.context) {
      setError('Restaurant context not available');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoading(true);

    try {
      const alerts = await alertService.generateAlerts(restaurantState.context);
      
      // Add alerts to state and schedule notifications
      for (const alert of alerts) {
        addAlert(alert);
        
        if (alert.shouldNotify && shouldSendNotification(alert.priority, alert.type)) {
          await scheduleNotification({
            id: `${alert.id}_notification`,
            alertId: alert.id,
            scheduledTime: Date.now(),
            title: alert.title,
            body: alert.message,
            data: { alertId: alert.id, type: alert.type },
          });
        }
      }
      
      setAlertError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate alerts';
      setError(errorMessage);
      setAlertError(errorMessage);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  }, [restaurantState.context, alertService, addAlert, setLoading, setAlertError, scheduleNotification, shouldSendNotification]);

  const generateDemoScenario = useCallback(async (scenario: DemoScenario) => {
    if (!restaurantState.context) {
      setError('Restaurant context not available');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Use mock data generator directly for demo scenarios
      const mockGenerator = (alertService as any).mockDataGenerator;
      const alerts = mockGenerator.generateDemoScenario(scenario, restaurantState.context);
      
      // Process alerts through service for proper formatting
      for (const alert of alerts) {
        const processedAlert = (alertService as any).processAlert(alert, restaurantState.context);
        addAlert(processedAlert);
        
        if (processedAlert.shouldNotify && shouldSendNotification(processedAlert.priority, processedAlert.type)) {
          await scheduleNotification({
            id: `${processedAlert.id}_notification`,
            alertId: processedAlert.id,
            scheduledTime: Date.now(),
            title: processedAlert.title,
            body: processedAlert.message,
            data: { alertId: processedAlert.id, type: processedAlert.type },
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate demo scenario';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [restaurantState.context, alertService, addAlert, scheduleNotification, shouldSendNotification]);

  const generateRealisticAlerts = useCallback(async (count = 5) => {
    if (!restaurantState.context) {
      setError('Restaurant context not available');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const options: MockDataOptions = {
        restaurantType: restaurantState.context.profile.type,
        alertCount: count,
        timeRange: {
          start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
          end: Date.now(),
        },
        includePastAlerts: false,
        priorityDistribution: {
          CRITICAL: 10,
          HIGH: 25,
          MEDIUM: 45,
          LOW: 20,
        },
        typeDistribution: {
          ORDER: 20,
          EQUIPMENT: 15,
          INVENTORY: 15,
          STAFF: 15,
          CUSTOMER: 10,
          FINANCIAL: 10,
          SAFETY: 5,
          HEALTH: 5,
          SECURITY: 5,
        },
      };

      const alerts = await alertService.generateAlerts(restaurantState.context, options);
      
      for (const alert of alerts) {
        addAlert(alert);
        
        if (alert.shouldNotify && shouldSendNotification(alert.priority, alert.type)) {
          await scheduleNotification({
            id: `${alert.id}_notification`,
            alertId: alert.id,
            scheduledTime: Date.now(),
            title: alert.title,
            body: alert.message,
            data: { alertId: alert.id, type: alert.type },
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate realistic alerts';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [restaurantState.context, alertService, addAlert, scheduleNotification, shouldSendNotification]);

  // Real-time simulation
  const startSimulation = useCallback((intervalMs = 30000) => { // Default 30 seconds
    if (!restaurantState.context || isSimulating) {
      return;
    }

    setIsSimulating(true);
    
    simulationInterval.current = setInterval(async () => {
      try {
        const newAlert = await alertService.simulateRealTimeAlert(restaurantState.context!);
        
        if (newAlert) {
          addAlert(newAlert);
          
          if (newAlert.shouldNotify && shouldSendNotification(newAlert.priority, newAlert.type)) {
            await scheduleNotification({
              id: `${newAlert.id}_notification`,
              alertId: newAlert.id,
              scheduledTime: Date.now(),
              title: newAlert.title,
              body: newAlert.message,
              data: { alertId: newAlert.id, type: newAlert.type },
            });
          }
        }
      } catch (err) {
        console.error('Error in real-time simulation:', err);
      }
    }, intervalMs);
  }, [restaurantState.context, isSimulating, alertService, addAlert, scheduleNotification, shouldSendNotification]);

  const stopSimulation = useCallback(() => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulating(false);
  }, []);

  const simulateRandomAlert = useCallback(async (): Promise<Alert | null> => {
    if (!restaurantState.context) {
      setError('Restaurant context not available');
      return null;
    }

    try {
      const newAlert = await alertService.simulateRealTimeAlert(restaurantState.context);
      
      if (newAlert) {
        addAlert(newAlert);
        
        if (newAlert.shouldNotify && shouldSendNotification(newAlert.priority, newAlert.type)) {
          await scheduleNotification({
            id: `${newAlert.id}_notification`,
            alertId: newAlert.id,
            scheduledTime: Date.now(),
            title: newAlert.title,
            body: newAlert.message,
            data: { alertId: newAlert.id, type: newAlert.type },
          });
        }
      }
      
      return newAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate alert';
      setError(errorMessage);
      return null;
    }
  }, [restaurantState.context, alertService, addAlert, scheduleNotification, shouldSendNotification]);

  // Alert management
  const acknowledgeAlert = useCallback(async (alertId: string, userId = 'demo-user') => {
    try {
      await alertService.acknowledgeAlert(alertId, userId);
      updateAlert(alertId, {
        status: 'ACKNOWLEDGED',
        acknowledged: true,
        acknowledgedAt: Date.now(),
        acknowledgedBy: userId,
        read: true,
        readAt: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      setError(errorMessage);
      throw err;
    }
  }, [alertService, updateAlert]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId);
      updateAlert(alertId, {
        status: 'RESOLVED',
        resolved: true,
        resolvedAt: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alert';
      setError(errorMessage);
      throw err;
    }
  }, [alertService, updateAlert]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await alertService.dismissAlert(alertId);
      updateAlert(alertId, {
        status: 'DISMISSED',
        dismissed: true,
        dismissedAt: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss alert';
      setError(errorMessage);
      throw err;
    }
  }, [alertService, updateAlert]);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await alertService.markAsRead(alertId);
      updateAlert(alertId, {
        read: true,
        readAt: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark alert as read';
      setError(errorMessage);
      throw err;
    }
  }, [alertService, updateAlert]);

  // Analytics
  const getAlertStatistics = useCallback(async (timeRange?: { start: number; end: number }) => {
    try {
      return await alertService.getAlertStatistics(timeRange);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get alert statistics';
      setError(errorMessage);
      throw err;
    }
  }, [alertService]);

  const refreshAlertCache = useCallback(async () => {
    try {
      await alertService.refreshCache();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh alert cache';
      setError(errorMessage);
      throw err;
    }
  }, [alertService]);

  return {
    alertService,
    isGenerating,
    isSimulating,
    error,
    generateInitialAlerts,
    generateDemoScenario,
    generateRealisticAlerts,
    startSimulation,
    stopSimulation,
    simulateRandomAlert,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    markAsRead,
    getAlertStatistics,
    refreshAlertCache,
  };
}