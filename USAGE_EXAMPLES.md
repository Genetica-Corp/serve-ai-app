# Serve AI State Management - Usage Examples

This document provides comprehensive examples of how to use the state management system and mock data generation for the Serve AI restaurant alert app.

## Quick Start

### 1. App Setup

First, wrap your app with the AppProvider:

```tsx
import React from 'react';
import { AppProvider } from './src';
import MainApp from './MainApp';

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
```

### 2. Basic Alert Management

```tsx
import React, { useEffect } from 'react';
import { useAlerts, useAlertService } from './src';

function AlertDashboard() {
  const { state, getFilteredAlerts, markAsRead } = useAlerts();
  const { generateInitialAlerts, isGenerating } = useAlertService();

  useEffect(() => {
    // Generate initial alerts on component mount
    generateInitialAlerts();
  }, [generateInitialAlerts]);

  const handleAlertTap = async (alertId: string) => {
    await markAsRead(alertId);
  };

  if (isGenerating) {
    return <Text>Loading alerts...</Text>;
  }

  return (
    <View>
      <Text>Critical Alerts: {state.criticalCount}</Text>
      <Text>Unread Alerts: {state.unreadCount}</Text>
      
      {getFilteredAlerts().map(alert => (
        <TouchableOpacity 
          key={alert.id} 
          onPress={() => handleAlertTap(alert.id)}
        >
          <Text>{alert.title}</Text>
          <Text>{alert.message}</Text>
          <Text>Priority: {alert.priority}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 3. Restaurant Profile Management

```tsx
import React from 'react';
import { useRestaurant } from './src';

function RestaurantInfo() {
  const { 
    state, 
    isRestaurantOpen, 
    getCurrentCapacityPercentage,
    getRestaurantStatus 
  } = useRestaurant();

  if (!state.profile) {
    return <Text>No restaurant profile loaded</Text>;
  }

  return (
    <View>
      <Text>{state.profile.name}</Text>
      <Text>Type: {state.profile.type}</Text>
      <Text>Status: {getRestaurantStatus()}</Text>
      <Text>Capacity: {getCurrentCapacityPercentage()}%</Text>
      <Text>Open: {isRestaurantOpen() ? 'Yes' : 'No'}</Text>
      
      {state.context && (
        <View>
          <Text>Active Orders: {state.context.activeOrders}</Text>
          <Text>Staff on Duty: {state.context.staffOnDuty}</Text>
        </View>
      )}
    </View>
  );
}
```

### 4. Notification Settings

```tsx
import React from 'react';
import { useNotifications } from './src';

