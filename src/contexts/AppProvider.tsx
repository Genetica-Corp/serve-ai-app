import React, { ReactNode, useEffect } from 'react';
import { AlertProvider, useAlerts } from './AlertContext';
import { NotificationProvider } from './NotificationContext';
import { RestaurantProvider } from './RestaurantContext';
import { UserProvider } from './UserContext';
import { SampleAlertService } from '../services/SampleAlertService';

interface AppProviderProps {
  children: ReactNode;
}

// Inner component that has access to AlertContext
function AppProviderInner({ children }: AppProviderProps) {
  const alertContext = useAlerts();

  useEffect(() => {
    // Expose AlertContext to window for RestaurantContext to use
    (window as any).__alertContext = alertContext;

    // Initialize with sample alerts on first load
    if (alertContext.state.alerts.length === 0) {
      const sampleAlerts = SampleAlertService.generateSampleAlerts();
      sampleAlerts.forEach(alert => {
        alertContext.addAlert(alert);
      });
    }

    // Cleanup on unmount
    return () => {
      delete (window as any).__alertContext;
    };
  }, [alertContext]);

  return <>{children}</>;
}

/**
 * Main application provider that wraps all context providers
 * This ensures proper context hierarchy and initialization order
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <UserProvider>
      <RestaurantProvider>
        <NotificationProvider>
          <AlertProvider>
            <AppProviderInner>
              {children}
            </AppProviderInner>
          </AlertProvider>
        </NotificationProvider>
      </RestaurantProvider>
    </UserProvider>
  );
}

export default AppProvider;