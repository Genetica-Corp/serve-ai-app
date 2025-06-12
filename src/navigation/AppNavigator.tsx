import React from 'react';
import { Text, Image, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Theme } from '../theme';
import { navigationTheme } from './navigationTheme';

// Import screens
import { AlertDashboard } from '../screens/AlertDashboard';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AlertDetailScreen } from '../screens/AlertDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import OperatorDashboard from '../screens/OperatorDashboard';
import StoreManagerDashboard from '../screens/StoreManagerDashboard';

// Types
import { RootStackParamList, TabParamList } from '../types';
import { useUser } from '../contexts/UserContext';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { currentUser, isOperator } = useUser();
  
  // Choose dashboard based on user role
  const DashboardComponent = isOperator ? OperatorDashboard : StoreManagerDashboard;
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary.DEFAULT,
        tabBarInactiveTintColor: Theme.colors.neutral[500],
        tabBarStyle: {
          backgroundColor: Theme.colors.white,
          borderTopColor: Theme.colors.neutral[200],
          borderTopWidth: 1,
          paddingTop: Theme.spacing.sm,
          paddingBottom: Theme.spacing.sm,
          height: 80,
          ...Theme.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: Theme.typography.fontSize.xs,
          fontFamily: Theme.typography.fontFamily.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardComponent}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { currentUser } = useUser();
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.white,
            borderBottomColor: Theme.colors.neutral[200],
            borderBottomWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
          },
          headerTintColor: Theme.colors.neutral[900],
          headerTitleStyle: {
            fontFamily: Theme.typography.fontFamily.semibold,
            fontSize: Theme.typography.fontSize.lg,
          },
          headerBackTitleStyle: {
            fontFamily: Theme.typography.fontFamily.regular,
            fontSize: Theme.typography.fontSize.sm,
          },
        }}
      >
        {!currentUser ? (
          <Stack.Screen
            name="Home"
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={TabNavigator}
          options={{ 
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image 
                  source={require('../../assets/serve-ai-logo.png')}
                  style={{ width: 32, height: 32, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text style={{ 
                  fontSize: Theme.typography.fontSize.lg, 
                  fontFamily: Theme.typography.fontFamily.semibold, 
                  color: Theme.colors.neutral[900] 
                }}>Serve AI</Text>
              </View>
            ),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AlertDetail"
          component={AlertDetailScreen}
          options={{ 
            title: 'Alert Details',
            headerBackTitleVisible: false,
          }}
        />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{ 
                title: 'Notification Settings',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}