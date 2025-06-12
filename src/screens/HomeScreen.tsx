import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert as RNAlert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Alert } from '@/types';
import { AlertCard } from '../components/AlertCard';
import { AlertSearchService } from '../services/AlertSearchService';
import { useAlerts } from '../contexts/AlertContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { state: alertState, acknowledgeAlert, dismissUntilRefresh, markAsHelpful } = useAlerts();
  const [localDismissedAlerts, setLocalDismissedAlerts] = useState<Set<string>>(new Set());

  // Get active alerts from context
  const alerts = alertState.activeAlerts || [];

  const handleAlertPress = (alert: Alert) => {
    // Navigate to alert detail or handle alert press
    RNAlert.alert(
      'Alert Details',
      `${alert.title}\n\n${alert.message}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId, 'current-user'); // Using placeholder user ID
  };

  const handleDismiss = (alertId: string) => {
    // Use context method for permanent dismissal
    dismissUntilRefresh(alertId);
    // Also track local dismissals
    setLocalDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleMarkHelpful = (alertId: string, helpful: boolean) => {
    markAsHelpful(alertId, helpful);
    
    RNAlert.alert(
      'Thank You!',
      `Your feedback has been recorded. ${helpful ? 'Glad this was helpful!' : 'We\'ll work to improve our alerts.'}`
    );
  };

  const handleTellMeMore = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      const searchResults = await AlertSearchService.searchRelatedFactors(alert, alerts);
      const { additionalFactors, recommendations, preventiveMeasures } = searchResults.searchResults;
      
      const message = [
        'Additional Factors:',
        ...additionalFactors.slice(0, 3).map(factor => `• ${factor}`),
        '',
        'Recommendations:',
        ...recommendations.slice(0, 2).map(rec => `• ${rec}`),
        '',
        'Preventive Measures:',
        ...preventiveMeasures.slice(0, 2).map(measure => `• ${measure}`)
      ].join('\n');
      
      RNAlert.alert('More Information', message, [{ text: 'Got it', style: 'default' }]);
    } catch (error) {
      RNAlert.alert('Error', 'Unable to fetch additional information at this time.');
    }
  };

  const visibleAlerts = alerts.filter(alert => !localDismissedAlerts.has(alert.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Serve AI Dashboard</Text>
        <Text style={styles.subtitle}>
          Smart restaurant management and alerting system
        </Text>
      </View>
      
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Active Alerts</Text>
        {visibleAlerts.length > 0 ? (
          <>
            <Text style={styles.sectionSubtitle}>
              {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? 's' : ''} requiring attention
            </Text>
            
            {visibleAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onPress={handleAlertPress}
                onAcknowledge={handleAcknowledge}
                onDismiss={handleDismiss}
                onMarkHelpful={handleMarkHelpful}
                onTellMeMore={handleTellMeMore}
              />
            ))}
          </>
        ) : (
          <View>
            <Text style={styles.noAlertsText}>
              No active alerts to display
            </Text>
            <Text style={styles.debugText}>
              Debug info: {alerts.length} total alerts, {localDismissedAlerts.size} dismissed
            </Text>
            <Text style={styles.debugText}>
              Visible alerts: {visibleAlerts.length}
            </Text>
            {alerts.length > 0 && (
              <Text style={styles.debugText}>
                First alert: {alerts[0].title} (status: {alerts[0].status})
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  alertsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});

export default HomeScreen;