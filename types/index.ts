// Core Alert Types
export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertType = 
  | 'ORDER' 
  | 'EQUIPMENT' 
  | 'INVENTORY' 
  | 'STAFF' 
  | 'CUSTOMER' 
  | 'FINANCIAL' 
  | 'SAFETY' 
  | 'HEALTH' 
  | 'SECURITY';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  details?: string;
  timestamp: number;
  
  // State tracking
  read: boolean;
  readAt?: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: number;
  dismissed: boolean;
  dismissedAt?: number;
  
  // Notification tracking
  shouldNotify: boolean;
  notificationSent: boolean;
  notificationId?: string;
  notificationScheduledAt?: number;
  
  // Metadata
  source?: string;
  category?: string;
  tags?: string[];
  relatedAlerts?: string[];
  actionRequired?: boolean;
  estimatedResolutionTime?: number;
}

// Alert State Management
export interface AlertFilters {
  priority?: AlertPriority[];
  type?: AlertType[];
  status?: AlertStatus[];
  dateRange?: {
    start: number;
    end: number;
  };
  search?: string;
  tags?: string[];
  showRead?: boolean;
  showResolved?: boolean;
}

export interface AlertState {
  alerts: Alert[];
  activeAlerts: Alert[];
  history: Alert[];
  filters: AlertFilters;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  unreadCount: number;
  criticalCount: number;
}

export type AlertAction = 
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'UPDATE_ALERT'; payload: { id: string; updates: Partial<Alert> } }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { id: string; userId: string } }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'SET_FILTERS'; payload: AlertFilters }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALERTS' };

// Notification Types
export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationSettings {
  enabled: boolean;
  allowCritical: boolean;
  allowHigh: boolean;
  allowMedium: boolean;
  allowLow: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  maxPerHour: number;
  minimumPriority: AlertPriority;
  typeFilters: {
    [key in AlertType]: boolean;
  };
}

export interface PendingNotification {
  id: string;
  alertId: string;
  scheduledTime: number;
  title: string;
  body: string;
  data: any;
}

export interface NotificationState {
  permissions: NotificationPermissionStatus;
  settings: NotificationSettings;
  queue: PendingNotification[];
  lastNotificationTime: number;
  notificationHistory: string[];
}

export type NotificationAction =
  | { type: 'SET_PERMISSIONS'; payload: NotificationPermissionStatus }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'ADD_TO_QUEUE'; payload: PendingNotification }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'ADD_TO_HISTORY'; payload: string };

// Restaurant Types
export type RestaurantType = 'FAST_CASUAL' | 'FINE_DINING' | 'CAFE' | 'BAR' | 'FOOD_TRUCK' | 'CATERING';

export interface RestaurantProfile {
  id: string;
  name: string;
  type: RestaurantType;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  staffCount: number;
  hoursOfOperation: {
    [key: string]: { // day of week
      open: string;
      close: string;
      closed: boolean;
    };
  };
  specialties: string[];
  avgOrderTime: number; // minutes
  peakHours: string[];
}

export interface RestaurantContext {
  profile: RestaurantProfile;
  currentTime: number;
  dayOfWeek: string;
  isOpen: boolean;
  currentCapacity: number;
  activeOrders: number;
  staffOnDuty: number;
  recentAlerts: Alert[];
  averageAlertFrequency: number;
  demoMode: boolean;
  simulationSpeed: number; // multiplier for demo mode
}

export interface RestaurantState {
  profile: RestaurantProfile | null;
  context: RestaurantContext | null;
  demoMode: boolean;
  simulationActive: boolean;
  loading: boolean;
  error: string | null;
}

export type RestaurantAction =
  | { type: 'SET_PROFILE'; payload: RestaurantProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<RestaurantProfile> }
  | { type: 'SET_CONTEXT'; payload: RestaurantContext }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<RestaurantContext> }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_SIMULATION_ACTIVE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Demo and Testing Types
export type DemoScenario = 
  | 'BUSY_LUNCH_RUSH'
  | 'MORNING_PREP'
  | 'EVENING_SERVICE'
  | 'EQUIPMENT_FAILURE'
  | 'STAFF_SHORTAGE'
  | 'INVENTORY_CRISIS'
  | 'CUSTOMER_COMPLAINTS'
  | 'HEALTH_INSPECTION'
  | 'QUIET_PERIOD';

export interface DemoConfiguration {
  scenario: DemoScenario;
  duration: number; // minutes
  alertFrequency: number; // alerts per minute
  simulationSpeed: number; // time multiplier
  autoResolve: boolean;
  includeCritical: boolean;
}

export interface MockDataOptions {
  restaurantType: RestaurantType;
  alertCount: number;
  timeRange: {
    start: number;
    end: number;
  };
  includePastAlerts: boolean;
  priorityDistribution: {
    [key in AlertPriority]: number; // percentage
  };
  typeDistribution: {
    [key in AlertType]: number; // percentage
  };
}

// Global State Interface
export interface GlobalState {
  alerts: AlertState;
  notifications: NotificationState;
  restaurant: RestaurantState;
  ui: {
    activeTab: string;
    modalStack: string[];
    theme: 'light' | 'dark';
    networkStatus: 'online' | 'offline';
  };
}

// Service Interfaces
export interface IAlertService {
  generateAlerts(context: RestaurantContext, options?: MockDataOptions): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  dismissAlert(alertId: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  markAsRead(alertId: string): Promise<void>;
  filterAlerts(alerts: Alert[], filters: AlertFilters): Alert[];
  getAlertById(alertId: string): Promise<Alert | null>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertHistory(): Promise<Alert[]>;
}

export interface IMockDataGenerator {
  generateDemoScenario(scenario: DemoScenario, restaurantContext: RestaurantContext): Alert[];
  generateRealisticAlerts(restaurantContext: RestaurantContext, count: number): Alert[];
  generateSingleAlert(restaurantContext: RestaurantContext): Alert;
  generateRestaurantProfile(type: RestaurantType): RestaurantProfile;
  generateRestaurantContext(profile: RestaurantProfile): RestaurantContext;
  calculateAlertProbability(currentTime: number, context: RestaurantContext): number;
}

// Storage Interface
export interface IStorageService {
  saveAlerts(alerts: Alert[]): Promise<void>;
  loadAlerts(): Promise<Alert[]>;
  saveNotificationSettings(settings: NotificationSettings): Promise<void>;
  loadNotificationSettings(): Promise<NotificationSettings>;
  saveRestaurantProfile(profile: RestaurantProfile): Promise<void>;
  loadRestaurantProfile(): Promise<RestaurantProfile | null>;
  clearAllData(): Promise<void>;
}

// Error Types
export interface AppError {
  type: 'NETWORK_ERROR' | 'STORAGE_ERROR' | 'NOTIFICATION_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  timestamp: number;
  context?: string;
}

// Performance Types
export interface PerformanceMetrics {
  appStartTime: number;
  alertGenerationTime: number;
  notificationSchedulingTime: number;
  stateUpdateTime: number;
  memoryUsage: number;
  renderTime: number;
}

// Testing Types
export interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<void>;
  execute: () => Promise<void>;
  cleanup: () => Promise<void>;
  expectedResult: any;
}

export interface TestDataSet {
  alerts: Alert[];
  restaurants: RestaurantProfile[];
  notificationSettings: NotificationSettings[];
  userInteractions: any[];
}