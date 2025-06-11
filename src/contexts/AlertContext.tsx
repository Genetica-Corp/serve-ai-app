import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert, AlertState, AlertAction, AlertFilters } from '../../types';

// Initial state
const initialState: AlertState = {
  alerts: [],
  activeAlerts: [],
  history: [],
  filters: {
    priority: undefined,
    type: undefined,
    status: undefined,
    dateRange: undefined,
    search: '',
    tags: undefined,
    showRead: true,
    showResolved: false,
  },
  loading: false,
  error: null,
  lastUpdated: 0,
  unreadCount: 0,
  criticalCount: 0,
};

// Alert reducer
function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case 'SET_ALERTS':
      const alerts = action.payload;
      const activeAlerts = alerts.filter(alert => 
        alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED'
      );
      const history = alerts.filter(alert => 
        alert.status === 'RESOLVED' || alert.status === 'DISMISSED'
      );
      const unreadCount = alerts.filter(alert => !alert.read).length;
      const criticalCount = alerts.filter(alert => 
        alert.priority === 'CRITICAL' && alert.status === 'ACTIVE'
      ).length;

      return {
        ...state,
        alerts,
        activeAlerts,
        history,
        unreadCount,
        criticalCount,
        lastUpdated: Date.now(),
      };

    case 'ADD_ALERT': {
      const newAlert = action.payload;
      const updatedAlerts = [newAlert, ...state.alerts];
      const activeAlerts = updatedAlerts.filter(alert => 
        alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED'
      );
      const unreadCount = state.unreadCount + (newAlert.read ? 0 : 1);
      const criticalCount = newAlert.priority === 'CRITICAL' && newAlert.status === 'ACTIVE' 
        ? state.criticalCount + 1 
        : state.criticalCount;

      return {
        ...state,
        alerts: updatedAlerts,
        activeAlerts,
        unreadCount,
        criticalCount,
        lastUpdated: Date.now(),
      };
    }

    case 'UPDATE_ALERT': {
      const { id, updates } = action.payload;
      const updatedAlerts = state.alerts.map(alert => 
        alert.id === id ? { ...alert, ...updates } : alert
      );
      
      const activeAlerts = updatedAlerts.filter(alert => 
        alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED'
      );
      const history = updatedAlerts.filter(alert => 
        alert.status === 'RESOLVED' || alert.status === 'DISMISSED'
      );
      const unreadCount = updatedAlerts.filter(alert => !alert.read).length;
      const criticalCount = updatedAlerts.filter(alert => 
        alert.priority === 'CRITICAL' && alert.status === 'ACTIVE'
      ).length;

      return {
        ...state,
        alerts: updatedAlerts,
        activeAlerts,
        history,
        unreadCount,
        criticalCount,
        lastUpdated: Date.now(),
      };
    }

    case 'REMOVE_ALERT': {
      const alertId = action.payload;
      const removedAlert = state.alerts.find(alert => alert.id === alertId);
      const updatedAlerts = state.alerts.filter(alert => alert.id !== alertId);
      
      const activeAlerts = updatedAlerts.filter(alert => 
        alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED'
      );
      const unreadCount = removedAlert && !removedAlert.read 
        ? state.unreadCount - 1 
        : state.unreadCount;
      const criticalCount = removedAlert && 
        removedAlert.priority === 'CRITICAL' && 
        removedAlert.status === 'ACTIVE'
        ? state.criticalCount - 1 
        : state.criticalCount;

      return {
        ...state,
        alerts: updatedAlerts,
        activeAlerts,
        unreadCount: Math.max(0, unreadCount),
        criticalCount: Math.max(0, criticalCount),
        lastUpdated: Date.now(),
      };
    }

    case 'ACKNOWLEDGE_ALERT': {
      const { id, userId } = action.payload;
      const timestamp = Date.now();
      const updatedAlerts = state.alerts.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              status: 'ACKNOWLEDGED' as const,
              acknowledged: true,
              acknowledgedAt: timestamp,
              acknowledgedBy: userId,
              read: true,
              readAt: alert.readAt || timestamp,
            }
          : alert
      );

      return alertReducer(state, { type: 'SET_ALERTS', payload: updatedAlerts });
    }

    case 'RESOLVE_ALERT': {
      const alertId = action.payload;
      const timestamp = Date.now();
      const updatedAlerts = state.alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'RESOLVED' as const,
              resolved: true,
              resolvedAt: timestamp,
            }
          : alert
      );

      return alertReducer(state, { type: 'SET_ALERTS', payload: updatedAlerts });
    }

    case 'DISMISS_ALERT': {
      const alertId = action.payload;
      const timestamp = Date.now();
      const updatedAlerts = state.alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'DISMISSED' as const,
              dismissed: true,
              dismissedAt: timestamp,
            }
          : alert
      );

      return alertReducer(state, { type: 'SET_ALERTS', payload: updatedAlerts });
    }

    case 'MARK_READ': {
      const alertId = action.payload;
      const timestamp = Date.now();
      const updatedAlerts = state.alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              read: true,
              readAt: timestamp,
            }
          : alert
      );

      return alertReducer(state, { type: 'UPDATE_ALERT', payload: { id: alertId, updates: { read: true, readAt: timestamp } } });
    }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'CLEAR_ALERTS':
      return {
        ...initialState,
        filters: state.filters, // Keep current filters
      };

    default:
      return state;
  }
}

