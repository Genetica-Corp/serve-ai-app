// Context exports
export { AlertProvider, useAlerts } from './contexts/AlertContext';
export { NotificationProvider, useNotifications } from './contexts/NotificationContext';
export { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
export { AppProvider } from './contexts/AppProvider';

// Service exports
export { AlertService } from './services/AlertService';
export { MockDataGenerator } from './services/MockDataGenerator';
export { StorageService } from './services/StorageService';

// Hook exports
export { useAlertService } from './hooks/useAlertService';
export { useStateManagement } from './hooks/useStateManagement';

// Utility exports
export { ErrorHandler, ErrorRecovery, useErrorHandler } from './utils/errorHandler';
export { 
  useLoadingState, 
  useGlobalLoadingState, 
  useProgressTracker,
  withLoading,
  ProgressTracker,
  OPERATIONS 
} from './utils/loadingState';

// Type exports from types file
export * from '../types';