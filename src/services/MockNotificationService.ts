import { v4 as uuidv4 } from 'react-native-uuid';
import { 
  Alert, 
  DemoScenario, 
  RestaurantType, 
  MockDataContext, 
  AlertType, 
  AlertPriority 
} from '../types';

/**
 * Mock notification service for generating realistic demo scenarios
 */
export class MockNotificationService {
  private static instance: MockNotificationService;

  private constructor() {}

  public static getInstance(): MockNotificationService {
    if (!MockNotificationService.instance) {
      MockNotificationService.instance = new MockNotificationService();
    }
    return MockNotificationService.instance;
  }

  /**
   * Generate alerts for demo scenarios based on pseudocode specifications
   */
  public generateDemoScenario(restaurantType: RestaurantType, scenario: DemoScenario): Alert[] {
    switch (scenario) {
      case 'BUSY_LUNCH_RUSH':
        return this.generateBusyLunchRushAlerts(restaurantType);
      case 'MORNING_PREP':
        return this.generateMorningPrepAlerts(restaurantType);
      case 'EVENING_SERVICE':
        return this.generateEveningServiceAlerts(restaurantType);
      default:
        return this.generateRandomAlerts(restaurantType, 3);
    }
  }

  /**
   * Generate busy lunch rush scenario alerts
   */
  private generateBusyLunchRushAlerts(restaurantType: RestaurantType): Alert[] {
    const baseAlerts = [
      this.createAlert('ORDER', 'HIGH', 'High Order Volume', '15 orders in queue - kitchen backup forming'),
      this.createAlert('EQUIPMENT', 'CRITICAL', 'Freezer Temperature Alert', 'Walk-in freezer temp: 45°F - URGENT ACTION REQUIRED'),
      this.createAlert('INVENTORY', 'HIGH', 'Low Stock Alert', 'Chicken breast inventory critical - only 4 portions remaining'),
      this.createAlert('STAFF', 'MEDIUM', 'Staffing Issue', 'Server called in sick - consider calling backup staff'),
    ];

    // Add restaurant-specific alerts
    switch (restaurantType) {
      case 'FAST_CASUAL':
        baseAlerts.push(
          this.createAlert('ORDER', 'HIGH', 'Drive-thru Backup', 'Drive-thru queue extending to street - 8 minute average wait'),
          this.createAlert('EQUIPMENT', 'MEDIUM', 'Fryer Maintenance', 'Fryer #2 needs oil change - efficiency decreasing')
        );
        break;
      case 'FINE_DINING':
        baseAlerts.push(
          this.createAlert('CUSTOMER', 'HIGH', 'VIP Reservation', 'Table 12 - James Wellington (food critic) arriving in 20 minutes'),
          this.createAlert('INVENTORY', 'MEDIUM', 'Wine Selection', 'Recommended wine pairing out of stock for signature dish')
        );
        break;
      case 'COFFEE_SHOP':
        baseAlerts.push(
          this.createAlert('EQUIPMENT', 'HIGH', 'Espresso Machine Issue', 'Main espresso machine pressure dropping - possible malfunction'),
          this.createAlert('INVENTORY', 'MEDIUM', 'Milk Supply', 'Oat milk running low - only 2 containers left')
        );
        break;
      case 'BAR':
        baseAlerts.push(
          this.createAlert('INVENTORY', 'HIGH', 'Liquor Stock', 'Premium whiskey selection depleted - restocking needed'),
          this.createAlert('EQUIPMENT', 'MEDIUM', 'Ice Machine', 'Ice machine production rate below normal - monitor closely')
        );
        break;
    }

    return baseAlerts;
  }

