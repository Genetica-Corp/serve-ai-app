import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'; // Required for uuid to work in React Native
import {
  Alert,
  RestaurantContext,
  RestaurantProfile,
  RestaurantType,
  DemoScenario,
  AlertPriority,
  AlertType,
  IMockDataGenerator,
} from '../../types';

export class MockDataGenerator implements IMockDataGenerator {
  
  // Demo scenario alert templates following SERVE_AI_PSEUDOCODE.md patterns
  private demoScenarios: Record<DemoScenario, Array<Partial<Alert>>> = {
    BUSY_LUNCH_RUSH: [
      {
        type: 'ORDER',
        priority: 'HIGH',
        title: 'Order Queue Overloaded',
        message: '15 orders in queue - Customer wait time exceeding 20 minutes',
        details: 'Current queue: 15 orders. Average prep time: 8 minutes. Estimated wait: 22 minutes.',
        actionRequired: true,
        estimatedResolutionTime: 15,
      },
      {
        type: 'EQUIPMENT',
        priority: 'CRITICAL',
        title: 'Freezer Temperature Alert',
        message: 'Walk-in freezer temperature: 45°F - Food safety risk',
        details: 'Temperature has been above safe threshold for 12 minutes. Immediate action required.',
        actionRequired: true,
        estimatedResolutionTime: 30,
      },
      {
        type: 'INVENTORY',
        priority: 'HIGH',
        title: 'Low Stock Warning',
        message: 'Chicken breast inventory critically low',
        details: 'Current stock: 2 lbs remaining. Daily usage: 15 lbs. Next delivery: Tomorrow 8 AM.',
        actionRequired: true,
        estimatedResolutionTime: 60,
      },
    ],
    MORNING_PREP: [
      {
        type: 'INVENTORY',
        priority: 'MEDIUM',
        title: 'Delivery Delay',
        message: 'Fresh vegetables delivery delayed by 2 hours',
        details: 'Sysco delivery originally scheduled for 7 AM now arriving at 9 AM. May impact lunch prep.',
        actionRequired: false,
        estimatedResolutionTime: 120,
      },
      {
        type: 'STAFF',
        priority: 'HIGH',
        title: 'Staff Shortage',
        message: 'Head chef called in sick - Kitchen understaffed',
        details: 'Mike called in with flu. Only 2 kitchen staff scheduled for lunch rush. Consider calling backup.',
        actionRequired: true,
        estimatedResolutionTime: 180,
      },
      {
        type: 'EQUIPMENT',
        priority: 'LOW',
        title: 'Maintenance Due',
        message: 'Commercial dishwasher maintenance overdue',
        details: 'Last maintenance: 45 days ago. Recommended interval: 30 days. Schedule maintenance soon.',
        actionRequired: false,
        estimatedResolutionTime: 1440,
      },
    ],
    EVENING_SERVICE: [
      {
        type: 'CUSTOMER',
        priority: 'HIGH',
        title: 'Negative Review Alert',
        message: 'New 1-star review received on Google',
        details: '"Food was cold and service was terrible. Waited 45 minutes for burnt steak." - Sarah M.',
        actionRequired: true,
        estimatedResolutionTime: 60,
      },
      {
        type: 'FINANCIAL',
        priority: 'MEDIUM',
        title: 'Payment System Issue',
        message: 'Card reader #2 offline - Cash only at register 2',
        details: 'Credit card processing down for register 2. Customers directed to register 1 or cash payment.',
        actionRequired: true,
        estimatedResolutionTime: 45,
      },
    ],
    EQUIPMENT_FAILURE: [
      {
        type: 'EQUIPMENT',
        priority: 'CRITICAL',
        title: 'Ice Machine Failure',
        message: 'Primary ice machine completely down',
        details: 'Compressor failure detected. No ice production. Backup ice supply needed immediately.',
        actionRequired: true,
        estimatedResolutionTime: 240,
      },
      {
        type: 'EQUIPMENT',
        priority: 'HIGH',
        title: 'Oven Temperature Inconsistent',
        message: 'Main oven running 50°F below set temperature',
        details: 'Oven #1 set to 450°F but maintaining only 400°F. Food quality and cook times affected.',
        actionRequired: true,
        estimatedResolutionTime: 90,
      },
    ],
    STAFF_SHORTAGE: [
      {
        type: 'STAFF',
        priority: 'CRITICAL',
        title: 'Critical Understaffing',
        message: 'Only 1 server for dinner service - 4 scheduled',
        details: '3 servers called out sick. 40 covers booked for tonight. Emergency staffing needed.',
        actionRequired: true,
        estimatedResolutionTime: 120,
      },
      {
        type: 'STAFF',
        priority: 'HIGH',
        title: 'No Dishwasher on Duty',
        message: 'Dishwasher no-show - Dishes backing up',
        details: 'Evening dishwasher did not arrive. Dish pit filling up fast. Kitchen staff having to wash.',
        actionRequired: true,
        estimatedResolutionTime: 180,
      },
    ],
    INVENTORY_CRISIS: [
      {
        type: 'INVENTORY',
        priority: 'CRITICAL',
        title: 'Multiple Items Out of Stock',
        message: 'Salmon, risotto, and chocolate cake unavailable',
        details: '3 signature dishes unavailable. Represents 30% of typical evening sales. Need alternatives.',
        actionRequired: true,
        estimatedResolutionTime: 60,
      },
      {
        type: 'INVENTORY',
        priority: 'HIGH',
        title: 'Alcohol License Issue',
        message: 'Liquor delivery rejected - License renewal pending',
        details: 'Alcohol distributor cannot deliver until license renewed. Wine list limited to current stock.',
        actionRequired: true,
        estimatedResolutionTime: 2880, // 2 days
      },
    ],
    CUSTOMER_COMPLAINTS: [
      {
        type: 'CUSTOMER',
        priority: 'HIGH',
        title: 'Food Allergy Incident',
        message: 'Customer allergic reaction - Nuts in supposedly nut-free dish',
        details: 'Table 12 customer had reaction to walnut traces in salad marked as nut-free. EMS called.',
        actionRequired: true,
        estimatedResolutionTime: 30,
      },
      {
        type: 'CUSTOMER',
        priority: 'MEDIUM',
        title: 'Large Party Complaint',
        message: 'Table of 8 waiting 90 minutes for entrees',
        details: 'Anniversary party increasingly frustrated. Kitchen backed up. Consider comping desserts.',
        actionRequired: true,
        estimatedResolutionTime: 45,
      },
    ],
    HEALTH_INSPECTION: [
      {
        type: 'HEALTH',
        priority: 'CRITICAL',
        title: 'Health Inspector On-Site',
        message: 'Surprise health inspection in progress',
        details: 'Inspector arrived 10 minutes ago. Checking food storage temperatures and cleanliness.',
        actionRequired: true,
        estimatedResolutionTime: 120,
      },
      {
        type: 'SAFETY',
        priority: 'HIGH',
        title: 'Food Temperature Violation',
        message: 'Chicken stored at unsafe temperature',
        details: 'Raw chicken in walk-in cooler measuring 45°F. Safe storage requires 40°F or below.',
        actionRequired: true,
        estimatedResolutionTime: 15,
      },
    ],
    QUIET_PERIOD: [
      {
        type: 'EQUIPMENT',
        priority: 'LOW',
        title: 'Routine Maintenance Reminder',
        message: 'Monthly deep clean scheduled for tonight',
        details: 'Comprehensive cleaning of kitchen equipment scheduled. All prep should be completed early.',
        actionRequired: false,
        estimatedResolutionTime: 240,
      },
      {
        type: 'INVENTORY',
        priority: 'LOW',
        title: 'Reorder Suggestion',
        message: 'Office supplies running low',
        details: 'Receipt paper, napkins, and cleaning supplies below reorder threshold.',
        actionRequired: false,
        estimatedResolutionTime: 1440,
      },
    ],
  };

