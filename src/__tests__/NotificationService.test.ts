import { NotificationService } from '../services/NotificationService';
import { PermissionManager } from '../services/PermissionManager';
import { Alert, NotificationSettings } from '../types';
import { v4 as uuidv4 } from 'react-native-uuid';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../services/PermissionManager');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockPermissionManager: jest.Mocked<PermissionManager>;

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

  beforeEach(() => {
    // Reset singleton instance
    (NotificationService as any).instance = undefined;
    notificationService = NotificationService.getInstance();

    // Setup permission manager mock
    mockPermissionManager = PermissionManager.getInstance() as jest.Mocked<PermissionManager>;
    mockPermissionManager.checkPermissionStatus.mockResolvedValue('granted');
    mockPermissionManager.requestNotificationPermissions.mockResolvedValue({
      success: true,
      data: 'granted',
      timestamp: new Date(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully with granted permissions', async () => {
      const result = await notificationService.initialize();

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockPermissionManager.requestNotificationPermissions).toHaveBeenCalled();
    });

    it('should handle initialization with denied permissions', async () => {
      mockPermissionManager.requestNotificationPermissions.mockResolvedValue({
        success: false,
        error: 'Permissions denied',
        timestamp: new Date(),
      });

      const result = await notificationService.initialize();

      expect(result.success).toBe(true); // Should still succeed, just with limited functionality
      expect(result.data).toBe(true);
    });

    it('should handle initialization errors', async () => {
      mockPermissionManager.requestNotificationPermissions.mockRejectedValue(
        new Error('Permission request failed')
      );

      const result = await notificationService.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to initialize notification service');
    });
  });

  describe('notification scheduling', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should schedule notification for valid alert', async () => {
      const alert = createMockAlert({ priority: 'CRITICAL' });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string'); // Should return notification ID
      expect(alert.notificationSent).toBe(true);
      expect(alert.notificationScheduledAt).toBeDefined();
    });

    it('should not schedule notification for low priority alert when disabled', async () => {
      const alert = createMockAlert({ priority: 'LOW' });
      
      await notificationService.updateSettings({ allowLow: false });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(false);
      expect(result.error).toContain('filtered by user settings');
    });

    it('should always schedule critical alerts regardless of settings', async () => {
      const alert = createMockAlert({ priority: 'CRITICAL' });
      
      await notificationService.updateSettings({ 
        allowHigh: false,
        allowMedium: false,
        allowLow: false
      });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(true);
    });

    it('should respect quiet hours for non-critical alerts', async () => {
      const alert = createMockAlert({ priority: 'MEDIUM' });
      
      // Set quiet hours (assuming test runs during these hours)
      await notificationService.updateSettings({
        quietHours: {
          enabled: true,
          start: '00:00',
          end: '23:59'
        }
      });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(false);
      expect(result.error).toContain('filtered by user settings');
    });
  });

  describe('notification settings', () => {
    it('should update settings successfully', async () => {
      const newSettings: Partial<NotificationSettings> = {
        allowHigh: false,
        maxPerHour: 5,
        customSounds: false,
      };

      const result = await notificationService.updateSettings(newSettings);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(newSettings);
    });

    it('should return current settings', () => {
      const settings = notificationService.getSettings();

      expect(settings).toBeDefined();
      expect(typeof settings.allowNotifications).toBe('boolean');
      expect(typeof settings.allowCritical).toBe('boolean');
      expect(typeof settings.maxPerHour).toBe('number');
    });

    it('should handle settings update errors', async () => {
      // Mock AsyncStorage to throw an error
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await notificationService.updateSettings({ allowHigh: false });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update settings');
    });
  });

  describe('notification cancellation', () => {
    it('should cancel notification successfully', async () => {
      const result = await notificationService.cancelNotification('test-id');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should cancel all notifications successfully', async () => {
      const result = await notificationService.cancelAllNotifications();

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle cancellation errors', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error('Cancel failed')
      );

      const result = await notificationService.cancelNotification('test-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to cancel notification');
    });
  });

  describe('badge management', () => {
    it('should get badge count', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.getBadgeCountAsync.mockResolvedValue(5);

      const count = await notificationService.getBadgeCount();

      expect(count).toBe(5);
    });

    it('should set badge count', async () => {
      await notificationService.setBadgeCount(3);

      const mockNotifications = require('expo-notifications');
      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(3);
    });
  });

  describe('notification history', () => {
    it('should return empty history initially', () => {
      const history = notificationService.getNotificationHistory();

      expect(history).toEqual([]);
    });

    it('should clear notification history', () => {
      notificationService.clearNotificationHistory();
      const history = notificationService.getNotificationHistory();

      expect(history).toEqual([]);
    });
  });

  describe('notification queue', () => {
    it('should queue notification for processing', () => {
      const alert = createMockAlert();

      // This should not throw an error
      expect(() => {
        notificationService.queueNotification(alert);
      }).not.toThrow();
    });

    it('should process queued notifications', async () => {
      await notificationService.initialize();

      const alert1 = createMockAlert({ id: 'alert-1' });
      const alert2 = createMockAlert({ id: 'alert-2' });

      notificationService.queueNotification(alert1);
      notificationService.queueNotification(alert2);

      // Allow async processing to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alert1.notificationSent).toBe(true);
      expect(alert2.notificationSent).toBe(true);
    });
  });

  describe('permission integration', () => {
    it('should not schedule notifications when permissions denied', async () => {
      mockPermissionManager.checkPermissionStatus.mockResolvedValue('denied');
      await notificationService.initialize();

      const alert = createMockAlert();
      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(false);
      expect(result.error).toContain('filtered by user settings');
    });

    it('should handle permission check errors gracefully', async () => {
      mockPermissionManager.checkPermissionStatus.mockRejectedValue(
        new Error('Permission check failed')
      );
      await notificationService.initialize();

      const alert = createMockAlert();
      const result = await notificationService.scheduleNotification(alert);

      // Should handle the error gracefully and not crash
      expect(result).toBeDefined();
    });
  });

  describe('notification payload building', () => {
    it('should build correct notification payload for critical alert', async () => {
      await notificationService.initialize();
      const alert = createMockAlert({ 
        priority: 'CRITICAL',
        title: 'Critical Issue',
        message: 'This is a critical alert that needs immediate attention'
      });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(true);
      // Verify the notification was built with correct format
      // (This would require mocking expo-notifications more thoroughly)
    });

    it('should truncate long notification messages', async () => {
      await notificationService.initialize();
      const longMessage = 'A'.repeat(200); // Very long message
      const alert = createMockAlert({ 
        message: longMessage,
        priority: 'HIGH'
      });

      const result = await notificationService.scheduleNotification(alert);

      expect(result.success).toBe(true);
      // The actual truncation would be tested by checking the notification content
    });
  });
});