  /**
   * Generate morning prep scenario alerts
   */
  private generateMorningPrepAlerts(restaurantType: RestaurantType): Alert[] {
    const baseAlerts = [
      this.createAlert('INVENTORY', 'MEDIUM', 'Delivery Delay', 'Fresh vegetable delivery 2 hours late - adjust prep schedule'),
      this.createAlert('STAFF', 'HIGH', 'Chef Absence', 'Head chef called in sick - sous chef covering morning prep'),
      this.createAlert('EQUIPMENT', 'LOW', 'Maintenance Reminder', 'Dishwasher scheduled maintenance due this week'),
      this.createAlert('INVENTORY', 'MEDIUM', 'Stock Count Discrepancy', 'Inventory count mismatch on tomatoes - verify before service'),
    ];

    switch (restaurantType) {
      case 'FAST_CASUAL':
        baseAlerts.push(
          this.createAlert('INVENTORY', 'HIGH', 'Bread Shortage', 'Sandwich bread delivery failed - only 20 portions available'),
          this.createAlert('EQUIPMENT', 'MEDIUM', 'Prep Station', 'Cold prep station temperature slightly elevated - monitor')
        );
        break;
      case 'FINE_DINING':
        baseAlerts.push(
          this.createAlert('INVENTORY', 'HIGH', 'Special Ingredients', 'Truffle shipment delayed - adjust today\'s specials menu'),
          this.createAlert('STAFF', 'MEDIUM', 'Training Reminder', 'New server orientation scheduled for 10 AM')
        );
        break;
      case 'COFFEE_SHOP':
        baseAlerts.push(
          this.createAlert('INVENTORY', 'MEDIUM', 'Bean Roasting', 'House blend beans need roasting for afternoon service'),
          this.createAlert('EQUIPMENT', 'LOW', 'Grinder Calibration', 'Coffee grinder calibration due - affects extraction quality')
        );
        break;
      case 'BAR':
        baseAlerts.push(
          this.createAlert('INVENTORY', 'MEDIUM', 'Beer Tap', 'IPA keg needs replacement before evening service'),
          this.createAlert('EQUIPMENT', 'LOW', 'Glass Washing', 'Glassware inventory low - run additional wash cycles')
        );
        break;
    }

    return baseAlerts;
  }

  /**
   * Generate evening service scenario alerts
   */
  private generateEveningServiceAlerts(restaurantType: RestaurantType): Alert[] {
    const baseAlerts = [
      this.createAlert('CUSTOMER', 'HIGH', 'Customer Complaint', 'Negative review posted - food quality concern reported'),
      this.createAlert('FINANCIAL', 'MEDIUM', 'Payment System', 'Credit card reader #2 intermittent failures - backup available'),
      this.createAlert('STAFF', 'MEDIUM', 'Overtime Alert', 'Server overtime approaching limit - consider shift adjustments'),
      this.createAlert('ORDER', 'LOW', 'Special Event', 'Large party booking confirmed for Thursday - prep requirements'),
    ];

    switch (restaurantType) {
      case 'FAST_CASUAL':
        baseAlerts.push(
          this.createAlert('ORDER', 'MEDIUM', 'Mobile Orders', 'High volume of mobile orders - 12 minute wait time'),
          this.createAlert('EQUIPMENT', 'LOW', 'POS System', 'POS terminal #3 running slowly - consider restart')
        );
        break;
      case 'FINE_DINING':
        baseAlerts.push(
          this.createAlert('CUSTOMER', 'MEDIUM', 'Wine Recommendation', 'Table 8 requests sommelier for wine pairing consultation'),
          this.createAlert('INVENTORY', 'LOW', 'Dessert Special', 'Featured dessert ingredients sufficient for 8 more portions')
        );
        break;
      case 'COFFEE_SHOP':
        baseAlerts.push(
          this.createAlert('EQUIPMENT', 'MEDIUM', 'WiFi Issues', 'Customer WiFi experiencing intermittent connectivity'),
          this.createAlert('INVENTORY', 'LOW', 'Pastry Stock', 'Popular muffin variety sold out - consider next-day order')
        );
        break;
      case 'BAR':
        baseAlerts.push(
          this.createAlert('CUSTOMER', 'MEDIUM', 'Live Music Setup', 'Sound check needed for tonight\'s live performance'),
          this.createAlert('INVENTORY', 'HIGH', 'Signature Cocktail', 'Specialty garnish for signature cocktail depleted')
        );
        break;
    }

    return baseAlerts;
  }

  /**
   * Generate random alerts for variety
   */
  public generateRandomAlerts(restaurantType: RestaurantType, count: number): Alert[] {
    const alerts: Alert[] = [];
    const alertTemplates = this.getAlertTemplates(restaurantType);

    for (let i = 0; i < count; i++) {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      alerts.push(this.createAlert(
        template.type,
        template.priority,
        template.title,
        template.message
      ));
    }

    return alerts;
  }

