import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  NotificationSettings,
  RestaurantProfile,
  IStorageService,
} from '../../types';

// Storage keys
const STORAGE_KEYS = {
  ALERTS: '@serve_ai_alerts',
  NOTIFICATION_SETTINGS: '@serve_ai_notification_settings',
  RESTAURANT_PROFILE: '@serve_ai_restaurant_profile',
  USER_PREFERENCES: '@serve_ai_user_preferences',
  ALERT_HISTORY: '@serve_ai_alert_history',
  CACHE_TIMESTAMP: '@serve_ai_cache_timestamp',
} as const;

export class StorageService implements IStorageService {
  private cacheExpiryMs = 24 * 60 * 60 * 1000; // 24 hours

  // Alert storage methods
  async saveAlerts(alerts: Alert[]): Promise<void> {
    try {
      const alertsData = {
        alerts,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alertsData));
    } catch (error) {
      console.error('Error saving alerts to storage:', error);
      throw new Error('Failed to save alerts');
    }
  }

  async loadAlerts(): Promise<Alert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      if (!alertsJson) {
        return [];
      }

      const alertsData = JSON.parse(alertsJson);
      
      // Check if cache is still valid
      if (this.isCacheExpired(alertsData.timestamp)) {
        console.log('Alert cache expired, returning empty array');
        return [];
      }

      return alertsData.alerts || [];
    } catch (error) {
      console.error('Error loading alerts from storage:', error);
      return [];
    }
  }

  async saveAlertHistory(alerts: Alert[]): Promise<void> {
    try {
      // Only save resolved/dismissed alerts for history
      const historyAlerts = alerts.filter(alert => 
        alert.status === 'RESOLVED' || alert.status === 'DISMISSED'
      );

      const historyData = {
        alerts: historyAlerts,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ALERT_HISTORY, JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving alert history:', error);
      throw new Error('Failed to save alert history');
    }
  }

  async loadAlertHistory(): Promise<Alert[]> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_HISTORY);
      if (!historyJson) {
        return [];
      }

      const historyData = JSON.parse(historyJson);
      return historyData.alerts || [];
    } catch (error) {
      console.error('Error loading alert history:', error);
      return [];
    }
  }

  // Notification settings storage
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      const settingsData = {
        settings,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS, 
        JSON.stringify(settingsData)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw new Error('Failed to save notification settings');
    }
  }

  async loadNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (!settingsJson) {
        return this.getDefaultNotificationSettings();
      }

      const settingsData = JSON.parse(settingsJson);
      return settingsData.settings || this.getDefaultNotificationSettings();
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.getDefaultNotificationSettings();
    }
  }

  // Restaurant profile storage
  async saveRestaurantProfile(profile: RestaurantProfile): Promise<void> {
    try {
      const profileData = {
        profile,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.RESTAURANT_PROFILE, 
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.error('Error saving restaurant profile:', error);
      throw new Error('Failed to save restaurant profile');
    }
  }

  async loadRestaurantProfile(): Promise<RestaurantProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.RESTAURANT_PROFILE);
      if (!profileJson) {
        return null;
      }

      const profileData = JSON.parse(profileJson);
      return profileData.profile || null;
    } catch (error) {
      console.error('Error loading restaurant profile:', error);
      return null;
    }
  }

  // User preferences storage
  async saveUserPreferences(preferences: any): Promise<void> {
    try {
      const preferencesData = {
        preferences,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES, 
        JSON.stringify(preferencesData)
      );
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  async loadUserPreferences(): Promise<any> {
    try {
      const preferencesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!preferencesJson) {
        return {};
      }

      const preferencesData = JSON.parse(preferencesJson);
      return preferencesData.preferences || {};
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ALERTS,
        STORAGE_KEYS.CACHE_TIMESTAMP,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  // Storage utility methods
  async getStorageSize(): Promise<{ totalSize: number; breakdown: Record<string, number> }> {
    try {
      const breakdown: Record<string, number> = {};
      let totalSize = 0;

      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        try {
          const data = await AsyncStorage.getItem(storageKey);
          const size = data ? new Blob([data]).size : 0;
          breakdown[key] = size;
          totalSize += size;
        } catch (error) {
          breakdown[key] = 0;
        }
      }

      return { totalSize, breakdown };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { totalSize: 0, breakdown: {} };
    }
  }

  async exportData(): Promise<string> {
    try {
      const data: Record<string, any> = {};

      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        try {
          const value = await AsyncStorage.getItem(storageKey);
          data[key] = value ? JSON.parse(value) : null;
        } catch (error) {
          data[key] = null;
        }
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(dataJson: string): Promise<void> {
    try {
      const data = JSON.parse(dataJson);
      
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        if (data[key] !== null && data[key] !== undefined) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(data[key]));
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  // Backup and restore
  async createBackup(): Promise<string> {
    try {
      const exportData = await this.exportData();
      const backup = {
        version: '1.0',
        timestamp: Date.now(),
        data: exportData,
      };
      
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreFromBackup(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      
      if (!backup.data) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data first
      await this.clearAllData();
      
      // Import backup data
      await this.importData(backup.data);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  // Migration support
  async migrateStorage(fromVersion: string, toVersion: string): Promise<void> {
    try {
      console.log(`Migrating storage from ${fromVersion} to ${toVersion}`);
      
      // Add migration logic here when needed
      // For now, just log the migration
      
      // Example migration logic:
      // if (fromVersion === '1.0' && toVersion === '1.1') {
      //   await this.migrateV1ToV1_1();
      // }
      
    } catch (error) {
      console.error('Error during storage migration:', error);
      throw new Error('Failed to migrate storage');
    }
  }

  // Data validation
  async validateStoredData(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate alerts
      const alerts = await this.loadAlerts();
      for (const alert of alerts) {
        if (!this.isValidAlert(alert)) {
          errors.push(`Invalid alert structure: ${alert.id}`);
        }
      }

      // Validate notification settings
      const settings = await this.loadNotificationSettings();
      if (!this.isValidNotificationSettings(settings)) {
        errors.push('Invalid notification settings structure');
      }

      // Validate restaurant profile
      const profile = await this.loadRestaurantProfile();
      if (profile && !this.isValidRestaurantProfile(profile)) {
        errors.push('Invalid restaurant profile structure');
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods
  private isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheExpiryMs;
  }

  private getDefaultNotificationSettings(): NotificationSettings {
    return {
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
  }

  private isValidAlert(alert: any): boolean {
    return (
      typeof alert === 'object' &&
      typeof alert.id === 'string' &&
      typeof alert.type === 'string' &&
      typeof alert.priority === 'string' &&
      typeof alert.status === 'string' &&
      typeof alert.title === 'string' &&
      typeof alert.message === 'string' &&
      typeof alert.timestamp === 'number' &&
      typeof alert.read === 'boolean' &&
      typeof alert.acknowledged === 'boolean' &&
      typeof alert.resolved === 'boolean' &&
      typeof alert.dismissed === 'boolean'
    );
  }

  private isValidNotificationSettings(settings: any): boolean {
    return (
      typeof settings === 'object' &&
      typeof settings.enabled === 'boolean' &&
      typeof settings.allowCritical === 'boolean' &&
      typeof settings.allowHigh === 'boolean' &&
      typeof settings.allowMedium === 'boolean' &&
      typeof settings.allowLow === 'boolean' &&
      typeof settings.sound === 'boolean' &&
      typeof settings.vibration === 'boolean' &&
      typeof settings.badge === 'boolean' &&
      typeof settings.quietHours === 'object' &&
      typeof settings.maxPerHour === 'number' &&
      typeof settings.minimumPriority === 'string' &&
      typeof settings.typeFilters === 'object'
    );
  }

  private isValidRestaurantProfile(profile: any): boolean {
    return (
      typeof profile === 'object' &&
      typeof profile.id === 'string' &&
      typeof profile.name === 'string' &&
      typeof profile.type === 'string' &&
      typeof profile.address === 'string' &&
      typeof profile.phone === 'string' &&
      typeof profile.email === 'string' &&
      typeof profile.capacity === 'number' &&
      typeof profile.staffCount === 'number' &&
      typeof profile.hoursOfOperation === 'object'
    );
  }
}