import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../ui/Card';
import { Theme } from '../../theme';
import { Text } from 'react-native';
import { AnyIntegrationCredentials } from '../../types/integrations';
import { getWidgetByType } from '../../config/integrationWidgets';

interface IntegrationListItemProps {
  integration: AnyIntegrationCredentials;
  onPress: () => void;
  onDelete: () => void;
}

export const IntegrationListItem: React.FC<IntegrationListItemProps> = ({
  integration,
  onPress,
  onDelete,
}) => {
  const widget = getWidgetByType(integration.type);
  
  if (!widget) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: widget.iconColor + '20' }]}>
            <MaterialIcons
              name={widget.iconName}
              size={24}
              color={widget.iconColor}
            />
          </View>
          
          <View style={styles.info}>
            <Text style={styles.title}>{integration.name}</Text>
            <Text style={styles.subtitle}>{widget.title}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: integration.isActive ? Theme.colors.success : Theme.colors.error }
              ]} />
              <Text style={styles.statusText}>
                {integration.isActive ? 'Active' : 'Inactive'}
              </Text>
              {integration.lastSync && (
                <Text style={styles.syncText}>
                  Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color={Theme.colors.error} />
          </TouchableOpacity>
        </View>
        
        {integration.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={16} color={Theme.colors.error} />
            <Text style={styles.errorText}>{integration.error}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

interface IntegrationListProps {
  integrations: AnyIntegrationCredentials[];
  onIntegrationPress: (integration: AnyIntegrationCredentials) => void;
  onIntegrationDelete: (integration: AnyIntegrationCredentials) => void;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  onIntegrationPress,
  onIntegrationDelete,
}) => {
  return (
    <View style={styles.container}>
      {integrations.map((integration) => (
        <IntegrationListItem
          key={integration.id}
          integration={integration}
          onPress={() => onIntegrationPress(integration)}
          onDelete={() => onIntegrationDelete(integration)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.md,
  },
  card: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...Theme.typography.h3,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  statusText: {
    ...Theme.typography.caption,
    marginRight: Theme.spacing.md,
  },
  syncText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  deleteButton: {
    padding: Theme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.error,
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
});