  /**
   * Get alert templates for different restaurant types
   */
  private getAlertTemplates(restaurantType: RestaurantType) {
    const commonTemplates = [
      { type: 'EQUIPMENT' as AlertType, priority: 'HIGH' as AlertPriority, title: 'Temperature Alert', message: 'Refrigeration unit temperature above safe range' },
      { type: 'STAFF' as AlertType, priority: 'MEDIUM' as AlertPriority, title: 'Break Schedule', message: 'Staff break rotations need adjustment' },
      { type: 'INVENTORY' as AlertType, priority: 'LOW' as AlertPriority, title: 'Weekly Order', message: 'Weekly supplier order needs confirmation' },
      { type: 'CUSTOMER' as AlertType, priority: 'MEDIUM' as AlertPriority, title: 'Feedback Alert', message: 'New customer feedback requires response' },
    ];

    const specificTemplates = {
      FAST_CASUAL: [
        { type: 'ORDER' as AlertType, priority: 'HIGH' as AlertPriority, title: 'Drive-thru Delay', message: 'Drive-thru service time exceeding targets' },
        { type: 'EQUIPMENT' as AlertType, priority: 'CRITICAL' as AlertPriority, title: 'Fryer Malfunction', message: 'Main fryer showing error codes' },
      ],
      FINE_DINING: [
        { type: 'INVENTORY' as AlertType, priority: 'HIGH' as AlertPriority, title: 'Premium Ingredients', message: 'Seasonal ingredients availability alert' },
        { type: 'CUSTOMER' as AlertType, priority: 'HIGH' as AlertPriority, title: 'VIP Service', message: 'Special accommodation request for VIP guest' },
      ],
      COFFEE_SHOP: [
        { type: 'EQUIPMENT' as AlertType, priority: 'HIGH' as AlertPriority, title: 'Espresso Quality', message: 'Espresso extraction quality declining' },
        { type: 'INVENTORY' as AlertType, priority: 'MEDIUM' as AlertPriority, title: 'Bean Freshness', message: 'Coffee bean roast date approaching limit' },
      ],
      BAR: [
        { type: 'INVENTORY' as AlertType, priority: 'HIGH' as AlertPriority, title: 'Spirits Stock', message: 'Premium spirits inventory running low' },
        { type: 'EQUIPMENT' as AlertType, priority: 'MEDIUM' as AlertPriority, title: 'Draft System', message: 'Beer line cleaning overdue' },
      ],
    };

    return [...commonTemplates, ...specificTemplates[restaurantType]];
  }

  /**
   * Create a standardized alert object
   */
  private createAlert(
    type: AlertType, 
    priority: AlertPriority, 
    title: string, 
    message: string,
    additionalData: Record<string, any> = {}
  ): Alert {
    return {
      id: uuidv4() as string,
      type,
      priority,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      read: false,
      data: additionalData,
      notificationSent: false,
      shouldNotify: priority === 'CRITICAL' || priority === 'HIGH',
    };
  }

  /**
   * Generate time-sensitive alerts based on current time
   */
  public generateTimeSensitiveAlerts(): Alert[] {
    const now = new Date();
    const hour = now.getHours();
    const alerts: Alert[] = [];

    // Morning alerts (6-10 AM)
    if (hour >= 6 && hour < 10) {
      alerts.push(
        this.createAlert('STAFF', 'MEDIUM', 'Morning Shift', 'Morning shift team assembly complete'),
        this.createAlert('INVENTORY', 'LOW', 'Daily Prep', 'Daily prep checklist items pending review')
      );
    }

    // Lunch period alerts (11 AM - 2 PM)
    if (hour >= 11 && hour < 14) {
      alerts.push(
        this.createAlert('ORDER', 'HIGH', 'Lunch Rush', 'Peak lunch period - monitor order queue closely'),
        this.createAlert('EQUIPMENT', 'MEDIUM', 'High Usage', 'Equipment operating at peak capacity')
      );
    }

    // Dinner service alerts (5-9 PM)
    if (hour >= 17 && hour < 21) {
      alerts.push(
        this.createAlert('CUSTOMER', 'MEDIUM', 'Evening Service', 'Dinner reservations at 85% capacity'),
        this.createAlert('STAFF', 'LOW', 'Evening Shift', 'Evening shift transition complete')
      );
    }

    // Late night alerts (9 PM - 12 AM)
    if (hour >= 21 || hour < 1) {
      alerts.push(
        this.createAlert('EQUIPMENT', 'LOW', 'Closing Prep', 'Equipment cleaning and shutdown checklist'),
        this.createAlert('FINANCIAL', 'MEDIUM', 'Daily Summary', 'Daily sales summary ready for review')
      );
    }

    return alerts;
  }

