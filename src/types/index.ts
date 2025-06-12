// Core Alert Types
export type AlertType = 'INVENTORY' | 'ORDER' | 'EQUIPMENT' | 'STAFF' | 'CUSTOMER' | 'FINANCIAL' | 'SAFETY' | 'HEALTH' | 'SECURITY';
export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type RestaurantType = 'FAST_CASUAL' | 'FINE_DINING' | 'CAFE' | 'BAR' | 'FOOD_TRUCK' | 'CATERING';
export type UserRole = 'OPERATOR' | 'STORE_MANAGER' | 'REGIONAL_MANAGER' | 'ADMIN';

// Assignment history tracking
export interface AssignmentHistoryEntry {
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: Date;
  reason?: string;
  action: 'assigned' | 'reassigned' | 'unassigned';
}

// Cure step tracking
export interface CureStep {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  details?: string;
  timestamp: number;
  read: boolean;
  acknowledged: boolean;
  resolved: boolean;
  dismissed: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  dismissedAt?: Date;
  readAt?: Date;
  shouldNotify: boolean;
  notificationSent: boolean;
  notificationId?: string;
  notificationScheduledAt?: Date;
  actionRequired: boolean;
  estimatedResolutionTime?: number; // minutes
  source: string;
  tags: string[];
  explanation?: string;
  relatedFactors?: string[];
  helpfulVotes?: number;
  notHelpfulVotes?: number;
  dismissedUntilRefresh?: boolean;
  // Assignment fields
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedAt?: Date;
  assignmentHistory?: AssignmentHistoryEntry[];
  cureSteps?: CureStep[];
  resolutionNotes?: string;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  type: RestaurantType;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  staffCount: number;
  avgOrderTime: number; // minutes
  specialties: string[];
  peakHours: string[]; // array of hour strings like "12:00", "13:00"
  hoursOfOperation: Record<string, { open: string; close: string; closed?: boolean }>;
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
  simulationSpeed: number;
}

export interface Restaurant {
  id: string;
  name: string;
  type: RestaurantType;
  alerts: Alert[];
}

// Notification Types
export interface NotificationPayload {
  title: string;
  body: string;
  data: {
    alertId: string;
    type: AlertType;
    priority: AlertPriority;
  };
  sound?: string;
  badge?: number;
  categoryId: string;
}

export interface NotificationResponse {
  notification: NotificationPayload;
  actionIdentifier: string;
  userText?: string;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PendingNotification {
  id: string;
  title: string;
  body: string;
  data: {
    alertId: string;
    type: AlertType;
    priority: AlertPriority;
  };
  scheduledTime: number;
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
    end: string;   // HH:MM format
  };
  maxPerHour: number;
  minimumPriority: AlertPriority;
  typeFilters: Record<AlertType, boolean>;
}

// User Preferences
export interface UserPreferences {
  notifications: NotificationSettings;
  filters: {
    showResolved: boolean;
    selectedTypes: AlertType[];
    selectedPriorities: AlertPriority[];
  };
  ui: {
    darkMode: boolean;
    compactView: boolean;
  };
}

// App State Types
export interface AppState {
  alerts: Alert[];
  preferences: UserPreferences;
  permissionsGranted: boolean;
  isLoading: boolean;
  currentRestaurant: Restaurant | null;
  lastUpdated: Date;
}

// Mock Data Types
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

export interface IMockDataGenerator {
  generateDemoScenario(scenario: DemoScenario, context: RestaurantContext): Alert[];
  generateRealisticAlerts(context: RestaurantContext, count: number): Alert[];
  generateSingleAlert(context: RestaurantContext): Alert;
  generateRestaurantProfile(type: RestaurantType): RestaurantProfile;
  generateRestaurantContext(profile: RestaurantProfile): RestaurantContext;
  calculateAlertProbability(currentTime: number, context: RestaurantContext): number;
}

export interface MockDataContext {
  scenario: DemoScenario;
  restaurantType: RestaurantType;
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  dayOfWeek: 'WEEKDAY' | 'WEEKEND';
}

// Action Types
export type AlertAction = 
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'UPDATE_ALERT'; payload: { id: string; updates: Partial<Alert> } }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { id: string; userId?: string } }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'DISMISS_UNTIL_REFRESH'; payload: string }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_HELPFUL'; payload: { id: string; helpful: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: AlertFilters }
  | { type: 'UPDATE_FILTERS'; payload: Partial<AlertFilters> }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'ASSIGN_ALERT'; payload: { alertId: string; assignedTo: string; assignedToName: string; assignedBy: string; assignedByName: string } }
  | { type: 'REASSIGN_ALERT'; payload: { alertId: string; assignedTo: string; assignedToName: string; assignedBy: string; assignedByName: string; reason?: string } }
  | { type: 'UNASSIGN_ALERT'; payload: { alertId: string; unassignedBy: string } }
  | { type: 'UPDATE_CURE_STEP'; payload: { alertId: string; stepId: string; updates: Partial<CureStep> } }
  | { type: 'ADD_RESOLUTION_NOTES'; payload: { alertId: string; notes: string } };

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Testing Types
export type TestScenario = 'PERFORMANCE_TEST' | 'NOTIFICATION_TEST' | 'UI_TEST' | 'INTEGRATION_TEST';

export interface TestDataSet {
  alerts: Alert[];
  restaurants?: Restaurant[];
  notificationSettings?: NotificationSettings;
  userInteractions?: any[];
}

// Error Types
export type ErrorType = 'NETWORK_ERROR' | 'STORAGE_ERROR' | 'NOTIFICATION_ERROR' | 'PERMISSION_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  context?: string;
  timestamp: Date;
  recoverable: boolean;
}

export type RecoveryAction = 
  | 'SHOW_CACHED'
  | 'RETRY_PROMPT'
  | 'REINITIALIZE'
  | 'DEGRADE_GRACEFULLY'
  | 'RESTART_REQUIRED';

// Notification Category Types
export interface NotificationCategory {
  identifier: string;
  actions: NotificationActionConfig[];
  options?: {
    customDismissAction?: boolean;
    allowInCarPlay?: boolean;
    showTitle?: boolean;
    showSubtitle?: boolean;
  };
}

export interface NotificationActionConfig {
  identifier: string;
  title: string;
  options?: {
    destructive?: boolean;
    authenticationRequired?: boolean;
    foreground?: boolean;
  };
}

// Component Props Types
export interface AlertItemProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onMarkHelpful?: (alertId: string, helpful: boolean) => void;
  onTellMeMore?: (alertId: string) => void;
}

export interface AlertDashboardProps {
  alerts: Alert[];
  filters: UserPreferences['filters'];
  onAlertPress: (alert: Alert) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

// Navigation types (for our new screens)
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Alerts: undefined;
  AlertDetail: { alertId: string };
  Profile: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  Integrations: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Alerts: undefined;
  Profile: undefined;
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  storeId?: string;
  storeName?: string;
  permissions?: string[];
  teamMembers?: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_BREAK';
  lastActive?: Date;
}

// Component Props types
export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

// API Response types (additional to existing ServiceResponse)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Alert State Types
export interface AlertFilters {
  priority?: AlertPriority;
  type?: AlertType;
  status?: AlertStatus;
  dateRange?: {
    start: number;
    end: number;
  };
  search: string;
  tags?: string[];
  showRead: boolean;
  showResolved: boolean;
  assignedToMe?: boolean;
  unassigned?: boolean;
  assignedTo?: string;
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

// Restaurant State Types
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