# Serve AI - API Documentation

This document provides comprehensive documentation for the Serve AI restaurant alert notification system's service interfaces, component architecture, and data structures.

## 📋 Table of Contents

- [Service Interfaces](#service-interfaces)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Data Models](#data-models)
- [Mock Data Structure](#mock-data-structure)
- [Context Providers](#context-providers)
- [Custom Hooks](#custom-hooks)
- [Utility Functions](#utility-functions)

## 🔧 Service Interfaces

### AlertService

The core service responsible for alert generation, management, and business logic.

```typescript
interface IAlertService {
  // Alert Generation
  generateDemoAlerts(scenario: DemoScenario): Promise<Alert[]>;
  generateRealisticAlerts(context: RestaurantContext): Promise<Alert[]>;
  createAlert(params: CreateAlertParams): Alert;
  
  // Alert Management
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  dismissAlert(alertId: string): Promise<void>;
  resolveAlert(alertId: string, resolution: string): Promise<void>;
  markAsRead(alertId: string): Promise<void>;
  
  // Alert Queries
  getActiveAlerts(): Promise<Alert[]>;
  getAlertsByCategory(category: AlertCategory): Promise<Alert[]>;
  getAlertsByPriority(priority: AlertPriority): Promise<Alert[]>;
  getAlertHistory(dateRange: DateRange): Promise<Alert[]>;
  
  // Filtering and Sorting
  filterAlerts(alerts: Alert[], filters: AlertFilters): Alert[];
  sortAlerts(alerts: Alert[], sortBy: AlertSortBy): Alert[];
}

// Usage Example
const alertService = new AlertService();

// Generate demo alerts
const demoAlerts = await alertService.generateDemoAlerts('BUSY_LUNCH_RUSH');

// Acknowledge critical alert
await alertService.acknowledgeAlert('alert-123', 'manager-456');

// Get filtered alerts
const criticalAlerts = await alertService.getAlertsByPriority('CRITICAL');
```

#### AlertService Methods

**generateDemoAlerts(scenario: DemoScenario)**
- **Purpose**: Generate pre-configured alerts for demo scenarios
- **Parameters**: 
  - `scenario`: 'BUSY_LUNCH_RUSH' | 'MORNING_PREP' | 'EVENING_SERVICE'
- **Returns**: `Promise<Alert[]>`
- **Example**:
  ```typescript
  const alerts = await alertService.generateDemoAlerts('BUSY_LUNCH_RUSH');
  // Returns: [
  //   { id: '1', type: 'EQUIPMENT', priority: 'CRITICAL', title: 'Freezer Temperature Alert' },
  //   { id: '2', type: 'ORDER', priority: 'HIGH', title: '15 Orders in Queue' }
  // ]
  ```

**acknowledgeAlert(alertId: string, userId: string)**
- **Purpose**: Mark alert as acknowledged by user
- **Parameters**: 
  - `alertId`: Unique alert identifier
  - `userId`: User who acknowledged the alert
- **Returns**: `Promise<void>`
- **Side Effects**: Updates alert state, persists to storage, triggers notifications

### NotificationService

Handles push notifications, permissions, and notification scheduling.

```typescript
interface INotificationService {
  // Permission Management
  requestPermissions(): Promise<NotificationPermissionStatus>;
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  
  // Notification Scheduling
  scheduleNotification(alert: Alert): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  
  // Notification Handling
  handleNotificationReceived(notification: Notification): void;
  handleNotificationTapped(notification: Notification): void;
  
  // Configuration
  setNotificationCategories(): Promise<void>;
  updateBadgeCount(count: number): Promise<void>;
}

// Usage Example
const notificationService = new NotificationService();

// Request permissions
const permission = await notificationService.requestPermissions();

// Schedule notification for critical alert
const notificationId = await notificationService.scheduleNotification(criticalAlert);

// Handle notification tap
notificationService.handleNotificationTapped((notification) => {
  const alertId = notification.data?.alertId;
  navigateToAlert(alertId);
});
```

#### NotificationService Methods

**scheduleNotification(alert: Alert)**
- **Purpose**: Schedule local push notification for alert
- **Parameters**: Alert object containing notification details
- **Returns**: `Promise<string>` - Notification ID for cancellation
- **Example**:
  ```typescript
  const notificationId = await notificationService.scheduleNotification({
    id: 'alert-123',
    priority: 'CRITICAL',
    title: 'Freezer Temperature Alert',
    message: 'Freezer temperature is 45°F - immediate attention required'
  });
  ```

### StorageService

Manages data persistence using AsyncStorage with offline capabilities.

```typescript
interface IStorageService {
  // Alert Storage
  saveAlerts(alerts: Alert[]): Promise<void>;
  loadAlerts(): Promise<Alert[]>;
  deleteAlert(alertId: string): Promise<void>;
  
  // Settings Storage
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  loadUserPreferences(): Promise<UserPreferences>;
  
  // Cache Management
  clearCache(): Promise<void>;
  getCacheSize(): Promise<number>;
  validateCache(): Promise<boolean>;
  
  // Backup and Restore
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
}

// Usage Example
const storageService = new StorageService();

// Save alerts to storage
await storageService.saveAlerts(updatedAlerts);

// Load cached alerts
const cachedAlerts = await storageService.loadAlerts();

// Clear cache
await storageService.clearCache();
```

### MockDataService

Generates realistic mock data for demo and testing purposes.

```typescript
interface IMockDataService {
  // Demo Data Generation
  generateDemoScenario(scenario: DemoScenario): DemoData;
  generateRestaurantContext(type: RestaurantType): RestaurantContext;
  
  // Real-time Simulation
  startRealTimeSimulation(interval: number): void;
  stopRealTimeSimulation(): void;
  
  // Data Customization
  setRestaurantType(type: RestaurantType): void;
  setOperatingHours(hours: OperatingHours): void;
  setPeakHours(hours: PeakHours): void;
}

// Usage Example
const mockService = new MockDataService();

// Generate restaurant context
const restaurant = mockService.generateRestaurantContext('FAST_CASUAL');

// Start real-time alert simulation
mockService.startRealTimeSimulation(30000); // Every 30 seconds

// Generate specific demo scenario
const demoData = mockService.generateDemoScenario('EVENING_SERVICE');
```

## 🏪 State Management

### AlertContext

Global state management for alerts using React Context API.

```typescript
interface AlertContextType {
  // State
  alerts: Alert[];
  filteredAlerts: Alert[];
  activeFilters: AlertFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  removeAlert: (alertId: string) => void;
  
  // Filtering
  setFilters: (filters: AlertFilters) => void;
  clearFilters: () => void;
  
  // Operations
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

// Provider Component
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  
  // Implementation details...
  
  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook Usage
const { alerts, acknowledgeAlert, setFilters } = useAlerts();
```

### NotificationContext

Manages notification settings and permissions.

```typescript
interface NotificationContextType {
  // Permission State
  permissionStatus: NotificationPermissionStatus;
  permissionsRequested: boolean;
  
  // Settings
  preferences: NotificationPreferences;
  quietHours: QuietHours;
  
  // Actions
  requestPermissions: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  setQuietHours: (hours: QuietHours) => void;
}

// Usage
const { permissionStatus, requestPermissions, preferences } = useNotifications();
```

## 🧩 Component Architecture

### Screen Components

#### AlertDashboard
Main dashboard screen displaying categorized alerts.

```typescript
interface AlertDashboardProps {
  navigation: NavigationProp<any>;
}

interface AlertDashboardState {
  refreshing: boolean;
  selectedCategory: AlertCategory | null;
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({ navigation }) => {
  // Component implementation
};

// Props
AlertDashboard.propTypes = {
  navigation: PropTypes.object.isRequired
};
```

#### AlertDetail
Detailed view of individual alert with action buttons.

```typescript
interface AlertDetailProps {
  route: RouteProp<{ AlertDetail: { alertId: string } }>;
  navigation: NavigationProp<any>;
}

const AlertDetail: React.FC<AlertDetailProps> = ({ route, navigation }) => {
  const { alertId } = route.params;
  // Component implementation
};
```

### UI Components

#### AlertCard
Reusable card component for displaying alerts.

```typescript
interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onPress,
  onAcknowledge,
  onDismiss,
  showActions = true,
  compact = false
}) => {
  // Component implementation
};

// Default Props
AlertCard.defaultProps = {
  showActions: true,
  compact: false
};
```

#### PriorityBadge
Visual indicator for alert priority levels.

```typescript
interface PriorityBadgeProps {
  priority: AlertPriority;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'medium',
  variant = 'filled'
}) => {
  const badgeStyle = getPriorityStyle(priority, size, variant);
  
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, badgeStyle.text]}>
        {priority}
      </Text>
    </View>
  );
};
```

#### FilterBar
Horizontal filter selection component.

```typescript
interface FilterBarProps {
  categories: AlertCategory[];
  selectedCategory: AlertCategory | null;
  onCategorySelect: (category: AlertCategory | null) => void;
  priorities: AlertPriority[];
  selectedPriority: AlertPriority | null;
  onPrioritySelect: (priority: AlertPriority | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
  // Component implementation
};
```

## 📊 Data Models

### Core Data Types

```typescript
// Alert Model
interface Alert {
  id: string;
  type: AlertCategory;
  priority: AlertPriority;
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  read: boolean;
  readAt?: Date;
  data: Record<string, any>;
  notificationId?: string;
  notificationSent: boolean;
}

// Alert Categories
type AlertCategory = 
  | 'INVENTORY' 
  | 'ORDER' 
  | 'EQUIPMENT' 
  | 'STAFF' 
  | 'CUSTOMER' 
  | 'FINANCIAL'
  | 'MAINTENANCE'
  | 'COMPLIANCE';

// Alert Priorities
type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Restaurant Context
interface RestaurantContext {
  id: string;
  name: string;
  type: RestaurantType;
  location: Location;
  operatingHours: OperatingHours;
  peakHours: PeakHours;
  staffCount: number;
  averageOrders: number;
  equipment: Equipment[];
}

// Restaurant Types
type RestaurantType = 'FAST_CASUAL' | 'FINE_DINING' | 'COFFEE_SHOP' | 'BAR';

// Demo Scenarios
type DemoScenario = 'BUSY_LUNCH_RUSH' | 'MORNING_PREP' | 'EVENING_SERVICE';
```

### Notification Models

```typescript
// Notification Configuration
interface NotificationConfig {
  title: string;
  body: string;
  sound: string;
  badge: number;
  data: Record<string, any>;
  categoryId: string;
  trigger: NotificationTrigger;
}

// Notification Preferences
interface NotificationPreferences {
  enabled: boolean;
  allowCritical: boolean;
  allowHigh: boolean;
  allowMedium: boolean;
  allowLow: boolean;
  quietHours: QuietHours;
  maxPerHour: number;
  sound: string;
  vibration: boolean;
}

// Quiet Hours
interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string;   // HH:MM format
}
```

### Filter and Sort Models

```typescript
// Alert Filters
interface AlertFilters {
  categories: AlertCategory[];
  priorities: AlertPriority[];
  acknowledged: boolean | null;
  resolved: boolean | null;
  dateRange: DateRange | null;
  searchText: string;
}

// Date Range
interface DateRange {
  start: Date;
  end: Date;
}

// Sort Configuration
interface AlertSortBy {
  field: 'timestamp' | 'priority' | 'category' | 'title';
  direction: 'asc' | 'desc';
}
```

## 🗃️ Mock Data Structure

### Demo Alert Templates

```typescript
const DEMO_ALERT_TEMPLATES = {
  BUSY_LUNCH_RUSH: [
    {
      type: 'EQUIPMENT',
      priority: 'CRITICAL',
      title: 'Freezer Temperature Alert',
      message: 'Freezer temperature is 45°F - immediate attention required',
      data: { temperature: 45, threshold: 32, location: 'Main Kitchen' }
    },
    {
      type: 'ORDER',
      priority: 'HIGH',
      title: '15 Orders in Queue',
      message: 'Order queue is backing up - consider additional prep staff',
      data: { queueLength: 15, averageWaitTime: 12, threshold: 10 }
    }
  ],
  
  MORNING_PREP: [
    {
      type: 'STAFF',
      priority: 'HIGH',
      title: 'Chef Called In Sick',
      message: 'Head chef unavailable - backup plan needed for lunch service',
      data: { staffMember: 'Head Chef', shift: 'Morning Prep', replacement: null }
    }
  ]
};
```

### Restaurant Context Templates

```typescript
const RESTAURANT_CONTEXTS = {
  FAST_CASUAL: {
    name: 'Urban Bites',
    type: 'FAST_CASUAL',
    operatingHours: { open: '11:00', close: '22:00' },
    peakHours: [
      { start: '12:00', end: '14:00', label: 'Lunch Rush' },
      { start: '18:00', end: '20:00', label: 'Dinner Rush' }
    ],
    staffCount: 12,
    averageOrders: 200
  },
  
  FINE_DINING: {
    name: 'Le Gourmet',
    type: 'FINE_DINING',
    operatingHours: { open: '17:00', close: '23:00' },
    peakHours: [
      { start: '19:00', end: '21:00', label: 'Dinner Service' }
    ],
    staffCount: 20,
    averageOrders: 80
  }
};
```

## 🎣 Custom Hooks

### useAlerts

```typescript
interface UseAlertsResult {
  alerts: Alert[];
  filteredAlerts: Alert[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  
  // Filtering
  setFilters: (filters: AlertFilters) => void;
  clearFilters: () => void;
}

const useAlerts = (): UseAlertsResult => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};
```

### useNotifications

```typescript
interface UseNotificationsResult {
  permissionStatus: NotificationPermissionStatus;
  preferences: NotificationPreferences;
  
  // Actions
  requestPermissions: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  scheduleNotification: (alert: Alert) => Promise<string>;
}

const useNotifications = (): UseNotificationsResult => {
  // Hook implementation
};
```

### useDemo

```typescript
interface UseDemoResult {
  currentScenario: DemoScenario;
  isRunning: boolean;
  progress: number;
  
  // Actions
  startDemo: (scenario: DemoScenario) => void;
  stopDemo: () => void;
  nextStep: () => void;
  resetDemo: () => void;
}

const useDemo = (): UseDemoResult => {
  // Demo control hook implementation
};
```

## 🛠️ Utility Functions

### Date Utilities

```typescript
// Format date for display
export const formatAlertTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

// Check if within quiet hours
export const isWithinQuietHours = (
  quietHours: QuietHours, 
  time: Date = new Date()
): boolean => {
  if (!quietHours.enabled) return false;
  
  const currentTime = time.getHours() * 60 + time.getMinutes();
  const [startHour, startMin] = quietHours.start.split(':').map(Number);
  const [endHour, endMin] = quietHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
};
```

### Alert Utilities

```typescript
// Get priority color
export const getPriorityColor = (priority: AlertPriority): string => {
  const colors = {
    CRITICAL: '#E53E3E',
    HIGH: '#F56500',
    MEDIUM: '#ECC94B',
    LOW: '#38A169'
  };
  return colors[priority];
};

// Calculate alert score for sorting
export const calculateAlertScore = (alert: Alert): number => {
  const priorityScores = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const ageHours = (Date.now() - alert.timestamp.getTime()) / (1000 * 60 * 60);
  
  return priorityScores[alert.priority] * 100 - ageHours;
};

// Group alerts by category
export const groupAlertsByCategory = (alerts: Alert[]): Record<AlertCategory, Alert[]> => {
  return alerts.reduce((groups, alert) => {
    if (!groups[alert.type]) groups[alert.type] = [];
    groups[alert.type].push(alert);
    return groups;
  }, {} as Record<AlertCategory, Alert[]>);
};
```

### Validation Utilities

```typescript
// Validate alert data
export const validateAlert = (alert: Partial<Alert>): string[] => {
  const errors: string[] = [];
  
  if (!alert.title?.trim()) errors.push('Title is required');
  if (!alert.message?.trim()) errors.push('Message is required');
  if (!alert.type) errors.push('Alert type is required');
  if (!alert.priority) errors.push('Priority is required');
  
  return errors;
};

// Validate notification permissions
export const validateNotificationSetup = async (): Promise<ValidationResult> => {
  const permissions = await NotificationService.getPermissionStatus();
  const settings = await StorageService.loadUserPreferences();
  
  return {
    isValid: permissions === 'granted' && settings.notifications.enabled,
    errors: [
      permissions !== 'granted' && 'Notification permissions not granted',
      !settings.notifications.enabled && 'Notifications disabled in settings'
    ].filter(Boolean)
  };
};
```

## 📱 Platform-Specific APIs

### iOS Notification Categories

```typescript
// Set up notification categories for iOS
export const setupNotificationCategories = async (): Promise<void> => {
  await NotificationService.setNotificationCategoryAsync('CRITICAL_ALERT', [
    {
      identifier: 'ACKNOWLEDGE',
      buttonTitle: 'Acknowledge',
      options: { foreground: true }
    },
    {
      identifier: 'CALL_MANAGER',
      buttonTitle: 'Call Manager',
      options: { foreground: true }
    }
  ]);
  
  await NotificationService.setNotificationCategoryAsync('HIGH_ALERT', [
    {
      identifier: 'ACKNOWLEDGE',
      buttonTitle: 'Acknowledge',
      options: { foreground: false }
    },
    {
      identifier: 'DISMISS',
      buttonTitle: 'Dismiss',
      options: { destructive: true }
    }
  ]);
};
```

## 🧪 Testing Interfaces

### Test Utilities

```typescript
// Mock alert generator for testing
export const createMockAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: `test-alert-${Date.now()}`,
  type: 'EQUIPMENT',
  priority: 'HIGH',
  title: 'Test Alert',
  message: 'This is a test alert',
  timestamp: new Date(),
  acknowledged: false,
  resolved: false,
  dismissed: false,
  read: false,
  data: {},
  notificationSent: false,
  ...overrides
});

// Test service implementations
export class MockAlertService implements IAlertService {
  private alerts: Alert[] = [];
  
  async generateDemoAlerts(scenario: DemoScenario): Promise<Alert[]> {
    // Mock implementation
    return [];
  }
  
  // Other interface methods...
}
```

---

**API Documentation Maintained By**: Development Team  
**Last Updated**: Current Date  
**Version**: 1.0.0

*Complete API reference for Serve AI restaurant notification system*