import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPermissionStatus, AppError, ServiceResponse } from '../types';

export class PermissionManager {
  private static instance: PermissionManager;
  private permissionStatus: NotificationPermissionStatus = 'undetermined';
  private educationShown: boolean = false;

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Request notification permissions from the user
   * Follows progressive permission request pattern
   */
  public async requestNotificationPermissions(): Promise<ServiceResponse<NotificationPermissionStatus>> {
    try {
      // Check current permission status
      const settings = await Notifications.getPermissionsAsync();
      
      if (settings.granted) {
        this.permissionStatus = 'granted';
        return {
          success: true,
          data: 'granted',
          timestamp: new Date()
        };
      }

      // Show education if not shown before and permission not denied
      if (!this.educationShown && settings.canAskAgain) {
        this.educationShown = true;
        // In a real app, you'd show an educational dialog here
        console.log('📱 Showing permission education to user');
      }

      // Request permissions
      const permission = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
          allowCriticalAlerts: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (permission.granted) {
        this.permissionStatus = 'granted';
        await this.setupNotificationCategories();
        return {
          success: true,
          data: 'granted',
          timestamp: new Date()
        };
      } else {
        this.permissionStatus = 'denied';
        return {
          success: false,
          error: 'Notification permissions denied by user',
          timestamp: new Date()
        };
      }
    } catch (error) {
      const appError: AppError = {
        type: 'PERMISSION_ERROR',
        message: `Failed to request permissions: ${error}`,
        timestamp: new Date(),
        recoverable: true
      };

      return {
        success: false,
        error: appError.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check current permission status without requesting
   */
  public async checkPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      
      if (settings.granted) {
        this.permissionStatus = 'granted';
        return 'granted';
      } else if (settings.canAskAgain) {
        this.permissionStatus = 'undetermined';
        return 'undetermined';
      } else {
        this.permissionStatus = 'denied';
        return 'denied';
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
      return 'undetermined';
    }
  }

  /**
   * Get detailed permission information
   */
  public async getDetailedPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * Handle permission denial gracefully
   */
  public async handlePermissionDenial(): Promise<ServiceResponse<string>> {
    try {
      // Log the denial for analytics
      console.log('📱 User denied notification permissions');
      
      // Provide fallback functionality
      const fallbackMessage = 'Notifications disabled. You can still view alerts in the app.';
      
      return {
        success: true,
        data: fallbackMessage,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to handle permission denial: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Show permission education dialog
   */
  public showPermissionEducation(): string {
    const messages = {
      ios: '🔔 Get notified about critical restaurant alerts even when the app is closed. We\'ll only send important updates.',
      android: '🔔 Allow notifications to stay informed about urgent restaurant issues that need your immediate attention.',
    };

    return Platform.OS === 'ios' ? messages.ios : messages.android;
  }

  /**
   * Check if user can be asked for permissions again
   */
  public async canAskAgain(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    return settings.canAskAgain;
  }

  /**
   * Setup notification categories for interactive notifications
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('CRITICAL_ALERT', [
        {
          identifier: 'ACKNOWLEDGE',
          title: 'Acknowledge',
          options: {
            foreground: true,
          },
        },
        {
          identifier: 'VIEW_DETAILS',
          title: 'View Details',
          options: {
            foreground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('HIGH_ALERT', [
        {
          identifier: 'ACKNOWLEDGE',
          title: 'Acknowledge',
          options: {
            foreground: false,
          },
        },
        {
          identifier: 'DISMISS',
          title: 'Dismiss',
          options: {
            destructive: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('MEDIUM_ALERT', [
        {
          identifier: 'DISMISS',
          title: 'Dismiss',
          options: {
            destructive: false,
          },
        },
      ]);

      console.log('✅ Notification categories set up successfully');
    } catch (error) {
      console.error('❌ Failed to setup notification categories:', error);
    }
  }

  /**
   * Open app settings for manual permission management
   */
  public async openAppSettings(): Promise<void> {
    // This would typically open the app's settings page
    // For now, we'll just log the action
    console.log('📱 Opening app settings for permission management');
  }

  /**
   * Get current permission status (cached)
   */
  public getCurrentPermissionStatus(): NotificationPermissionStatus {
    return this.permissionStatus;
  }

  /**
   * Reset permission education state (for testing)
   */
  public resetEducationState(): void {
    this.educationShown = false;
  }

  /**
   * Check if critical alerts are allowed (iOS specific)
   */
  public async areCriticalAlertsAllowed(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android doesn't have this distinction
    }

    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.ios?.allowsCriticalAlerts ?? false;
    } catch (error) {
      console.error('Error checking critical alerts permission:', error);
      return false;
    }
  }

  /**
   * Validate permission for specific alert priority
   */
  public async validatePermissionForPriority(priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): Promise<boolean> {
    const status = await this.checkPermissionStatus();
    
    if (status !== 'granted') {
      return false;
    }

    // For critical alerts on iOS, check special permission
    if (priority === 'CRITICAL' && Platform.OS === 'ios') {
      return await this.areCriticalAlertsAllowed();
    }

    return true;
  }
}