import { Alert, AlertType, AlertPriority } from '../types';

export interface RelatedFactorSearch {
  alertId: string;
  originalAlert: Alert;
  searchResults: {
    relatedAlerts: Alert[];
    additionalFactors: string[];
    recommendations: string[];
    preventiveMeasures: string[];
  };
}

export class AlertSearchService {
  private static alertDatabase: {
    [key in AlertType]: {
      [key in AlertPriority]: {
        commonFactors: string[];
        preventiveMeasures: string[];
        recommendations: string[];
      };
    };
  } = {
    INVENTORY: {
      CRITICAL: {
        commonFactors: [
          'Supplier delivery delays',
          'Unexpected high demand',
          'Spoilage due to temperature control issues',
          'Inventory tracking system errors',
          'Staff not following FIFO procedures'
        ],
        preventiveMeasures: [
          'Implement automated inventory tracking',
          'Set up multiple supplier relationships',
          'Regular temperature monitoring',
          'Staff training on inventory management'
        ],
        recommendations: [
          'Contact supplier immediately',
          'Check alternative suppliers',
          'Adjust menu offerings temporarily',
          'Implement emergency ordering procedures'
        ]
      },
      HIGH: {
        commonFactors: [
          'Seasonal demand fluctuations',
          'Menu item popularity changes',
          'Weekend/holiday patterns',
          'Poor inventory forecasting'
        ],
        preventiveMeasures: [
          'Historical data analysis',
          'Better forecasting tools',
          'Safety stock levels',
          'Regular inventory audits'
        ],
        recommendations: [
          'Adjust ordering quantities',
          'Monitor consumption patterns',
          'Update reorder points',
          'Review supplier agreements'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Normal consumption variations',
          'Seasonal menu changes',
          'New item introduction',
          'Staff ordering mistakes'
        ],
        preventiveMeasures: [
          'Regular inventory reviews',
          'Staff training updates',
          'Clear ordering procedures',
          'Inventory management software'
        ],
        recommendations: [
          'Monitor closely',
          'Adjust next order',
          'Review staff procedures',
          'Update inventory thresholds'
        ]
      },
      LOW: {
        commonFactors: [
          'Minor stock variations',
          'Expected fluctuations',
          'Routine reordering needed'
        ],
        preventiveMeasures: [
          'Maintain regular ordering schedule',
          'Monitor consumption trends'
        ],
        recommendations: [
          'Schedule routine reorder',
          'No immediate action needed'
        ]
      }
    },
    EQUIPMENT: {
      CRITICAL: {
        commonFactors: [
          'Equipment age and wear',
          'Lack of preventive maintenance',
          'Power supply issues',
          'Manufacturing defects',
          'Improper usage by staff'
        ],
        preventiveMeasures: [
          'Regular maintenance schedules',
          'Staff training on proper usage',
          'Equipment monitoring systems',
          'Backup equipment availability'
        ],
        recommendations: [
          'Call repair service immediately',
          'Switch to backup equipment',
          'Adjust service temporarily',
          'Document incident for warranty'
        ]
      },
      HIGH: {
        commonFactors: [
          'Equipment showing wear signs',
          'Irregular maintenance',
          'Environmental factors',
          'Heavy usage periods'
        ],
        preventiveMeasures: [
          'Preventive maintenance program',
          'Usage monitoring',
          'Environmental controls',
          'Staff training updates'
        ],
        recommendations: [
          'Schedule maintenance',
          'Monitor equipment closely',
          'Check warranty status',
          'Plan for potential replacement'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Routine wear and tear',
          'Scheduled maintenance due',
          'Minor performance issues'
        ],
        preventiveMeasures: [
          'Follow maintenance schedule',
          'Regular performance checks',
          'Staff training on proper use'
        ],
        recommendations: [
          'Schedule routine maintenance',
          'Monitor performance',
          'Review usage patterns'
        ]
      },
      LOW: {
        commonFactors: [
          'Normal operation variations',
          'Minor adjustments needed'
        ],
        preventiveMeasures: [
          'Regular monitoring',
          'Proper operation procedures'
        ],
        recommendations: [
          'Continue monitoring',
          'No immediate action needed'
        ]
      }
    },
    ORDER: {
      CRITICAL: {
        commonFactors: [
          'System outages',
          'Payment processing failures',
          'Kitchen capacity exceeded',
          'Staff shortages during peak',
          'Ingredient shortages'
        ],
        preventiveMeasures: [
          'Backup ordering systems',
          'Kitchen capacity planning',
          'Staff scheduling optimization',
          'Inventory buffer management'
        ],
        recommendations: [
          'Implement backup procedures',
          'Communicate delays to customers',
          'Prioritize order processing',
          'Add temporary staff if possible'
        ]
      },
      HIGH: {
        commonFactors: [
          'Peak hour rushes',
          'Large group orders',
          'Special event bookings',
          'Staff learning curve'
        ],
        preventiveMeasures: [
          'Peak hour staffing',
          'Large order protocols',
          'Event planning procedures',
          'Continuous staff training'
        ],
        recommendations: [
          'Adjust staffing levels',
          'Communicate estimated times',
          'Streamline processes',
          'Monitor wait times'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Normal order volume spikes',
          'Menu complexity',
          'New staff training'
        ],
        preventiveMeasures: [
          'Standard operating procedures',
          'Menu optimization',
          'Regular staff training'
        ],
        recommendations: [
          'Monitor processing times',
          'Optimize workflow',
          'Review staff performance'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine order processing',
          'Minor delays'
        ],
        preventiveMeasures: [
          'Maintain service standards',
          'Regular process review'
        ],
        recommendations: [
          'Continue normal operations',
          'Minor process adjustments'
        ]
      }
    },
    STAFF: {
      CRITICAL: {
        commonFactors: [
          'Unexpected absences',
          'High turnover rates',
          'Inadequate training',
          'Workplace incidents',
          'Scheduling conflicts'
        ],
        preventiveMeasures: [
          'Cross-training programs',
          'Competitive compensation',
          'Comprehensive training',
          'Safety protocols',
          'Flexible scheduling'
        ],
        recommendations: [
          'Call in backup staff',
          'Adjust service levels',
          'Redistribute responsibilities',
          'Consider temporary help'
        ]
      },
      HIGH: {
        commonFactors: [
          'Planned absences overlap',
          'Training needs',
          'Performance issues',
          'Schedule adjustments'
        ],
        preventiveMeasures: [
          'Advance scheduling',
          'Ongoing training programs',
          'Performance management',
          'Flexible staffing'
        ],
        recommendations: [
          'Adjust schedules',
          'Provide additional training',
          'Monitor performance',
          'Plan coverage'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Normal staffing variations',
          'Skill development needs',
          'Minor scheduling issues'
        ],
        preventiveMeasures: [
          'Regular schedule reviews',
          'Skill development programs',
          'Clear communication'
        ],
        recommendations: [
          'Minor schedule adjustments',
          'Provide training opportunities',
          'Monitor staff satisfaction'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine staffing matters',
          'Minor adjustments needed'
        ],
        preventiveMeasures: [
          'Regular team meetings',
          'Open communication'
        ],
        recommendations: [
          'Continue normal operations',
          'Address minor issues'
        ]
      }
    },
    CUSTOMER: {
      CRITICAL: {
        commonFactors: [
          'Service failures',
          'Food quality issues',
          'Long wait times',
          'Staff behavior problems',
          'Health and safety concerns'
        ],
        preventiveMeasures: [
          'Service quality training',
          'Food safety protocols',
          'Efficient service systems',
          'Staff behavior standards',
          'Health code compliance'
        ],
        recommendations: [
          'Address issue immediately',
          'Apologize and compensate',
          'Investigate root cause',
          'Implement corrective measures'
        ]
      },
      HIGH: {
        commonFactors: [
          'Service delays',
          'Menu availability issues',
          'Cleanliness concerns',
          'Staff attitude problems'
        ],
        preventiveMeasures: [
          'Service efficiency training',
          'Menu management',
          'Cleaning protocols',
          'Customer service training'
        ],
        recommendations: [
          'Address customer concerns',
          'Review service procedures',
          'Train staff as needed',
          'Follow up with customer'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Minor service issues',
          'Preference complaints',
          'Suggestion feedback'
        ],
        preventiveMeasures: [
          'Regular service reviews',
          'Customer feedback systems',
          'Continuous improvement'
        ],
        recommendations: [
          'Acknowledge feedback',
          'Consider improvements',
          'Thank customer for input'
        ]
      },
      LOW: {
        commonFactors: [
          'General feedback',
          'Minor suggestions'
        ],
        preventiveMeasures: [
          'Maintain service standards',
          'Regular customer surveys'
        ],
        recommendations: [
          'Log feedback',
          'Review periodically'
        ]
      }
    },
    FINANCIAL: {
      CRITICAL: {
        commonFactors: [
          'Cash flow problems',
          'Payment system failures',
          'Major cost overruns',
          'Revenue shortfalls',
          'Accounting errors'
        ],
        preventiveMeasures: [
          'Cash flow management',
          'Backup payment systems',
          'Budget monitoring',
          'Revenue tracking',
          'Regular audits'
        ],
        recommendations: [
          'Emergency financial review',
          'Contact financial advisor',
          'Implement cost controls',
          'Review all expenses'
        ]
      },
      HIGH: {
        commonFactors: [
          'Budget variances',
          'Seasonal revenue changes',
          'Cost increases',
          'Payment delays'
        ],
        preventiveMeasures: [
          'Budget planning',
          'Seasonal adjustments',
          'Cost monitoring',
          'Payment terms management'
        ],
        recommendations: [
          'Review budget variance',
          'Adjust financial plans',
          'Monitor costs closely',
          'Improve payment collection'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Normal financial variations',
          'Routine expense changes',
          'Minor budget adjustments'
        ],
        preventiveMeasures: [
          'Regular financial reviews',
          'Budget monitoring',
          'Expense tracking'
        ],
        recommendations: [
          'Update financial records',
          'Adjust budget as needed',
          'Continue monitoring'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine financial matters',
          'Minor adjustments'
        ],
        preventiveMeasures: [
          'Regular bookkeeping',
          'Financial record maintenance'
        ],
        recommendations: [
          'Update records',
          'Continue normal operations'
        ]
      }
    },
    SAFETY: {
      CRITICAL: {
        commonFactors: [
          'Equipment hazards',
          'Chemical spills',
          'Fire hazards',
          'Slip and fall risks',
          'Food contamination'
        ],
        preventiveMeasures: [
          'Safety training programs',
          'Hazard identification',
          'Emergency procedures',
          'Safety equipment maintenance',
          'Regular safety audits'
        ],
        recommendations: [
          'Evacuate if necessary',
          'Call emergency services',
          'Secure the area',
          'Document incident thoroughly'
        ]
      },
      HIGH: {
        commonFactors: [
          'Safety protocol violations',
          'Equipment maintenance issues',
          'Training gaps',
          'Environmental hazards'
        ],
        preventiveMeasures: [
          'Safety training updates',
          'Equipment inspections',
          'Environmental monitoring',
          'Safety reminder programs'
        ],
        recommendations: [
          'Address safety concerns',
          'Retrain staff as needed',
          'Inspect equipment',
          'Update safety procedures'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Minor safety concerns',
          'Routine safety checks needed',
          'Training reminders'
        ],
        preventiveMeasures: [
          'Regular safety meetings',
          'Routine inspections',
          'Safety awareness programs'
        ],
        recommendations: [
          'Address minor issues',
          'Schedule safety training',
          'Update safety checklists'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine safety matters',
          'Minor maintenance needs'
        ],
        preventiveMeasures: [
          'Regular safety reviews',
          'Maintenance schedules'
        ],
        recommendations: [
          'Continue safety protocols',
          'Schedule routine maintenance'
        ]
      }
    },
    HEALTH: {
      CRITICAL: {
        commonFactors: [
          'Foodborne illness reports',
          'Temperature control failures',
          'Cross-contamination incidents',
          'Expired ingredients used',
          'Health code violations'
        ],
        preventiveMeasures: [
          'HACCP implementation',
          'Temperature monitoring',
          'Sanitation protocols',
          'Inventory rotation systems',
          'Regular health inspections'
        ],
        recommendations: [
          'Contact health authorities',
          'Remove affected products',
          'Deep clean facility',
          'Review all procedures'
        ]
      },
      HIGH: {
        commonFactors: [
          'Temperature monitoring issues',
          'Sanitation lapses',
          'Staff illness',
          'Cleaning protocol violations'
        ],
        preventiveMeasures: [
          'Temperature control systems',
          'Sanitation training',
          'Sick leave policies',
          'Cleaning checklists'
        ],
        recommendations: [
          'Address health concerns',
          'Retrain staff',
          'Implement corrective measures',
          'Monitor closely'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Routine health checks needed',
          'Minor sanitation issues',
          'Training updates required'
        ],
        preventiveMeasures: [
          'Regular health training',
          'Sanitation schedules',
          'Health monitoring'
        ],
        recommendations: [
          'Address minor issues',
          'Update training',
          'Maintain health standards'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine health matters',
          'Minor improvements needed'
        ],
        preventiveMeasures: [
          'Regular health reviews',
          'Continuous improvement'
        ],
        recommendations: [
          'Continue health protocols',
          'Minor adjustments'
        ]
      }
    },
    SECURITY: {
      CRITICAL: {
        commonFactors: [
          'Break-in attempts',
          'Theft incidents',
          'Security system failures',
          'Cash handling violations',
          'Staff security breaches'
        ],
        preventiveMeasures: [
          'Security system maintenance',
          'Cash handling procedures',
          'Staff background checks',
          'Security training',
          'Access control systems'
        ],
        recommendations: [
          'Contact law enforcement',
          'Secure premises',
          'Review security footage',
          'Update security procedures'
        ]
      },
      HIGH: {
        commonFactors: [
          'Security protocol violations',
          'Access control issues',
          'Cash handling problems',
          'Surveillance gaps'
        ],
        preventiveMeasures: [
          'Security training updates',
          'Access control reviews',
          'Cash handling audits',
          'Surveillance system checks'
        ],
        recommendations: [
          'Address security concerns',
          'Update security protocols',
          'Train staff on procedures',
          'Review access controls'
        ]
      },
      MEDIUM: {
        commonFactors: [
          'Minor security concerns',
          'Routine security checks needed',
          'Training reminders'
        ],
        preventiveMeasures: [
          'Regular security reviews',
          'Security awareness programs',
          'Routine checks'
        ],
        recommendations: [
          'Address minor issues',
          'Update security training',
          'Maintain vigilance'
        ]
      },
      LOW: {
        commonFactors: [
          'Routine security matters',
          'Minor improvements needed'
        ],
        preventiveMeasures: [
          'Regular security monitoring',
          'Continuous improvement'
        ],
        recommendations: [
          'Continue security protocols',
          'Minor adjustments'
        ]
      }
    }
  };

