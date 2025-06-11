import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { 
  NotificationState, 
  NotificationAction, 
  NotificationSettings, 
  NotificationPermissionStatus,
  PendingNotification,
  AlertType,
  AlertPriority
} from '../../types';

// Initial notification settings
const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  allowCritical: true,
  allowHigh: true,
  allowMedium: true,
  allowLow: false,
  sound: true,
  vibration: true,
  badge: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  maxPerHour: 10,
  minimumPriority: 'LOW',
  typeFilters: {
    ORDER: true,
    EQUIPMENT: true,
    INVENTORY: true,
    STAFF: true,
    CUSTOMER: true,
    FINANCIAL: true,
    SAFETY: true,
    HEALTH: true,
    SECURITY: true,
  },
};

// Initial state
const initialState: NotificationState = {
  permissions: 'undetermined',
  settings: defaultNotificationSettings,
  queue: [],
  lastNotificationTime: 0,
  notificationHistory: [],
};

// Notification reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };

    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(notification => notification.id !== action.payload),
      };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
      };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        notificationHistory: [action.payload, ...state.notificationHistory.slice(0, 99)], // Keep last 100
        lastNotificationTime: Date.now(),
      };

    default:
      return state;
  }
}

// Context type
interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  
  // Permission methods
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  checkPermissionStatus: () => Promise<NotificationPermissionStatus>;
  
  // Settings methods
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
  
  // Queue management
  addToQueue: (notification: PendingNotification) => void;
  removeFromQueue: (notificationId: string) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  
  // Notification scheduling
  scheduleNotification: (notification: PendingNotification) => Promise<string | null>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  
  // Utility methods
  shouldSendNotification: (priority: AlertPriority, type: AlertType) => boolean;
  isWithinQuietHours: () => boolean;
  canSendNotification: () => boolean;
  formatNotificationTime: (time: number) => string;
  
  // Statistics
  getNotificationStats: () => {
    totalSent: number;
    lastHourCount: number;
    queueLength: number;
  };
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize permissions check on mount
  useEffect(() => {
    checkPermissionStatus().then(status => {
      dispatch({ type: 'SET_PERMISSIONS', payload: status });
    });
  }, []);

  // Set up notification response handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationId = response.notification.request.identifier;
      dispatch({ type: 'ADD_TO_HISTORY', payload: notificationId });
      
      // Handle notification tap - could trigger navigation or actions
      if (response.notification.request.content.data) {
        const { alertId, type } = response.notification.request.content.data;
        // Handle notification interaction based on data
        console.log('Notification tapped:', { alertId, type });
      }
    });

    return () => subscription.remove();
  }, []);

  // Permission methods
  const requestPermissions = async (): Promise<NotificationPermissionStatus> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      let mappedStatus: NotificationPermissionStatus;
      
      switch (status) {
        case 'granted':
          mappedStatus = 'granted';
          break;
        case 'denied':
          mappedStatus = 'denied';
          break;
        default:
          mappedStatus = 'undetermined';
      }
      
      dispatch({ type: 'SET_PERMISSIONS', payload: mappedStatus });
      return mappedStatus;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return 'denied';
    }
  };

  const checkPermissionStatus = async (): Promise<NotificationPermissionStatus> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let mappedStatus: NotificationPermissionStatus;
      
      switch (status) {
        case 'granted':
          mappedStatus = 'granted';
          break;
        case 'denied':
          mappedStatus = 'denied';
          break;
        default:
          mappedStatus = 'undetermined';
      }
      
      return mappedStatus;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return 'denied';
    }
  };

  // Settings methods
  const updateSettings = (settings: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const resetSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: defaultNotificationSettings });
  };

  // Queue management
  const addToQueue = (notification: PendingNotification) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: notification });
  };

  const removeFromQueue = (notificationId: string) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: notificationId });
  };

  const clearQueue = () => {
    dispatch({ type: 'CLEAR_QUEUE' });
  };

  const processQueue = async () => {
    if (state.permissions !== 'granted') {
      console.warn('Cannot process notification queue: permissions not granted');
      return;
    }

    for (const notification of state.queue) {
      if (canSendNotification()) {
        await scheduleNotification(notification);
        removeFromQueue(notification.id);
      }
    }
  };

  // Notification scheduling
  const scheduleNotification = async (notification: PendingNotification): Promise<string | null> => {
    try {
      if (state.permissions !== 'granted') {
        console.warn('Cannot schedule notification: permissions not granted');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: state.settings.sound ? 'default' : undefined,
        },
        trigger: notification.scheduledTime <= Date.now() 
          ? null // Send immediately
          : { seconds: Math.max(1, Math.floor((notification.scheduledTime - Date.now()) / 1000)) },
      });

      dispatch({ type: 'ADD_TO_HISTORY', payload: notificationId });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      dispatch({ type: 'CLEAR_QUEUE' });
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  // Utility methods
  const shouldSendNotification = (priority: AlertPriority, type: AlertType): boolean => {
    const { settings } = state;
    
    if (!settings.enabled) return false;
    if (!settings.typeFilters[type]) return false;
    
    // Check priority settings
    switch (priority) {
      case 'CRITICAL':
        return settings.allowCritical;
      case 'HIGH':
        return settings.allowHigh;
      case 'MEDIUM':
        return settings.allowMedium;
      case 'LOW':
        return settings.allowLow;
      default:
        return false;
    }
  };

  const isWithinQuietHours = (): boolean => {
    const { settings } = state;
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 14:00 to 18:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 07:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const canSendNotification = (): boolean => {
    if (state.permissions !== 'granted') return false;
    if (!state.settings.enabled) return false;
    if (isWithinQuietHours()) return false;
    
    // Check rate limiting
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentNotifications = state.notificationHistory.filter(time => 
      parseInt(time) > oneHourAgo
    );
    
    return recentNotifications.length < state.settings.maxPerHour;
  };

  const formatNotificationTime = (time: number): string => {
    return new Date(time).toLocaleTimeString();
  };

  const getNotificationStats = () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const lastHourCount = state.notificationHistory.filter(time => 
      parseInt(time) > oneHourAgo
    ).length;

    return {
      totalSent: state.notificationHistory.length,
      lastHourCount,
      queueLength: state.queue.length,
    };
  };

  const contextValue: NotificationContextType = {
    state,
    dispatch,
    requestPermissions,
    checkPermissionStatus,
    updateSettings,
    resetSettings,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    shouldSendNotification,
    isWithinQuietHours,
    canSendNotification,
    formatNotificationTime,
    getNotificationStats,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;