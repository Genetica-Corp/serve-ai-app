import { Alert, AlertType, AlertPriority, AlertStatus } from '../types';

export class SampleAlertService {
  static generateSampleAlerts(): Alert[] {
    const now = Date.now();
    
    return [
      {
        id: 'sample-1',
        type: 'INVENTORY' as AlertType,
        priority: 'HIGH' as AlertPriority,
        status: 'ACTIVE' as AlertStatus,
        title: 'Low Stock: Premium Beef',
        message: 'Premium beef stock is running low (2 units remaining). Expected to run out by 6 PM today.',
        details: 'Current inventory: 2 units. Daily consumption: 8-12 units during dinner service.',
        explanation: 'Premium beef is one of our most popular dinner items. Running out during peak dinner hours could significantly impact customer satisfaction and revenue. The low stock is likely due to higher than expected demand from today\'s lunch service and a delayed delivery from our primary supplier.',
        relatedFactors: [
          'Supplier delivery delayed by 2 days',
          'Higher than forecast lunch demand (+30%)',
          'Weekend dinner service approaching',
          'Popular beef special featured on menu',
          'Alternative beef grades not suitable for signature dishes'
        ],
        timestamp: now - 1800000, // 30 minutes ago
        read: false,
        acknowledged: false,
        resolved: false,
        dismissed: false,
        shouldNotify: true,
        notificationSent: false,
        actionRequired: true,
        estimatedResolutionTime: 120, // 2 hours
        source: 'Inventory Management System',
        tags: ['inventory', 'beef', 'high-demand', 'supplier-delay'],
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        dismissedUntilRefresh: false,
        // Assignment fields for demo
        assignedTo: '2',
        assignedToName: 'Sarah Chen',
        assignedBy: '1',
        assignedByName: 'Alex Thompson',
        assignedAt: new Date(now - 1200000), // 20 minutes ago
        assignmentHistory: [{
          assignedTo: '2',
          assignedToName: 'Sarah Chen',
          assignedBy: '1',
          assignedByName: 'Alex Thompson',
          assignedAt: new Date(now - 1200000),
          action: 'assigned' as const,
        }],
        cureSteps: [
          { id: 'step-1', description: 'Verify current stock levels', completed: true, completedAt: new Date(now - 1000000), completedBy: '2' },
          { id: 'step-2', description: 'Check for discrepancies in counts', completed: true, completedAt: new Date(now - 900000), completedBy: '2' },
          { id: 'step-3', description: 'Review recent deliveries', completed: false },
          { id: 'step-4', description: 'Update inventory system', completed: false },
          { id: 'step-5', description: 'Place emergency order if needed', completed: false },
          { id: 'step-6', description: 'Adjust par levels if necessary', completed: false },
        ],
      },
      {
        id: 'sample-2',
        type: 'EQUIPMENT' as AlertType,
        priority: 'CRITICAL' as AlertPriority,
        status: 'ACTIVE' as AlertStatus,
        title: 'Refrigeration Unit #2 Temperature Warning',
        message: 'Walk-in cooler #2 temperature has risen to 45°F (safe range: 35-38°F). Food safety risk detected.',
        details: 'Temperature logged at 45°F at 2:15 PM. Contains dairy products, fresh vegetables, and prepared sauces.',
        explanation: 'The walk-in cooler temperature has exceeded safe food storage limits, creating a potential food safety hazard. This could be caused by a malfunctioning compressor, blocked air vents, or a refrigerant leak. All stored food items are at risk of bacterial growth and spoilage, which could lead to foodborne illness if served to customers.',
        relatedFactors: [
          'Compressor showing signs of strain (loud noises reported)',
          'Air vents may be blocked by recent large delivery',
          'Hot weather increasing ambient temperature',
          'Door gasket showing wear from frequent use',
          'Recent power fluctuation in building'
        ],
        timestamp: now - 900000, // 15 minutes ago
        read: false,
        acknowledged: false,
        resolved: false,
        dismissed: false,
        shouldNotify: true,
        notificationSent: true,
        actionRequired: true,
        estimatedResolutionTime: 60, // 1 hour
        source: 'Temperature Monitoring System',
        tags: ['equipment', 'refrigeration', 'food-safety', 'critical'],
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        dismissedUntilRefresh: false,
        // Assignment fields for demo
        assignedTo: '3',
        assignedToName: 'Mike Rodriguez',
        assignedBy: '1',
        assignedByName: 'Alex Thompson',
        assignedAt: new Date(now - 600000), // 10 minutes ago
        assignmentHistory: [{
          assignedTo: '3',
          assignedToName: 'Mike Rodriguez',
          assignedBy: '1',
          assignedByName: 'Alex Thompson',
          assignedAt: new Date(now - 600000),
          action: 'assigned' as const,
        }],
      },
      {
        id: 'sample-3',
        type: 'STAFF' as AlertType,
        priority: 'HIGH' as AlertPriority,
        status: 'ACTIVE' as AlertStatus,
        title: 'Kitchen Staff Shortage',
        message: 'Two kitchen staff members called in sick. Operating at 60% kitchen capacity for dinner service.',
        details: 'Missing: 1 line cook, 1 prep cook. Estimated impact: 40% longer ticket times during peak hours.',
        explanation: 'With two key kitchen staff members out sick, the restaurant is facing a significant staffing shortage just before the busy dinner service. This will likely result in longer wait times, potential order mistakes due to rushed preparation, and increased stress on remaining staff members. The shortage particularly affects the salad station and grill line.',
        relatedFactors: [
          'Seasonal flu affecting multiple staff members',
          'No cross-trained backup for specialized positions',
          'Weekend dinner service has highest demand',
          'Recent hire still in training period',
          'Overtime budget constraints limiting call-ins'
        ],
        timestamp: now - 3600000, // 1 hour ago
        read: false,
        acknowledged: false,
        resolved: false,
        dismissed: false,
        shouldNotify: true,
        notificationSent: true,
        actionRequired: true,
        estimatedResolutionTime: 480, // 8 hours (rest of shift)
        source: 'Staff Management System',
        tags: ['staff', 'shortage', 'kitchen', 'sick-leave'],
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        dismissedUntilRefresh: false,
      },
      {
        id: 'sample-4',
        type: 'ORDER' as AlertType,
        priority: 'MEDIUM' as AlertPriority,
        status: 'ACTIVE' as AlertStatus,
        title: 'Order Processing Delays',
        message: 'Average order processing time increased to 25 minutes (target: 15 minutes). 8 orders currently in queue.',
        details: 'Current wait time affecting customer satisfaction. Peak dinner service beginning.',
        explanation: 'Order processing times have increased significantly due to the kitchen staffing shortage and higher than expected early dinner demand. While not critical yet, this trend could escalate into a more serious problem as the evening progresses and more customers arrive for dinner.',
        relatedFactors: [
          'Kitchen staff shortage impacting prep speed',
          'Complex orders from large party reservations',
          'New menu items require additional prep time',
          'POS system running slower than usual',
          'Increased takeout orders during dinner prep'
        ],
        timestamp: now - 600000, // 10 minutes ago
        read: false,
        acknowledged: false,
        resolved: false,
        dismissed: false,
        shouldNotify: true,
        notificationSent: false,
        actionRequired: false,
        estimatedResolutionTime: 180, // 3 hours
        source: 'Order Management System',
        tags: ['orders', 'delays', 'processing-time', 'customer-impact'],
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        dismissedUntilRefresh: false,
      },
      {
        id: 'sample-5',
        type: 'CUSTOMER' as AlertType,
        priority: 'LOW' as AlertPriority,
        status: 'ACTIVE' as AlertStatus,
        title: 'Customer Feedback: Table 12',
        message: 'Customer reported slower than expected service but complimented food quality.',
        details: 'Positive feedback on salmon dish, concern about 20-minute wait for appetizers.',
        explanation: 'While the customer was satisfied with the food quality, they noted the extended wait time for their appetizers. This feedback aligns with the current kitchen staffing challenges and provides valuable insight into how operational issues are affecting the customer experience.',
        relatedFactors: [
          'Current kitchen staffing shortage affecting all prep times',
          'Table 12 ordered multiple appetizers during peak prep time',
          'Customer has been a regular for 2+ years, knows typical service speed',
          'Salmon dish preparation went smoothly despite delays',
          'Server kept customer informed about delays'
        ],
        timestamp: now - 1200000, // 20 minutes ago
        read: false,
        acknowledged: false,
        resolved: false,
        dismissed: false,
        shouldNotify: false,
        notificationSent: false,
        actionRequired: false,
        estimatedResolutionTime: 30, // 30 minutes
        source: 'Customer Feedback System',
        tags: ['customer', 'feedback', 'service-time', 'food-quality'],
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        dismissedUntilRefresh: false,
      }
    ];
  }

  static getAlertById(id: string): Alert | undefined {
    return this.generateSampleAlerts().find(alert => alert.id === id);
  }

  static getActiveAlerts(): Alert[] {
    return this.generateSampleAlerts().filter(alert => 
      alert.status === 'ACTIVE' && !alert.dismissedUntilRefresh
    );
  }
}