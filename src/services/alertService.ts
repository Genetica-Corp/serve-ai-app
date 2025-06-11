import { v4 as uuidv4 } from 'uuid';
import {
  Alert,
  AlertFilters,
  RestaurantContext,
  MockDataOptions,
  IAlertService,
  AlertPriority,
  AlertType,
  DemoScenario,
} from '../../types';
import { MockDataGenerator } from './MockDataGenerator';
import { StorageService } from './StorageService';

export class AlertService implements IAlertService {
  private mockDataGenerator: MockDataGenerator;
  private storageService: StorageService;
  private alertCache: Alert[] = [];
  private lastCacheUpdate: number = 0;
  private cacheExpiryMs: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.mockDataGenerator = new MockDataGenerator();
    this.storageService = new StorageService();
  }

  // Core alert methods
  async generateAlerts(context: RestaurantContext, options?: MockDataOptions): Promise<Alert[]> {
    try {
      let alerts: Alert[];

      if (context.demoMode) {
        // In demo mode, generate scenario-based alerts
        const scenario = this.selectDemoScenario(context);
        alerts = this.mockDataGenerator.generateDemoScenario(scenario, context);
      } else {
        // Generate realistic alerts based on context
        const count = options?.alertCount || this.calculateAlertCount(context);
        alerts = this.mockDataGenerator.generateRealisticAlerts(context, count);
      }

      // Process and enhance alerts
      const processedAlerts = alerts.map(alert => this.processAlert(alert, context));
      
      // Cache the alerts
      this.alertCache = [...processedAlerts, ...this.alertCache];
      this.lastCacheUpdate = Date.now();
      
      // Persist to storage
      await this.storageService.saveAlerts(this.alertCache);
      
      return processedAlerts;
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw new Error('Failed to generate alerts');
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alert = await this.getAlertById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      if (alert.acknowledged) {
        throw new Error('Alert already acknowledged');
      }

      // Update alert state
      const updatedAlert: Partial<Alert> = {
        status: 'ACKNOWLEDGED',
        acknowledged: true,
        acknowledgedAt: Date.now(),
        acknowledgedBy: userId,
        read: true,
        readAt: alert.readAt || Date.now(),
      };

      await this.updateAlert(alertId, updatedAlert);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    try {
      const alert = await this.getAlertById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      if (alert.priority === 'CRITICAL') {
        throw new Error('Critical alerts cannot be dismissed');
      }

      const updatedAlert: Partial<Alert> = {
        status: 'DISMISSED',
        dismissed: true,
        dismissedAt: Date.now(),
      };

      await this.updateAlert(alertId, updatedAlert);
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alert = await this.getAlertById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      const updatedAlert: Partial<Alert> = {
        status: 'RESOLVED',
        resolved: true,
        resolvedAt: Date.now(),
      };

      await this.updateAlert(alertId, updatedAlert);
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  async markAsRead(alertId: string): Promise<void> {
    try {
      const alert = await this.getAlertById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      if (alert.read) {
        return; // Already read
      }

      const updatedAlert: Partial<Alert> = {
        read: true,
        readAt: Date.now(),
      };

      await this.updateAlert(alertId, updatedAlert);
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  filterAlerts(alerts: Alert[], filters: AlertFilters): Alert[] {
    let filtered = [...alerts];

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

    // Sort by priority and timestamp
    return this.sortAlerts(filtered);
  }

  async getAlertById(alertId: string): Promise<Alert | null> {
    try {
      // First check cache
      let alert = this.alertCache.find(a => a.id === alertId);
      
      if (!alert) {
        // Load from storage if not in cache
        const storedAlerts = await this.storageService.loadAlerts();
        alert = storedAlerts.find(a => a.id === alertId);
        
        if (alert) {
          // Update cache
          this.alertCache = storedAlerts;
          this.lastCacheUpdate = Date.now();
        }
      }

      return alert || null;
    } catch (error) {
      console.error('Error getting alert by ID:', error);
      return null;
    }
  }

  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const alerts = await this.getAllAlerts();
      return alerts.filter(alert => 
        alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED'
      );
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  async getAlertHistory(): Promise<Alert[]> {
    try {
      const alerts = await this.getAllAlerts();
      return alerts.filter(alert => 
        alert.status === 'RESOLVED' || alert.status === 'DISMISSED'
      );
    } catch (error) {
      console.error('Error getting alert history:', error);
      return [];
    }
  }

  // Simulation methods
  generateSingleAlert(context: RestaurantContext): Alert {
    return this.mockDataGenerator.generateSingleAlert(context);
  }

  async simulateRealTimeAlert(context: RestaurantContext): Promise<Alert | null> {
    try {
      const probability = this.mockDataGenerator.calculateAlertProbability(
        Date.now(),
        context
      );

      if (Math.random() < probability) {
        const alert = this.generateSingleAlert(context);
        const processedAlert = this.processAlert(alert, context);
        
        // Add to cache and storage
        this.alertCache.unshift(processedAlert);
        await this.storageService.saveAlerts(this.alertCache);
        
        return processedAlert;
      }

      return null;
    } catch (error) {
      console.error('Error simulating real-time alert:', error);
      return null;
    }
  }

  // Statistics and analytics
  async getAlertStatistics(timeRange?: { start: number; end: number }) {
    try {
      const alerts = await this.getAllAlerts();
      const filteredAlerts = timeRange
        ? alerts.filter(alert => 
            alert.timestamp >= timeRange.start && alert.timestamp <= timeRange.end
          )
        : alerts;

      const stats = {
        total: filteredAlerts.length,
        byPriority: this.groupBy(filteredAlerts, 'priority'),
        byType: this.groupBy(filteredAlerts, 'type'),
        byStatus: this.groupBy(filteredAlerts, 'status'),
        averageResolutionTime: this.calculateAverageResolutionTime(filteredAlerts),
        unreadCount: filteredAlerts.filter(alert => !alert.read).length,
        criticalCount: filteredAlerts.filter(alert => 
          alert.priority === 'CRITICAL' && alert.status === 'ACTIVE'
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating alert statistics:', error);
      throw error;
    }
  }

  // Cache management
  async refreshCache(): Promise<void> {
    try {
      this.alertCache = await this.storageService.loadAlerts();
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  }

  isCacheExpired(): boolean {
    return Date.now() - this.lastCacheUpdate > this.cacheExpiryMs;
  }

  // Private helper methods
  private async getAllAlerts(): Promise<Alert[]> {
    if (this.isCacheExpired()) {
      await this.refreshCache();
    }
    return this.alertCache;
  }

  private async updateAlert(alertId: string, updates: Partial<Alert>): Promise<void> {
    // Update cache
    const alertIndex = this.alertCache.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      this.alertCache[alertIndex] = { ...this.alertCache[alertIndex], ...updates };
    }

    // Update storage
    await this.storageService.saveAlerts(this.alertCache);
  }

  private processAlert(alert: Alert, context: RestaurantContext): Alert {
    // Add context-specific processing
    const processed: Alert = {
      ...alert,
      id: alert.id || uuidv4(),
      timestamp: alert.timestamp || Date.now(),
      read: false,
      acknowledged: false,
      resolved: false,
      dismissed: false,
      shouldNotify: this.shouldGenerateNotification(alert, context),
      notificationSent: false,
    };

    // Add tags based on context
    processed.tags = [
      ...processed.tags || [],
      context.profile.type,
      this.getTimeBasedTag(),
      this.getCapacityBasedTag(context),
    ];

    return processed;
  }

  private selectDemoScenario(context: RestaurantContext): DemoScenario {
    const hour = new Date().getHours();
    const capacityPercentage = context.currentCapacity / context.profile.capacity;

    if (hour >= 11 && hour <= 14 && capacityPercentage > 0.7) {
      return 'BUSY_LUNCH_RUSH';
    } else if (hour >= 6 && hour <= 10) {
      return 'MORNING_PREP';
    } else if (hour >= 17 && hour <= 22) {
      return 'EVENING_SERVICE';
    } else if (capacityPercentage < 0.2) {
      return 'QUIET_PERIOD';
    } else {
      // Random scenario
      const scenarios: DemoScenario[] = [
        'EQUIPMENT_FAILURE',
        'STAFF_SHORTAGE',
        'INVENTORY_CRISIS',
        'CUSTOMER_COMPLAINTS',
      ];
      return scenarios[Math.floor(Math.random() * scenarios.length)];
    }
  }

  private calculateAlertCount(context: RestaurantContext): number {
    const baseCount = 3;
    const capacityMultiplier = context.currentCapacity / context.profile.capacity;
    const timeMultiplier = context.profile.peakHours.includes(
      new Date().toTimeString().slice(0, 5)
    ) ? 1.5 : 1;

    return Math.floor(baseCount * capacityMultiplier * timeMultiplier);
  }

  private shouldGenerateNotification(alert: Alert, context: RestaurantContext): boolean {
    // Critical alerts always notify
    if (alert.priority === 'CRITICAL') return true;

    // During quiet hours, only high priority and above
    const hour = new Date().getHours();
    if ((hour >= 22 || hour <= 6) && alert.priority !== 'HIGH') {
      return false;
    }

    return true;
  }

  private getTimeBasedTag(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'late-night';
  }

  private getCapacityBasedTag(context: RestaurantContext): string {
    const percentage = (context.currentCapacity / context.profile.capacity) * 100;
    if (percentage > 80) return 'high-capacity';
    if (percentage > 50) return 'medium-capacity';
    return 'low-capacity';
  }

  private sortAlerts(alerts: Alert[]): Alert[] {
    const priorityOrder: Record<AlertPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return alerts.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (newest first)
      return b.timestamp - a.timestamp;
    });
  }

  private groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, number> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = (groups[groupKey] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private calculateAverageResolutionTime(alerts: Alert[]): number {
    const resolvedAlerts = alerts.filter(alert => alert.resolved && alert.resolvedAt);
    
    if (resolvedAlerts.length === 0) return 0;

    const totalResolutionTime = resolvedAlerts.reduce((total, alert) => {
      return total + (alert.resolvedAt! - alert.timestamp);
    }, 0);

    return Math.round(totalResolutionTime / resolvedAlerts.length / (1000 * 60)); // Return in minutes
  }
}