function NotificationSettings() {
  const { state, updateSettings, requestPermissions } = useNotifications();

  const handleToggleNotifications = () => {
    updateSettings({ enabled: !state.settings.enabled });
  };

  const handleRequestPermissions = async () => {
    const status = await requestPermissions();
    console.log('Permission status:', status);
  };

  return (
    <View>
      <Text>Permissions: {state.permissions}</Text>
      
      <TouchableOpacity onPress={handleRequestPermissions}>
        <Text>Request Permissions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleToggleNotifications}>
        <Text>
          Notifications: {state.settings.enabled ? 'Enabled' : 'Disabled'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => updateSettings({ allowCritical: !state.settings.allowCritical })}
      >
        <Text>
          Critical Alerts: {state.settings.allowCritical ? 'Allowed' : 'Blocked'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Advanced Usage

### 5. Demo Scenarios

```tsx
import React from 'react';
import { useAlertService, DemoScenario } from './src';

function DemoController() {
  const { generateDemoScenario, startSimulation, stopSimulation, isSimulating } = useAlertService();

  const scenarios: DemoScenario[] = [
    'BUSY_LUNCH_RUSH',
    'MORNING_PREP',
    'EVENING_SERVICE',
    'EQUIPMENT_FAILURE',
    'STAFF_SHORTAGE',
  ];

  const handleScenario = async (scenario: DemoScenario) => {
    await generateDemoScenario(scenario);
  };

  const handleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation(30000); // Generate alert every 30 seconds
    }
  };

  return (
    <View>
      <Text>Demo Scenarios:</Text>
      {scenarios.map(scenario => (
        <TouchableOpacity 
          key={scenario}
          onPress={() => handleScenario(scenario)}
        >
          <Text>{scenario.replace(/_/g, ' ')}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity onPress={handleSimulation}>
        <Text>{isSimulating ? 'Stop' : 'Start'} Real-time Simulation</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 6. Alert Actions

```tsx
import React from 'react';
import { useAlertService, Alert } from './src';

interface AlertCardProps {
  alert: Alert;
}

function AlertCard({ alert }: AlertCardProps) {
  const { acknowledgeAlert, resolveAlert, dismissAlert } = useAlertService();

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAlert(alert.id);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveAlert(alert.id);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissAlert(alert.id);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  return (
    <View style={[styles.card, { borderColor: getPriorityColor(alert.priority) }]}>
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>
      <Text style={styles.priority}>Priority: {alert.priority}</Text>
      <Text style={styles.time}>
        {new Date(alert.timestamp).toLocaleTimeString()}
      </Text>
      
      <View style={styles.actions}>
        {!alert.acknowledged && (
          <TouchableOpacity onPress={handleAcknowledge} style={styles.button}>
            <Text>Acknowledge</Text>
          </TouchableOpacity>
        )}
        
        {alert.acknowledged && !alert.resolved && (
          <TouchableOpacity onPress={handleResolve} style={styles.button}>
            <Text>Resolve</Text>
          </TouchableOpacity>
        )}
        
        {alert.priority !== 'CRITICAL' && !alert.dismissed && (
          <TouchableOpacity onPress={handleDismiss} style={styles.button}>
            <Text>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return '#ff4444';
    case 'HIGH': return '#ff8800';
    case 'MEDIUM': return '#ffcc00';
    case 'LOW': return '#00cc00';
    default: return '#888888';
  }
};
```

### 7. Data Management

```tsx
import React from 'react';
import { useStateManagement } from './src';

function DataManager() {
  const {
    isLoading,
    error,
    saveAllData,
    loadAllData,
    createBackup,
    restoreFromBackup,
    clearAllData,
    getStorageInfo,
  } = useStateManagement();

  const handleSave = async () => {
    try {
      await saveAllData();
      alert('Data saved successfully');
    } catch (error) {
      alert('Failed to save data');
    }
  };

  const handleBackup = async () => {
    try {
      const backup = await createBackup();
      // In a real app, you might share this or save to external storage
      console.log('Backup created:', backup);
      alert('Backup created successfully');
    } catch (error) {
      alert('Failed to create backup');
    }
  };

  const handleStorageInfo = async () => {
    try {
      const info = await getStorageInfo();
      alert(`Total storage: ${(info.totalSize / 1024).toFixed(2)} KB`);
    } catch (error) {
      alert('Failed to get storage info');
    }
  };

  if (isLoading) {
    return <Text>Processing...</Text>;
  }

  return (
    <View>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text>Save All Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleBackup} style={styles.button}>
        <Text>Create Backup</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleStorageInfo} style={styles.button}>
        <Text>Storage Info</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={clearAllData} style={[styles.button, styles.dangerButton]}>
        <Text>Clear All Data</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 8. Error Handling

```tsx
import React, { useEffect } from 'react';
import { useErrorHandler } from './src';

function ErrorMonitor() {
  const { getErrorLog, getRecentErrors, clearErrors, getErrorStats } = useErrorHandler();

  const [errors, setErrors] = React.useState([]);
  const [stats, setStats] = React.useState(null);

  useEffect(() => {
    const recentErrors = getRecentErrors(60); // Last hour
    setErrors(recentErrors);
    
    const errorStats = getErrorStats();
    setStats(errorStats);
  }, [getRecentErrors, getErrorStats]);

  return (
    <View>
      <Text>Error Monitor</Text>
      
      {stats && (
        <View>
          <Text>Total Errors: {stats.total}</Text>
          <Text>Recent Errors: {stats.recentErrors.length}</Text>
          
          <Text>By Type:</Text>
          {Object.entries(stats.byType).map(([type, count]) => (
            <Text key={type}>  {type}: {count}</Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity onPress={clearErrors} style={styles.button}>
        <Text>Clear Error Log</Text>
      </TouchableOpacity>
      
      <Text>Recent Errors:</Text>
      {errors.map((error, index) => (
        <View key={index} style={styles.errorItem}>
          <Text style={styles.errorType}>{error.type}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Text style={styles.errorTime}>
            {new Date(error.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

### 9. Loading States

```tsx
import React from 'react';
import { useLoadingState, useGlobalLoadingState, OPERATIONS } from './src';

function LoadingExample() {
  const localLoading = useLoadingState();
  const globalLoading = useGlobalLoadingState();

  const handleLocalOperation = async () => {
    localLoading.startOperation('LOCAL_TASK', 'Processing local data...');
    
    try {
      // Simulate work with progress updates
      for (let i = 0; i <= 100; i += 20) {
        localLoading.setProgress(i);
        localLoading.setMessage(`Step ${i/20 + 1} of 5...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      localLoading.completeOperation();
    }
  };

  const handleGlobalOperation = async () => {
    globalLoading.startOperation(OPERATIONS.GENERATING_ALERTS, 'Generating new alerts...');
    
    try {
      // Simulate alert generation
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      globalLoading.completeOperation();
    }
  };

  return (
    <View>
      <Text>Local Loading: {localLoading.state.isLoading ? 'Active' : 'Inactive'}</Text>
      {localLoading.state.isLoading && (
        <View>
          <Text>{localLoading.state.message}</Text>
          {localLoading.state.progress && (
            <Text>Progress: {localLoading.state.progress}%</Text>
          )}
        </View>
      )}
      
      <Text>Global Loading: {globalLoading.state.isLoading ? 'Active' : 'Inactive'}</Text>
      {globalLoading.state.isLoading && (
        <Text>Operation: {globalLoading.state.operation}</Text>
      )}
      
      <TouchableOpacity onPress={handleLocalOperation} style={styles.button}>
        <Text>Start Local Operation</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleGlobalOperation} style={styles.button}>
        <Text>Start Global Operation</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Data Flow Architecture

The state management system follows this data flow:

```
User Action → Hook → Service → Storage → Context → Component Update
     ↓           ↓       ↓        ↓         ↓           ↓
Tap Alert → useAlertService → AlertService → AsyncStorage → AlertContext → UI Update
     │
     └─→ Notification → NotificationService → Expo Notifications → Native Alert
```

## Best Practices

1. **Always use the AppProvider** at the root of your app
2. **Handle errors gracefully** using the error handling utilities
3. **Show loading states** for better user experience
4. **Persist data regularly** using auto-save or manual triggers
5. **Use demo scenarios** for development and testing
6. **Monitor performance** with the error and loading state utilities

## Architecture Benefits

- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Type Safety**: Full TypeScript support throughout the system
- **Offline Support**: AsyncStorage persistence for offline functionality
- **Error Recovery**: Comprehensive error handling and recovery strategies
- **Scalability**: Modular design allows easy extension and modification
- **Testing**: Mock data generation makes testing and development easier