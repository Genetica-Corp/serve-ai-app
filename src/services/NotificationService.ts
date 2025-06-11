import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'react-native-uuid';

import { 
  Alert, 
  NotificationPayload, 
  NotificationSettings, 
  ServiceResponse, 
  AppError,
  NotificationResponse,
  AlertPriority 
} from '../types';
import { PermissionManager } from './PermissionManager';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const priority = notification.request.content.data?.priority as AlertPriority;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: priority === 'CRITICAL' || priority === 'HIGH',
      shouldSetBadge: true,
    };
  },
});

export class NotificationService {
  private static instance: NotificationService;
  private permissionManager: PermissionManager;
  private notificationQueue: Alert[] = [];
  private isProcessingQueue: boolean = false;
  private settings: NotificationSettings;
  private notificationHistory: NotificationResponse[] = [];

  private constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.settings = this.getDefaultSettings();
    this.setupNotificationHandlers();
    this.loadSettings();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  public async initialize(): Promise<ServiceResponse<boolean>> {
    try {
      // Request permissions
      const permissionResult = await this.permissionManager.requestNotificationPermissions();
      
      if (!permissionResult.success) {
        console.warn('Notifications disabled:', permissionResult.error);
      }

      // Load persisted settings
      await this.loadSettings();

      // Setup notification handlers
      this.setupNotificationHandlers();

      // Process any queued notifications
      await this.processNotificationQueue();

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize notification service: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Schedule a local notification for an alert
   */
  public async scheduleNotification(alert: Alert): Promise<ServiceResponse<string>> {
    try {
      // Check if notifications should be sent
      const shouldSend = await this.shouldSendNotification(alert);
      if (!shouldSend) {
        return {
          success: false,
          error: 'Notification filtered by user settings',
          timestamp: new Date()
        };
      }

      // Build notification payload
      const notification = this.buildNotificationPayload(alert);

      // Calculate notification time (immediate for demo, but could be delayed)
      const notificationTime = this.calculateNotificationTime(alert);

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
          badge: notification.badge,
          categoryIdentifier: notification.categoryId,
        },
        trigger: notificationTime,
      });

      // Update alert with notification info
      alert.notificationId = notificationId;
      alert.notificationSent = true;
      alert.notificationScheduledAt = new Date();

      // Log for analytics
      this.logNotificationSent(alert.id, notification.categoryId);

      return {
        success: true,
        data: notificationId,
        timestamp: new Date()
      };
    } catch (error) {
      const appError: AppError = {
        type: 'NOTIFICATION_ERROR',
        message: `Failed to schedule notification: ${error}`,
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
   * Cancel a scheduled notification
   */
  public async cancelNotification(notificationId: string): Promise<ServiceResponse<boolean>> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel notification: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<ServiceResponse<boolean>> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel all notifications: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Show in-app notification when app is in foreground
   */
  public async showInAppNotification(alert: Alert): Promise<void> {
    console.log('📱 Showing in-app notification:', alert.title);
    // In a real app, this would trigger an in-app notification banner
    // For now, we'll just log it
  }

  /**
   * Update notification settings
   */
  public async updateSettings(newSettings: Partial<NotificationSettings>): Promise<ServiceResponse<NotificationSettings>> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();
      
      return {
        success: true,
        data: this.settings,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update settings: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current notification settings
   */
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Get notification history
   */
  public getNotificationHistory(): NotificationResponse[] {
    return [...this.notificationHistory];
  }

  /**
   * Clear notification history
   */
  public clearNotificationHistory(): void {
    this.notificationHistory = [];
  }

  /**
   * Get badge count
   */
  public async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  public async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications from notification center
   */
  public async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Private methods

  /**
   * Determine if notification should be sent based on settings and context
   */
  private async shouldSendNotification(alert: Alert): Promise<boolean> {
    // Check if notifications are enabled
    if (!this.settings.allowNotifications) {
      return false;
    }

    // Check permission status
    const permissionStatus = await this.permissionManager.checkPermissionStatus();
    if (permissionStatus !== 'granted') {
      return false;
    }

    // Always send critical alerts
    if (alert.priority === 'CRITICAL') {
      return this.settings.allowCritical;
    }

    // Check priority-based settings
    const prioritySettings = {
      HIGH: this.settings.allowHigh,
      MEDIUM: this.settings.allowMedium,
      LOW: this.settings.allowLow,
    };

    if (!prioritySettings[alert.priority as keyof typeof prioritySettings]) {
      return false;
    }

    // Check quiet hours
    if (this.isWithinQuietHours()) {
      return alert.priority === 'CRITICAL';
    }

    // Check notification frequency limits
    if (await this.exceedsFrequencyLimit()) {
      return alert.priority === 'CRITICAL';
    }

    return true;
  }

  /**
   * Build notification payload from alert
   */
  private buildNotificationPayload(alert: Alert): NotificationPayload {
    return {
      title: this.formatNotificationTitle(alert),
      body: this.formatNotificationBody(alert),
      data: {
        alertId: alert.id,
        type: alert.type,
        priority: alert.priority,
      },
      sound: this.selectNotificationSound(alert.priority),
      badge: this.calculateBadgeCount(),
      categoryId: this.getCategoryId(alert),
    };
  }

  /**
   * Calculate when notification should be sent
   */
  private calculateNotificationTime(alert: Alert): Date | null {
    // For demo purposes, send immediately
    // In production, you might delay based on priority or user preferences
    return null; // null means immediate
  }

  /**
   * Format notification title
   */
  private formatNotificationTitle(alert: Alert): string {
    const priorityPrefix = {
      CRITICAL: '🚨 CRITICAL',
      HIGH: '⚠️ HIGH',
      MEDIUM: '📢 ALERT',
      LOW: '💡 INFO',
    };

    return `${priorityPrefix[alert.priority]}: ${alert.title}`;
  }

  /**
   * Format notification body
   */
  private formatNotificationBody(alert: Alert): string {
    const maxLength = 100;
    return alert.message.length > maxLength 
      ? `${alert.message.substring(0, maxLength)}...`
      : alert.message;
  }

  /**
   * Select appropriate sound for notification priority
   */
  private selectNotificationSound(priority: AlertPriority): string | undefined {
    if (!this.settings.customSounds) {
      return undefined; // Use default system sound
    }

    const sounds = {
      CRITICAL: 'critical-alert.caf',
      HIGH: 'high-priority.caf',
      MEDIUM: 'medium-alert.caf',
      LOW: 'low-priority.caf',
    };

    return sounds[priority];
  }

  /**
   * Calculate current badge count
   */
  private calculateBadgeCount(): number {
    // This would typically be the number of unread alerts
    // For now, we'll return a mock value
    return 1;
  }

  /**
   * Get category ID for interactive notifications
   */
  private getCategoryId(alert: Alert): string {
    return `${alert.priority}_ALERT`;
  }

  /**
   * Check if current time is within quiet hours
   */
  private isWithinQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check if notification frequency exceeds user limits
   */
  private async exceedsFrequencyLimit(): Promise<boolean> {
    // Implementation would track recent notifications
    // For demo, we'll return false
    return false;
  }

  /**
   * Setup notification event handlers
   */
  private setupNotificationHandlers(): void {
    // Handle notification received while app is running
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('📱 Notification received:', notification);
      
      if (AppState.currentState === 'active') {
        // Show in-app notification
        const alertId = notification.request.content.data?.alertId as string;
        console.log('Showing in-app notification for alert:', alertId);
      }
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('📱 Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle user response to notification
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const alertId = notification.request.content.data?.alertId as string;

    // Store in history
    this.notificationHistory.push({
      notification: {
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data as any,
        categoryId: notification.request.content.categoryIdentifier || '',
      },
      actionIdentifier,
      userText: response.userText,
    });

    // Handle different actions
    switch (actionIdentifier) {
      case 'ACKNOWLEDGE':
        console.log('User acknowledged alert:', alertId);
        // In a real app, you'd update the alert state here
        break;
      case 'DISMISS':
        console.log('User dismissed alert:', alertId);
        break;
      case 'VIEW_DETAILS':
        console.log('User wants to view details for alert:', alertId);
        // Navigate to alert details screen
        break;
      default:
        console.log('User tapped notification for alert:', alertId);
        // Default action - navigate to app/alert
        break;
    }
  }

  /**
   * Process queued notifications
   */
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      for (const alert of this.notificationQueue) {
        await this.scheduleNotification(alert);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between notifications
      }
      
      this.notificationQueue = [];
    } catch (error) {
      console.error('Error processing notification queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Add alert to notification queue
   */
  public queueNotification(alert: Alert): void {
    this.notificationQueue.push(alert);
    this.processNotificationQueue();
  }

  /**
   * Log notification sent for analytics
   */
  private logNotificationSent(alertId: string, category: string): void {
    console.log(`📊 Notification sent - Alert: ${alertId}, Category: ${category}`);
  }

  /**
   * Get default notification settings
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      allowNotifications: true,
      allowCritical: true,
      allowHigh: true,
      allowMedium: true,
      allowLow: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      maxPerHour: 10,
      customSounds: true,
      vibration: true,
    };
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notification_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }
}