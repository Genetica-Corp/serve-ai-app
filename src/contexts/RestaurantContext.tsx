import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  RestaurantState, 
  RestaurantAction, 
  RestaurantProfile, 
  RestaurantContext as RestaurantContextType,
  RestaurantType,
  Alert
} from '../../types';

// Initial state
const initialState: RestaurantState = {
  profile: null,
  context: null,
  demoMode: true, // Start in demo mode for development
  simulationActive: false,
  loading: false,
  error: null,
};

// Restaurant reducer
function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };

    case 'SET_CONTEXT':
      return {
        ...state,
        context: action.payload,
      };

    case 'UPDATE_CONTEXT':
      return {
        ...state,
        context: state.context ? { ...state.context, ...action.payload } : null,
      };

    case 'SET_DEMO_MODE':
      return {
        ...state,
        demoMode: action.payload,
      };

    case 'SET_SIMULATION_ACTIVE':
      return {
        ...state,
        simulationActive: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

// Context interface
interface RestaurantContextInterface {
  state: RestaurantState;
  dispatch: React.Dispatch<RestaurantAction>;
  
  // Profile methods
  setProfile: (profile: RestaurantProfile) => void;
  updateProfile: (updates: Partial<RestaurantProfile>) => void;
  createDefaultProfile: (type: RestaurantType) => RestaurantProfile;
  
  // Context methods
  setContext: (context: RestaurantContextType) => void;
  updateContext: (updates: Partial<RestaurantContextType>) => void;
  refreshContext: () => void;
  
  // Demo mode methods
  setDemoMode: (enabled: boolean) => void;
  setSimulationActive: (active: boolean) => void;
  
  // Utility methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed properties
  isRestaurantOpen: () => boolean;
  getCurrentCapacityPercentage: () => number;
  getOperatingHours: () => { open: string; close: string } | null;
  isWithinOperatingHours: (time?: number) => boolean;
  getPeakHourStatus: () => 'peak' | 'normal' | 'slow';
  getRestaurantStatus: () => 'open' | 'closed' | 'closing_soon' | 'opening_soon';
}

// Create context
const RestaurantContext = createContext<RestaurantContextInterface | undefined>(undefined);

// Provider component
interface RestaurantProviderProps {
  children: ReactNode;
}

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  // Initialize with default profile on mount
  useEffect(() => {
    if (!state.profile && state.demoMode) {
      const defaultProfile = createDefaultProfile('FAST_CASUAL');
      setProfile(defaultProfile);
      
      // Create initial context
      const initialContext = createInitialContext(defaultProfile);
      setContext(initialContext);
    }
  }, []);

  // Update context periodically when simulation is active
  useEffect(() => {
    if (state.simulationActive && state.context) {
      const interval = setInterval(() => {
        refreshContext();
      }, 30000); // Update every 30 seconds in simulation mode

      return () => clearInterval(interval);
    }
  }, [state.simulationActive, state.context]);

  // Profile methods
  const setProfile = (profile: RestaurantProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };

  const updateProfile = (updates: Partial<RestaurantProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const createDefaultProfile = (type: RestaurantType): RestaurantProfile => {
    const profiles: Record<RestaurantType, Partial<RestaurantProfile>> = {
      FAST_CASUAL: {
        name: 'Demo Burger Kitchen',
        capacity: 80,
        staffCount: 12,
        avgOrderTime: 8,
        specialties: ['Burgers', 'Fries', 'Shakes'],
        peakHours: ['12:00', '13:00', '18:00', '19:00'],
      },
      FINE_DINING: {
        name: 'Demo Elegance Restaurant',
        capacity: 60,
        staffCount: 20,
        avgOrderTime: 45,
        specialties: ['French Cuisine', 'Wine Pairing', 'Tasting Menu'],
        peakHours: ['19:00', '20:00', '21:00'],
      },
      CAFE: {
        name: 'Demo Coffee House',
        capacity: 40,
        staffCount: 6,
        avgOrderTime: 5,
        specialties: ['Coffee', 'Pastries', 'Light Meals'],
        peakHours: ['07:00', '08:00', '12:00', '15:00'],
      },
      BAR: {
        name: 'Demo Sports Bar',
        capacity: 100,
        staffCount: 8,
        avgOrderTime: 12,
        specialties: ['Craft Beer', 'Wings', 'Sports Viewing'],
        peakHours: ['17:00', '18:00', '19:00', '20:00', '21:00'],
      },
      FOOD_TRUCK: {
        name: 'Demo Mobile Eats',
        capacity: 20,
        staffCount: 3,
        avgOrderTime: 10,
        specialties: ['Street Food', 'Quick Service'],
        peakHours: ['12:00', '13:00', '17:00', '18:00'],
      },
      CATERING: {
        name: 'Demo Catering Co.',
        capacity: 200,
        staffCount: 15,
        avgOrderTime: 60,
        specialties: ['Event Catering', 'Corporate Meals'],
        peakHours: ['11:00', '12:00', '17:00', '18:00'],
      },
    };

    const baseProfile: RestaurantProfile = {
      id: `demo-${type.toLowerCase()}-${Date.now()}`,
      type,
      address: '123 Demo Street, Demo City, DC 12345',
      phone: '(555) 123-4567',
      email: `demo@${type.toLowerCase()}restaurant.com`,
      hoursOfOperation: {
        Monday: { open: '11:00', close: '22:00', closed: false },
        Tuesday: { open: '11:00', close: '22:00', closed: false },
        Wednesday: { open: '11:00', close: '22:00', closed: false },
        Thursday: { open: '11:00', close: '22:00', closed: false },
        Friday: { open: '11:00', close: '23:00', closed: false },
        Saturday: { open: '10:00', close: '23:00', closed: false },
        Sunday: { open: '10:00', close: '21:00', closed: false },
      },
      ...profiles[type],
    } as RestaurantProfile;

    return baseProfile;
  };

  // Context methods
  const setContext = (context: RestaurantContextType) => {
    dispatch({ type: 'SET_CONTEXT', payload: context });
  };

  const updateContext = (updates: Partial<RestaurantContextType>) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: updates });
  };

  const createInitialContext = (profile: RestaurantProfile): RestaurantContextType => {
    const now = Date.now();
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Simulate current restaurant activity
    const isPeakHour = profile.peakHours.some(hour => {
      const peakHour = parseInt(hour.split(':')[0]);
      return Math.abs(currentHour - peakHour) <= 1;
    });

    const baseCapacity = Math.floor(profile.capacity * 0.3); // Base 30% capacity
    const peakBonus = isPeakHour ? Math.floor(profile.capacity * 0.4) : 0;
    const randomVariation = Math.floor(Math.random() * profile.capacity * 0.2);
    
    return {
      profile,
      currentTime: now,
      dayOfWeek,
      isOpen: isWithinOperatingHours(now),
      currentCapacity: Math.min(profile.capacity, baseCapacity + peakBonus + randomVariation),
      activeOrders: Math.floor(Math.random() * 15) + 5,
      staffOnDuty: Math.floor(profile.staffCount * (Math.random() * 0.3 + 0.7)), // 70-100% of staff
      recentAlerts: [],
      averageAlertFrequency: 0.5, // alerts per hour
      demoMode: state.demoMode,
      simulationSpeed: 1.0,
    };
  };

  const refreshContext = () => {
    if (!state.profile) return;

    const updates = {
      currentTime: Date.now(),
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      isOpen: isRestaurantOpen(),
      currentCapacity: Math.min(
        state.profile.capacity,
        Math.floor(Math.random() * state.profile.capacity * 0.8) + 
        Math.floor(state.profile.capacity * 0.2)
      ),
      activeOrders: Math.floor(Math.random() * 20) + 1,
    };

    updateContext(updates);
  };

  // Demo mode methods
  const setDemoMode = (enabled: boolean) => {
    dispatch({ type: 'SET_DEMO_MODE', payload: enabled });
  };

  const setSimulationActive = (active: boolean) => {
    dispatch({ type: 'SET_SIMULATION_ACTIVE', payload: active });
  };

  // Utility methods
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Computed properties
  const isRestaurantOpen = (): boolean => {
    return isWithinOperatingHours();
  };

  const getCurrentCapacityPercentage = (): number => {
    if (!state.profile || !state.context) return 0;
    return Math.round((state.context.currentCapacity / state.profile.capacity) * 100);
  };

  const getOperatingHours = (): { open: string; close: string } | null => {
    if (!state.profile) return null;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hours = state.profile.hoursOfOperation[today];
    
    if (!hours || hours.closed) return null;
    
    return { open: hours.open, close: hours.close };
  };

  const isWithinOperatingHours = (time?: number): boolean => {
    if (!state.profile) return false;
    
    const checkTime = time ? new Date(time) : new Date();
    const dayOfWeek = checkTime.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = state.profile.hoursOfOperation[dayOfWeek];
    
    if (!hours || hours.closed) return false;
    
    const currentMinutes = checkTime.getHours() * 60 + checkTime.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  const getPeakHourStatus = (): 'peak' | 'normal' | 'slow' => {
    if (!state.profile || !state.context) return 'normal';
    
    const currentHour = new Date().getHours();
    const isPeakHour = state.profile.peakHours.some(hour => {
      const peakHour = parseInt(hour.split(':')[0]);
      return Math.abs(currentHour - peakHour) <= 1;
    });
    
    if (isPeakHour) return 'peak';
    
    const capacityPercentage = getCurrentCapacityPercentage();
    return capacityPercentage < 30 ? 'slow' : 'normal';
  };

  const getRestaurantStatus = (): 'open' | 'closed' | 'closing_soon' | 'opening_soon' => {
    if (!isRestaurantOpen()) {
      // Check if opening soon (within 1 hour)
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      if (isWithinOperatingHours(oneHourLater.getTime())) {
        return 'opening_soon';
      }
      return 'closed';
    }
    
    // Check if closing soon (within 1 hour)
    const hours = getOperatingHours();
    if (hours) {
      const now = new Date();
      const [closeHour, closeMin] = hours.close.split(':').map(Number);
      const closeTime = new Date();
      closeTime.setHours(closeHour, closeMin, 0, 0);
      
      const timeUntilClose = closeTime.getTime() - now.getTime();
      if (timeUntilClose <= 60 * 60 * 1000 && timeUntilClose > 0) {
        return 'closing_soon';
      }
    }
    
    return 'open';
  };

  const contextValue: RestaurantContextInterface = {
    state,
    dispatch,
    setProfile,
    updateProfile,
    createDefaultProfile,
    setContext,
    updateContext,
    refreshContext,
    setDemoMode,
    setSimulationActive,
    setLoading,
    setError,
    isRestaurantOpen,
    getCurrentCapacityPercentage,
    getOperatingHours,
    isWithinOperatingHours,
    getPeakHourStatus,
    getRestaurantStatus,
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
}

// Custom hook to use the context
export function useRestaurant(): RestaurantContextInterface {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}

export default RestaurantContext;