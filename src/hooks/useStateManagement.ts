import { useCallback, useEffect, useState } from 'react';
import { useAlerts } from '../contexts/AlertContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { StorageService } from '../services/StorageService';

interface UseStateManagementReturn {
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Initialization
  initializeApp: () => Promise<void>;
  resetApp: () => Promise<void>;
  
  // Data persistence
  saveAllData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Backup and restore
  createBackup: () => Promise<string>;
  restoreFromBackup: (backupData: string) => Promise<void>;
  
  // Storage management
  clearAllData: () => Promise<void>;
  getStorageInfo: () => Promise<{
    totalSize: number;
    breakdown: Record<string, number>;
  }>;
  
  // Data validation
  validateData: () => Promise<{
    isValid: boolean;
    errors: string[];
  }>;
}

export function useStateManagement(): UseStateManagementReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const storageService = new StorageService();
  
  const { state: alertState, dispatch: alertDispatch, setLoading: setAlertLoading } = useAlerts();
  const { state: notificationState, updateSettings } = useNotifications();
  const { 
    state: restaurantState, 
    setProfile, 
    setContext, 
    setLoading: setRestaurantLoading 
  } = useRestaurant();

  // Initialize the app with stored data
  const initializeApp = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    setAlertLoading(true);
    setRestaurantLoading(true);

    try {
      // Load restaurant profile first
      const storedProfile = await storageService.loadRestaurantProfile();
      if (storedProfile) {
        setProfile(storedProfile);
      }

      // Load notification settings
      const storedSettings = await storageService.loadNotificationSettings();
      updateSettings(storedSettings);

      // Load alerts
      const storedAlerts = await storageService.loadAlerts();
      if (storedAlerts.length > 0) {
        alertDispatch({ type: 'SET_ALERTS', payload: storedAlerts });
      }

      // Load user preferences
      const userPreferences = await storageService.loadUserPreferences();
      
      // If we have a profile, create/update restaurant context
      if (storedProfile) {
        const mockGenerator = await import('../services/MockDataGenerator');
        const generator = new mockGenerator.MockDataGenerator();
        const context = generator.generateRestaurantContext(storedProfile);
        setContext(context);
      }

      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize app';
      setError(errorMessage);
      console.error('App initialization error:', err);
    } finally {
      setIsLoading(false);
      setAlertLoading(false);
      setRestaurantLoading(false);
    }
  }, [
    isInitialized,
    storageService,
    setProfile,
    setContext,
    updateSettings,
    alertDispatch,
    setAlertLoading,
    setRestaurantLoading,
  ]);

  // Reset app to initial state
  const resetApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear all stored data
      await storageService.clearAllData();
      
      // Reset all contexts to initial state
      alertDispatch({ type: 'CLEAR_ALERTS' });
      updateSettings(await storageService.loadNotificationSettings()); // This will load defaults
      
      // Reset restaurant context
      if (restaurantState.profile) {
        const mockGenerator = await import('../services/MockDataGenerator');
        const generator = new mockGenerator.MockDataGenerator();
        const defaultProfile = generator.generateRestaurantProfile('FAST_CASUAL');
        setProfile(defaultProfile);
        
        const context = generator.generateRestaurantContext(defaultProfile);
        setContext(context);
      }

      setIsInitialized(false);
      console.log('App reset successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset app';
      setError(errorMessage);
      console.error('App reset error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storageService, alertDispatch, updateSettings, restaurantState.profile, setProfile, setContext]);

  // Save all current data to storage
  const saveAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Save alerts
      await storageService.saveAlerts(alertState.alerts);
      
      // Save notification settings
      await storageService.saveNotificationSettings(notificationState.settings);
      
      // Save restaurant profile
      if (restaurantState.profile) {
        await storageService.saveRestaurantProfile(restaurantState.profile);
      }

      console.log('All data saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Save data error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageService, alertState.alerts, notificationState.settings, restaurantState.profile]);

  // Load all data from storage
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load alerts
      const alerts = await storageService.loadAlerts();
      alertDispatch({ type: 'SET_ALERTS', payload: alerts });
      
      // Load notification settings
      const settings = await storageService.loadNotificationSettings();
      updateSettings(settings);
      
      // Load restaurant profile
      const profile = await storageService.loadRestaurantProfile();
      if (profile) {
        setProfile(profile);
        
        // Generate new context for the profile
        const mockGenerator = await import('../services/MockDataGenerator');
        const generator = new mockGenerator.MockDataGenerator();
        const context = generator.generateRestaurantContext(profile);
        setContext(context);
      }

      console.log('All data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Load data error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageService, alertDispatch, updateSettings, setProfile, setContext]);

  // Create backup of all data
  const createBackup = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Save current state before backup
      await saveAllData();
      
      // Create backup
      const backup = await storageService.createBackup();
      console.log('Backup created successfully');
      return backup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create backup';
      setError(errorMessage);
      console.error('Create backup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageService, saveAllData]);

  // Restore from backup
  const restoreFromBackup = useCallback(async (backupData: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Restore data from backup
      await storageService.restoreFromBackup(backupData);
      
      // Reload all data into state
      await loadAllData();
      
      console.log('Data restored from backup successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore from backup';
      setError(errorMessage);
      console.error('Restore backup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageService, loadAllData]);

  // Clear all data
  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await storageService.clearAllData();
      
      // Reset contexts
      alertDispatch({ type: 'CLEAR_ALERTS' });
      updateSettings(await storageService.loadNotificationSettings());
      
      console.log('All data cleared successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
      console.error('Clear data error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageService, alertDispatch, updateSettings]);

  // Get storage information
  const getStorageInfo = useCallback(async () => {
    try {
      return await storageService.getStorageSize();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get storage info';
      setError(errorMessage);
      console.error('Get storage info error:', err);
      throw err;
    }
  }, [storageService]);

  // Validate stored data
  const validateData = useCallback(async () => {
    try {
      return await storageService.validateStoredData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate data';
      setError(errorMessage);
      console.error('Validate data error:', err);
      throw err;
    }
  }, [storageService]);

  // Auto-save data periodically
  useEffect(() => {
    if (!isInitialized) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await saveAllData();
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 5 * 60 * 1000); // Auto-save every 5 minutes

    return () => clearInterval(autoSaveInterval);
  }, [isInitialized, saveAllData]);

  // Initialize on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return {
    isLoading,
    isInitialized,
    error,
    initializeApp,
    resetApp,
    saveAllData,
    loadAllData,
    createBackup,
    restoreFromBackup,
    clearAllData,
    getStorageInfo,
    validateData,
  };
}