import { NotificationScheduler } from '../services/NotificationScheduler';
import { NotificationService } from '../services/NotificationService';
import { Alert, NotificationSettings, DemoScenario, MockDataContext } from '../types';
import { v4 as uuidv4 } from 'react-native-uuid';

// Mock dependencies
jest.mock('../services/NotificationService');

describe('NotificationScheduler', () => {
  let scheduler: NotificationScheduler;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const createMockAlert = (overrides: Partial<Alert> = {}): Alert => ({
    id: uuidv4() as string,
    type: 'ORDER',
    priority: 'HIGH',
    title: 'Test Alert',
    message: 'This is a test alert',
    timestamp: new Date(),
    acknowledged: false,
    resolved: false,
    read: false,
    data: {},
    notificationSent: false,
    shouldNotify: true,
    ...overrides,
  });

  const createMockSettings = (overrides: Partial<NotificationSettings> = {}): NotificationSettings => ({
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
    ...overrides,
  });

  beforeEach(() => {
    // Reset singleton instance
    (NotificationScheduler as any).instance = undefined;
    scheduler = NotificationScheduler.getInstance();

    // Setup notification service mock
    mockNotificationService = NotificationService.getInstance() as jest.Mocked<NotificationService>;
    mockNotificationService.scheduleNotification.mockResolvedValue({
      success: true,
      data: 'notification-id',
      timestamp: new Date(),
    });

    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationScheduler.getInstance();
      const instance2 = NotificationScheduler.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('notification scheduling', () => {
    it('should schedule notifications for eligible alerts', async () => {
      const alerts = [
        createMockAlert({ id: 'alert-1', priority: 'CRITICAL' }),
        createMockAlert({ id: 'alert-2', priority: 'HIGH' }),
        createMockAlert({ id: 'alert-3', shouldNotify: false }),
      ];
      const settings = createMockSettings();

      const result = await scheduler.scheduleNotifications(alerts, settings);

      expect(result.success).toBe(true);
      expect(result.data).toBe(2); // Only 2 alerts should be scheduled
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledTimes(2);
    });

    it('should handle scheduling errors gracefully', async () => {
      const alerts = [createMockAlert({ priority: 'CRITICAL' })];
      const settings = createMockSettings();

      mockNotificationService.scheduleNotification.mockRejectedValue(
        new Error('Scheduling failed')
      );

      const result = await scheduler.scheduleNotifications(alerts, settings);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to schedule notifications');
    });

    it('should skip already sent notifications', async () => {
      const alerts = [
        createMockAlert({ notificationSent: true }),
        createMockAlert({ notificationSent: false }),
      ];
      const settings = createMockSettings();

      const result = await scheduler.scheduleNotifications(alerts, settings);

      expect(result.success).toBe(true);
      expect(result.data).toBe(1); // Only 1 alert should be scheduled
    });
  });

  describe('alert batching', () => {
    it('should group related alerts together', () => {
      const alerts = [
        createMockAlert({ id: 'alert-1', type: 'ORDER', timestamp: new Date('2023-01-01T10:00:00Z') }),
        createMockAlert({ id: 'alert-2', type: 'ORDER', timestamp: new Date('2023-01-01T10:02:00Z') }),
        createMockAlert({ id: 'alert-3', type: 'EQUIPMENT', timestamp: new Date('2023-01-01T10:00:00Z') }),
        createMockAlert({ id: 'alert-4', type: 'INVENTORY', timestamp: new Date('2023-01-01T10:00:00Z') }),
      ];

      const batches = scheduler.batchRelatedAlerts(alerts);

      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(2); // ORDER alerts batched together
      expect(batches[1]).toHaveLength(1); // EQUIPMENT alert alone
      expect(batches[2]).toHaveLength(1); // INVENTORY alert alone
    });

    it('should handle empty alert list', () => {
      const batches = scheduler.batchRelatedAlerts([]);

      expect(batches).toEqual([]);
    });

    it('should create separate batches for unrelated alerts', () => {
      const alerts = [
        createMockAlert({ id: 'alert-1', type: 'CUSTOMER' }),
        createMockAlert({ id: 'alert-2', type: 'FINANCIAL' }),
        createMockAlert({ id: 'alert-3', type: 'STAFF' }),
      ];

      const batches = scheduler.batchRelatedAlerts(alerts);

      expect(batches).toHaveLength(3);
      batches.forEach(batch => {
        expect(batch).toHaveLength(1);
      });
    });
  });

  describe('adaptive scheduling', () => {
    it('should reduce alerts for low engagement users', () => {
      const alerts = [
        createMockAlert({ priority: 'CRITICAL' }),
        createMockAlert({ priority: 'HIGH' }),
        createMockAlert({ priority: 'MEDIUM' }),
        createMockAlert({ priority: 'LOW' }),
      ];

      const adaptedAlerts = scheduler.adaptSchedulingBasedOnUserBehavior(alerts, 0.2);

      expect(adaptedAlerts).toHaveLength(2); // Only CRITICAL and HIGH
      expect(adaptedAlerts.every(alert => 
        alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
      )).toBe(true);
    });

    it('should enable more alerts for high engagement users', () => {
      const alerts = [
        createMockAlert({ priority: 'LOW', shouldNotify: false }),
        createMockAlert({ priority: 'MEDIUM', shouldNotify: true }),
      ];

      const adaptedAlerts = scheduler.adaptSchedulingBasedOnUserBehavior(alerts, 0.9);

      expect(adaptedAlerts[0].shouldNotify).toBe(true); // LOW priority enabled
    });

    it('should maintain normal behavior for average engagement', () => {
      const alerts = [
        createMockAlert({ priority: 'HIGH' }),
        createMockAlert({ priority: 'MEDIUM' }),
      ];

      const adaptedAlerts = scheduler.adaptSchedulingBasedOnUserBehavior(alerts, 0.5);

      expect(adaptedAlerts).toEqual(alerts);
    });
  });

  describe('time-based optimization', () => {
    it('should filter alerts during early morning hours', () => {
      // Mock current hour to be 6 AM
      const originalDate = Date;
      const mockDate = new Date('2023-01-01T06:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const alerts = [
        createMockAlert({ priority: 'CRITICAL' }),
        createMockAlert({ priority: 'HIGH' }),
        createMockAlert({ priority: 'MEDIUM' }),
        createMockAlert({ priority: 'LOW' }),
      ];

      const optimizedAlerts = scheduler.optimizeForTimeOfDay(alerts);

      expect(optimizedAlerts).toHaveLength(2); // Only CRITICAL and HIGH
      expect(optimizedAlerts.every(alert => 
        alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
      )).toBe(true);

      global.Date = originalDate;
    });

    it('should allow all alerts during business hours', () => {
      // Mock current hour to be 12 PM
      const originalDate = Date;
      const mockDate = new Date('2023-01-01T12:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const alerts = [
        createMockAlert({ priority: 'CRITICAL' }),
        createMockAlert({ priority: 'HIGH' }),
        createMockAlert({ priority: 'MEDIUM' }),
        createMockAlert({ priority: 'LOW' }),
      ];

      const optimizedAlerts = scheduler.optimizeForTimeOfDay(alerts);

      expect(optimizedAlerts).toEqual(alerts);

      global.Date = originalDate;
    });

    it('should only allow critical alerts during late night', () => {
      // Mock current hour to be 2 AM
      const originalDate = Date;
      const mockDate = new Date('2023-01-01T02:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const alerts = [
        createMockAlert({ priority: 'CRITICAL' }),
        createMockAlert({ priority: 'HIGH' }),
        createMockAlert({ priority: 'MEDIUM' }),
        createMockAlert({ priority: 'LOW' }),
      ];

      const optimizedAlerts = scheduler.optimizeForTimeOfDay(alerts);

      expect(optimizedAlerts).toHaveLength(1);
      expect(optimizedAlerts[0].priority).toBe('CRITICAL');

      global.Date = originalDate;
    });
  });

  describe('restaurant context scheduling', () => {
    it('should prioritize for busy lunch rush', () => {
      const alerts = Array.from({ length: 10 }, (_, i) => 
        createMockAlert({ id: `alert-${i}`, priority: i < 3 ? 'CRITICAL' : 'LOW' })
      );

      const contextAlerts = scheduler.scheduleForRestaurantContext(alerts, 'BUSY_LUNCH_RUSH');

      expect(contextAlerts.length).toBeLessThanOrEqual(5); // Limited during busy periods
    });

    it('should filter for morning prep scenario', () => {
      const alerts = [
        createMockAlert({ type: 'INVENTORY' }),
        createMockAlert({ type: 'EQUIPMENT' }),
        createMockAlert({ type: 'CUSTOMER' }), // Should be filtered out
        createMockAlert({ type: 'ORDER' }), // Should be filtered out
        createMockAlert({ priority: 'CRITICAL', type: 'FINANCIAL' }), // Should be kept
      ];

      const contextAlerts = scheduler.scheduleForRestaurantContext(alerts, 'MORNING_PREP');

      expect(contextAlerts).toHaveLength(3);
      expect(contextAlerts.some(alert => alert.type === 'CUSTOMER')).toBe(false);
      expect(contextAlerts.some(alert => alert.type === 'ORDER')).toBe(false);
    });

    it('should reduce frequency for evening service', () => {
      const alerts = [
        createMockAlert({ id: 'alert-1', type: 'ORDER', priority: 'HIGH' }),
        createMockAlert({ id: 'alert-2', type: 'ORDER', priority: 'MEDIUM' }),
        createMockAlert({ id: 'alert-3', type: 'EQUIPMENT', priority: 'LOW' }),
      ];

      const contextAlerts = scheduler.scheduleForRestaurantContext(alerts, 'EVENING_SERVICE');

      // Should take highest priority from related batches
      expect(contextAlerts.length).toBeLessThanOrEqual(2);
    });
  });

  describe('notification cancellation', () => {
    it('should cancel scheduled notification', () => {
      const alertId = 'test-alert-id';
      
      // First schedule a notification (simulate by setting timeout)
      scheduler['scheduledAlerts'].set(alertId, setTimeout(() => {}, 1000) as any);

      const result = scheduler.cancelScheduledNotification(alertId);

      expect(result).toBe(true);
      expect(scheduler['scheduledAlerts'].has(alertId)).toBe(false);
    });

    it('should return false for non-existent notification', () => {
      const result = scheduler.cancelScheduledNotification('non-existent-id');

      expect(result).toBe(false);
    });

    it('should cancel all scheduled notifications', () => {
      // Set up some scheduled notifications
      scheduler['scheduledAlerts'].set('alert-1', setTimeout(() => {}, 1000) as any);
      scheduler['scheduledAlerts'].set('alert-2', setTimeout(() => {}, 1000) as any);

      scheduler.cancelAllScheduledNotifications();

      expect(scheduler['scheduledAlerts'].size).toBe(0);
    });
  });

  describe('real-time simulation', () => {
    it('should start and stop real-time simulation', () => {
      const context: MockDataContext = {
        scenario: 'BUSY_LUNCH_RUSH',
        restaurantType: 'FAST_CASUAL',
        timeOfDay: 'AFTERNOON',
        dayOfWeek: 'WEEKDAY',
      };

      const stopSimulation = scheduler.startRealTimeSimulation(context, 100);

      expect(typeof stopSimulation).toBe('function');

      // Stop the simulation
      stopSimulation();

      // Should not throw an error
      expect(() => stopSimulation()).not.toThrow();
    });

    it('should calculate different probabilities for different contexts', () => {
      const busyContext: MockDataContext = {
        scenario: 'BUSY_LUNCH_RUSH',
        restaurantType: 'FAST_CASUAL',
        timeOfDay: 'AFTERNOON',
        dayOfWeek: 'WEEKEND',
      };

      const quietContext: MockDataContext = {
        scenario: 'MORNING_PREP',
        restaurantType: 'FINE_DINING',
        timeOfDay: 'NIGHT',
        dayOfWeek: 'WEEKDAY',
      };

      const busyProbability = scheduler['calculateAlertProbability'](busyContext);
      const quietProbability = scheduler['calculateAlertProbability'](quietContext);

      expect(busyProbability).toBeGreaterThan(quietProbability);
    });
  });

  describe('scheduling statistics', () => {
    it('should return scheduling statistics', () => {
      const stats = scheduler.getSchedulingStats();

      expect(stats).toHaveProperty('totalScheduled');
      expect(stats).toHaveProperty('pendingScheduled');
      expect(stats).toHaveProperty('averageDelay');
      expect(typeof stats.totalScheduled).toBe('number');
    });
  });

  describe('delay calculation', () => {
    it('should return immediate delay for critical alerts', () => {
      const alert = createMockAlert({ priority: 'CRITICAL' });
      const settings = createMockSettings();

      const delay = scheduler['calculateOptimalNotificationTime'](alert, settings);

      expect(delay).toBe(0);
    });

    it('should return appropriate delays for different priorities', () => {
      const settings = createMockSettings();

      const highAlert = createMockAlert({ priority: 'HIGH' });
      const mediumAlert = createMockAlert({ priority: 'MEDIUM' });
      const lowAlert = createMockAlert({ priority: 'LOW' });

      const highDelay = scheduler['calculateOptimalNotificationTime'](highAlert, settings);
      const mediumDelay = scheduler['calculateOptimalNotificationTime'](mediumAlert, settings);
      const lowDelay = scheduler['calculateOptimalNotificationTime'](lowAlert, settings);

      expect(highDelay).toBeGreaterThan(0);
      expect(mediumDelay).toBeGreaterThan(highDelay);
      expect(lowDelay).toBeGreaterThan(mediumDelay);
    });
  });

  describe('random delay generation', () => {
    it('should generate delays within specified range', () => {
      const min = 1000;
      const max = 5000;

      for (let i = 0; i < 10; i++) {
        const delay = scheduler['getRandomDelay'](min, max);
        expect(delay).toBeGreaterThanOrEqual(min);
        expect(delay).toBeLessThanOrEqual(max);
      }
    });

    it('should handle equal min and max values', () => {
      const value = 1000;
      const delay = scheduler['getRandomDelay'](value, value);

      expect(delay).toBe(value);
    });
  });
});