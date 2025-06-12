import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, TeamMember } from '../types';

interface UserContextType {
  currentUser: User | null;
  teamMembers: TeamMember[];
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  isOperator: boolean;
  isStoreManager: boolean;
  canAssignAlerts: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    // In a real app, you'd also handle authentication tokens here
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setTeamMembers([]);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const isOperator = currentUser?.role === 'OPERATOR' || currentUser?.role === 'REGIONAL_MANAGER' || currentUser?.role === 'ADMIN';
  const isStoreManager = currentUser?.role === 'STORE_MANAGER';
  const canAssignAlerts = isOperator || currentUser?.role === 'ADMIN';

  const value: UserContextType = {
    currentUser,
    teamMembers,
    login,
    logout,
    updateUser,
    setTeamMembers,
    isOperator,
    isStoreManager,
    canAssignAlerts,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};