  // Realistic alert templates based on restaurant operations
  private alertTemplates: Record<AlertType, Array<Partial<Alert>>> = {
    ORDER: [
      { priority: 'HIGH', title: 'Order Queue Overloaded', message: 'Kitchen queue exceeding capacity' },
      { priority: 'MEDIUM', title: 'Large Order Incoming', message: 'Party of 12 order submitted' },
      { priority: 'LOW', title: 'Order Modification', message: 'Customer requested menu substitution' },
    ],
    EQUIPMENT: [
      { priority: 'CRITICAL', title: 'Equipment Failure', message: 'Critical kitchen equipment down' },
      { priority: 'HIGH', title: 'Equipment Malfunction', message: 'Equipment running suboptimally' },
      { priority: 'MEDIUM', title: 'Maintenance Required', message: 'Scheduled maintenance due' },
      { priority: 'LOW', title: 'Maintenance Reminder', message: 'Routine maintenance scheduled' },
    ],
    INVENTORY: [
      { priority: 'CRITICAL', title: 'Out of Stock', message: 'Key menu item unavailable' },
      { priority: 'HIGH', title: 'Low Stock Warning', message: 'Inventory below minimum threshold' },
      { priority: 'MEDIUM', title: 'Delivery Delay', message: 'Supplier delivery postponed' },
      { priority: 'LOW', title: 'Reorder Reminder', message: 'Items approaching reorder point' },
    ],
    STAFF: [
      { priority: 'CRITICAL', title: 'Critical Understaffing', message: 'Severe staff shortage' },
      { priority: 'HIGH', title: 'Staff No-Show', message: 'Scheduled staff member absent' },
      { priority: 'MEDIUM', title: 'Overtime Alert', message: 'Staff approaching overtime limits' },
      { priority: 'LOW', title: 'Schedule Reminder', message: 'Upcoming shift changes' },
    ],
    CUSTOMER: [
      { priority: 'HIGH', title: 'Customer Complaint', message: 'Serious customer dissatisfaction' },
      { priority: 'MEDIUM', title: 'Service Issue', message: 'Minor service problem reported' },
      { priority: 'LOW', title: 'Customer Feedback', message: 'General customer comment received' },
    ],
    FINANCIAL: [
      { priority: 'HIGH', title: 'Payment System Down', message: 'POS system experiencing issues' },
      { priority: 'MEDIUM', title: 'Daily Sales Alert', message: 'Sales tracking notification' },
      { priority: 'LOW', title: 'Financial Report', message: 'Routine financial update' },
    ],
    SAFETY: [
      { priority: 'CRITICAL', title: 'Safety Hazard', message: 'Immediate safety concern identified' },
      { priority: 'HIGH', title: 'Safety Protocol Breach', message: 'Safety procedure not followed' },
      { priority: 'MEDIUM', title: 'Safety Reminder', message: 'Routine safety check due' },
    ],
    HEALTH: [
      { priority: 'CRITICAL', title: 'Health Code Violation', message: 'Serious health concern detected' },
      { priority: 'HIGH', title: 'Temperature Alert', message: 'Food storage temperature issue' },
      { priority: 'MEDIUM', title: 'Health Inspection', message: 'Scheduled health inspection' },
    ],
    SECURITY: [
      { priority: 'HIGH', title: 'Security Breach', message: 'Unauthorized access detected' },
      { priority: 'MEDIUM', title: 'Security Alert', message: 'Unusual activity observed' },
      { priority: 'LOW', title: 'Security Update', message: 'Routine security check' },
    ],
  };

