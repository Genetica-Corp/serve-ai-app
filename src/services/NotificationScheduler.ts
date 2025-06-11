import { Alert, NotificationSettings, DemoScenario, MockDataContext, ServiceResponse } from '../types';
import { NotificationService } from './NotificationService';

/**
 * Advanced notification scheduling algorithms based on the pseudocode specifications
 */
export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private notificationService: NotificationService;
  private scheduledAlerts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  /**
   * Main scheduling algorithm - determines optimal notification timing
   */
  public async scheduleNotifications(alerts: Alert[], settings: NotificationSettings): Promise<ServiceResponse<number>> {
    try {
      let scheduledCount = 0;

      for (const alert of alerts) {
        if (alert.shouldNotify && !alert.notificationSent) {
          // Calculate optimal notification time
          const notificationTime = this.calculateOptimalNotificationTime(alert, settings);
          
          // Schedule the notification
          const result = await this.scheduleDelayedNotification(alert, notificationTime);
          
          if (result.success) {
            scheduledCount++;
          }
        }
      }

      return {
        success: true,
        data: scheduledCount,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to schedule notifications: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Calculate optimal notification time based on alert properties and user preferences
   */
  private calculateOptimalNotificationTime(alert: Alert, settings: NotificationSettings): number {
    const now = Date.now();
    
    // Critical alerts - immediate
    if (alert.priority === 'CRITICAL') {
      return 0;
    }

    // High priority - within 30 seconds to 2 minutes
    if (alert.priority === 'HIGH') {
      return this.getRandomDelay(30000, 120000);
    }

    // Medium priority - within 2-5 minutes
    if (alert.priority === 'MEDIUM') {
      return this.getRandomDelay(120000, 300000);
    }

    // Low priority - within 5-15 minutes
    return this.getRandomDelay(300000, 900000);
  }

  /**
   * Schedule a notification with delay
   */
  private async scheduleDelayedNotification(alert: Alert, delayMs: number): Promise<ServiceResponse<string>> {
    try {
      if (delayMs === 0) {
        // Send immediately
        return await this.notificationService.scheduleNotification(alert);
      }

      // Schedule with delay
      const timeoutId = setTimeout(async () => {
        await this.notificationService.scheduleNotification(alert);
        this.scheduledAlerts.delete(alert.id);
      }, delayMs);

      this.scheduledAlerts.set(alert.id, timeoutId);

      return {
        success: true,
        data: `Scheduled in ${delayMs}ms`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to schedule delayed notification: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Intelligent batching algorithm - groups related alerts to avoid notification spam
   */
  public batchRelatedAlerts(alerts: Alert[]): Alert[][] {
    const batches: Alert[][] = [];
    const processed = new Set<string>();

    for (const alert of alerts) {
      if (processed.has(alert.id)) continue;

      const batch = [alert];
      processed.add(alert.id);

      // Find related alerts
      for (const otherAlert of alerts) {
        if (processed.has(otherAlert.id)) continue;

        if (this.areAlertsRelated(alert, otherAlert)) {
          batch.push(otherAlert);
          processed.add(otherAlert.id);
        }
      }

      batches.push(batch);
    }

    return batches;
  }

  /**
   * Determine if two alerts are related and should be batched
   */
  private areAlertsRelated(alert1: Alert, alert2: Alert): boolean {
    // Same type and similar time
    if (alert1.type === alert2.type) {
      const timeDiff = Math.abs(alert1.timestamp.getTime() - alert2.timestamp.getTime());
      return timeDiff < 300000; // 5 minutes
    }

    // Related equipment alerts
    if (alert1.type === 'EQUIPMENT' && alert2.type === 'EQUIPMENT') {
      return true;
    }

    // Related inventory and order alerts
    if ((alert1.type === 'INVENTORY' && alert2.type === 'ORDER') ||
        (alert1.type === 'ORDER' && alert2.type === 'INVENTORY')) {
      return true;
    }

    return false;
  }

  /**
   * Adaptive scheduling based on user interaction patterns
   */
  public adaptSchedulingBasedOnUserBehavior(alerts: Alert[], userEngagementScore: number): Alert[] {
    const adaptedAlerts = [...alerts];

    // If user has low engagement, reduce notification frequency
    if (userEngagementScore < 0.3) {
      return adaptedAlerts.filter(alert => alert.priority === 'CRITICAL' || alert.priority === 'HIGH');
    }

    // If user has high engagement, can send more notifications
    if (userEngagementScore > 0.8) {
      adaptedAlerts.forEach(alert => {
        if (alert.priority === 'LOW') {
          alert.shouldNotify = true;
        }
      });
    }

    return adaptedAlerts;
  }

  /**
   * Time-based scheduling optimization
   */
  public optimizeForTimeOfDay(alerts: Alert[]): Alert[] {
    const now = new Date();
    const hour = now.getHours();
    const optimizedAlerts = [...alerts];

    // Early morning (5-8 AM) - Only critical and high priority
    if (hour >= 5 && hour < 8) {
      return optimizedAlerts.filter(alert => 
        alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
      );
    }

    // Business hours (8 AM - 6 PM) - All priorities
    if (hour >= 8 && hour < 18) {
      return optimizedAlerts;
    }

    // Evening hours (6-10 PM) - Reduce medium and low priority
    if (hour >= 18 && hour < 22) {
      return optimizedAlerts.filter(alert => 
        alert.priority === 'CRITICAL' || alert.priority === 'HIGH' || 
        (alert.priority === 'MEDIUM' && Math.random() > 0.5)
      );
    }

    // Late night (10 PM - 5 AM) - Only critical
    return optimizedAlerts.filter(alert => alert.priority === 'CRITICAL');
  }

  /**
   * Context-aware scheduling based on restaurant scenario
   */
  public scheduleForRestaurantContext(alerts: Alert[], scenario: DemoScenario): Alert[] {
    const contextAlerts = [...alerts];

    switch (scenario) {
      case 'BUSY_LUNCH_RUSH':
        // During busy periods, batch similar alerts and prioritize critical ones
        return this.prioritizeForBusyPeriod(contextAlerts);

      case 'MORNING_PREP':
        // Morning prep - focus on inventory and equipment alerts
        return contextAlerts.filter(alert => 
          alert.type === 'INVENTORY' || alert.type === 'EQUIPMENT' || alert.priority === 'CRITICAL'
        );

      case 'EVENING_SERVICE':
        // Evening service - balance all types but reduce frequency
        return this.reduceFrequencyForEveningService(contextAlerts);

      default:
        return contextAlerts;
    }
  }

  /**
   * Priority-based scheduling for busy periods
   */
  private prioritizeForBusyPeriod(alerts: Alert[]): Alert[] {
    return alerts
      .sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, Math.min(alerts.length, 5)); // Limit to 5 notifications during busy periods
  }

  /**
   * Reduce frequency for evening service
   */
  private reduceFrequencyForEveningService(alerts: Alert[]): Alert[] {
    const batches = this.batchRelatedAlerts(alerts);
    const reducedAlerts: Alert[] = [];

    for (const batch of batches) {
      // Take only the highest priority alert from each batch
      const highestPriority = batch.reduce((prev, current) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[prev.priority] < priorityOrder[current.priority] ? prev : current;
      });
      reducedAlerts.push(highestPriority);
    }

    return reducedAlerts;
  }

  /**
   * Cancel scheduled notification
   */
  public cancelScheduledNotification(alertId: string): boolean {
    const timeoutId = this.scheduledAlerts.get(alertId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledAlerts.delete(alertId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all scheduled notifications
   */
  public cancelAllScheduledNotifications(): void {
    for (const [alertId, timeoutId] of this.scheduledAlerts) {
      clearTimeout(timeoutId);
    }
    this.scheduledAlerts.clear();
  }

  /**
   * Get random delay within range
   */
  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Real-time alert simulation scheduling
   */
  public startRealTimeSimulation(context: MockDataContext, interval: number = 30000): () => void {
    const simulationInterval = setInterval(() => {
      const probability = this.calculateAlertProbability(context);
      
      if (Math.random() < probability) {
        console.log('🎯 Real-time simulation would generate alert now');
        // In a real implementation, this would generate and schedule a new alert
        // this.generateAndScheduleAlert(context);
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(simulationInterval);
  }

  /**
   * Calculate alert probability based on context
   */
  private calculateAlertProbability(context: MockDataContext): number {
    let baseProbability = 0.1; // 10% base chance

    // Adjust based on time of day
    switch (context.timeOfDay) {
      case 'MORNING':
        baseProbability *= 1.5; // Higher probability during prep
        break;
      case 'AFTERNOON':
        baseProbability *= 2.0; // Lunch rush
        break;
      case 'EVENING':
        baseProbability *= 1.8; // Dinner service
        break;
      case 'NIGHT':
        baseProbability *= 0.3; // Lower probability at night
        break;
    }

    // Adjust based on restaurant type
    switch (context.restaurantType) {
      case 'FAST_CASUAL':
        baseProbability *= 1.3;
        break;
      case 'FINE_DINING':
        baseProbability *= 0.8;
        break;
      case 'COFFEE_SHOP':
        baseProbability *= 1.1;
        break;
      case 'BAR':
        baseProbability *= 0.9;
        break;
    }

    // Adjust based on day of week
    if (context.dayOfWeek === 'WEEKEND') {
      baseProbability *= 1.2;
    }

    return Math.min(baseProbability, 0.5); // Cap at 50%
  }

  /**
   * Get scheduling statistics
   */
  public getSchedulingStats(): {
    totalScheduled: number;
    pendingScheduled: number;
    averageDelay: number;
  } {
    return {
      totalScheduled: this.scheduledAlerts.size,
      pendingScheduled: this.scheduledAlerts.size,
      averageDelay: 0, // Would calculate from actual scheduling data
    };
  }
}