// Context type
interface AlertContextType {
  state: AlertState;
  dispatch: React.Dispatch<AlertAction>;
  
  // Convenience methods
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  acknowledgeAlert: (id: string, userId: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  markAsRead: (id: string) => void;
  setFilters: (filters: AlertFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAlerts: () => void;
  
  // Computed properties
  getFilteredAlerts: () => Alert[];
  getAlertById: (id: string) => Alert | undefined;
  getAlertsByType: (type: string) => Alert[];
  getAlertsByPriority: (priority: string) => Alert[];
  getUnreadAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
}

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Provider component
interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Convenience methods
  const addAlert = (alert: Alert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    dispatch({ type: 'UPDATE_ALERT', payload: { id, updates } });
  };

  const removeAlert = (id: string) => {
    dispatch({ type: 'REMOVE_ALERT', payload: id });
  };

  const acknowledgeAlert = (id: string, userId: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { id, userId } });
  };

  const resolveAlert = (id: string) => {
    dispatch({ type: 'RESOLVE_ALERT', payload: id });
  };

  const dismissAlert = (id: string) => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  };

  const setFilters = (filters: AlertFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearAlerts = () => {
    dispatch({ type: 'CLEAR_ALERTS' });
  };

  // Filter alerts based on current filters
  const getFilteredAlerts = (): Alert[] => {
    let filtered = state.alerts;
    const { filters } = state;

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(alert => filters.priority!.includes(alert.priority));
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(alert => filters.type!.includes(alert.type));
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(alert => filters.status!.includes(alert.status));
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(alert => 
        alert.timestamp >= filters.dateRange!.start && 
        alert.timestamp <= filters.dateRange!.end
      );
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchTerm) ||
        alert.message.toLowerCase().includes(searchTerm) ||
        alert.details?.toLowerCase().includes(searchTerm)
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(alert => 
        alert.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    // Show read filter
    if (!filters.showRead) {
      filtered = filtered.filter(alert => !alert.read);
    }

    // Show resolved filter
    if (!filters.showResolved) {
      filtered = filtered.filter(alert => !alert.resolved);
    }

    return filtered;
  };

  // Helper methods
  const getAlertById = (id: string): Alert | undefined => {
    return state.alerts.find(alert => alert.id === id);
  };

  const getAlertsByType = (type: string): Alert[] => {
    return state.alerts.filter(alert => alert.type === type);
  };

  const getAlertsByPriority = (priority: string): Alert[] => {
    return state.alerts.filter(alert => alert.priority === priority);
  };

  const getUnreadAlerts = (): Alert[] => {
    return state.alerts.filter(alert => !alert.read);
  };

  const getCriticalAlerts = (): Alert[] => {
    return state.alerts.filter(alert => 
      alert.priority === 'CRITICAL' && alert.status === 'ACTIVE'
    );
  };

  const contextValue: AlertContextType = {
    state,
    dispatch,
    addAlert,
    updateAlert,
    removeAlert,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    markAsRead,
    setFilters,
    setLoading,
    setError,
    clearAlerts,
    getFilteredAlerts,
    getAlertById,
    getAlertsByType,
    getAlertsByPriority,
    getUnreadAlerts,
    getCriticalAlerts,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
}

// Custom hook to use the context
export function useAlerts(): AlertContextType {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;