  generateDemoScenario(scenario: DemoScenario, restaurantContext: RestaurantContext): Alert[] {
    const templates = this.demoScenarios[scenario] || [];
    return templates.map(template => this.createAlertFromTemplate(template, restaurantContext));
  }

  generateRealisticAlerts(restaurantContext: RestaurantContext, count: number): Alert[] {
    const alerts: Alert[] = [];
    const alertTypes = Object.keys(this.alertTemplates) as AlertType[];
    
    for (let i = 0; i < count; i++) {
      // Select alert type based on restaurant context and time
      const alertType = this.selectAlertTypeByContext(restaurantContext, alertTypes);
      const templates = this.alertTemplates[alertType];
      
      // Select template based on context probability
      const template = this.selectTemplateByProbability(templates, restaurantContext);
      
      // Create alert with context-specific modifications
      const alert = this.createAlertFromTemplate(template, restaurantContext);
      alerts.push(alert);
    }

    return alerts;
  }

  generateSingleAlert(restaurantContext: RestaurantContext): Alert {
    const alertTypes = Object.keys(this.alertTemplates) as AlertType[];
    const alertType = this.selectAlertTypeByContext(restaurantContext, alertTypes);
    const templates = this.alertTemplates[alertType];
    const template = this.selectTemplateByProbability(templates, restaurantContext);
    
    return this.createAlertFromTemplate(template, restaurantContext);
  }