  static async searchRelatedFactors(alert: Alert, allAlerts: Alert[]): Promise<RelatedFactorSearch> {
    // Get type and priority specific information
    const typeData = this.alertDatabase[alert.type];
    const priorityData = typeData?.[alert.priority];

    // Find related alerts of the same type
    const relatedAlerts = allAlerts.filter(a => 
      a.id !== alert.id && 
      (a.type === alert.type || a.tags?.some(tag => alert.tags?.includes(tag)))
    ).slice(0, 5);

    // Combine existing factors with database factors
    const additionalFactors = [
      ...(priorityData?.commonFactors || []),
      ...(alert.relatedFactors || [])
    ].filter((factor, index, self) => self.indexOf(factor) === index);

    return {
      alertId: alert.id,
      originalAlert: alert,
      searchResults: {
        relatedAlerts,
        additionalFactors,
        recommendations: priorityData?.recommendations || [],
        preventiveMeasures: priorityData?.preventiveMeasures || []
      }
    };
  }

  static async getRecommendations(alertType: AlertType, priority: AlertPriority): Promise<string[]> {
    return this.alertDatabase[alertType]?.[priority]?.recommendations || [];
  }

  static async getPreventiveMeasures(alertType: AlertType, priority: AlertPriority): Promise<string[]> {
    return this.alertDatabase[alertType]?.[priority]?.preventiveMeasures || [];
  }
}