  /**
   * Generate progressive difficulty alerts for demo
   */
  public generateProgressiveAlerts(): Alert[] {
    return [
      // Start with low-priority alerts
      this.createAlert('INVENTORY', 'LOW', 'Routine Check', 'Weekly inventory count scheduled'),
      this.createAlert('STAFF', 'LOW', 'Training Update', 'New safety protocol training available'),
      
      // Escalate to medium priority
      this.createAlert('ORDER', 'MEDIUM', 'Increased Volume', 'Order volume 20% above normal'),
      this.createAlert('EQUIPMENT', 'MEDIUM', 'Maintenance Due', 'Scheduled maintenance window approaching'),
      
      // High priority alerts
      this.createAlert('CUSTOMER', 'HIGH', 'Service Complaint', 'Customer service issue requires immediate attention'),
      this.createAlert('INVENTORY', 'HIGH', 'Stock Shortage', 'Critical ingredient stock below minimum threshold'),
      
      // Critical alert
      this.createAlert('EQUIPMENT', 'CRITICAL', 'System Failure', 'Primary POS system experiencing critical errors'),
    ];
  }

  /**
   * Generate coordinated scenario for demo presentation
   */
  public generateCoordinatedDemo(): { alerts: Alert[], timeline: number[] } {
    const alerts = [
      this.createAlert('ORDER', 'MEDIUM', 'Lunch Prep', 'Lunch service preparation beginning'),
      this.createAlert('INVENTORY', 'HIGH', 'Supply Issue', 'Key ingredient supplier delivery delayed'),
      this.createAlert('STAFF', 'MEDIUM', 'Team Update', 'Kitchen staff briefed on menu modifications'),
      this.createAlert('EQUIPMENT', 'CRITICAL', 'Emergency Alert', 'Walk-in cooler temperature rising rapidly'),
      this.createAlert('CUSTOMER', 'HIGH', 'Service Recovery', 'VIP customer complaint requires immediate response'),
    ];

    // Timeline in seconds from start of demo
    const timeline = [0, 30, 60, 120, 180];

    return { alerts, timeline };
  }

  /**
   * Generate test data for specific scenarios
   */
  public generateTestData(scenario: 'PERFORMANCE' | 'STRESS' | 'INTEGRATION'): Alert[] {
    switch (scenario) {
      case 'PERFORMANCE':
        return this.generateLargeAlertSet(100);
      case 'STRESS':
        return this.generateLargeAlertSet(500);
      case 'INTEGRATION':
        return this.generateVariedAlertSet();
      default:
        return [];
    }
  }

  /**
   * Generate large alert set for performance testing
   */
  private generateLargeAlertSet(count: number): Alert[] {
    const alerts: Alert[] = [];
    const types: AlertType[] = ['INVENTORY', 'ORDER', 'EQUIPMENT', 'STAFF', 'CUSTOMER', 'FINANCIAL'];
    const priorities: AlertPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      alerts.push(this.createAlert(
        type,
        priority,
        `Test Alert ${i + 1}`,
        `This is test alert number ${i + 1} for performance testing`,
        { testIndex: i }
      ));
    }

    return alerts;
  }

  /**
   * Generate varied alert set for integration testing
   */
  private generateVariedAlertSet(): Alert[] {
    return [
      this.createAlert('CRITICAL', 'CRITICAL', 'System Critical', 'Critical system failure detected'),
      this.createAlert('HIGH', 'HIGH', 'High Priority', 'High priority alert for testing'),
      this.createAlert('MEDIUM', 'MEDIUM', 'Medium Priority', 'Medium priority alert for testing'),
      this.createAlert('LOW', 'LOW', 'Low Priority', 'Low priority alert for testing'),
    ] as any; // Type assertion needed due to mixed usage
  }
}