  generateRestaurantProfile(type: RestaurantType): RestaurantProfile {
    const baseProfiles: Record<RestaurantType, Partial<RestaurantProfile>> = {
      FAST_CASUAL: {
        name: `${this.getRandomName()} Burger Co.`,
        capacity: 80,
        staffCount: 12,
        avgOrderTime: 8,
        specialties: ['Burgers', 'Fries', 'Shakes'],
        peakHours: ['12:00', '13:00', '18:00', '19:00'],
      },
      FINE_DINING: {
        name: `${this.getRandomName()} Restaurant`,
        capacity: 60,
        staffCount: 20,
        avgOrderTime: 45,
        specialties: ['French Cuisine', 'Wine Pairing', 'Tasting Menu'],
        peakHours: ['19:00', '20:00', '21:00'],
      },
      CAFE: {
        name: `${this.getRandomName()} Coffee House`,
        capacity: 40,
        staffCount: 6,
        avgOrderTime: 5,
        specialties: ['Coffee', 'Pastries', 'Light Meals'],
        peakHours: ['07:00', '08:00', '12:00', '15:00'],
      },
      BAR: {
        name: `${this.getRandomName()} Tavern`,
        capacity: 100,
        staffCount: 8,
        avgOrderTime: 12,
        specialties: ['Craft Beer', 'Wings', 'Sports Viewing'],
        peakHours: ['17:00', '18:00', '19:00', '20:00', '21:00'],
      },
      FOOD_TRUCK: {
        name: `${this.getRandomName()} Mobile Kitchen`,
        capacity: 20,
        staffCount: 3,
        avgOrderTime: 10,
        specialties: ['Street Food', 'Quick Service'],
        peakHours: ['12:00', '13:00', '17:00', '18:00'],
      },
      CATERING: {
        name: `${this.getRandomName()} Catering`,
        capacity: 200,
        staffCount: 15,
        avgOrderTime: 60,
        specialties: ['Event Catering', 'Corporate Meals'],
        peakHours: ['11:00', '12:00', '17:00', '18:00'],
      },
    };

    const profile: RestaurantProfile = {
      id: uuidv4(),
      type,
      address: this.generateRandomAddress(),
      phone: this.generateRandomPhone(),
      email: `info@${type.toLowerCase()}restaurant.com`,
      hoursOfOperation: this.generateOperatingHours(type),
      ...baseProfiles[type],
    } as RestaurantProfile;

    return profile;
  }

