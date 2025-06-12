import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/EmptyState';
import { IntegrationWidget } from '../components/integrations/IntegrationWidget';
import { IntegrationList } from '../components/integrations/IntegrationList';
import { Theme } from '../theme';
import { integrationWidgets } from '../config/integrationWidgets';
import integrationService from '../services/integrationService';
import { AnyIntegrationCredentials, IntegrationType } from '../types/integrations';

export const IntegrationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [integrations, setIntegrations] = useState<AnyIntegrationCredentials[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<IntegrationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const result = await integrationService.getIntegrations();
      if (result.success && result.data) {
        setIntegrations(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntegrationPress = (integration: AnyIntegrationCredentials) => {
    Alert.alert(
      integration.name,
      `Type: ${integration.type}\nStatus: ${integration.isActive ? 'Active' : 'Inactive'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => setSelectedWidget(integration.type),
        },
      ]
    );
  };

  const handleIntegrationDelete = (integration: AnyIntegrationCredentials) => {
    Alert.alert(
      'Delete Integration',
      `Are you sure you want to delete ${integration.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await integrationService.deleteIntegration(integration.type);
            if (result.success) {
              loadIntegrations();
            } else {
              Alert.alert('Error', 'Failed to delete integration');
            }
          },
        },
      ]
    );
  };

  const handleWidgetSuccess = () => {
    setSelectedWidget(null);
    setShowWidgetSelector(false);
    loadIntegrations();
  };

  const handleWidgetCancel = () => {
    setSelectedWidget(null);
    setShowWidgetSelector(false);
  };

  const renderWidgetSelector = () => (
    <View style={styles.widgetSelector}>
      <View style={styles.widgetSelectorHeader}>
        <Text style={styles.widgetSelectorTitle}>Choose Integration</Text>
        <TouchableOpacity onPress={() => setShowWidgetSelector(false)}>
          <MaterialIcons name="close" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {integrationWidgets.map((widget) => {
          const isConfigured = integrations.some(i => i.type === widget.type);
          
          return (
            <TouchableOpacity
              key={widget.type}
              onPress={() => {
                setSelectedWidget(widget.type);
                setShowWidgetSelector(false);
              }}
              disabled={isConfigured}
              activeOpacity={0.7}
            >
              <Card style={[styles.widgetCard, isConfigured && styles.widgetCardDisabled]}>
                <View style={[styles.widgetIcon, { backgroundColor: widget.iconColor + '20' }]}>
                  <MaterialIcons
                    name={widget.iconName}
                    size={32}
                    color={widget.iconColor}
                  />
                </View>
                <View style={styles.widgetInfo}>
                  <Text style={styles.widgetTitle}>{widget.title}</Text>
                  <Text style={styles.widgetDescription}>{widget.description}</Text>
                  {isConfigured && (
                    <Text style={styles.configuredText}>Already configured</Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (selectedWidget) {
    const widget = integrationWidgets.find(w => w.type === selectedWidget);
    if (widget) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleWidgetCancel} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={Theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Configure {widget.title}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <IntegrationWidget
            widget={widget}
            onSuccess={handleWidgetSuccess}
            onCancel={handleWidgetCancel}
          />
        </SafeAreaView>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Integrations</Text>
        <TouchableOpacity
          onPress={() => setShowWidgetSelector(true)}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={integrations.length === 0 ? styles.emptyContent : undefined}
        >
          {integrations.length === 0 ? (
            <EmptyState
              iconName="extension"
              title="No Integrations"
              description="Connect your services to start receiving alerts"
              action={
                <Button
                  title="Add Integration"
                  onPress={() => setShowWidgetSelector(true)}
                  icon="add"
                  size="large"
                />
              }
            />
          ) : (
            <IntegrationList
              integrations={integrations}
              onIntegrationPress={handleIntegrationPress}
              onIntegrationDelete={handleIntegrationDelete}
            />
          )}
        </ScrollView>
      )}

      {showWidgetSelector && renderWidgetSelector()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
    marginLeft: -Theme.spacing.sm,
  },
  headerTitle: {
    ...Theme.typography.h2,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: Theme.spacing.sm,
    marginRight: -Theme.spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetSelector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.background,
    paddingTop: 60,
  },
  widgetSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  widgetSelectorTitle: {
    ...Theme.typography.h2,
    flex: 1,
  },
  widgetCard: {
    flexDirection: 'row',
    margin: Theme.spacing.md,
    marginBottom: 0,
    padding: Theme.spacing.md,
  },
  widgetCardDisabled: {
    opacity: 0.6,
  },
  widgetIcon: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetTitle: {
    ...Theme.typography.h3,
    marginBottom: Theme.spacing.xs,
  },
  widgetDescription: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  configuredText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    marginTop: Theme.spacing.xs,
  },
});