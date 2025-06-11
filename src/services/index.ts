// Main service exports for the notification system

export { NotificationService } from './NotificationService';
export { PermissionManager } from './PermissionManager';
export { NotificationScheduler } from './NotificationScheduler';
export { MockNotificationService } from './MockNotificationService';
export { ErrorHandler } from './ErrorHandler';

// Service initialization and coordination
import { NotificationService } from './NotificationService';
import { PermissionManager } from './PermissionManager';
import { NotificationScheduler } from './NotificationScheduler';
import { MockNotificationService } from './MockNotificationService';
import { ErrorHandler } from './ErrorHandler';
import { ServiceResponse, Alert, NotificationSettings, DemoScenario, RestaurantType } from '../types';

/**
 * Unified notification system coordinator
 * Manages all notification-related services and provides a single interface
 */
export class NotificationSystemCoordinator {
  private static instance: NotificationSystemCoordinator;
  
  private notificationService: NotificationService;
  private permissionManager: PermissionManager;
  private scheduler: NotificationScheduler;
  private mockService: MockNotificationService;
  private errorHandler: ErrorHandler;
  
  private isInitialized: boolean = false;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.permissionManager = PermissionManager.getInstance();
    this.scheduler = NotificationScheduler.getInstance();
    this.mockService = MockNotificationService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
  }

  public static getInstance(): NotificationSystemCoordinator {
    if (!NotificationSystemCoordinator.instance) {
      NotificationSystemCoordinator.instance = new NotificationSystemCoordinator();
    }
    return NotificationSystemCoordinator.instance;
  }

  /**
   * Initialize the entire notification system
   */
  public async initialize(): Promise<ServiceResponse<boolean>> {
    try {
      console.log('🚀 Initializing Serve AI Notification System...');

      // Initialize notification service (includes permission requests)
      const initResult = await this.notificationService.initialize();
      
      if (!initResult.success) {
        console.warn('⚠️ Notification service initialization had issues:', initResult.error);
        // Continue initialization even if notifications are disabled
      }

      // Verify permission status
      const permissionStatus = await this.permissionManager.checkPermissionStatus();
      console.log(`🔐 Permission status: ${permissionStatus}`);

      this.isInitialized = true;
      console.log('✅ Notification system initialized successfully');

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      const handledError = await this.errorHandler.handleError(
        error as Error,
        'NotificationSystemCoordinator.initialize'
      );

      return {
        success: false,
        error: `System initialization failed: ${handledError.error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate and schedule demo alerts for presentation
   */
  public async startDemo(
    restaurantType: RestaurantType, 
    scenario: DemoScenario
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`🎬 Starting demo: ${scenario} for ${restaurantType}`);

      // Generate demo alerts
      const alerts = this.mockService.generateDemoScenario(restaurantType, scenario);
      
      // Optimize alerts for presentation
      const optimizedAlerts = this.scheduler.scheduleForRestaurantContext(alerts, scenario);
      
      // Get current notification settings
      const settings = this.notificationService.getSettings();
      
      // Schedule notifications for the alerts
      const scheduleResult = await this.scheduler.scheduleNotifications(optimizedAlerts, settings);
      
      if (!scheduleResult.success) {
        console.warn('⚠️ Some notifications could not be scheduled:', scheduleResult.error);
      }

      console.log(`📱 Demo started with ${optimizedAlerts.length} alerts`);

      return {
        success: true,
        data: optimizedAlerts,
        timestamp: new Date()
      };
    } catch (error) {
      return await this.handleError(error as Error, 'startDemo');
    }
  }

  /**
   * Schedule a single alert notification
   */
  public async scheduleAlert(alert: Alert): Promise<ServiceResponse<string>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Use the scheduler for intelligent timing
      const settings = this.notificationService.getSettings();
      const scheduleResult = await this.scheduler.scheduleNotifications([alert], settings);
      
      if (scheduleResult.success && scheduleResult.data && scheduleResult.data > 0) {
        return {
          success: true,
          data: `Alert ${alert.id} scheduled successfully`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          error: 'Alert was filtered and not scheduled',
          timestamp: new Date()
        };
      }
    } catch (error) {
      return await this.handleError(error as Error, 'scheduleAlert');
    }
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(settings: Partial<NotificationSettings>): Promise<ServiceResponse<NotificationSettings>> {
    try {
      const result = await this.notificationService.updateSettings(settings);
      
      if (result.success) {
        console.log('⚙️ Notification preferences updated');
      }
      
      return result;
    } catch (error) {
      return await this.handleError(error as Error, 'updatePreferences');
    }
  }

  /**
   * Get system status and statistics
   */
  public getSystemStatus(): {
    initialized: boolean;
    permissionStatus: string;
    schedulingStats: any;
    errorStats: any;
  } {
    return {
      initialized: this.isInitialized,
      permissionStatus: this.permissionManager.getCurrentPermissionStatus(),
      schedulingStats: this.scheduler.getSchedulingStats(),
      errorStats: this.errorHandler.getErrorStatistics(),
    };
  }

  /**
   * Generate coordinated demo for presentations
   */
  public async generateCoordinatedDemo(): Promise<ServiceResponse<{ alerts: Alert[], timeline: number[] }>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const demoData = this.mockService.generateCoordinatedDemo();
      
      console.log('🎯 Generated coordinated demo with timed alerts');
      
      return {
        success: true,
        data: demoData,
        timestamp: new Date()
      };
    } catch (error) {
      return await this.handleError(error as Error, 'generateCoordinatedDemo');
    }
  }

  /**
   * Emergency alert - bypass all filters and send immediately
   */
  public async sendEmergencyAlert(alert: Alert): Promise<ServiceResponse<string>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Force the alert to be critical and should notify
      alert.priority = 'CRITICAL';
      alert.shouldNotify = true;

      // Send immediately through notification service
      const result = await this.notificationService.scheduleNotification(alert);
      
      if (result.success) {
        console.log('🚨 Emergency alert sent successfully');
      }
      
      return result;
    } catch (error) {
      return await this.handleError(error as Error, 'sendEmergencyAlert');
    }
  }

  /**
   * Clear all notifications and reset system
   */
  public async clearAll(): Promise<ServiceResponse<boolean>> {
    try {
      // Cancel all scheduled notifications
      this.scheduler.cancelAllScheduledNotifications();
      
      // Clear all notifications from notification center
      await this.notificationService.clearAllNotifications();
      
      // Reset badge count
      await this.notificationService.setBadgeCount(0);
      
      // Clear notification history
      this.notificationService.clearNotificationHistory();
      
      console.log('🧹 All notifications cleared');
      
      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      return await this.handleError(error as Error, 'clearAll');
    }
  }

  /**
   * Test notification system with various scenarios
   */
  public async runSystemTest(): Promise<ServiceResponse<boolean>> {
    try {
      console.log('🧪 Running notification system tests...');

      // Test permission status
      const permissionStatus = await this.permissionManager.checkPermissionStatus();
      console.log(`✓ Permission check: ${permissionStatus}`);

      // Test notification scheduling
      const testAlert = this.mockService.generateRandomAlerts('FAST_CASUAL', 1)[0];
      const scheduleResult = await this.scheduleAlert(testAlert);
      console.log(`✓ Scheduling test: ${scheduleResult.success ? 'PASS' : 'FAIL'}`);

      // Test batching algorithm
      const batchTestAlerts = this.mockService.generateRandomAlerts('FAST_CASUAL', 5);
      const batches = this.scheduler.batchRelatedAlerts(batchTestAlerts);
      console.log(`✓ Batching test: ${batches.length} batches created`);

      // Test error handling
      try {
        await this.errorHandler.handleError(new Error('Test error'), 'system-test');
        console.log('✓ Error handling test: PASS');
      } catch {
        console.log('✗ Error handling test: FAIL');
      }

      console.log('🎉 System test completed');

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (error) {
      return await this.handleError(error as Error, 'runSystemTest');
    }
  }

  /**
   * Get comprehensive system information for debugging
   */
  public getDebugInfo(): any {
    const status = this.getSystemStatus();
    const settings = this.notificationService.getSettings();
    const history = this.notificationService.getNotificationHistory();

    return {
      system: status,
      settings,
      history: history.slice(-10), // Last 10 notifications
      timestamp: new Date(),
    };
  }

  // Private helper methods

  private async handleError(error: Error, context: string): Promise<ServiceResponse<any>> {
    const handledError = await this.errorHandler.handleError(error, context);
    
    return {
      success: false,
      error: handledError.error || error.message,
      timestamp: new Date()
    };
  }
}