  generateRestaurantContext(profile: RestaurantProfile): RestaurantContext {
    const now = Date.now();
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Calculate realistic capacity based on time and type
    const isPeakHour = profile.peakHours.some(hour => {
      const peakHour = parseInt(hour.split(':')[0]);
      return Math.abs(currentHour - peakHour) <= 1;
    });

    const baseCapacity = Math.floor(profile.capacity * 0.3);
    const peakBonus = isPeakHour ? Math.floor(profile.capacity * 0.4) : 0;
    const randomVariation = Math.floor(Math.random() * profile.capacity * 0.2);
    
    return {
      profile,
      currentTime: now,
      dayOfWeek,
      isOpen: this.isWithinOperatingHours(profile, now),
      currentCapacity: Math.min(profile.capacity, baseCapacity + peakBonus + randomVariation),
      activeOrders: Math.floor(Math.random() * 15) + 5,
      staffOnDuty: Math.floor(profile.staffCount * (Math.random() * 0.3 + 0.7)),
      recentAlerts: [],
      averageAlertFrequency: this.calculateBaseAlertFrequency(profile.type),
      demoMode: true,
      simulationSpeed: 1.0,
    };
  }

  calculateAlertProbability(currentTime: number, context: RestaurantContext): number {
    let baseProbability = context.averageAlertFrequency / 60; // Convert per hour to per minute
    
    // Adjust based on capacity
    const capacityFactor = context.currentCapacity / context.profile.capacity;
    baseProbability *= (0.5 + capacityFactor);
    
    // Adjust based on time of day
    const hour = new Date(currentTime).getHours();
    const isPeakHour = context.profile.peakHours.some(peakHour => {
      const peak = parseInt(peakHour.split(':')[0]);
      return Math.abs(hour - peak) <= 1;
    });
    
    if (isPeakHour) {
      baseProbability *= 2.0;
    } else if (hour < 6 || hour > 23) {
      baseProbability *= 0.1; // Very low during closed hours
    }
    
    // Ensure probability is reasonable (max 10% per minute during peak)
    return Math.min(baseProbability, 0.1);
  }

  // Private helper methods
  private createAlertFromTemplate(template: Partial<Alert>, context: RestaurantContext): Alert {
    const now = Date.now();
    
    const alert: Alert = {
      id: uuidv4(),
      type: template.type || 'ORDER',
      priority: template.priority || 'MEDIUM',
      status: 'ACTIVE',
      title: template.title || 'Restaurant Alert',
      message: this.personalizeMessage(template.message || 'Alert message', context),
      details: template.details,
      timestamp: now,
      read: false,
      acknowledged: false,
      resolved: false,
      dismissed: false,
      shouldNotify: true,
      notificationSent: false,
      actionRequired: template.actionRequired || false,
      estimatedResolutionTime: template.estimatedResolutionTime || 30,
      source: 'MockDataGenerator',
      tags: [context.profile.type, this.getTimeBasedTag(now)],
    };

    return alert;
  }

  private selectAlertTypeByContext(context: RestaurantContext, alertTypes: AlertType[]): AlertType {
    const hour = new Date().getHours();
    const capacityPercentage = context.currentCapacity / context.profile.capacity;
    
    // Weight alert types based on context
    const weights: Record<AlertType, number> = {
      ORDER: hour >= 11 && hour <= 22 ? (capacityPercentage > 0.7 ? 3 : 1) : 0.1,
      EQUIPMENT: 1,
      INVENTORY: hour >= 6 && hour <= 10 ? 2 : 1,
      STAFF: capacityPercentage > 0.8 ? 2 : 1,
      CUSTOMER: capacityPercentage > 0.6 ? 2 : 0.5,
      FINANCIAL: hour >= 9 && hour <= 21 ? 1 : 0.5,
      SAFETY: 1,
      HEALTH: 1,
      SECURITY: hour >= 22 || hour <= 6 ? 2 : 0.5,
    };
    
    return this.weightedRandomSelect(alertTypes, weights);
  }

