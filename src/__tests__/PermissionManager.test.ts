import { PermissionManager } from '../services/PermissionManager';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
}));

describe('PermissionManager', () => {
  let permissionManager: PermissionManager;
  let mockNotifications: any;

  beforeEach(() => {
    // Reset singleton instance
    (PermissionManager as any).instance = undefined;
    permissionManager = PermissionManager.getInstance();
    
    mockNotifications = require('expo-notifications');
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PermissionManager.getInstance();
      const instance2 = PermissionManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('permission requests', () => {
    it('should return granted when permissions already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
      });

      const result = await permissionManager.requestNotificationPermissions();

      expect(result.success).toBe(true);
      expect(result.data).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permissions when not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        granted: true,
      });

      const result = await permissionManager.requestNotificationPermissions();

      expect(result.success).toBe(true);
      expect(result.data).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledWith({
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
    });

    it('should handle permission denial', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        granted: false,
      });

      const result = await permissionManager.requestNotificationPermissions();

      expect(result.success).toBe(false);
      expect(result.error).toContain('denied by user');
    });

    it('should handle permission request errors', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('Permission check failed')
      );

      const result = await permissionManager.requestNotificationPermissions();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to request permissions');
    });
  });

  describe('permission status checking', () => {
    it('should return granted status correctly', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
      });

      const status = await permissionManager.checkPermissionStatus();

      expect(status).toBe('granted');
    });

    it('should return undetermined status when can ask again', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      });

      const status = await permissionManager.checkPermissionStatus();

      expect(status).toBe('undetermined');
    });

    it('should return denied status when cannot ask again', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: false,
      });

      const status = await permissionManager.checkPermissionStatus();

      expect(status).toBe('denied');
    });

    it('should handle status check errors', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('Status check failed')
      );

      const status = await permissionManager.checkPermissionStatus();

      expect(status).toBe('undetermined');
    });
  });

  describe('detailed permissions', () => {
    it('should return detailed permission information', async () => {
      const mockPermissions = {
        granted: true,
        canAskAgain: true,
        ios: { allowsCriticalAlerts: true },
      };
      mockNotifications.getPermissionsAsync.mockResolvedValue(mockPermissions);

      const permissions = await permissionManager.getDetailedPermissions();

      expect(permissions).toEqual(mockPermissions);
    });
  });

  describe('permission denial handling', () => {
    it('should handle permission denial gracefully', async () => {
      const result = await permissionManager.handlePermissionDenial();

      expect(result.success).toBe(true);
      expect(result.data).toContain('Notifications disabled');
    });

    it('should handle permission denial errors', async () => {
      // Mock some internal error during handling
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await permissionManager.handlePermissionDenial();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to handle permission denial');

      consoleSpy.mockRestore();
    });
  });

  describe('permission education', () => {
    it('should provide iOS education message on iOS', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      const message = permissionManager.showPermissionEducation();

      expect(message).toContain('Get notified about critical restaurant alerts');
      expect(message).toContain('We\'ll only send important updates');

      require('react-native').Platform.OS = originalPlatform;
    });

    it('should provide Android education message on Android', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'android';

      const message = permissionManager.showPermissionEducation();

      expect(message).toContain('Allow notifications to stay informed');
      expect(message).toContain('urgent restaurant issues');

      require('react-native').Platform.OS = originalPlatform;
    });
  });

  describe('can ask again checking', () => {
    it('should return true when can ask again', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        canAskAgain: true,
      });

      const canAsk = await permissionManager.canAskAgain();

      expect(canAsk).toBe(true);
    });

    it('should return false when cannot ask again', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        canAskAgain: false,
      });

      const canAsk = await permissionManager.canAskAgain();

      expect(canAsk).toBe(false);
    });
  });

  describe('critical alerts (iOS)', () => {
    beforeEach(() => {
      require('react-native').Platform.OS = 'ios';
    });

    afterEach(() => {
      require('react-native').Platform.OS = 'ios'; // Reset to default
    });

    it('should check critical alerts permission on iOS', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        ios: { allowsCriticalAlerts: true },
      });

      const allowed = await permissionManager.areCriticalAlertsAllowed();

      expect(allowed).toBe(true);
    });

    it('should handle missing critical alerts permission', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        ios: {},
      });

      const allowed = await permissionManager.areCriticalAlertsAllowed();

      expect(allowed).toBe(false);
    });

    it('should handle critical alerts check errors', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('Permission check failed')
      );

      const allowed = await permissionManager.areCriticalAlertsAllowed();

      expect(allowed).toBe(false);
    });
  });

  describe('critical alerts (Android)', () => {
    beforeEach(() => {
      require('react-native').Platform.OS = 'android';
    });

    it('should return true for critical alerts on Android', async () => {
      const allowed = await permissionManager.areCriticalAlertsAllowed();

      expect(allowed).toBe(true);
    });
  });

  describe('priority validation', () => {
    it('should validate permission for high priority alert', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
      });

      const valid = await permissionManager.validatePermissionForPriority('HIGH');

      expect(valid).toBe(true);
    });

    it('should validate critical alert permission on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
        ios: { allowsCriticalAlerts: true },
      });

      const valid = await permissionManager.validatePermissionForPriority('CRITICAL');

      expect(valid).toBe(true);
    });

    it('should reject when permissions not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
      });

      const valid = await permissionManager.validatePermissionForPriority('HIGH');

      expect(valid).toBe(false);
    });

    it('should reject critical alerts without special permission on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
        ios: { allowsCriticalAlerts: false },
      });

      const valid = await permissionManager.validatePermissionForPriority('CRITICAL');

      expect(valid).toBe(false);
    });
  });

  describe('notification categories setup', () => {
    it('should set up notification categories when permissions granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        granted: true,
      });

      await permissionManager.requestNotificationPermissions();

      expect(mockNotifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
        'CRITICAL_ALERT',
        expect.arrayContaining([
          expect.objectContaining({ identifier: 'ACKNOWLEDGE' }),
          expect.objectContaining({ identifier: 'VIEW_DETAILS' }),
        ])
      );

      expect(mockNotifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
        'HIGH_ALERT',
        expect.arrayContaining([
          expect.objectContaining({ identifier: 'ACKNOWLEDGE' }),
          expect.objectContaining({ identifier: 'DISMISS' }),
        ])
      );

      expect(mockNotifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
        'MEDIUM_ALERT',
        expect.arrayContaining([
          expect.objectContaining({ identifier: 'DISMISS' }),
        ])
      );
    });
  });

  describe('state management', () => {
    it('should track current permission status', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
      });

      await permissionManager.checkPermissionStatus();
      const status = permissionManager.getCurrentPermissionStatus();

      expect(status).toBe('granted');
    });

    it('should reset education state', () => {
      permissionManager.resetEducationState();

      // This should not throw an error
      expect(() => {
        permissionManager.resetEducationState();
      }).not.toThrow();
    });
  });

  describe('app settings integration', () => {
    it('should provide method to open app settings', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await permissionManager.openAppSettings();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Opening app settings')
      );

      consoleSpy.mockRestore();
    });
  });
});