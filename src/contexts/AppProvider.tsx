import React, { ReactNode } from 'react';
import { AlertProvider } from './AlertContext';
import { NotificationProvider } from './NotificationContext';
import { RestaurantProvider } from './RestaurantContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Main application provider that wraps all context providers
 * This ensures proper context hierarchy and initialization order
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <RestaurantProvider>
      <NotificationProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </NotificationProvider>
    </RestaurantProvider>
  );
}

export default AppProvider;