  private selectTemplateByProbability(templates: Array<Partial<Alert>>, context: RestaurantContext): Partial<Alert> {
    const capacityPercentage = context.currentCapacity / context.profile.capacity;
    
    // Higher capacity increases chance of higher priority alerts
    const weights = templates.map(template => {
      let weight = 1;
      
      if (template.priority === 'CRITICAL') {
        weight = capacityPercentage > 0.9 ? 3 : 0.5;
      } else if (template.priority === 'HIGH') {
        weight = capacityPercentage > 0.7 ? 2 : 1;
      } else if (template.priority === 'MEDIUM') {
        weight = capacityPercentage > 0.5 ? 1.5 : 1;
      } else {
        weight = capacityPercentage < 0.3 ? 2 : 1;
      }
      
      return weight;
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < templates.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return templates[i];
      }
    }
    
    return templates[0];
  }

  private weightedRandomSelect<T>(items: T[], weights: Record<string, number>): T {
    const weightedItems = items.map(item => ({
      item,
      weight: weights[item as string] || 1,
    }));
    
    const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { item, weight } of weightedItems) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[0];
  }

  private personalizeMessage(message: string, context: RestaurantContext): string {
    // Replace placeholders with context-specific information
    return message
      .replace('{restaurantName}', context.profile.name)
      .replace('{capacity}', context.currentCapacity.toString())
      .replace('{maxCapacity}', context.profile.capacity.toString())
      .replace('{activeOrders}', context.activeOrders.toString())
      .replace('{staffCount}', context.staffOnDuty.toString());
  }

  private getTimeBasedTag(timestamp: number): string {
    const hour = new Date(timestamp).getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'late-night';
  }

  private getRandomName(): string {
    const names = [
      'Golden', 'Silver', 'Royal', 'Prime', 'Elite', 'Garden', 'Ocean', 'Mountain',
      'Sunset', 'Sunrise', 'Corner', 'Main Street', 'Downtown', 'Harbor', 'Mill',
      'Station', 'Bridge', 'Park', 'Square', 'Avenue'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateRandomAddress(): string {
    const streetNumbers = Math.floor(Math.random() * 9999) + 1;
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Broadway', 'Market St'];
    const cities = ['Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Salem', 'Madison'];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA'];
    const zipCode = Math.floor(Math.random() * 90000) + 10000;
    
    return `${streetNumbers} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]} ${zipCode}`;
  }

  private generateRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private generateOperatingHours(type: RestaurantType) {
    const defaultHours = {
      FAST_CASUAL: { open: '11:00', close: '22:00' },
      FINE_DINING: { open: '17:00', close: '23:00' },
      CAFE: { open: '06:00', close: '20:00' },
      BAR: { open: '15:00', close: '02:00' },
      FOOD_TRUCK: { open: '11:00', close: '21:00' },
      CATERING: { open: '08:00', close: '18:00' },
    };
    
    const hours = defaultHours[type];
    
    return {
      Monday: { ...hours, closed: false },
      Tuesday: { ...hours, closed: false },
      Wednesday: { ...hours, closed: false },
      Thursday: { ...hours, closed: false },
      Friday: { ...hours, closed: false },
      Saturday: { ...hours, closed: false },
      Sunday: { ...hours, closed: type === 'CATERING' },
    };
  }

  private isWithinOperatingHours(profile: RestaurantProfile, timestamp: number): boolean {
    const date = new Date(timestamp);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = profile.hoursOfOperation[dayOfWeek];
    
    if (!hours || hours.closed) return false;
    
    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    let closeMinutes = closeHour * 60 + closeMin;
    
    // Handle overnight hours (e.g., bar closing at 2 AM)
    if (closeMinutes < openMinutes) {
      closeMinutes += 24 * 60;
      if (currentMinutes < openMinutes) {
        return currentMinutes + 24 * 60 <= closeMinutes;
      }
    }
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  private calculateBaseAlertFrequency(type: RestaurantType): number {
    // Returns average alerts per hour
    const frequencies: Record<RestaurantType, number> = {
      FAST_CASUAL: 2.0,
      FINE_DINING: 1.5,
      CAFE: 1.0,
      BAR: 1.8,
      FOOD_TRUCK: 2.5,
      CATERING: 1.2,
    };
    
    return frequencies[type];
  }
}